package com.buenos_hijos.intervenciones.dto.UserDTOs;

import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.model.HorarioAsistencia;
import com.buenos_hijos.intervenciones.model.User;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Long userId;
    private String email;
    private String name;
    private String lastname;
    private String username;
    private String degree;
    private User.RoleType role;
    private List<HorarioAsistenciaDto> horarioAsistencias;

}
