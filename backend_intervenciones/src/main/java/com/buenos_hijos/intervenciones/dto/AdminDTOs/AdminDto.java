package com.buenos_hijos.intervenciones.dto.AdminDTOs;

import com.buenos_hijos.intervenciones.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminDto {

    private Long userId;
    private String name;
    private String lastname;
    private String username;
    private String email;
    private User.RoleType role;

}
