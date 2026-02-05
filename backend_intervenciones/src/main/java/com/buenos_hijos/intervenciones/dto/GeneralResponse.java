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
public class GeneralResponse {

    private Date timestamp = new Date();
    private String message;
    private int status;

}
