package com.buenos_hijos.intervenciones.dto.EmailDTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PasswordRequest(@JsonProperty("password") String password) {
}
