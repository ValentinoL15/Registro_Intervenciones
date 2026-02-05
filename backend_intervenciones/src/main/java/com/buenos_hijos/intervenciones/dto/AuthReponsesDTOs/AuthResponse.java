package com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {
    private String message;
    @JsonProperty("access_token")
    private String access_token;
    private String username;
    private Long userId;
    private String userRole;

    public AuthResponse() {}

    public AuthResponse(String message, String access_token, String username, Long userId, String userRole) {
        this.message = message;
        this.access_token = access_token;
        this.username = username;
        this.userId = userId;
        this.userRole = userRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAccess_token() {
        return access_token;
    }

    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
}
