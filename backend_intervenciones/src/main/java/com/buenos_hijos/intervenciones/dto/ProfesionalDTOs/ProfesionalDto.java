package com.buenos_hijos.intervenciones.dto.ProfesionalDTOs;

import com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs.DisponibilidadDto;
import com.buenos_hijos.intervenciones.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProfesionalDto {

    private Long userId;
    private String name;
    private String lastname;
    private String username;
    private String email;
    private User.RoleType role;
    private String hourly;
    private List<DisponibilidadDto> disponibilidades;
    private boolean active;

}
