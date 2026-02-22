package com.buenos_hijos.intervenciones.embeddables;

import com.buenos_hijos.intervenciones.model.Profesional;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Disponibilidad {

    @Enumerated(EnumType.STRING)
    private Profesional.DaysType dia;

    @Enumerated(EnumType.STRING)
    private Profesional.Turnstype turno;
}
