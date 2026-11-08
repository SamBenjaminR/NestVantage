
package NestVantage.API.service;

import NestVantage.API.entity.SiteVisit;
import NestVantage.API.repository.SiteVisitRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SiteVisitReminderService {

    private final SiteVisitRepository siteVisitRepository;
    private final HandoffNotificationService notificationService;

    public SiteVisitReminderService(
            SiteVisitRepository siteVisitRepository,
            HandoffNotificationService notificationService) {
        this.siteVisitRepository = siteVisitRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void sendSiteVisitReminders() {

        LocalDateTime now = LocalDateTime.now();

        List<SiteVisit> visits =
                siteVisitRepository
                        .findByStatusOrderByVisitDateAscVisitTimeAsc("Booked");

        for (SiteVisit visit : visits) {

            LocalDateTime visitDateTime =
                    visit.getVisitDate().atTime(visit.getVisitTime());

            if (!now.isBefore(visitDateTime)) {
                continue;
            }

            String buyerName = visit.getLead().getBuyerName();

            // 24-hour reminder
            if (!visit.isReminder24hSent()
                    && !now.isBefore(visitDateTime.minusHours(24))) {

                visit.setReminder24hSent(true);
                siteVisitRepository.save(visit);

                notificationService.notifySiteVisitReminder(
                        visit.getId(),
                        visit.getVisitCode(),
                        buyerName,
                        visit.getProjectName(),
                        visit.getVisitDate().toString(),
                        visit.getVisitTime().toString(),
                        visit.getLocationUrl(),
                        "24-hour"
                );
            }

            // 2-hour reminder
            if (!visit.isReminder2hSent()
                    && !now.isBefore(visitDateTime.minusHours(2))) {

                visit.setReminder2hSent(true);
                siteVisitRepository.save(visit);

                notificationService.notifySiteVisitReminder(
                        visit.getId(),
                        visit.getVisitCode(),
                        buyerName,
                        visit.getProjectName(),
                        visit.getVisitDate().toString(),
                        visit.getVisitTime().toString(),
                        visit.getLocationUrl(),
                        "2-hour"
                );
            }
        }
    }
}
