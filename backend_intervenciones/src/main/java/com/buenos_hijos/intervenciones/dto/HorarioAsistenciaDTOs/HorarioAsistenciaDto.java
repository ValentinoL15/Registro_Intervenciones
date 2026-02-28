package com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class HorarioAsistenciaDto {

    private Long id;
    private String dia;
    private LocalTime inicio;
    private LocalTime fin;
    private Long user_id;

}
