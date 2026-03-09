package com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs;

public class ErrorResponseDTO {
    private String status;
    private String message;

    public ErrorResponseDTO() {}

    public ErrorResponseDTO(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
