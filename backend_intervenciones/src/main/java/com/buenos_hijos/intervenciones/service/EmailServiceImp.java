package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.model.Email_Verification;
import com.buenos_hijos.intervenciones.model.Mail;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IEmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImp implements IEmailService {

    private final TemplateEngine templateEngine;
    private final JavaMailSender javaMailSender;
    private final IUserRepository userRepository;


    @Override
    @Async
    public void sendSimpleEmail(Mail mail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(mail.getTo());
        message.setSubject(mail.getSubject());
        message.setText(mail.getBody());

        javaMailSender.send(message);
    }

    @Override
    @Async
    @SneakyThrows
    public void sendHTMLEmail(Mail mail) {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("pichilongo1@gmail.com");
        helper.setTo(mail.getTo());
        helper.setSubject(mail.getSubject());
        helper.setText(mail.getBody(), true);

        javaMailSender.send(message);
    }

    @Override
    @Async
    @SneakyThrows
    public void sendEmailWithThymeLeaf(Mail mail, String rawPassword) {
        String recipient = mail.getTo();

        User user = userRepository.findByEmail(recipient)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + recipient));

        Context context = new Context();
        context.setVariable("username", user.getUsername());
        context.setVariable("email", user.getEmail());
        context.setVariable("password", rawPassword);

        String process = templateEngine.process("ThymeLeafMail", context);

        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setSubject(mail.getSubject());
        helper.setFrom("Pichilongo1@gmail.com");
        helper.setText(process, true); // ✅ true = HTML
        helper.setTo(recipient);

        javaMailSender.send(message);
    }

    @SneakyThrows
    @Override
    public void sendEmailToChangePassword(Mail mail, String token) {
        String recipient = mail.getTo();

        User user = userRepository.findByEmail(recipient)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + recipient));

        Context context = new Context();
        context.setVariable("username", user.getUsername());
        String recoveryUrl = "http://localhost:3000/resetear-password?token=" + token;
        context.setVariable("url", recoveryUrl);

        String process = templateEngine.process("ForgotPassword", context);

        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setSubject(mail.getSubject());
        helper.setFrom("Pichilongo1@gmail.com");
        helper.setText(process, true); // ✅ true = HTML
        helper.setTo(recipient);

        javaMailSender.send(message);
    }

    @Override
    public void sendEmailWithAttachment(Mail mail) {

    }
}
