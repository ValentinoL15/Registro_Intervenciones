package com.buenos_hijos.intervenciones.dto.UserDTOs;

import com.buenos_hijos.intervenciones.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Long userId;
    private String email;
    private String username;
    private User.RoleType role;
    private String name;
    private String lastname;

}
