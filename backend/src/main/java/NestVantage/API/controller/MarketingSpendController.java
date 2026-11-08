package NestVantage.API.controller;

import NestVantage.API.entity.MarketingSpend;
import NestVantage.API.service.MarketingSpendService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing-spends")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD')")
public class MarketingSpendController {

    private final MarketingSpendService service;

    public MarketingSpendController(MarketingSpendService service) {
        this.service = service;
    }

    @GetMapping
    public List<MarketingSpend> getAll() {
        return service.getAllSpends();
    }

    @GetMapping("/month/{month}")
    public List<MarketingSpend> getByMonth(@PathVariable String month) {
        return service.getSpendsByMonth(month);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody MarketingSpend spend) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(service.createSpend(spend));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody MarketingSpend spend) {
        try {
            return ResponseEntity.ok(service.updateSpend(id, spend));
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
            service.deleteSpend(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}