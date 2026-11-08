package NestVantage.API.dto;

import jakarta.validation.constraints.NotBlank;

public record SiteVisitStatusRequest(
        @NotBlank String status
) {}