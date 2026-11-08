
package NestVantage.API.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record PublicSiteVisitRequest(

    @NotBlank
    String accessToken,

    @NotBlank
    String buyerName,

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$",
             message = "Phone number must contain exactly 10 digits.")
    String phone,

    String budget,

    String requirements,

    @NotBlank
    String projectName,

    @NotNull
    LocalDate visitDate,

    @NotBlank
    String visitTime

) {}
