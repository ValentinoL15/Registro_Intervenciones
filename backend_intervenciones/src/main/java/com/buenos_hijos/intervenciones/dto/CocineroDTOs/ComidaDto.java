package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import com.buenos_hijos.intervenciones.embeddables.Cocina;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ComidaDto {

    @NotNull(message = "Es necesario colocar el tipo de comida")
    private Cocina.TipoComida tipoComida;

    @Column(columnDefinition = "TEXT")
    @NotNull(message = "Es obligatorio describir cual fue la comida")
    private String description;

}
