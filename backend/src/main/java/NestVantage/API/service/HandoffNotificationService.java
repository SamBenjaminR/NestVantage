
package NestVantage.API.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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

    public void notifySiteVisitReminder(
            Long visitId,
            String visitCode,
            String buyerName,
            String projectName,
            String visitDate,
            String visitTime,
            String locationUrl,
            String reminderType) {

        Map<String, Object> notification = new HashMap<>();

        notification.put("visitId", visitId);
        notification.put("visitCode", visitCode);
        notification.put("buyerName", buyerName);
        notification.put("projectName", projectName);
        notification.put("visitDate", visitDate);
        notification.put("visitTime", visitTime);
        notification.put("locationUrl", locationUrl);
        notification.put("reminderType", reminderType);

        messagingTemplate.convertAndSend(
        "/topic/site-visits",
        (Object) notification
        );
    }
}
