package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Intervencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InIntervencionRepository extends JpaRepository<Intervencion,Long> {
}
