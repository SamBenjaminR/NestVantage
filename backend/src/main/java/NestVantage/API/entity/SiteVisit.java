
package NestVantage.API.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "site_visits")
public class SiteVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visit_code", unique = true, nullable = false)
    private String visitCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_time", nullable = false)
    private LocalTime visitTime;

    @Column(nullable = false)
    private String status = "Booked";

    @Column(name = "location_url", length = 500)
    private String locationUrl;

    @Column(name = "reminder_24h_sent", nullable = false)
private boolean reminder24hSent = false;

@Column(name = "reminder_2h_sent", nullable = false)
private boolean reminder2hSent = false;

    public SiteVisit() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVisitCode() {
        return visitCode;
    }

    public void setVisitCode(String visitCode) {
        this.visitCode = visitCode;
    }

    public Lead getLead() {
        return lead;
    }

    public void setLead(Lead lead) {
        this.lead = lead;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public LocalTime getVisitTime() {
        return visitTime;
    }

    public void setVisitTime(LocalTime visitTime) {
        this.visitTime = visitTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocationUrl() {
        return locationUrl;
    }

    public void setLocationUrl(String locationUrl) {
        this.locationUrl = locationUrl;
    }
    public boolean isReminder24hSent() {
    return reminder24hSent;
}

public void setReminder24hSent(boolean reminder24hSent) {
    this.reminder24hSent = reminder24hSent;
}

public boolean isReminder2hSent() {
    return reminder2hSent;
}

public void setReminder2hSent(boolean reminder2hSent) {
    this.reminder2hSent = reminder2hSent;
}
}
