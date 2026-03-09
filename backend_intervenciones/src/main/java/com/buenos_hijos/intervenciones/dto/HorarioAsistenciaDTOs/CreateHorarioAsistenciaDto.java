package com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs;

import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.model.Tecnico2;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class CreateHorarioAsistenciaDto {

    @Enumerated(EnumType.STRING)
    private Profesional.DaysType dia;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime inicio;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime fin;
    private Tecnico2 tecnico2;

}
