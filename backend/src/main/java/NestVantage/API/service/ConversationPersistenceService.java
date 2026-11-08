
package NestVantage.API.service;

import NestVantage.API.entity.Conversation;
import NestVantage.API.entity.ConversationMessage;
import NestVantage.API.repository.ConversationRepository;
import NestVantage.API.repository.ConversationMessageRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import NestVantage.API.auth.entity.AppUser;
import NestVantage.API.auth.repository.AppUserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class ConversationPersistenceService {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final AppUserRepository appUserRepository;

    public ConversationPersistenceService(
        ConversationRepository conversationRepository,
        ConversationMessageRepository messageRepository,
        AppUserRepository appUserRepository) {

    this.conversationRepository = conversationRepository;
    this.messageRepository = messageRepository;
    this.appUserRepository = appUserRepository;
}

    @Transactional
    public Conversation getOrCreateConversation(
        Long conversationId,
        String buyerName,
        String budget,
        String requirements,
        String language) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    AppUser currentUser = appUserRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new IllegalStateException("Authenticated user not found."));

    Conversation conversation;

    if (conversationId != null) {
        conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Conversation not found."));

        boolean isManager =
                "ADMIN".equals(currentUser.getRole())
                || "SALES_HEAD".equals(currentUser.getRole());

        if (!isManager &&
                (conversation.getOwner() == null
                || !conversation.getOwner().getId().equals(currentUser.getId()))) {

            throw new AccessDeniedException(
                    "You are not authorized to access this conversation.");
        }

    } else {
        conversation = new Conversation();
        conversation.setOwner(currentUser);
    }

    if (buyerName != null) {
        conversation.setBuyerName(buyerName);
    }

    if (budget != null) {
        conversation.setBudget(budget);
    }

    if (requirements != null) {
        conversation.setRequirements(requirements);
    }

    if (language != null && !language.isBlank()) {
        conversation.setLanguage(language);
    }

    return conversationRepository.save(conversation);
}
        @Transactional(readOnly = true)
public Conversation getAccessibleConversation(Long conversationId) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    AppUser currentUser = appUserRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new IllegalStateException("Authenticated user not found."));

    Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Conversation not found."));

    boolean isManager =
            "ADMIN".equals(currentUser.getRole())
            || "SALES_HEAD".equals(currentUser.getRole());

    if (!isManager &&
            (conversation.getOwner() == null
            || !conversation.getOwner().getId().equals(currentUser.getId()))) {

        throw new AccessDeniedException(
                "You are not authorized to access this conversation.");
    }

    return conversation;
}

    @Transactional
    public ConversationMessage saveMessage(
        Conversation conversation,
        String sender,
        String message) {

    Conversation accessibleConversation =
            getAccessibleConversation(conversation.getId());

    ConversationMessage conversationMessage =
            new ConversationMessage();

    conversationMessage.setConversation(accessibleConversation);
    conversationMessage.setSender(sender);
    conversationMessage.setMessage(message);

    return messageRepository.save(conversationMessage);
    }

    @Transactional
    public void requestHumanHandoff(Conversation conversation) {

        Conversation accessibleConversation =
            getAccessibleConversation(conversation.getId());

        accessibleConversation.setHandoffRequested(true);
            conversationRepository.save(accessibleConversation);
}
}
