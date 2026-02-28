package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.HorarioAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IHorariosAsistenciaRepository extends JpaRepository<HorarioAsistencia,Long> {

}
