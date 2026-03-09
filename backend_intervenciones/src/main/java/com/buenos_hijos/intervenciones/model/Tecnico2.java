package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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
@Table(name = "tecnico2")
public class Tecnico2 extends User{

    private String hourly;
    private String degree;

    @OneToMany(mappedBy = "tecnico2", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HorarioAsistencia> horarioAsistencias = new ArrayList<>();

    @OneToMany(mappedBy = "tecnico2", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tecnico_Description> descriptions = new ArrayList<>();

}
