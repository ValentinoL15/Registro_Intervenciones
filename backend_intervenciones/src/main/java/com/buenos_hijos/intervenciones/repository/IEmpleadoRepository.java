package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IEmpleadoRepository extends JpaRepository<Empleado,Long> {

    Optional<Empleado> findByUsername(String username);

}
