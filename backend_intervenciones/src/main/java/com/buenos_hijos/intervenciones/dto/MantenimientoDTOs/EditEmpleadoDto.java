package com.buenos_hijos.intervenciones.dto.MantenimientoDTOs;

import com.buenos_hijos.intervenciones.model.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditEmpleadoDto {

    private String name;
    private String lastname;
    private String hourly;
}
