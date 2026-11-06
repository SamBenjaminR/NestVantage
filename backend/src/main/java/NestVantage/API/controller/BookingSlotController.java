package NestVantage.API.controller;

import NestVantage.API.entity.BookingSlot;
import NestVantage.API.service.BookingSlotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking-slots")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingSlotController {

    private final BookingSlotService service;

    public BookingSlotController(BookingSlotService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookingSlot> getAll() {
        return service.getAllSlots();
    }

    @GetMapping("/active")
    public List<BookingSlot> getActive() {
        return service.getActiveSlots();
    }

    @GetMapping("/project/{projectName}")
    public List<BookingSlot> getByProject(
            @PathVariable String projectName) {
        return service.getSlotsByProject(projectName);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookingSlot slot) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(service.createSlot(slot));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody BookingSlot slot) {
        try {
            return ResponseEntity.ok(service.updateSlot(id, slot));
        } catch (IllegalArgumentException e) {
            HttpStatus status = e.getMessage().contains("not found")
                    ? HttpStatus.NOT_FOUND
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteSlot(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}