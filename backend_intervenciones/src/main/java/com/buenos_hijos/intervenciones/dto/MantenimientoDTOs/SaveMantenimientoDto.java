package com.buenos_hijos.intervenciones.dto.MantenimientoDTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SaveMantenimientoDto {

    @NotNull(message = "Debes ingresar una fecha válida")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @NotBlank(message = "La descripción no puede estar vacía")
    @Size(min = 5, max = 500, message = "La descripción debe contener entre {min} y {max} caracteres")
    private String description;

}
