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
        TARDE,
        NOCHE
    }

    private String hourly;
    @ElementCollection
    @CollectionTable(
        name = "dias_profesionales",
        joinColumns = @JoinColumn(name = "userId")
    )
    @Column(name = "dia")
    private List<DaysType> days = new ArrayList<>();
    @Enumerated(EnumType.STRING)
    private Turnstype turno;
    private boolean active;

    @ManyToMany(mappedBy = "profesionales")
    private List<Intervencion> intervenciones = new ArrayList<>();

    public Profesional(){

    }

    public Profesional(Long user_id, String name, String lastname, String username ,String email, String password, RoleType role, String hourly, List<DaysType> days, Turnstype turno, boolean active, List<Intervencion> intervenciones) {
        super(user_id, name, lastname, username ,email, password, role);
        this.hourly = hourly;
        this.days = days;
        this.turno = turno;
        this.active = active;
        this.intervenciones = (intervenciones != null) ? intervenciones : new ArrayList<>();
    }
}
