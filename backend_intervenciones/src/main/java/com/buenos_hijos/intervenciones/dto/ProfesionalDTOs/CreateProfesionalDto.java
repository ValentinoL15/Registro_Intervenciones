package com.buenos_hijos.intervenciones.dto.ProfesionalDTOs;

import com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs.DisponibilidadDto;
import jakarta.validation.Valid;
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


    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3, max = 20, message = "El nombre debe contener entre 3 y 20 caracteres")
    private String name;

    @NotBlank(message = "El apellido no puede estar vacío")
    @Size(min = 3, max = 20, message = "El apellido debe contener entre 3 y 20 caracteres")
    private String lastname;

    @NotBlank(message = "El username no puede estar vacío")
    @Size(min = 5, max = 20, message = "El username debe contener entre 5 y 20 caracteres")
    private String username;

    @NotBlank(message = "La dedicación no puede estar vacía")
    @Size(min = 5, max = 20, message = "La dedicación debe contener entre {min} y {max} caracteres")
    private String degree;


    @NotBlank(message = "El email no puede estar vacío")
    @Pattern(regexp = EMAIL_REGEX, message = "El formato del email no es válido (ej. usuario@dominio.com)")
    private String email;

    @NotBlank(message = "Debes colocar la carga horaria del profesional")
    private String hourly;

    @NotEmpty(message = "Debes colocar al menos un día y turno de asistencia")
    @Valid
    private List<DisponibilidadDto> disponibilidad;



}
