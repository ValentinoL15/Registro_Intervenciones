package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Mantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mantenimientoId;

    private LocalDate fecha;

    private String description;

    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

}
