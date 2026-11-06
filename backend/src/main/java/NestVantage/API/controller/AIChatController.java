
package NestVantage.API.controller;

import NestVantage.API.entity.Conversation;
import NestVantage.API.service.ConversationPersistenceService;
import NestVantage.API.service.ai.GeminiService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIChatController {

    private final GeminiService geminiService;
    private final ConversationPersistenceService persistenceService;

    public AIChatController(
            GeminiService geminiService,
            ConversationPersistenceService persistenceService) {

        this.geminiService = geminiService;
        this.persistenceService = persistenceService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestBody Map<String, Object> request) {

        String message = (String) request.get("message");

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message cannot be empty."));
        }

        try {
            Long conversationId = null;

            Object idValue = request.get("conversationId");

            if (idValue instanceof Number) {
                conversationId = ((Number) idValue).longValue();
            }

            String buyerName = (String) request.get("buyerName");
            String budget = (String) request.get("budget");
            String requirements = (String) request.get("requirements");
            String language = (String) request.get("language");

            Conversation conversation =
                    persistenceService.getOrCreateConversation(
                            conversationId,
                            buyerName,
                            budget,
                            requirements,
                            language
                    );

            persistenceService.saveMessage(
                    conversation, "BUYER", message
            );

            String context = (String) request.get("context");

                String aiInput = (context == null || context.isBlank())
                    ? message
                    : context + "\nBuyer: " + message;

            String reply = geminiService.generateReply(aiInput);

            persistenceService.saveMessage(
                    conversation, "AI", reply
            );

            return ResponseEntity.ok(
                    Map.of(
                            "conversationId", conversation.getId(),
                            "reply", reply
                    )
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));

        } catch (Exception exception) {
            exception.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "AI service is temporarily unavailable. Please try again."
                    ));
        }
    }
}
