
package NestVantage.API.repository;

import NestVantage.API.entity.Handoff;
import NestVantage.API.entity.SalesExecutive;
import NestVantage.API.entity.Conversation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HandoffRepository extends JpaRepository<Handoff, Long> {

    Optional<Handoff> findByConversation(Conversation conversation);

    List<Handoff> findByStatusOrderByRequestedAtDesc(String status);

    List<Handoff> findAllByOrderByRequestedAtDesc();

    long countBySalesExecutiveAndStatus(
            SalesExecutive salesExecutive,
            String status
    );
        List<Handoff> findBySalesExecutiveOrderByRequestedAtDesc(
            SalesExecutive salesExecutive
    );
}
