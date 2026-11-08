
package NestVantage.API.service.ai;

import tools.jackson.databind.JsonNode;
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

    // Remove Markdown formatting before displaying AI responses.
    private String cleanAiText(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        return text
                .replaceAll("\\*{1,3}", "")
                .replaceAll("(?m)^\\s*#{1,6}\\s*", "")
                .replaceAll("(?m)^\\s*[-•]\\s+", "")
                .replaceAll("(?m)^\\s*\\d+[.)]\\s+", "")
                .replaceAll("(?m)^\\s*>\\s?", "")
                .replace("`", "")
                .trim();
    }

    public String generateReply(String buyerMessage) {

        String prompt = """
                You are NestVantage, a helpful real-estate enquiry assistant
                for Company A in Ahmedabad.

                Follow these rules strictly:

                1. Use only the verified facts in the active fact sheets below.
                2. Never invent project names, addresses, amenities,
                   availability, RERA numbers, or other property details.
                3. Do not mix the price range, amenities, or other details
                   of one project with another project.
                4. Never promise a final price or discount.
                5. If a buyer asks for information not included in the
                   fact sheets, explain politely that a sales executive
                   must confirm it.
                6. If the buyer requests a human, acknowledge the request
                   and say that the sales team will follow up.
                7. Keep replies concise, friendly, and professional.
                8. Respond in the language used by the buyer when possible:
                   English, Hindi, or Gujarati.
                9. If there are no active property fact sheets, do not invent
                   property details. Ask the buyer to contact a sales executive.
                10. Write in plain text only. Do not use Markdown formatting.
                    Do not use asterisks, bold text, headings, bullet points,
                    numbered lists, or backticks.
                11. Use short paragraphs and natural sentences that are
                    easy to read in a chat window.
                12. Buyer qualification is important. When a buyer expresses interest,
                proactively collect their budget and property requirements.

                13. Check the conversation history to determine which details the buyer
                has already provided. Do not ask for information they have already given.

                14. If the buyer's budget is missing, politely ask for their approximate
                  budget.

                15.  If the buyer has not specified a preferred configuration, explicitly
                        ask: "Would you prefer a 2 BHK or 3 BHK apartment?"
                        Do not rely on a general question about property requirements to collect this information.

                16. Ask about any additional property requirements if they have not
                   already been discussed.

                17. Ask only for the missing details, preferably one or two questions
                  in a natural conversational reply.

                18. Do not force the buyer to provide all details before answering
                their property questions or requesting a site visit.    

                Verified active fact sheets:
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

            return cleanAiText(textNode.asText());

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
                Use plain text only. Do not use Markdown, asterisks,
                bold formatting, or backticks.

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

            return cleanAiText(textNode.asText());

        } catch (Exception exception) {
            throw new RuntimeException(
                    "Unable to generate the handoff summary.",
                    exception
            );
        }
    }
}
