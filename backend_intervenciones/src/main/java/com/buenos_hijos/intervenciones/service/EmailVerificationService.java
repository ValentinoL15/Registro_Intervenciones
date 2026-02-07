package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.EmailDTOs.CreateVerificationCodeDTO;
import com.buenos_hijos.intervenciones.dto.EmailDTOs.EmailDTO;
import com.buenos_hijos.intervenciones.dto.EmailDTOs.EmailRequest;
import com.buenos_hijos.intervenciones.model.Email_Verification;
import com.buenos_hijos.intervenciones.model.Mail;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IEmailRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IEmailVerificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class EmailVerificationService implements IEmailVerificationService{

    private final IEmailRepository emailVerificationRepository;
    private final EmailServiceImp emailServiceImp;
    private final IUserRepository userRepository;

    public static String generarCodigoCincoDigitos() {
        // Genera un número aleatorio entre 10000 (inclusive) y 99999 (inclusive).
        int min = 10000;
        int max = 99999;

        // Usamos ThreadLocalRandom, que es más eficiente en entornos multihilo.
        int codigo = ThreadLocalRandom.current().nextInt(min, max + 1);

        // Se convierte el entero a String para usarlo como código.
        return String.valueOf(codigo);
    }

    public static String generarTokenVerificacion(){
        String token = UUID.randomUUID().toString();
        return token;
    }


    @Override
    public EmailDTO getVerification(String token) {
        Email_Verification email = emailVerificationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El email no se encuentra"));
        //if(email.isExpired() || email.isRevoked()) {
        //  throw new RuntimeException("Codigo expirado o revocado, por favor vuelve a pedirlo");
        //}
        EmailDTO emailDTO = new EmailDTO(
                email.getUser().getEmail(),
                email.getToken(),
                email.getExpiryDate(),
                email.isExpired(),
                email.isRevoked()
        );
        return emailDTO;
    }

    @Override
    public void sendEmailWithCredentials(String email, String rawPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No se encuentra el usuario con el email ingresado"));

        emailVerificationRepository.revokeAllPreviousCodesByUser(user);

        Mail mail = new Mail(email, "Verificación de Email", "");
        try {
            emailServiceImp.sendEmailWithThymeLeaf(mail, rawPassword);
        } catch (Exception e) {
            // No detener el flujo de creación de usuario si el envío de email falla en desarrollo
            System.err.println("Warning: fallo al enviar email de verificación: " + e.getMessage());
        }


    }


    @Override
    public String verificationEmail(String token, CreateVerificationCodeDTO code) {
        return "";
    }

    @Override
    public String reSendEmailConfirmation(EmailRequest email) {
        return "";
    }
}
