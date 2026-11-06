
package NestVantage.API.repository;

import NestVantage.API.entity.Conversation;
import NestVantage.API.entity.ConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationMessageRepository
        extends JpaRepository<ConversationMessage, Long> {

    List<ConversationMessage> findByConversationOrderByCreatedAtAsc(
            Conversation conversation
    );
}
