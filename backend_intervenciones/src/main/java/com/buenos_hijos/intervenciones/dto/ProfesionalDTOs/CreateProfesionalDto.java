package com.buenos_hijos.intervenciones.dto.ProfesionalDTOs;

import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.model.User;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateProfesionalDto {

    private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    // Tu regex de contraseña
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$";

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3, max = 20, message = "El nombre debe contener entre 3 y 20 caracteres")
    private String name;

    @NotBlank(message = "El apellido no puede estar vacío")
    @Size(min = 3, max = 20, message = "El apellido debe contener entre 3 y 20 caracteres")
    private String lastname;

    @NotBlank(message = "El username no puede estar vacío")
    @Size(min = 5, max = 20, message = "El username debe contener entre 5 y 20 caracteres")
    private String username;

    @NotBlank(message = "El email no puede estar vacío")
    @Pattern(regexp = EMAIL_REGEX, message = "El formato del email no es válido (ej. usuario@dominio.com)")
    private String email;

    @NotBlank(message = "Debes colocar la carga horaria del profesional")
    private String hourly;
    @NotEmpty(message = "Debes colocar el / los días que el profesional acude a la escuela")
    private List<Profesional.DaysType> days;
    @NotNull(message = "Debes colocar el turno en el que el profesional trabaja en la escuela")
    private Profesional.Turnstype turno;

}
