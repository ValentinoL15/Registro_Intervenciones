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
public class Cocina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public enum TipoComida {
        CELIACO,
        NOCELIACO
    }

    @Enumerated(EnumType.STRING)
    private Cocina.TipoComida tipoComida;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "menu_dia_id")
    private MenuDia menuDia;


}
