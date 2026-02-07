package com.buenos_hijos.intervenciones.dto.EmailDTOs;

import java.time.LocalDateTime;

public class EmailDTO {
    private String email;
    private String token;
    private LocalDateTime expiryDate;
    private boolean revoked;
    private boolean expired;

    public EmailDTO() {}

    public EmailDTO(String email,String token,LocalDateTime expiryDate, boolean revoked, boolean expired) {
        this.email = email;
        this.token = token;
        this.expiryDate = expiryDate;
        this.revoked = revoked;
        this.expired = expired;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public boolean isExpired() {
        return expired;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }
}
