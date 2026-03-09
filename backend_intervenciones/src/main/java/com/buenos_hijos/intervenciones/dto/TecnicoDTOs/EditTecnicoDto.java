package com.buenos_hijos.intervenciones.dto.TecnicoDTOs;

import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class    EditTecnicoDto {

    private String name;
    private String lastname;
    private String hourly;
    private String degree;
    private List<HorarioAsistenciaDto> horarioAsistencias;

}
