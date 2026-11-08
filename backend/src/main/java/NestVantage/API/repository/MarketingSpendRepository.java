package NestVantage.API.repository;

import NestVantage.API.entity.MarketingSpend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketingSpendRepository
        extends JpaRepository<MarketingSpend, Long> {

    List<MarketingSpend> findBySpendMonthOrderBySourceAsc(String spendMonth);

    Optional<MarketingSpend> findBySourceIgnoreCaseAndSpendMonth(
            String source,
            String spendMonth
    );
}