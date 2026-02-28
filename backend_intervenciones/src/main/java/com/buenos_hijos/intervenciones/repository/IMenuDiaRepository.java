package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Cocinero;
import com.buenos_hijos.intervenciones.model.MenuDia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface IMenuDiaRepository extends JpaRepository<MenuDia,Long> {

    boolean existsByFecha(LocalDate fecha);

    Page<MenuDia> findByCocinero(Cocinero cocinero, Pageable pageable);

    Page<MenuDia> findByFechaBetween(LocalDate start, LocalDate end, Pageable pageable);

    // Para el Cocinero: Sus propios menús filtrados por fecha
    Page<MenuDia> findByCocineroAndFechaBetween(Cocinero cocinero, LocalDate start, LocalDate end, Pageable pageable);

}
