package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import com.buenos_hijos.intervenciones.model.Cocina;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlatoDto {

    private Long id;

    @Enumerated(EnumType.STRING)
    private Cocina.TipoComida tipoComida;

    private String description;

    private Long menuId;

}
