package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import com.buenos_hijos.intervenciones.model.Cocina;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateComidaDto {

    @NotNull(message = "La fecha es obligatoria")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @NotNull(message = "Es necesario colocar el tipo de comida")
    private Cocina.TipoComida tipoComida;

    @Column(columnDefinition = "TEXT")
    @NotNull(message = "Es obligatorio describir cual fue la comida")
    private String description;

}
