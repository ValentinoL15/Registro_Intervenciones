package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.EmailDTOs.CreateVerificationCodeDTO;
import com.buenos_hijos.intervenciones.dto.EmailDTOs.EmailDTO;
import com.buenos_hijos.intervenciones.dto.EmailDTOs.EmailRequest;

public interface IEmailVerificationService {

    public EmailDTO getVerification(String token);

    public void sendEmailWithCredentials(String email, String rawPassword);

    public String verificationEmail(String token, CreateVerificationCodeDTO code);

    public String reSendEmailConfirmation(EmailRequest email);

}
