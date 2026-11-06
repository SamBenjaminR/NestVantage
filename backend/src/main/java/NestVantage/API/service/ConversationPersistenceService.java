
package NestVantage.API.service;

import NestVantage.API.entity.Conversation;
import NestVantage.API.entity.ConversationMessage;
import NestVantage.API.repository.ConversationRepository;
import NestVantage.API.repository.ConversationMessageRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationPersistenceService {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;

    public ConversationPersistenceService(
            ConversationRepository conversationRepository,
            ConversationMessageRepository messageRepository) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public Conversation getOrCreateConversation(
            Long conversationId,
            String buyerName,
            String budget,
            String requirements,
            String language) {

        Conversation conversation;

        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Conversation not found."
                            ));
        } else {
            conversation = new Conversation();
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

    @Transactional
    public ConversationMessage saveMessage(
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

    @Transactional
    public void requestHumanHandoff(Conversation conversation) {
        conversation.setHandoffRequested(true);
        conversationRepository.save(conversation);
    }
}
