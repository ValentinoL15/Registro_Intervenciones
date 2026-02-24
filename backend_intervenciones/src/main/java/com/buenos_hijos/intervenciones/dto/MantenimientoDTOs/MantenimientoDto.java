package com.buenos_hijos.intervenciones.dto.MantenimientoDTOs;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MantenimientoDto {

    private Long mantenimientoId;

    private LocalDate fecha;

    private String description;

    private Long empleadoId;


}
