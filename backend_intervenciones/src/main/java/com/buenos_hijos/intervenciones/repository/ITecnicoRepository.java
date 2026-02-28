package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Tecnico2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITecnicoRepository extends JpaRepository<Tecnico2,Long> {
}
