package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Cocina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICocinaRepository extends JpaRepository<Cocina,Long> {
}
