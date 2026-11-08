package NestVantage.API.service;

import NestVantage.API.entity.MarketingSpend;
import NestVantage.API.repository.MarketingSpendRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MarketingSpendService {

    private final MarketingSpendRepository repository;

    public MarketingSpendService(MarketingSpendRepository repository) {
        this.repository = repository;
    }

    public List<MarketingSpend> getAllSpends() {
        return repository.findAll();
    }

    public List<MarketingSpend> getSpendsByMonth(String month) {
        validateMonth(month);
        return repository.findBySpendMonthOrderBySourceAsc(month);
    }

    @Transactional
    public MarketingSpend createSpend(MarketingSpend spend) {
        validate(spend);

        if (repository.findBySourceIgnoreCaseAndSpendMonth(
                spend.getSource(), spend.getSpendMonth()).isPresent()) {
            throw new IllegalArgumentException(
                    "A spend record already exists for this source and month.");
        }

        try {
            return repository.saveAndFlush(spend);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException(
                    "A spend record already exists for this source and month.");
        }
    }

    @Transactional
    public MarketingSpend updateSpend(Long id, MarketingSpend updated) {
        validate(updated);

        MarketingSpend existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Marketing spend record not found."));

        boolean duplicate = repository
                .findBySourceIgnoreCaseAndSpendMonth(
                        updated.getSource(), updated.getSpendMonth())
                .filter(record -> !record.getId().equals(id))
                .isPresent();

        if (duplicate) {
            throw new IllegalArgumentException(
                    "A spend record already exists for this source and month.");
        }

        existing.setSource(updated.getSource().trim());
        existing.setSpendMonth(updated.getSpendMonth());
        existing.setAmount(updated.getAmount());

        try {
            return repository.saveAndFlush(existing);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException(
                    "A spend record already exists for this source and month.");
        }
    }

    @Transactional
    public void deleteSpend(Long id) {
        MarketingSpend spend = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Marketing spend record not found."));

        repository.delete(spend);
    }

    private void validate(MarketingSpend spend) {

        if (spend.getSource() == null || spend.getSource().isBlank()) {
            throw new IllegalArgumentException("Lead source is required.");
        }

        spend.setSource(spend.getSource().trim());

        validateMonth(spend.getSpendMonth());

        if (spend.getAmount() == null
                || spend.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Marketing spend must be zero or greater.");
        }
    }

    private void validateMonth(String month) {
        if (month == null || !month.matches(
                "^\\d{4}-(0[1-9]|1[0-2])$")) {
            throw new IllegalArgumentException(
                    "Month must use YYYY-MM format.");
        }
    }
}