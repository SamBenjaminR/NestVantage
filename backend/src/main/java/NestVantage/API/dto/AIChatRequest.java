
package NestVantage.API.dto;

public class AIChatRequest {

    private String message;
    private String language;
    private Long conversationId;
    private String buyerName;
    private String budget;
    private String requirements;
    private String recentConversation;

    public AIChatRequest() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBudget() {
        return budget;
    }

    public void setBudget(String budget) {
        this.budget = budget;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getRecentConversation() {
        return recentConversation;
    }

    public void setRecentConversation(String recentConversation) {
        this.recentConversation = recentConversation;
    }
}
