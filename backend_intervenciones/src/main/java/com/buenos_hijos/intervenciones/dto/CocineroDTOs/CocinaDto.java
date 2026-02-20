package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import com.buenos_hijos.intervenciones.model.Cocina;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CocinaDto {

    @NotNull(message = "El día es obligatorio")
    private Cocina.DiaCocinero dia;

    @NotNull(message = "Es necesario colocar el tipo de comida")
    private Cocina.TipoComida tipoComida;

    @Column(columnDefinition = "TEXT")
    @NotNull(message = "Es obligatorio describir cual fue la comida")
    private String description;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate fecha;

}
