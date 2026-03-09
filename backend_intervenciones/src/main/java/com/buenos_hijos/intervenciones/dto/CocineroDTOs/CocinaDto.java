package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import com.buenos_hijos.intervenciones.model.Cocina;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CocinaDto {

    private Long id;

    @Enumerated(EnumType.STRING)
    private Cocina.TipoComida tipoComida;

    private String description;

    private Long menuId;

}
