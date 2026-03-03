package com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateDescriptionDto {

    @NotBlank(message = "La descripción no puede estar en blanco")
    @Size(min = 10, max = 500, message = "La descripción debe contener entre {min} y {max} caracteres")
    private String description;

    @NotNull(message = "Debes colocar una fecha válida")
    private LocalDate fecha;

}
