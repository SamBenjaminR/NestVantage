
package NestVantage.API.service;

import NestVantage.API.dto.PublicSiteVisitRequest;
import NestVantage.API.entity.BookingSlot;
import NestVantage.API.entity.Conversation;
import NestVantage.API.entity.Lead;
import NestVantage.API.entity.SiteVisit;
import NestVantage.API.repository.BookingSlotRepository;
import NestVantage.API.repository.ConversationRepository;
import NestVantage.API.repository.LeadRepository;
import NestVantage.API.repository.SiteVisitRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class PublicSiteVisitService {

    private static final DateTimeFormatter SLOT_FORMAT =
            DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    private final PublicConversationService publicConversationService;
    private final BookingSlotRepository bookingSlotRepository;
    private final ConversationRepository conversationRepository;
    private final LeadRepository leadRepository;
    private final SiteVisitRepository siteVisitRepository;

    public PublicSiteVisitService(
            PublicConversationService publicConversationService,
            BookingSlotRepository bookingSlotRepository,
            ConversationRepository conversationRepository,
            LeadRepository leadRepository,
            SiteVisitRepository siteVisitRepository) {

        this.publicConversationService = publicConversationService;
        this.bookingSlotRepository = bookingSlotRepository;
        this.conversationRepository = conversationRepository;
        this.leadRepository = leadRepository;
        this.siteVisitRepository = siteVisitRepository;
    }

    // Return active slots that are not already booked.
    @Transactional(readOnly = true)
    public Map<String, Object> getAvailableSlots(
            String projectName, LocalDate visitDate) {

        validateProjectAndDate(projectName, visitDate);

        List<BookingSlot> activeSlots =
                bookingSlotRepository.findByProjectNameAndActiveTrue(
                        projectName.trim());

        List<Map<String, Object>> availableSlots = new ArrayList<>();

        for (BookingSlot slot : activeSlots) {

            LocalTime slotTime =
                    LocalTime.parse(slot.getSlotTime(), SLOT_FORMAT);

            boolean booked =
                    siteVisitRepository
                            .existsByProjectNameAndVisitDateAndVisitTimeAndStatus(
                                    projectName.trim(),
                                    visitDate,
                                    slotTime,
                                    "Booked");

            if (!booked &&
                    (visitDate.isAfter(LocalDate.now())
                    || slotTime.isAfter(LocalTime.now()))) {

                availableSlots.add(Map.of(
                        "slotTime", slot.getSlotTime(),
                        "available", true
                ));
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("projectName", projectName.trim());
        response.put("visitDate", visitDate);
        response.put("slots", availableSlots);

        return response;
    }

    // Create a booking only after the buyer explicitly confirms.
    @Transactional
    public Map<String, Object> bookPublicVisit(
            PublicSiteVisitRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Booking details are required.");
        }

        validateProjectAndDate(
                request.projectName(), request.visitDate());

        if (request.buyerName().trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Buyer name cannot exceed 100 characters.");
        }

        if (request.phone() == null
                || !request.phone().trim().matches("^[0-9]{10}$")) {
            throw new IllegalArgumentException(
                    "Phone number must contain exactly 10 digits.");
        }

        LocalTime selectedTime;

        try {
            selectedTime = LocalTime.parse(
                    request.visitTime().trim(), SLOT_FORMAT);
        } catch (Exception exception) {
            throw new IllegalArgumentException(
                    "Please select a valid booking time.");
        }

        if (request.visitDate().isEqual(LocalDate.now())
                && !selectedTime.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException(
                    "Please select a future booking time.");
        }

        String projectName = request.projectName().trim();

        // Confirm that the selected time is an active configured slot.
        boolean activeSlot = bookingSlotRepository
                .findByProjectNameAndActiveTrue(projectName)
                .stream()
                .anyMatch(slot ->
                        LocalTime.parse(slot.getSlotTime(), SLOT_FORMAT)
                                .equals(selectedTime));

        if (!activeSlot) {
            throw new IllegalArgumentException(
                    "This booking slot is no longer available.");
        }

        // Validate the buyer's public conversation token.
        Conversation conversation =
                publicConversationService.getPublicConversation(
                        request.accessToken());

        // Find an existing lead or create a new AI lead.
        String phone = request.phone().trim();

        Lead lead = leadRepository.findByPhone(phone)
                .orElseGet(() -> createLead(request, phone));

        // Fill missing information without overwriting existing lead data.
        if (lead.getBuyerName() == null
                || lead.getBuyerName().isBlank()) {
            lead.setBuyerName(request.buyerName().trim());
        }

        if (lead.getBudget() == null || lead.getBudget().isBlank()) {
            lead.setBudget(request.budget());
        }

        if (lead.getProjectName() == null
                || lead.getProjectName().isBlank()
                || "Not specified".equalsIgnoreCase(
                        lead.getProjectName())) {
            lead.setProjectName(projectName);
        }

        lead = leadRepository.save(lead);

        // Link the public conversation to the buyer's lead.
        conversation.setBuyerName(request.buyerName().trim());

        if (request.budget() != null && !request.budget().isBlank()) {
            conversation.setBudget(request.budget());
        }

        if (request.requirements() != null
                && !request.requirements().isBlank()) {
            conversation.setRequirements(request.requirements());
        }

        conversation.setLead(lead);
        conversationRepository.save(conversation);

        // Create the site visit.
        SiteVisit visit = new SiteVisit();

        visit.setVisitCode(
                "VIS-" + UUID.randomUUID()
                        .toString().substring(0, 8).toUpperCase());

        visit.setLead(lead);
        visit.setProjectName(projectName);
        visit.setVisitDate(request.visitDate());
        visit.setVisitTime(selectedTime);
        visit.setStatus("Booked");

        String locationQuery = URLEncoder.encode(
                projectName + ", Ahmedabad",
                StandardCharsets.UTF_8);

        visit.setLocationUrl(
                "https://www.google.com/maps/search/?api=1&query="
                        + locationQuery);

        try {
            SiteVisit savedVisit =
                    siteVisitRepository.saveAndFlush(visit);

            Map<String, Object> response = new LinkedHashMap<>();

            response.put("message",
                    "Your site visit has been booked successfully.");
            response.put("visitId", savedVisit.getId());
            response.put("visitCode", savedVisit.getVisitCode());
            response.put("buyerName", lead.getBuyerName());
            response.put("leadCode", lead.getLeadCode());
            response.put("projectName", savedVisit.getProjectName());
            response.put("visitDate", savedVisit.getVisitDate());
            response.put("visitTime",
                    savedVisit.getVisitTime().format(SLOT_FORMAT));
            response.put("status", savedVisit.getStatus());
            response.put("locationUrl", savedVisit.getLocationUrl());

            return response;

        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException(
                    "This time slot has just been booked. "
                    + "Please choose another available slot.");
        }
    }

    private Lead createLead(
            PublicSiteVisitRequest request, String phone) {

        Lead lead = new Lead();

        String leadCode;

        do {
            leadCode = "AI-" + UUID.randomUUID()
                    .toString().substring(0, 8).toUpperCase();
        } while (leadRepository.existsByLeadCode(leadCode));

        lead.setLeadCode(leadCode);
        lead.setBuyerName(request.buyerName().trim());
        lead.setPhone(phone);
        lead.setSource("AI Assistant");
        lead.setProjectName(request.projectName().trim());
        lead.setBhkType("Not specified");
        lead.setBudget(request.budget());
        lead.setStatus("New Lead");

        return leadRepository.save(lead);
    }

    private void validateProjectAndDate(
            String projectName, LocalDate visitDate) {

        if (projectName == null || projectName.isBlank()) {
            throw new IllegalArgumentException(
                    "Please select a project.");
        }

        if (visitDate == null || visitDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Please select today or a future date.");
        }
    }
}
