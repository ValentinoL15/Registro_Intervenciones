package com.buenos_hijos.intervenciones.dto.EmailDTOs;

public class CreateVerificationCodeDTO {
    private String code;

    public CreateVerificationCodeDTO() {}

    public CreateVerificationCodeDTO(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
