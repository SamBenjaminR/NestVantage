
package NestVantage.API.service;

import NestVantage.API.entity.Conversation;
import NestVantage.API.entity.ConversationMessage;
import NestVantage.API.repository.ConversationRepository;
import NestVantage.API.repository.ConversationMessageRepository;
import NestVantage.API.service.ai.GeminiService;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PublicConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final GeminiService geminiService;

    private final SecureRandom secureRandom = new SecureRandom();

    public PublicConversationService(
            ConversationRepository conversationRepository,
            ConversationMessageRepository messageRepository,
            GeminiService geminiService) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.geminiService = geminiService;
    }

    public Map<String, Object> startConversation(String language) {

        String accessToken = generateAccessToken();

        Conversation conversation = new Conversation();
        conversation.setPublicAccessTokenHash(hashToken(accessToken));

        if (isSupportedLanguage(language)) {
            conversation.setLanguage(language);
        }

        conversationRepository.save(conversation);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accessToken", accessToken);
        response.put("message",
                "Hello! Welcome to NestVantage. "
                + "I'm here to help you explore our properties. "
                + "How can I assist you today?");

        return response;
    }

    public Map<String, Object> sendMessage(
            String accessToken,
            String message,
            String buyerName,
            String budget,
            String requirements,
            String language) {

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(
                    "Message cannot be empty.");
        }

        if (message.length() > 2000) {
            throw new IllegalArgumentException(
                    "Message cannot exceed 2000 characters.");
        }

        Conversation conversation = getPublicConversation(accessToken);

        if (buyerName != null && !buyerName.isBlank()) {
            conversation.setBuyerName(buyerName.trim());
        }

        if (budget != null) {
            conversation.setBudget(budget.trim());
        }

        if (requirements != null) {
            conversation.setRequirements(requirements.trim());
        }

        if (isSupportedLanguage(language)) {
            conversation.setLanguage(language);
        }

        conversationRepository.save(conversation);

        messageRepository.save(createMessage(
                conversation, "BUYER", message.trim()));

        List<ConversationMessage> history =
                messageRepository.findByConversationOrderByCreatedAtAsc(
                        conversation);

        StringBuilder context = new StringBuilder();

        context.append("Previous conversation:\n");

        for (int i = 0; i < history.size() - 1; i++) {
            ConversationMessage previous = history.get(i);

            context.append(previous.getSender())
                    .append(": ")
                    .append(previous.getMessage())
                    .append("\n");
        }

        context.append("\nLatest buyer message:\n")
                .append(message.trim());

        String reply = geminiService.generateReply(context.toString());

        messageRepository.save(createMessage(
                conversation, "AI", reply));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("reply", reply);

        return response;
    }

        public void updateBuyerDetails(
        String accessToken,
        String buyerName,
        String budget,
        String requirements) {

    if (buyerName == null || buyerName.isBlank()) {
        throw new IllegalArgumentException(
                "Buyer name is required for human handoff.");
    }

    if (buyerName.trim().length() > 100) {
        throw new IllegalArgumentException(
                "Buyer name cannot exceed 100 characters.");
    }

    Conversation conversation = getPublicConversation(accessToken);

    conversation.setBuyerName(buyerName.trim());

    if (budget != null) {
        conversation.setBudget(budget.trim());
    }

    if (requirements != null) {
        conversation.setRequirements(requirements.trim());
    }

    conversationRepository.save(conversation);
}

    public Conversation getPublicConversation(String accessToken) {

        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException(
                    "A valid conversation access token is required.");
        }

        String tokenHash = hashToken(accessToken);

        return conversationRepository
                .findByPublicAccessTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired conversation token."));
    }

    private ConversationMessage createMessage(
            Conversation conversation,
            String sender,
            String message) {

        ConversationMessage conversationMessage =
                new ConversationMessage();

        conversationMessage.setConversation(conversation);
        conversationMessage.setSender(sender);
        conversationMessage.setMessage(message);

        return messageRepository.save(conversationMessage);
    }

    private String generateAccessToken() {

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(hash);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to secure the conversation token.",
                    exception);
        }
    }

    private boolean isSupportedLanguage(String language) {

        return "English".equalsIgnoreCase(language)
                || "Hindi".equalsIgnoreCase(language)
                || "Gujarati".equalsIgnoreCase(language);
    }
}
