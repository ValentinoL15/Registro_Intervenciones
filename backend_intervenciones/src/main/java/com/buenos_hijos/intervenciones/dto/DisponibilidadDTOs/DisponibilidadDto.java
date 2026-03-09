package com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs;

import com.buenos_hijos.intervenciones.model.Profesional;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DisponibilidadDto {

    @NotNull(message = "El día es obligatorio")
    private Profesional.DaysType dia;

    @NotNull(message = "El turno es obligatorio")
    private Profesional.Turnstype turno;
}