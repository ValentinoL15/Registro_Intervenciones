package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.embeddables.Cocina;
import com.buenos_hijos.intervenciones.model.Cocinero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICocineroRepository extends JpaRepository<Cocinero,Long> {

    Optional<Cocinero> findByUsername(String username);

    @Query("SELECT c FROM Cocinero coc JOIN coc.cocina c ORDER BY c.fecha DESC")
    List<Cocina> findAllCocinasOrderByFechaDesc();

}
