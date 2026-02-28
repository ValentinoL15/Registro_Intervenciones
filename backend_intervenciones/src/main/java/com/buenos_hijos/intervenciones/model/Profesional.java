package com.buenos_hijos.intervenciones.model;

import com.buenos_hijos.intervenciones.embeddables.Disponibilidad;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "profesionales")
public class Profesional extends User{

    public enum DaysType{
        LUNES,
        MARTES,
        MIÉRCOLES,
        JUEVES,
        VIERNES
    }

    public enum Turnstype {
        MAÑANA,
        TARDE
    }

    private String hourly;
    private String degree;
    @ElementCollection
    @CollectionTable(
            name = "disponibilidad_profesional",
            joinColumns = @JoinColumn(name = "userId")
    )
    private List<Disponibilidad> disponibilidad = new ArrayList<>();

    @OneToMany(mappedBy = "creador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Intervencion> intervenciones = new ArrayList<>();

}
