package NestVantage.API.service;

import NestVantage.API.entity.BookingSlot;
import NestVantage.API.repository.BookingSlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingSlotService {

    private final BookingSlotRepository repository;

    public BookingSlotService(BookingSlotRepository repository) {
        this.repository = repository;
    }

    public List<BookingSlot> getAllSlots() {
        return repository.findAll();
    }

    public List<BookingSlot> getActiveSlots() {
        return repository.findByActiveTrue();
    }

    public List<BookingSlot> getSlotsByProject(String projectName) {
        return repository.findByProjectNameAndActiveTrue(projectName);
    }

    public BookingSlot createSlot(BookingSlot slot) {
        validate(slot);

        if (repository.existsByProjectNameAndSlotTime(
                slot.getProjectName(), slot.getSlotTime())) {
            throw new IllegalArgumentException(
                    "This time slot already exists for this project.");
        }

        return repository.save(slot);
    }

    public BookingSlot updateSlot(Long id, BookingSlot updated) {
        validate(updated);

        BookingSlot existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Booking slot not found."));

        boolean duplicate = repository.findAll().stream()
                .anyMatch(slot ->
                        !slot.getId().equals(id)
                        && slot.getProjectName().equalsIgnoreCase(
                                updated.getProjectName())
                        && slot.getSlotTime().equalsIgnoreCase(
                                updated.getSlotTime()));

        if (duplicate) {
            throw new IllegalArgumentException(
                    "This time slot already exists for this project.");
        }

        existing.setProjectName(updated.getProjectName());
        existing.setSlotTime(updated.getSlotTime());
        existing.setActive(updated.isActive());

        return repository.save(existing);
    }

    public void deleteSlot(Long id) {
        BookingSlot slot = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Booking slot not found."));

        repository.delete(slot);
    }

    private void validate(BookingSlot slot) {
        if (slot.getProjectName() == null
                || slot.getProjectName().isBlank()) {
            throw new IllegalArgumentException(
                    "Project name is required.");
        }

        if (slot.getSlotTime() == null
                || !slot.getSlotTime().matches(
                        "^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$")) {
            throw new IllegalArgumentException(
                    "Time must use the format HH:MM AM/PM.");
        }
    }
}