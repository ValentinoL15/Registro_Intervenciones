package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditMantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.MantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveMantenimientoDto;
import com.buenos_hijos.intervenciones.model.Empleado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface IEmpleadoService {

    public EmpleadoDto getEmpleado(Long empleadoId);

    public List<EmpleadoDto> getEmpleados();

    public MantenimientoDto getMantenimiento(Long mantenimientoId);

    public Page<MantenimientoDto> getMyMantenimientos(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser);

    public Page<MantenimientoDto> getAllMantenimientos(LocalDate desde, LocalDate hasta, Pageable pageable);

    public GeneralResponse saveMantenimiento(SaveMantenimientoDto mantenimientoDto, String currentUser);

    public GeneralResponse editMantenimiento(Long mantenimientoId,EditMantenimientoDto mantenimientoDto, String currentUser);

    public GeneralResponse deleteMantenimiento(Long mantenimientoId, String currentUser);

}
