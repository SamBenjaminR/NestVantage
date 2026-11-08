package NestVantage.API.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "marketing_spends",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_marketing_spend_source_month",
            columnNames = {"source", "spend_month"}
        )
    }
)
public class MarketingSpend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Lead source is required")
    @Column(nullable = false)
    private String source;

    @NotBlank(message = "Spend month is required")
    @Pattern(
        regexp = "^\\d{4}-(0[1-9]|1[0-2])$",
        message = "Month must use YYYY-MM format"
    )
    @Column(name = "spend_month", nullable = false, length = 7)
    private String spendMonth;

    @DecimalMin(value = "0.00", message = "Spend cannot be negative")
    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public MarketingSpend() {
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

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSpendMonth() {
        return spendMonth;
    }

    public void setSpendMonth(String spendMonth) {
        this.spendMonth = spendMonth;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}