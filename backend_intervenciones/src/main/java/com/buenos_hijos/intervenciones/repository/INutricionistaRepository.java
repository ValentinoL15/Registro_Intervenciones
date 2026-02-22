package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Admin;
import com.buenos_hijos.intervenciones.model.Nutricionista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface INutricionistaRepository extends JpaRepository<Nutricionista,Long> {

    Optional<Nutricionista> findByUsername(String username);

}
