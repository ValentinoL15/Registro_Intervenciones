package com.buenos_hijos.intervenciones.dto.NutricionistaDTOs;

import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.model.Nutricion_Semanal;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NutricionistaDto {

    private Long userId;
    private String name;
    private String lastname;
    private String email;
    private String hourly;
    private List<HorarioAsistenciaDto> horarioAsistencias;
    private boolean active;


}
