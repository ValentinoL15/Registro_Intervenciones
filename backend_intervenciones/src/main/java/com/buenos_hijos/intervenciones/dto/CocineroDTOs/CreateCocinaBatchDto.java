package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateCocinaBatchDto {

    private List<CocinaDto> cocina;
}
