package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
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
    @ElementCollection
    @CollectionTable(
            name = "disponibilidad_profesional",
            joinColumns = @JoinColumn(name = "userId")
    )
    private List<Disponibilidad> disponibilidad = new ArrayList<>();
    private boolean active;

    @ManyToMany(mappedBy = "profesionales")
    private List<Intervencion> intervenciones = new ArrayList<>();

    public Profesional(){

    }

    public Profesional(Long user_id, String name, String lastname, String username ,String email, String password, RoleType role, String hourly, List<Disponibilidad> disponibilidad, boolean active, List<Intervencion> intervenciones) {
        super(user_id, name, lastname, username ,email, password, role);
        this.hourly = hourly;
        this.disponibilidad = disponibilidad;
        this.active = active;
        this.intervenciones = (intervenciones != null) ? intervenciones : new ArrayList<>();
    }
}
