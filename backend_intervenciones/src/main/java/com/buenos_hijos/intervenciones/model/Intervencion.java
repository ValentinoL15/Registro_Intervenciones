package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Intervencion {

    public enum DestinyType {
        FAMILIA,
        INSTITUCION
    }

    public enum IntervencionType {
        INDIVIDUAL,
        EQUIPO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long intervencionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creador_id")
    private Profesional creador;
    private DestinyType tipo;
    private String nombre;
    private LocalDateTime fecha;
    private String hora;
    private String motivo;
    private IntervencionType intervencion;
    private String observaciones;


}
