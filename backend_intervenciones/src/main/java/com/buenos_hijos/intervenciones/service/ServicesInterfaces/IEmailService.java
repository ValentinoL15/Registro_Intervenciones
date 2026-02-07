package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.model.Mail;

public interface IEmailService {

    void sendSimpleEmail(Mail mail);

    void sendHTMLEmail(Mail mail);

    void sendEmailWithThymeLeaf(Mail mail, String rawPassword);

    void sendEmailToChangePassword(Mail mail, String token);

    void sendEmailWithAttachment(Mail mail);

}
