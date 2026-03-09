package com.buenos_hijos.intervenciones.dto.UserDTOs;

import com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs.DisponibilidadDto;
import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.CreateHorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.model.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserDto {

    private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    @NotBlank(message = "El nombre no puede estar vacío")
    private String name;

    @NotBlank(message = "El apellido no puede estar vacío")
    private String lastname;

    @NotBlank(message = "El username no puede estar vacío")
    private String username;

    @NotBlank(message = "El email no puede estar vacío")
    @Pattern(regexp = EMAIL_REGEX, message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "El horario no puede estar vacío")
    private String hourly; // Lo usan todos

    @NotNull(message = "El rol es obligatorio")
    private User.RoleType role; // Agregamos el rol para saber qué estamos creando

    // OPCIONAL: Solo se valida manualmente en el service si el rol es PROFESIONAL
    @Valid
    private List<DisponibilidadDto> disponibilidad;

    @Valid
    private List<CreateHorarioAsistenciaDto> horarioAsistencia;

    @Valid
    private String degree;
}
