
package NestVantage.API.auth.dto;

public record LoginResponse(
        String token,
        String tokenType,
        Long userId,
        String email,
        String role,
        String name
) {
}
