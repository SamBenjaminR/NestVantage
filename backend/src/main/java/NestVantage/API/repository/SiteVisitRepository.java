
package NestVantage.API.repository;

import NestVantage.API.entity.SiteVisit;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {

    boolean existsByProjectNameAndVisitDateAndVisitTimeAndStatus(
            String projectName,
            LocalDate visitDate,
            LocalTime visitTime,
            String status
    );

    @EntityGraph(attributePaths = {"lead"})
    List<SiteVisit> findByStatusOrderByVisitDateAscVisitTimeAsc(String status);
}
