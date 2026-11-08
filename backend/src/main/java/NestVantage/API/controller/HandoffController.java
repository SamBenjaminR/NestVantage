
package NestVantage.API.controller;

import NestVantage.API.entity.Handoff;
import NestVantage.API.service.HandoffService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;

import java.util.Map;

@RestController
@RequestMapping("/api/handoffs")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE')")
public class HandoffController {

    private final HandoffService handoffService;

    public HandoffController(HandoffService handoffService) {
        this.handoffService = handoffService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE')")
    public ResponseEntity<?> requestHandoff(
            @RequestBody Map<String, Object> request) {

        try {
            Object conversationIdValue = request.get("conversationId");

            if (!(conversationIdValue instanceof Number)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid conversation ID is required."));
            }

            String phone = (String) request.get("phone");

            Handoff handoff = handoffService.requestHandoff(
                    ((Number) conversationIdValue).longValue(),
                    phone
            );

            return ResponseEntity.ok(Map.of(
                    "handoffId", handoff.getId(),
                    "status", handoff.getStatus(),
                    "executiveName",
                    handoff.getSalesExecutive() == null
                            ? "Awaiting assignment"
                            : handoff.getSalesExecutive().getName(),
                    "summary", handoff.getSummary() == null
                            ? ""
                            : handoff.getSummary()
            ));
         
            
        } catch (AccessDeniedException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", exception.getMessage()));
                
            
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to process the handoff request."));
        }
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE')")
        public ResponseEntity<?> getAllHandoffs() {
    return ResponseEntity.ok(handoffService.getAllHandoffs());
    }

    @GetMapping("/{id}/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE')")
        public ResponseEntity<?> getConversationHistory(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(
                handoffService.getConversationHistory(id)
        );
    } catch (AccessDeniedException exception) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", exception.getMessage()));    

    } catch (IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", exception.getMessage()));
    }
}
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE')")
        public ResponseEntity<?> acceptHandoff(@PathVariable Long id) {
        try {
            Handoff handoff = handoffService.acceptHandoff(id);

        return ResponseEntity.ok(Map.of(
                "handoffId", handoff.getId(),
                "status", handoff.getStatus(),
                "message", "Handoff accepted successfully."
            ));

        }       catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE')")
        public ResponseEntity<?> resolveHandoff(@PathVariable Long id) {
        try {
            Handoff handoff = handoffService.resolveHandoff(id);

            return ResponseEntity.ok(Map.of(
                "handoffId", handoff.getId(),
                "status", handoff.getStatus(),
                "message", "Handoff resolved successfully."
             ));

            } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", exception.getMessage()));
        }
    }
                                                                        
}
