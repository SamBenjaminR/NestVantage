
package NestVantage.API.controller;

import NestVantage.API.dto.PublicSiteVisitRequest;
import NestVantage.API.service.PublicSiteVisitService;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/public/site-visits")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicSiteVisitController {

    private final PublicSiteVisitService publicSiteVisitService;

    public PublicSiteVisitController(
            PublicSiteVisitService publicSiteVisitService) {

        this.publicSiteVisitService = publicSiteVisitService;
    }

    @GetMapping("/availability")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam String projectName,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate visitDate) {

        try {
            return ResponseEntity.ok(
                    publicSiteVisitService.getAvailableSlots(
                            projectName, visitDate));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookSiteVisit(
            @Valid @RequestBody PublicSiteVisitRequest request) {

        try {
            return ResponseEntity.status(201).body(
                    publicSiteVisitService.bookPublicVisit(request));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", exception.getMessage()));

        } catch (Exception exception) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error",
                            "Unable to book your site visit. Please try again."));
        }
    }
}
