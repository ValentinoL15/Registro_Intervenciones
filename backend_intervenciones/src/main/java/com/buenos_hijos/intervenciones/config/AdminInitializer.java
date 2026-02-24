package com.buenos_hijos.intervenciones.config;

import com.buenos_hijos.intervenciones.model.Admin;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IAdminRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final IAdminRepository adminRepository;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-username:admin}")
    private String defaultUsername;

    @Value("${app.admin.default-password}")
    private String defaultPassword;

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setName("Maria José");
            admin.setLastname("Unno");
            admin.setEmail("pichilongo1@gmail.com");
            admin.setUsername(defaultUsername);
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            admin.setRole(User.RoleType.ADMIN);

            adminRepository.save(admin);
            System.out.println(">>> Administrador inicial creado con éxito.");
        }

    }
}
