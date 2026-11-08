package NestVantage.API.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;

public record SiteVisitRequest(

    @NotNull
    Long leadId,

    @NotBlank
    String projectName,

    @NotNull
    LocalDate visitDate,

    @NotNull
    LocalTime visitTime

) {
}