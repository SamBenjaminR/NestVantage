package NestVantage.API.repository;

import NestVantage.API.entity.BookingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingSlotRepository
        extends JpaRepository<BookingSlot, Long> {

    List<BookingSlot> findByActiveTrue();

    List<BookingSlot> findByProjectNameAndActiveTrue(String projectName);

    boolean existsByProjectNameAndSlotTime(
            String projectName,
            String slotTime
    );
}