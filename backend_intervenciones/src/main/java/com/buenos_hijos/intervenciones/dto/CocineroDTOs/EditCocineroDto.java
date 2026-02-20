package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class EditCocineroDto {

    @Size(min = 3, max = 20, message = "El nombre debe contener entre 3 y 20 caracteres")
    private String name;

    @Size(min = 3, max = 20, message = "El apellido debe contener entre 3 y 20 caracteres")
    private String lastname;

    @Size(min = 5, max = 20, message = "El username debe contener entre 5 y 20 caracteres")
    private String username;

    private List<CocinaDto> cocina;

}
