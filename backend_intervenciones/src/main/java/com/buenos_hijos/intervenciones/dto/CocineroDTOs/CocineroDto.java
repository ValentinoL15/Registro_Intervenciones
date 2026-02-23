package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CocineroDto {

    private Long userId;
    private String name;
    private String lastname;
    private String username;
    private String email;
    private boolean active;

}
