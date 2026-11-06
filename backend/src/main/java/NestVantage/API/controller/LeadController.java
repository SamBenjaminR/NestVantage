
package NestVantage.API.controller;

import NestVantage.API.dto.LeadRequest;
import NestVantage.API.entity.Lead;
import NestVantage.API.service.LeadService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "http://localhost:5173")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    // GET /api/leads
    @GetMapping
    public ResponseEntity<List<Lead>> getAllLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }

    // GET /api/leads/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
        return leadService.getLeadById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/leads/code/{leadCode}
    @GetMapping("/code/{leadCode}")
    public ResponseEntity<Lead> getLeadByCode(
            @PathVariable String leadCode) {

        return leadService.getLeadByCode(leadCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/leads
    @PostMapping
    public ResponseEntity<?> createLead(
            @Valid @RequestBody LeadRequest request) {

        try {
            Lead savedLead = leadService.createLead(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedLead);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", exception.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLead(
        @PathVariable Long id,
        @Valid @RequestBody LeadRequest request) {

        return leadService.updateLead(id, request)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build()); 
        }
        // DELETE /api/leads/{id}
        @DeleteMapping("/{id}")
            public ResponseEntity<Void> deleteLead(@PathVariable Long id) {

           boolean deleted = leadService.deleteLead(id);
                if (!deleted) {
        return ResponseEntity.notFound().build();
    }
        return ResponseEntity.noContent().build();
}

}
