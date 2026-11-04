package NestVantage.API.controller;

import NestVantage.API.dto.SiteVisitRequest;
import NestVantage.API.entity.SiteVisit;
import NestVantage.API.service.SiteVisitService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelVisit(@PathVariable Long id) {

        siteVisitService.cancelVisit(id);

        return ResponseEntity.noContent().build();
    }
}