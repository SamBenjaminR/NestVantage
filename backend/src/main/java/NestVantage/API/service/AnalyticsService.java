package NestVantage.API.service;

import NestVantage.API.entity.Conversation;
import NestVantage.API.entity.ConversationMessage;
import NestVantage.API.entity.Lead;
import NestVantage.API.entity.SiteVisit;
import NestVantage.API.entity.MarketingSpend;

import NestVantage.API.repository.ConversationRepository;
import NestVantage.API.repository.ConversationMessageRepository;
import NestVantage.API.repository.LeadRepository;
import NestVantage.API.repository.SiteVisitRepository;
import NestVantage.API.repository.MarketingSpendRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final LeadRepository leadRepository;
    private final SiteVisitRepository siteVisitRepository;
    private final MarketingSpendRepository marketingSpendRepository;

    public AnalyticsService(
            ConversationRepository conversationRepository,
            ConversationMessageRepository messageRepository,
            LeadRepository leadRepository,
            SiteVisitRepository siteVisitRepository,
            MarketingSpendRepository marketingSpendRepository) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.leadRepository = leadRepository;
        this.siteVisitRepository = siteVisitRepository;
        this.marketingSpendRepository = marketingSpendRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResponseTimeAnalytics() {

        // AI first response time
        List<Conversation> conversations =
                conversationRepository.findByLeadIsNotNull();

        Map<String, ResponseStats> aiSourceStats =
                new LinkedHashMap<>();

        long aiOverallTotalSeconds = 0;
        int aiOverallResponseCount = 0;

        for (Conversation conversation : conversations) {

            List<ConversationMessage> messages =
                    messageRepository.findByConversationOrderByCreatedAtAsc(
                            conversation);

            LocalDateTime firstBuyerMessage = null;
            LocalDateTime firstAIReply = null;

            for (ConversationMessage message : messages) {

                if ("BUYER".equalsIgnoreCase(message.getSender())
                        && firstBuyerMessage == null) {

                    firstBuyerMessage = message.getCreatedAt();

                } else if ("AI".equalsIgnoreCase(message.getSender())
                        && firstBuyerMessage != null
                        && firstAIReply == null
                        && !message.getCreatedAt().isBefore(firstBuyerMessage)) {

                    firstAIReply = message.getCreatedAt();
                    break;
                }
            }

            if (firstBuyerMessage == null || firstAIReply == null) {
                continue;
            }

            long responseSeconds = Duration.between(
                    firstBuyerMessage,
                    firstAIReply
            ).getSeconds();

            if (responseSeconds < 0) {
                continue;
            }

            String source = conversation.getLead().getSource();

            if (source == null || source.isBlank()) {
                source = "Unknown";
            }

            ResponseStats stats = aiSourceStats.computeIfAbsent(
                    source,
                    key -> new ResponseStats()
            );

            stats.totalSeconds += responseSeconds;
            stats.responseCount++;

            aiOverallTotalSeconds += responseSeconds;
            aiOverallResponseCount++;
        }

        List<Map<String, Object>> aiBySource =
                buildSourceBreakdown(aiSourceStats);

        // Human sales first response time
        List<Lead> respondedLeads = leadRepository.findAll();

        Map<String, ResponseStats> humanSourceStats =
                new LinkedHashMap<>();

        long humanOverallTotalSeconds = 0;
        int humanOverallResponseCount = 0;

        for (Lead lead : respondedLeads) {

            LocalDateTime createdAt = lead.getCreatedAt();
            LocalDateTime firstResponseAt = lead.getFirstResponseAt();

            if (createdAt == null || firstResponseAt == null
                    || firstResponseAt.isBefore(createdAt)) {
                continue;
            }

            long responseSeconds = Duration.between(
                    createdAt,
                    firstResponseAt
            ).getSeconds();

            String source = lead.getSource();

            if (source == null || source.isBlank()) {
                source = "Unknown";
            }

            ResponseStats stats = humanSourceStats.computeIfAbsent(
                    source,
                    key -> new ResponseStats()
            );

            stats.totalSeconds += responseSeconds;
            stats.responseCount++;

            humanOverallTotalSeconds += responseSeconds;
            humanOverallResponseCount++;
        }

        List<Map<String, Object>> humanBySource =
                buildSourceBreakdown(humanSourceStats);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("averageResponseSeconds",
                roundAverage(aiOverallTotalSeconds, aiOverallResponseCount));

        result.put("responseCount", aiOverallResponseCount);
        result.put("bySource", aiBySource);

        result.put("averageHumanResponseSeconds",
                roundAverage(humanOverallTotalSeconds, humanOverallResponseCount));

        result.put("humanResponseCount", humanOverallResponseCount);
        result.put("humanBySource", humanBySource);

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCostPerVisitAnalytics(String month) {

        if (month == null || month.isBlank()) {
            throw new IllegalArgumentException(
                    "Month is required in YYYY-MM format."
            );
        }

        try {
            YearMonth.parse(month);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(
                    "Invalid month. Use YYYY-MM format."
            );
        }

        Map<String, Integer> completedVisitsBySource =
                new LinkedHashMap<>();

        List<SiteVisit> visits =
                siteVisitRepository.findAllByOrderByVisitDateAscVisitTimeAsc();

        for (SiteVisit visit : visits) {

            if (!"Completed".equalsIgnoreCase(visit.getStatus())) {
                continue;
            }

            LocalDate visitDate = visit.getVisitDate();

            if (visitDate == null || !YearMonth.from(visitDate).toString().equals(month)) {
                continue;
            }

            String source = visit.getLead().getSource();

            if (source == null || source.isBlank()) {
                source = "Unknown";
            }

            completedVisitsBySource.merge(source, 1, Integer::sum);
        }

        List<MarketingSpend> spendRecords =
                marketingSpendRepository.findBySpendMonthOrderBySourceAsc(month);

        Map<String, MarketingSpend> spendBySource =
                new LinkedHashMap<>();

        for (MarketingSpend spend : spendRecords) {
            spendBySource.put(spend.getSource(), spend);
        }

        Map<String, Map<String, Object>> sourceResults =
                new LinkedHashMap<>();

        // Include sources that have marketing spend records.
        for (MarketingSpend spend : spendRecords) {

            String source = spend.getSource();

            int completedVisits =
                    completedVisitsBySource.getOrDefault(source, 0);

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("source", source);
            item.put("month", month);
            item.put("marketingSpend", spend.getAmount());
            item.put("completedVisits", completedVisits);

            if (completedVisits > 0) {
                BigDecimal costPerVisit = spend.getAmount().divide(
                        BigDecimal.valueOf(completedVisits),
                        2,
                        RoundingMode.HALF_UP
                );

                item.put("costPerVisit", costPerVisit);
            } else {
                item.put("costPerVisit", null);
            }

            sourceResults.put(source, item);
        }

        // Also include visit sources without a spend record.
        for (Map.Entry<String, Integer> entry
                : completedVisitsBySource.entrySet()) {

            String source = entry.getKey();

            if (!sourceResults.containsKey(source)) {

                Map<String, Object> item = new LinkedHashMap<>();

                item.put("source", source);
                item.put("month", month);
                item.put("marketingSpend", null);
                item.put("completedVisits", entry.getValue());
                item.put("costPerVisit", null);

                sourceResults.put(source, item);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("month", month);
        result.put("bySource", new ArrayList<>(sourceResults.values()));

        return result;
    }

    private List<Map<String, Object>> buildSourceBreakdown(
            Map<String, ResponseStats> sourceStats) {

        List<Map<String, Object>> bySource = new ArrayList<>();

        for (Map.Entry<String, ResponseStats> entry
                : sourceStats.entrySet()) {

            ResponseStats stats = entry.getValue();

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("source", entry.getKey());
            item.put("averageResponseSeconds",
                    roundAverage(stats.totalSeconds, stats.responseCount));
            item.put("responseCount", stats.responseCount);

            bySource.add(item);
        }

        return bySource;
    }

    private double roundAverage(long total, int count) {

        if (count == 0) {
            return 0;
        }

        return Math.round((double) total / count * 100.0) / 100.0;
    }

    private static class ResponseStats {
        private long totalSeconds;
        private int responseCount;
    }
}