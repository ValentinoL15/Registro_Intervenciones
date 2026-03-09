package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Tecnico_Description;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ITecDescriptionRepository extends JpaRepository<Tecnico_Description,Long> {

    Page<Tecnico_Description> findByTecnico2_Username(String username, Pageable pageable);

    Page<Tecnico_Description> findByTecnico2_UsernameAndFechaBetween(
            String username,
            LocalDate desde,
            LocalDate hasta,
            Pageable pageable
    );

    Page<Tecnico_Description> findByFechaBetween(LocalDate desde, LocalDate hasta, Pageable pageable);

}
