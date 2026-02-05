package com.buenos_hijos.intervenciones.dto.AdminDTOs;

import com.buenos_hijos.intervenciones.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateAdminDto {

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

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, max = 20, message = "La contraseña debe contener entre 8 y 20 caracteres")
    @Pattern(
            regexp = PASSWORD_REGEX,
            message = "La contraseña debe contener al menos 8 caracteres, 1 mayúscula, 1 minúscula, y 1 carácter especial"
    )
    private String password;

    @NotBlank(message = "Debes colocar un rol")
    private User.RoleType role;

}
