package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Nutricion_Semanal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface INutricion_SemanalRepository extends JpaRepository<Nutricion_Semanal,Long> {
}
