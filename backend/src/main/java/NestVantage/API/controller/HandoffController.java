
package NestVantage.API.controller;

import NestVantage.API.entity.Handoff;
import NestVantage.API.service.HandoffService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/handoffs")
@CrossOrigin(origins = "http://localhost:5173")
public class HandoffController {

    private final HandoffService handoffService;

    public HandoffController(HandoffService handoffService) {
        this.handoffService = handoffService;
    }

    @PostMapping
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

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to process the handoff request."));
        }
    }
    @GetMapping
    public ResponseEntity<?> getAllHandoffs() {
    return ResponseEntity.ok(handoffService.getAllHandoffs());
    }

    @GetMapping("/{id}/messages")
public ResponseEntity<?> getConversationHistory(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(
                handoffService.getConversationHistory(id)
        );

    } catch (IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", exception.getMessage()));
    }
}
    @PostMapping("/{id}/accept")
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
