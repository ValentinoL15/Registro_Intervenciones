package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IProfesionalRepository extends JpaRepository<Profesional,Long> {
}
