package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.model.ChangePassword;
import com.buenos_hijos.intervenciones.model.Mail;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IPasswordRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IChangePasswordService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChangePasswordService implements IChangePasswordService {

    private final IPasswordRepository changePasswordRepository;
    private final IUserRepository userRepository;
    private final EmailServiceImp emailService;

    @Override
    @Transactional
    public GeneralResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario desconocido"));

        List<ChangePassword> tokensAnteriores = changePasswordRepository.findByEmail(user.getEmail());

        if (!tokensAnteriores.isEmpty()) {
            changePasswordRepository.deleteAll(tokensAnteriores);
        }

        String token = UUID.randomUUID().toString();
        ChangePassword pass = new ChangePassword();
        pass.setEmail(user.getEmail());
        pass.setToken(token);
        pass.setExpiryDate(LocalDateTime.now().plusDays(1));
        changePasswordRepository.save(pass);

        Mail mymail = new Mail(user.getEmail(),"Recuperación de contraseña", "");
        try {
            emailService.sendEmailToChangePassword(mymail,token);
        } catch (Exception e) {
            // En desarrollo, no obligamos al envío de email para continuar el flujo
            System.err.println("Warning: fallo al enviar email de recuperación: " + e.getMessage());
        }
        return new GeneralResponse(new Date(),
                "Email (o token) generado con éxito",
                HttpStatus.ACCEPTED.value());
    }

    @Override
    @Transactional
    public GeneralResponse changePassword(String token, String password) {
        ChangePassword pass = changePasswordRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El token no es válido o ha expirado, por favor intente nuevamente"));

        User user = userRepository.findByEmail(pass.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        System.out.println("DEBUG: Usuario encontrado ID: " + user.getUsername() + " Email: " + user.getEmail());

        // 3. Encriptar y Setear
        String passEncriptada = encryptPassword(password);
        user.setPassword(passEncriptada);

        try {
            userRepository.save(user);

            pass.setRevoked(true);
            changePasswordRepository.saveAndFlush(pass);

        } catch (Exception e) {
            System.err.println("ERROR AL GUARDAR EN BD: " + e.getMessage());
            throw e;
        }

        return new GeneralResponse(new Date(), "Contraseña modificada con éxito", HttpStatus.ACCEPTED.value());

    }

    @Override
    public boolean isTokenValid(String token) {
        return changePasswordRepository.findByToken(token)
                .map(tokenEntity -> {
                    if (tokenEntity.isRevoked()) {
                        return false;
                    }

                    LocalDateTime now = LocalDateTime.now();
                    return tokenEntity.getExpiryDate().isAfter(now);
                })
                .orElse(false);
    }

    @Override
    public String encryptPassword(String password) {
        return new BCryptPasswordEncoder().encode(password);
    }
}
