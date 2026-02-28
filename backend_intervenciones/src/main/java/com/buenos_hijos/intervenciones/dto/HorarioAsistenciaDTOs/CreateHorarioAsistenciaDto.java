package com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs;

import com.buenos_hijos.intervenciones.model.Tecnico2;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class CreateHorarioAsistenciaDto {

    private Long id;
    private String dia;
    private LocalTime inicio;
    private LocalTime fin;
    private Tecnico2 tecnico2;

}
