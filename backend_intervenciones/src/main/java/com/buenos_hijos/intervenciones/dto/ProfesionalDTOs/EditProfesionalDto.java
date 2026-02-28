package com.buenos_hijos.intervenciones.dto.ProfesionalDTOs;

import com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs.DisponibilidadDto;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EditProfesionalDto {

    @Size(min = 3, max = 20, message = "El nombre debe contener entre 3 y 20 caracteres")
    private String name;

    @Size(min = 3, max = 20, message = "El apellido debe contener entre 3 y 20 caracteres")
    private String lastname;

    @Size(min = 4, max = 20, message = "El username debe contener entre 4 y 20 caracteres")
    private String username;

    @Size(min = 5, max = 20, message = "La dedicación debe contener entre {min} y {max} caracteres")
    private String degree;

    private String hourly;

    private List<DisponibilidadDto> disponibilidades;


}
