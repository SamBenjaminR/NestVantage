
package NestVantage.API.service;

import NestVantage.API.entity.*;
import NestVantage.API.repository.*;
import NestVantage.API.service.ai.GeminiService;
import NestVantage.API.auth.entity.AppUser;
import NestVantage.API.auth.repository.AppUserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class HandoffService {

    private final HandoffRepository handoffRepository;
    private final SalesExecutiveRepository executiveRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final LeadRepository leadRepository;
    private final GeminiService geminiService;
    private final HandoffNotificationService notificationService;
    private final AppUserRepository appUserRepository;
    private final ConversationPersistenceService conversationPersistenceService;
    private final PublicConversationService publicConversationService;

    public HandoffService(
            AppUserRepository appUserRepository,
            HandoffRepository handoffRepository,
            HandoffNotificationService notificationService,
            SalesExecutiveRepository executiveRepository,
            ConversationRepository conversationRepository,
            ConversationMessageRepository messageRepository,
            LeadRepository leadRepository,
            ConversationPersistenceService conversationPersistenceService,
            PublicConversationService publicConversationService,
            GeminiService geminiService) {

        this.appUserRepository = appUserRepository;
        this.handoffRepository = handoffRepository;
        this.notificationService = notificationService;
        this.executiveRepository = executiveRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.leadRepository = leadRepository;
        this.conversationPersistenceService = conversationPersistenceService;
        this.publicConversationService = publicConversationService;
        this.geminiService = geminiService;
    }

    // Existing staff handoff: retains conversation ownership validation.
    @Transactional
    public Handoff requestHandoff(Long conversationId, String phone) {

        validatePhone(phone);

        Conversation conversation =
                conversationPersistenceService.getAccessibleConversation(
                        conversationId);

        return createHandoff(conversation, phone.trim());
    }

    // Public buyer handoff: validates the secure conversation access token.
    @Transactional
    public Handoff requestPublicHandoff(
            String accessToken, String phone) {

        validatePhone(phone);

        Conversation conversation =
                publicConversationService.getPublicConversation(accessToken);

        return createHandoff(conversation, phone.trim());
    }

    private void validatePhone(String phone) {

        if (phone == null || !phone.trim().matches("^[0-9]{10}$")) {
            throw new IllegalArgumentException(
                    "Phone number must contain exactly 10 digits.");
        }
    }

    // Shared handoff creation logic for staff and public conversations.
    private Handoff createHandoff(
            Conversation conversation, String phone) {

        if (conversation.getBuyerName() == null
                || conversation.getBuyerName().isBlank()) {
            throw new IllegalArgumentException(
                    "Buyer name is required for human handoff.");
        }

        Handoff existing = handoffRepository
                .findByConversation(conversation)
                .orElse(null);

        if (existing != null) {
            return existing;
        }

        // Reuse an existing lead or create a new one.
        Lead lead = leadRepository.findByPhone(phone)
                .orElseGet(() -> createLead(conversation, phone));

        conversation.setLead(lead);
        conversation.setHandoffRequested(true);
        conversationRepository.save(conversation);

        // Collect conversation history.
        List<ConversationMessage> messages =
                messageRepository.findByConversationOrderByCreatedAtAsc(
                        conversation);

        StringBuilder details = new StringBuilder();

        details.append("Buyer: ").append(conversation.getBuyerName());
        details.append("\nPhone: ").append(phone);
        details.append("\nBudget: ").append(conversation.getBudget());
        details.append("\nRequirements: ")
                .append(conversation.getRequirements());
        details.append("\nLanguage: ").append(conversation.getLanguage());
        details.append("\n\nConversation history:\n");

        for (ConversationMessage message : messages) {
            details.append(message.getSender())
                    .append(": ")
                    .append(message.getMessage())
                    .append("\n");
        }

        // Generate a summary; retain a fallback if Gemini is unavailable.
        String summary;

        try {
            summary = geminiService.generateHandoffSummary(
                    details.toString());
        } catch (Exception exception) {
            summary = details.toString();
        }

        Handoff handoff = new Handoff();
        handoff.setConversation(conversation);
        handoff.setSummary(summary);

        // Assign to the available executive with the fewest active handoffs.
        List<SalesExecutive> availableExecutives =
                executiveRepository.findByAvailableTrue();

        SalesExecutive selectedExecutive = availableExecutives.stream()
                .min(Comparator.comparingLong(executive ->
                        handoffRepository.countBySalesExecutiveAndStatus(
                                executive, "ASSIGNED")))
                .orElse(null);

        if (selectedExecutive != null) {
            handoff.setSalesExecutive(selectedExecutive);
            handoff.setStatus("ASSIGNED");
            handoff.setAssignedAt(java.time.LocalDateTime.now());
        } else {
            handoff.setStatus("PENDING");
        }

        Handoff savedHandoff = handoffRepository.save(handoff);

        notificationService.notifyNewHandoff(
                savedHandoff.getId(),
                conversation.getBuyerName(),
                phone,
                savedHandoff.getSummary(),
                savedHandoff.getStatus(),
                savedHandoff.getSalesExecutive() == null
                        ? "Awaiting assignment"
                        : savedHandoff.getSalesExecutive().getName()
        );

        return savedHandoff;
    }

    @Transactional
    public Handoff acceptHandoff(Long handoffId) {

        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Handoff not found."));

        verifyHandoffAccess(handoff, getCurrentUser());

        if (!"ASSIGNED".equals(handoff.getStatus())) {
            throw new IllegalArgumentException(
                    "Only assigned handoffs can be accepted.");
        }

        handoff.setStatus("ACCEPTED");

        return handoffRepository.save(handoff);
    }

    @Transactional
    public Handoff resolveHandoff(Long handoffId) {

        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Handoff not found."));

        verifyHandoffAccess(handoff, getCurrentUser());

        if (!"ACCEPTED".equals(handoff.getStatus())) {
            throw new IllegalArgumentException(
                    "Only accepted handoffs can be resolved.");
        }

        handoff.setStatus("RESOLVED");
        handoff.setResolvedAt(java.time.LocalDateTime.now());

        return handoffRepository.save(handoff);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversationHistory(
            Long handoffId) {

        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Handoff not found."));

        verifyHandoffAccess(handoff, getCurrentUser());

        Conversation conversation = handoff.getConversation();

        List<ConversationMessage> messages =
                messageRepository.findByConversationOrderByCreatedAtAsc(
                        conversation);

        List<Map<String, Object>> result = new ArrayList<>();

        for (ConversationMessage message : messages) {
            Map<String, Object> item = new HashMap<>();

            item.put("sender", message.getSender());
            item.put("message", message.getMessage());
            item.put("createdAt", message.getCreatedAt());

            result.add(item);
        }

        return result;
    }

    private Lead createLead(Conversation conversation, String phone) {

        Lead lead = new Lead();

        lead.setLeadCode("AI-" +
                UUID.randomUUID().toString()
                        .substring(0, 8).toUpperCase());

        lead.setBuyerName(conversation.getBuyerName().trim());
        lead.setPhone(phone);
        lead.setSource("AI Assistant");
        lead.setProjectName("Not specified");
        lead.setBhkType("Not specified");
        lead.setBudget(conversation.getBudget());
        lead.setStatus("New Lead");

        return leadRepository.save(lead);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllHandoffs() {

        AppUser currentUser = getCurrentUser();

        List<Handoff> handoffs;

        if (isManager(currentUser)) {
            handoffs = handoffRepository.findAllByOrderByRequestedAtDesc();
        } else if ("SALES_EXECUTIVE".equals(currentUser.getRole())
                && currentUser.getSalesExecutive() != null) {
            handoffs = handoffRepository
                    .findBySalesExecutiveOrderByRequestedAtDesc(
                            currentUser.getSalesExecutive());
        } else {
            handoffs = List.of();
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (Handoff handoff : handoffs) {

            Conversation conversation = handoff.getConversation();

            Map<String, Object> item = new HashMap<>();

            item.put("handoffId", handoff.getId());
            item.put("buyerName", conversation.getBuyerName());
            item.put("phone", conversation.getLead() == null
                    ? ""
                    : conversation.getLead().getPhone());
            item.put("budget", conversation.getBudget());
            item.put("requirements", conversation.getRequirements());
            item.put("language", conversation.getLanguage());
            item.put("summary", handoff.getSummary());
            item.put("status", handoff.getStatus());
            item.put("executiveName",
                    handoff.getSalesExecutive() == null
                            ? "Awaiting assignment"
                            : handoff.getSalesExecutive().getName());
            item.put("requestedAt", handoff.getRequestedAt());

            result.add(item);
        }

        return result;
    }

    private AppUser getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user not found."));
    }

    private boolean isManager(AppUser user) {

        return "ADMIN".equals(user.getRole())
                || "SALES_HEAD".equals(user.getRole());
    }

    private void verifyHandoffAccess(
            Handoff handoff, AppUser user) {

        if (isManager(user)) {
            return;
        }

        if ("SALES_EXECUTIVE".equals(user.getRole())
                && user.getSalesExecutive() != null
                && handoff.getSalesExecutive() != null
                && user.getSalesExecutive().getId()
                        .equals(handoff.getSalesExecutive().getId())) {
            return;
        }

        throw new AccessDeniedException(
                "You are not authorized to access this handoff.");
    }
}
