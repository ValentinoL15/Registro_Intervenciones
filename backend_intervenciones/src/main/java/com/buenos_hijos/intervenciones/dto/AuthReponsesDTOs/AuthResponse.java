package com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String message;
    @JsonProperty("access_token")
    private String access_token;
    private String username;
    private Long userId;
    private String userRole;
    private String name;
    private String lastname;
    private String email;

}