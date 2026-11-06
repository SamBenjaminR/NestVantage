package NestVantage.API.repository;

import NestVantage.API.entity.PropertyFactSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyFactSheetRepository
        extends JpaRepository<PropertyFactSheet, Long> {

    List<PropertyFactSheet> findByActiveTrue();
}