
package NestVantage.API.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Lead code is required")
    @Size(max = 50, message = "Lead code cannot exceed 50 characters")
    @Column(name = "lead_code", unique = true, nullable = false)
    private String leadCode;

    @NotBlank(message = "Buyer name is required")
    @Size(max = 100, message = "Buyer name cannot exceed 100 characters")
    @Column(name = "buyer_name", nullable = false)
    private String buyerName;

    private String source;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "bhk_type")
    private String bhkType;

   @NotBlank(message = "Phone number is required")
    @Pattern(
    regexp = "^[0-9]{10}$",
    message = "Phone number must contain exactly 10 digits"
)
    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "budget")
    private String budget;

    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Automatically set the creation time before saving.
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Default constructor required by JPA.
    public Lead() {
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public String getLeadCode() {
        return leadCode;
    }

    public void setLeadCode(String leadCode) {
        this.leadCode = leadCode;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getBhkType() {
        return bhkType;
    }

    public void setBhkType(String bhkType) {
        this.bhkType = bhkType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public String getPhone() {
    return phone;
    }

    public void setPhone(String phone) {
    this.phone = phone; 
    }

    public String getBudget() {
    return budget;
    }

    public void setBudget(String budget) {
    this.budget = budget;
    }
}
