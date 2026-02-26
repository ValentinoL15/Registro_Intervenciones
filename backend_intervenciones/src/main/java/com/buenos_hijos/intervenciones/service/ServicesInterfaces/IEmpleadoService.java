package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditMantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.MantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveMantenimientoDto;
import com.buenos_hijos.intervenciones.model.Empleado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IEmpleadoService {

    public EmpleadoDto getEmpleado(Long empleadoId);

    public Page<EmpleadoDto> getEmpleados(Pageable pageable);

    public MantenimientoDto getMantenimiento(Long mantenimientoId);

    public Page<MantenimientoDto> getMyMantenimientos(Pageable pageable,  String currentUser);

    public Page<MantenimientoDto> getAllMantenimientos(Pageable pageable);

    public GeneralResponse saveMantenimiento(SaveMantenimientoDto mantenimientoDto, String currentUser);

    public GeneralResponse editMantenimiento(Long mantenimientoId,EditMantenimientoDto mantenimientoDto, String currentUser);

    public GeneralResponse deleteMantenimiento(Long mantenimientoId, String currentUser);

}
