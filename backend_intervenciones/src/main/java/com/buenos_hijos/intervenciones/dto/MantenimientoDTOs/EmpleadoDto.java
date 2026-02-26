package com.buenos_hijos.intervenciones.dto.MantenimientoDTOs;

import com.buenos_hijos.intervenciones.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmpleadoDto {

    private Long userId;
    private String name;
    private String lastname;
    private String username;
    private String email;
    private boolean active;
    private User.RoleType roleType;

}
