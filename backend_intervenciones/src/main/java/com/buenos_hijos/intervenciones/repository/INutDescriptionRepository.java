package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Nutricionista_Description;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface INutDescriptionRepository extends JpaRepository<Nutricionista_Description,Long> {

    Page<Nutricionista_Description> findByNutricionista_Username(String username, Pageable pageable);

    Page<Nutricionista_Description> findByNutricionista_UsernameAndFechaBetween(
            String username,
            LocalDate desde,
            LocalDate hasta,
            Pageable pageable
    );

    Page<Nutricionista_Description> findByFechaBetween(LocalDate desde, LocalDate hasta, Pageable pageable);

}
