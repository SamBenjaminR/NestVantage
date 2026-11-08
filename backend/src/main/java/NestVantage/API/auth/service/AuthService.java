
package NestVantage.API.auth.service;

import NestVantage.API.auth.dto.LoginRequest;
import NestVantage.API.auth.dto.LoginResponse;
import NestVantage.API.auth.entity.AppUser;
import NestVantage.API.auth.repository.AppUserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            AppUserRepository appUserRepository,
            JwtService jwtService) {

        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        String email = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        String name;

                if (user.getSalesExecutive() != null) {
                        name = user.getSalesExecutive().getName();
                } else if ("ADMIN".equals(user.getRole())) {
                        name = "Admin";
                } else if ("SALES_HEAD".equals(user.getRole())) {
                        name = "Sales Head";
                } else {
                        name = "User";
                }

        return new LoginResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getRole(),
                name
        );
    }
}
