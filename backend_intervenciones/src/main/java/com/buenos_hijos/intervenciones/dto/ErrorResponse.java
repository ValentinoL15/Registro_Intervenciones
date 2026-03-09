package com.buenos_hijos.intervenciones.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private Date timestamp = new Date();
    private int status;
    private String error;
    private String message;
    private String url;

    public ErrorResponse(String message,int status,String error,String url){
        this.message = message;
        this.url = url.replace("uri=", "");
        this.status = status;
        this.error = error;
    }

}
