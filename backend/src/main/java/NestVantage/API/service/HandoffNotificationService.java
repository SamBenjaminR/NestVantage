
package NestVantage.API.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class HandoffNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public HandoffNotificationService(
            SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyNewHandoff(
            Long handoffId,
            String buyerName,
            String phone,
            String summary,
            String status,
            String executiveName) {

        Map<String, Object> notification = Map.of(
                "handoffId", handoffId,
                "buyerName", buyerName,
                "phone", phone,
                "summary", summary,
                "status", status,
                "executiveName", executiveName
        );

        messagingTemplate.convertAndSend(
        "/topic/handoffs",
        (Object) notification
        );
    }
}
