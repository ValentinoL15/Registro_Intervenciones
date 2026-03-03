package com.buenos_hijos.intervenciones.dto.NutricionistaDTOs;

import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EditNutricionistaDto {

    private String name;
    private String lastname;
    private String hourly;
    private List<HorarioAsistenciaDto> horarioAsistencias;

}
