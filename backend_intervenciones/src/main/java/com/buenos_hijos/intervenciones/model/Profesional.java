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

    public enum DaysType {
        MAÑANA,
        TARDE,
        NOCHE
    }

    private String hourly;
    @ElementCollection
    @CollectionTable(
        name = "dias_profesionales",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "dia")
    private List<String> days = new ArrayList<>();
    @Enumerated(EnumType.STRING)
    private DaysType turno;
    private boolean active;

    public Profesional(){

    }

    public Profesional(Long user_id, String name, String lastname, String username ,String email, String password, RoleType role, String hourly, List<String> days, DaysType turno) {
        super(user_id, name, lastname, username ,email, password, role);
        this.hourly = hourly;
        this.days = days;
        this.turno = turno;
    }
}
