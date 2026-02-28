package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Nutricion_Semanal;
import com.buenos_hijos.intervenciones.model.Nutricionista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface INutricion_SemanalRepository extends JpaRepository<Nutricion_Semanal,Long> {

    Page<Nutricion_Semanal> findByNutricionista(Nutricionista nutricionista, Pageable pageable);

    Page<Nutricion_Semanal> findByFechaInicioBetween(LocalDate start, LocalDate end, Pageable pageable);

    // Para el Nutricionista: Ver solo sus propios reportes
    Page<Nutricion_Semanal> findByNutricionistaAndFechaInicioBetween(Nutricionista nutricionista, LocalDate start, LocalDate end, Pageable pageable);

}
