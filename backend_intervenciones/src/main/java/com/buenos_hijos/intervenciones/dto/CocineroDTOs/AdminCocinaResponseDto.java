package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminCocinaResponseDto {

    private LocalDate fecha;

    private List<ComidaDto> platos;

}