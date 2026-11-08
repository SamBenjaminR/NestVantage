package NestVantage.API.repository;

import NestVantage.API.entity.Conversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByPublicAccessTokenHash(String tokenHash);

    @EntityGraph(attributePaths = {"lead"})
    List<Conversation> findByLeadIsNotNull();
}