package com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DescriptionDto {

    private Long id;

    private String description;

    private LocalDate fecha;

    private Long userId;

}
