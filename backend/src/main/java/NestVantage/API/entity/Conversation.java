
package NestVantage.API.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import NestVantage.API.auth.entity.AppUser;

@Entity
@Table(name = "conversations")
public class Conversation {

   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private AppUser owner;

    @Column(name = "public_access_token_hash", unique = true, length = 64)
    private String publicAccessTokenHash;

    @Column(name = "buyer_name", length = 100)
    private String buyerName;

    @Column(name = "budget", length = 100)
    private String budget;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "language", nullable = false, length = 20)
    private String language = "English";

    @Column(name = "handoff_requested", nullable = false)
    private boolean handoffRequested = false;

    // Link this conversation to an existing buyer lead.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Conversation() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
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

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public boolean isHandoffRequested() {
        return handoffRequested;
    }

    public void setHandoffRequested(boolean handoffRequested) {
        this.handoffRequested = handoffRequested;
    }

    public Lead getLead() {
        return lead;
    }

    public void setLead(Lead lead) {
        this.lead = lead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public AppUser getOwner() {
    return owner;
    }
    public void setOwner(AppUser owner) {
    this.owner = owner;
    }
    public String getPublicAccessTokenHash() {
    return publicAccessTokenHash;
    }

    public void setPublicAccessTokenHash(String publicAccessTokenHash) {
    this.publicAccessTokenHash = publicAccessTokenHash;
    }   
}
