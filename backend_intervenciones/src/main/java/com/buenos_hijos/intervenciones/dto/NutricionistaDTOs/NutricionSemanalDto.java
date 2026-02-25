package com.buenos_hijos.intervenciones.dto.NutricionistaDTOs;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class NutricionSemanalDto {

    private Long id;
    private LocalDate fechaInicio;
    private LocalDate fechaFinal;
    private String archivo;

}
