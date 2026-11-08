
package NestVantage.API.controller;

import NestVantage.API.service.PublicConversationService;
import NestVantage.API.service.HandoffService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicChatController {

    private final PublicConversationService publicConversationService;
    private final HandoffService handoffService;

    public PublicChatController(
            PublicConversationService publicConversationService,
            HandoffService handoffService) {

        this.publicConversationService = publicConversationService;
        this.handoffService = handoffService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startConversation(
            @RequestBody(required = false) Map<String, Object> request) {

        String language = request == null
                ? "English"
                : (String) request.getOrDefault("language", "English");

        return ResponseEntity.ok(
                publicConversationService.startConversation(language));
    }

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> request) {

        try {
            String accessToken = (String) request.get("accessToken");
            String message = (String) request.get("message");
            String buyerName = (String) request.get("buyerName");
            String budget = (String) request.get("budget");
            String requirements = (String) request.get("requirements");
            String language = (String) request.get("language");

            return ResponseEntity.ok(
                    publicConversationService.sendMessage(
                            accessToken,
                            message,
                            buyerName,
                            budget,
                            requirements,
                            language));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", exception.getMessage()));

        } catch (Exception exception) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error",
                            "Unable to process your message. Please try again."));
        }
    }

    
@PostMapping("/handoff")
public ResponseEntity<?> requestHandoff(
        @RequestBody Map<String, Object> request) {

    try {
        String accessToken = (String) request.get("accessToken");
        String buyerName = (String) request.get("buyerName");
        String phone = (String) request.get("phone");
        String budget = (String) request.get("budget");
        String requirements = (String) request.get("requirements");

        // Save buyer details before creating the handoff.
        publicConversationService.updateBuyerDetails(
                accessToken,
                buyerName,
                budget,
                requirements
        );

        var handoff = handoffService.requestPublicHandoff(
                accessToken,
                phone
        );

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("message",
                "Your request has been sent to our sales team.");
        response.put("handoffId", handoff.getId());
        response.put("status", handoff.getStatus());
        response.put("executiveName",
                handoff.getSalesExecutive() == null
                        ? "Awaiting assignment"
                        : handoff.getSalesExecutive().getName());

        return ResponseEntity.ok(response);

    } catch (IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(
                Map.of("error", exception.getMessage()));

    } catch (Exception exception) {
        return ResponseEntity.internalServerError().body(
                Map.of("error",
                        "Unable to submit your request. Please try again."));
        }
    }

}
