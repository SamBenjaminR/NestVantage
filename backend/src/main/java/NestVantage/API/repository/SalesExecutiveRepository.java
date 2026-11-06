
package NestVantage.API.repository;

import NestVantage.API.entity.SalesExecutive;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesExecutiveRepository
        extends JpaRepository<SalesExecutive, Long> {

    List<SalesExecutive> findByAvailableTrue();

}
