package com.buenos_hijos.intervenciones.dto.ProfesionalDTOs;

import com.buenos_hijos.intervenciones.model.Profesional;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3, max = 20, message = "El nombre debe contener entre 3 y 20 caracteres")
    private String name;

    @NotBlank(message = "El apellido no puede estar vacío")
    @Size(min = 3, max = 20, message = "El apellido debe contener entre 3 y 20 caracteres")
    private String lastname;

    @NotBlank(message = "El username no puede estar vacío")
    @Size(min = 5, max = 20, message = "El username debe contener entre 5 y 20 caracteres")
    private String username;

    @NotBlank(message = "Debes colocar la carga horaria del profesional")
    private String hourly;
    @NotBlank(message = "Debes colocar el / los días que el profesional acude a la escuela")
    private List<Profesional.DaysType> days;
    @NotBlank(message = "Debes colocar el turno en el que el profesional trabaja en la escuela")
    private Profesional.Turnstype turno;

}
