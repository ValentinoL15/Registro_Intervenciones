package com.buenos_hijos.intervenciones.model;

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
public class Nutricionista extends User{

    private String hourly;
    private boolean active;
    @OneToMany(mappedBy = "nutricionista", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Nutricion_Semanal> nutricion = new ArrayList<>();

}
