
package NestVantage.API.repository;

import NestVantage.API.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Find a lead using its business lead code.
    Optional<Lead> findByLeadCode(String leadCode);

    // Check whether a lead code already exists.
    boolean existsByLeadCode(String leadCode);

    boolean existsByLeadCodeAndIdNot(String leadCode, Long id);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    Optional<Lead> findByPhone(String phone);
}
    