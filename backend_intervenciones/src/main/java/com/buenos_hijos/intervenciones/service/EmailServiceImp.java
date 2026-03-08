package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.model.Email_Verification;
import com.buenos_hijos.intervenciones.model.Mail;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IEmailService;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImp implements IEmailService {

    private final TemplateEngine templateEngine;
    private final IUserRepository userRepository;

    @Value("${resend.api-key}")
    private String resendApiKey;


    @Override
    @Async
    public void sendSimpleEmail(Mail mail) {
        Resend resend = new Resend(resendApiKey);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("contacto@losbuenoshijos.org")
                .to(mail.getTo())
                .subject(mail.getSubject())
                .html(mail.getBody())
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            System.err.println("Error en sendHTMLEmail: " + e.getMessage());
        }
    }

    @Override
    @Async
    @SneakyThrows
    public void sendHTMLEmail(Mail mail) {
        /*MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("pichilongo1@gmail.com");
        helper.setTo(mail.getTo());
        helper.setSubject(mail.getSubject());
        helper.setText(mail.getBody(), true);

        javaMailSender.send(message);*/
        sendSimpleEmail(mail);
    }

    @Override
    @Async
    @SneakyThrows
    public void sendEmailWithThymeLeaf(Mail mail,String rawPassword) {
        Resend resend = new Resend(resendApiKey);
        String recipient = mail.getTo();

        User user = userRepository.findByEmail(recipient)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + recipient));

        Context context = new Context();
        context.setVariable("username", user.getUsername());
        context.setVariable("email", user.getEmail());
        context.setVariable("password", rawPassword);

        String htmlContent = templateEngine.process("ThymeLeafMail", context);

        /*MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");*/

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("contacto@losbuenoshijos.org")
                .to(mail.getTo())
                .subject(mail.getSubject())
                .html(htmlContent)
                .build();

        try{
            resend.emails().send(params);
        }catch (ResendException e) {
            throw new RuntimeException("Error enviando con Resend", e);
        }

    }

    @Async
    @SneakyThrows
    @Override
    public void sendEmailToChangePassword(Mail mail, String token) {
        Resend resend = new Resend(resendApiKey);
        String recipient = mail.getTo();

        User user = userRepository.findByEmail(recipient)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + recipient));

        Context context = new Context();
        context.setVariable("username", user.getUsername());
        String recoveryUrl = "https://losbuenoshijos.org/reset-password/" + token;
        context.setVariable("url", recoveryUrl);

        String htmlProcess = templateEngine.process("ForgotPassword", context);

        /*MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");*/

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("contacto@losbuenoshijos.org") //
                .to(recipient)
                .subject(mail.getSubject())
                .html(htmlProcess)
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            System.err.println("Error enviando email con Resend: " + e.getMessage());
        }
    }

    @Override
    public void sendEmailWithAttachment(Mail mail) {

    }
}
