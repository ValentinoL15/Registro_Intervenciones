package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Intervencion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public interface InIntervencionRepository extends JpaRepository<Intervencion,Long> {

    Page<Intervencion> findByCreadorUserId(Pageable pageable, Long userId);

    Page<Intervencion> findByFechaBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Intervencion> findByCreadorUserIdAndFechaBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

}
