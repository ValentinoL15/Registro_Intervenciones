package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.EmailDTOs.EmailRequest;
import com.buenos_hijos.intervenciones.dto.EmailDTOs.PasswordRequest;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.model.ChangePassword;
import com.buenos_hijos.intervenciones.repository.IPasswordRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IChangePasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class ChangePasswordController {

    private final IChangePasswordService changePasswordService;
    private final IPasswordRepository changePasswordRepository;

    @PostMapping("/request-password-reset")
    public ResponseEntity<GeneralResponse> forgotPassword(@Valid @RequestBody EmailRequest email){
        return ResponseEntity.ok(changePasswordService.forgotPassword(email.getEmail()));

    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable("token") String token, // 2. Cambiamos a @PathVariable
                                           @Valid @RequestBody PasswordRequest password){

        ChangePassword changePassword = changePasswordRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El token expiró o no se encuentra disponible"));

        if (changePassword.isRevoked() || changePassword.isExpired()) {
            if (!changePassword.isRevoked()) {
                changePassword.setRevoked(true);
                changePasswordRepository.save(changePassword);
            }
            return ResponseEntity.status(HttpStatus.GONE).body("El enlace ya no es válido o ha expirado");
        }

        return ResponseEntity.ok(changePasswordService.changePassword(token, password.password()));
    }

    @GetMapping("/validate-token/{token}")
    public ResponseEntity<?> validateToken(@PathVariable String token) {
        if (changePasswordService.isTokenValid(token)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.GONE).body("El enlace ha expirado o ya fue utilizado");
        }
    }

}
