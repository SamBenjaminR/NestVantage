
package NestVantage.API.auth.service;

import NestVantage.API.auth.entity.AppUser;
import NestVantage.API.auth.repository.AppUserRepository;
import NestVantage.API.entity.SalesExecutive;
import NestVantage.API.repository.SalesExecutiveRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DemoUserInitializer {

    @Value("${app.demo-user-password:}")
    private String demoPassword;

    @Value("${app.admin-password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initializeDemoUsers(
            AppUserRepository appUserRepository,
            SalesExecutiveRepository salesExecutiveRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            if (demoPassword != null && demoPassword.length() >= 12) {

                createExecutiveAccount(
                    "Arjun Sharma", "arjun@companya.com", "SALES_EXECUTIVE",
                    appUserRepository, salesExecutiveRepository, passwordEncoder
                );

                createExecutiveAccount(
                    "Priya Patel", "priya@companya.com", "SALES_EXECUTIVE",
                    appUserRepository, salesExecutiveRepository, passwordEncoder
                );

                createExecutiveAccount(
                    "Rahul Mehta", "rahul@companya.com", "SALES_EXECUTIVE",
                    appUserRepository, salesExecutiveRepository, passwordEncoder
                );

                createSalesHeadAccount(appUserRepository, passwordEncoder);

            } else {
                System.out.println(
                    "Demo accounts not initialized. Configure DEMO_USER_PASSWORD (minimum 12 characters)."
                );
            }

            if (adminPassword != null && adminPassword.length() >= 12) {
                createAdminAccount(appUserRepository, passwordEncoder);
            } else {
                System.out.println(
                    "Admin account not initialized. Configure ADMIN_PASSWORD (minimum 12 characters)."
                );
            }
        };
    }

    private void createExecutiveAccount(
            String name,
            String email,
            String role,
            AppUserRepository appUserRepository,
            SalesExecutiveRepository salesExecutiveRepository,
            PasswordEncoder passwordEncoder) {

        SalesExecutive executive = salesExecutiveRepository.findByEmail(email)
            .orElseGet(() -> {
                SalesExecutive newExecutive = new SalesExecutive();
                newExecutive.setName(name);
                newExecutive.setEmail(email);
                newExecutive.setAvailable(true);
                return salesExecutiveRepository.save(newExecutive);
            });

        AppUser user = appUserRepository.findByEmail(email)
            .orElseGet(AppUser::new);

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(demoPassword));
        user.setRole(role);
        user.setSalesExecutive(executive);
        user.setEnabled(true);

        appUserRepository.save(user);
    }

    private void createSalesHeadAccount(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {

        String email = "saleshead@companya.com";

        AppUser user = appUserRepository.findByEmail(email)
            .orElseGet(AppUser::new);

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(demoPassword));
        user.setRole("SALES_HEAD");
        user.setEnabled(true);

        appUserRepository.save(user);
    }

    private void createAdminAccount(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {

        String email = "admin@companya.com";

        AppUser user = appUserRepository.findByEmail(email)
            .orElseGet(AppUser::new);

        if (user.getId() == null) {
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(adminPassword));
        }

        user.setRole("ADMIN");
        user.setEnabled(true);

        appUserRepository.save(user);
    }
}
