
package NestVantage.API.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LeadRequest(

    @NotBlank(message = "Lead code is required")
    @Size(max = 50, message = "Lead code cannot exceed 50 characters")
    String leadCode,

    @NotBlank(message = "Buyer name is required")
    @Size(max = 100, message = "Buyer name cannot exceed 100 characters")
    String buyerName,

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "Phone number must contain exactly 10 digits"
    )
    String phone,

    @NotBlank(message = "Source is required")
    String source,

    @NotBlank(message = "Project name is required")
    String projectName,

    @NotBlank(message = "Property configuration is required")
    String bhkType,

    String budget

) {}
