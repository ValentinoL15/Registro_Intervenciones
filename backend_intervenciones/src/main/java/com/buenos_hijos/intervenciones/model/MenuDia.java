package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MenuDia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuId;

    private LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "cocineroId")
    private Cocinero cocinero;

    @OneToMany(mappedBy = "menuDia", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Cocina> platos = new ArrayList<>();

}
