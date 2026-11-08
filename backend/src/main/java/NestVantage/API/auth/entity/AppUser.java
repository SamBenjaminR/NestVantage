
package NestVantage.API.auth.entity;

import NestVantage.API.entity.SalesExecutive;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(nullable = false)
    private boolean enabled = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_executive_id", unique = true)
    private SalesExecutive salesExecutive;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AppUser() {
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public SalesExecutive getSalesExecutive() {
        return salesExecutive;
    }

    public void setSalesExecutive(SalesExecutive salesExecutive) {
        this.salesExecutive = salesExecutive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
