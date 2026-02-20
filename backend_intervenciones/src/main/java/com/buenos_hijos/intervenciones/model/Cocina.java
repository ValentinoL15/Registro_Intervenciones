package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Embeddable
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Cocina {

    public enum DiaCocinero {
        LUNES,
        MARTES,
        MIÉRCOLES,
        JUEVES,
        VIERNES
    }

    public enum TipoComida {
        CELIACO,
        NOCELIACO
    }

    @ManyToOne
    @JoinColumn(name = "cocinero_id")
    private Cocinero cocinero;

    @Enumerated(EnumType.STRING)
    private DiaCocinero dia;

    @Enumerated(EnumType.STRING)
    private TipoComida tipoComida;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate fecha;


}
