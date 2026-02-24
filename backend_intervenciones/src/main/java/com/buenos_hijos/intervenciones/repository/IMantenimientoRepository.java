package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Empleado;
import com.buenos_hijos.intervenciones.model.Mantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IMantenimientoRepository extends JpaRepository<Mantenimiento,Long> {

    Page<Mantenimiento> findByEmpleado(Empleado empleado, Pageable pageable);

}
