
package NestVantage.API.service.ai;

import tools.jackson.databind.JsonNode;
// import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import NestVantage.API.repository.PropertyFactSheetRepository;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final JsonMapper objectMapper;

    private final PropertyFactSheetRepository propertyFactSheetRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    public GeminiService(
        RestClient.Builder restClientBuilder,
        JsonMapper objectMapper,
        PropertyFactSheetRepository propertyFactSheetRepository) {

         this.restClient = restClientBuilder.build();
         this.objectMapper = objectMapper;
         this.propertyFactSheetRepository = propertyFactSheetRepository;
}

private String getVerifiedFactSheet() {
    return propertyFactSheetRepository.findByActiveTrue()
            .stream()
            .map(fact -> """
                    Project: %s
                    Location: %s
                    Configurations: %s
                    Price Range: %s
                    Amenities: %s
                    Description: %s
                    """.formatted(
                    fact.getProjectName(),
                    fact.getLocation(),
                    fact.getConfigurations(),
                    fact.getPriceRange(),
                    fact.getAmenities(),
                    fact.getDescription()
            ))
            .reduce("", (a, b) -> a + "\n" + b);
}
    public String generateReply(String buyerMessage) {

        String prompt = """
                You are NestVantage, a helpful real-estate enquiry assistant
                for Company A in Ahmedabad.

                Follow these rules strictly:
                1. Use only the verified facts in the fact sheet below.
                2. Never invent project names, addresses, amenities,
                   availability, RERA numbers, or other property details.
                3. The indicative property budget range is ₹65 lakh to
                   ₹1.2 crore. Never promise a final price or discount.
                4. If a buyer asks for information not included in the
                   fact sheet, explain politely that a sales executive
                   must confirm it.
                5. If the buyer requests a human, acknowledge the request
                   and say that the sales team will follow up.
                6. Keep replies concise, friendly, and professional.
                7. Respond in the language used by the buyer when possible:
                   English, Hindi, or Gujarati.
                8. If there are no active property fact sheets, do not invent
                   property details. Ask the buyer to contact a sales executive.   

                Verified fact sheet:
                """ + getVerifiedFactSheet() + """

                Buyer message:
                """ + buyerMessage;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        try {
            String response = restClient.post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/"
                            + model + ":generateContent")
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);

            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            return textNode.asText();

        } catch (Exception exception) {
            throw new RuntimeException(
                    "Unable to generate an AI response. Please try again.",
                    exception
            );
        }
    }
        
public String generateHandoffSummary(String conversationDetails) {

    String prompt = """
            You are preparing a sales handoff summary for NestVantage,
            a real-estate developer in Ahmedabad.

            Create a concise, factual summary for a human sales executive.
            Include:
            1. Buyer details and budget.
            2. Preferred property configuration.
            3. Main questions and requirements.
            4. Important points discussed.
            5. Recommended follow-up action.

            Use only the information provided.
            Do not invent buyer preferences or property facts.
            Keep the summary professional and easy to scan.

            Conversation details:
            """ + conversationDetails;

    Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                    Map.of(
                            "parts", List.of(
                                    Map.of("text", prompt)
                            )
                    )
            )
    );

    try {
        String response = restClient.post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/"
                        + model + ":generateContent")
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(response);

        JsonNode textNode = root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text");

        if (textNode.isMissingNode() || textNode.isNull()) {
            throw new IllegalStateException(
                    "Gemini returned an empty handoff summary."
            );
        }

        return textNode.asText();

    } catch (Exception exception) {
        throw new RuntimeException(
                "Unable to generate the handoff summary.",
                exception
        );
    }
}

}
