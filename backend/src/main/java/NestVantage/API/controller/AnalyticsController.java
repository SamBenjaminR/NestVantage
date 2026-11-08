package NestVantage.API.controller;

import NestVantage.API.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/response-time")
    public ResponseEntity<Map<String, Object>> getResponseTimeAnalytics() {
        return ResponseEntity.ok(
                analyticsService.getResponseTimeAnalytics()
        );
    }

    @GetMapping("/cost-per-visit")
    public ResponseEntity<Map<String, Object>> getCostPerVisitAnalytics(
            @RequestParam String month) {

        return ResponseEntity.ok(
                analyticsService.getCostPerVisitAnalytics(month)
        );
    }
}