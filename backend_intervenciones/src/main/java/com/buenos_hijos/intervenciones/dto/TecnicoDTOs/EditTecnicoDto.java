package com.buenos_hijos.intervenciones.dto.TecnicoDTOs;

import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.model.HorarioAsistencia;
import com.buenos_hijos.intervenciones.model.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EditTecnicoDto {

    private String username;
    private User.RoleType role;
    private String name;
    private String lastname;
    private String hourly;
    private List<HorarioAsistenciaDto> horarioAsistencias;

}
