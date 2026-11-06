package NestVantage.API.controller;

import NestVantage.API.dto.SiteVisitRequest;
import NestVantage.API.entity.SiteVisit;
import NestVantage.API.service.SiteVisitService;
import NestVantage.API.dto.SiteVisitStatusRequest;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/site-visits")
@CrossOrigin(origins = "http://localhost:5173")
public class SiteVisitController {

    private final SiteVisitService siteVisitService;

    public SiteVisitController(SiteVisitService siteVisitService) {
        this.siteVisitService = siteVisitService;
    }

    @PostMapping
    public ResponseEntity<SiteVisit> bookVisit(
            @Valid @RequestBody SiteVisitRequest request) {

        SiteVisit booking = siteVisitService.bookVisit(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(booking);
    }

    @GetMapping
    public ResponseEntity<List<SiteVisit>> getAllBookings() {

        return ResponseEntity.ok(
                siteVisitService.getAllBookings()
        );
        
    }
    @GetMapping("/history")
public ResponseEntity<List<SiteVisit>> getVisitHistory() {

    return ResponseEntity.ok(
            siteVisitService.getVisitHistory()
    );
}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelVisit(@PathVariable Long id) {

        siteVisitService.cancelVisit(id);

        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{id}/status")
public ResponseEntity<Void> updateVisitStatus(
        @PathVariable Long id,
        @Valid @RequestBody SiteVisitStatusRequest request) {

    siteVisitService.updateVisitStatus(id, request);

    return ResponseEntity.noContent().build();
}

}