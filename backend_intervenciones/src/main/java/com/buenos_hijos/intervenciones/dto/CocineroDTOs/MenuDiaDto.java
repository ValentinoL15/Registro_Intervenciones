package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class MenuDiaDto {

    private Long menuId;
    private LocalDate fecha;
    private Long cocineroId;
    private List<CocinaDto> cocina;
    private String nombreCocinero;

}
