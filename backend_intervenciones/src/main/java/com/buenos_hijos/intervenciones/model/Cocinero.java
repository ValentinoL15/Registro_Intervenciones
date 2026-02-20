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
@Table(name = "cocineros")
public class Cocinero extends User{

    @ElementCollection
    @CollectionTable(
            name = "dias_cocinero",
            joinColumns = @JoinColumn(name = "userId")
    )
    private List<Cocina> cocina = new ArrayList<>();
    private boolean active;

}
