package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditMantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveMantenimientoDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.model.Empleado;
import com.buenos_hijos.intervenciones.model.Mantenimiento;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IEmpleadoRepository;
import com.buenos_hijos.intervenciones.repository.IMantenimientoRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IEmpleadoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class EmpleadoService implements IEmpleadoService {

    private final IEmpleadoRepository empleadoRepository;
    private final IUserRepository userRepository;
    private final IMantenimientoRepository mantenimientoRepository;

    @Override
    public EmpleadoDto getEmpleado(Long empleadoId) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        EmpleadoDto empleadoDto = new EmpleadoDto();
        empleadoDto.setName(empleado.getName());
        empleadoDto.setLastname(empleado.getLastname());
        empleadoDto.setEmail(empleado.getEmail());
        empleadoDto.setUsername(empleado.getUsername());
        empleadoDto.setRoleType(empleado.getRole());
        empleadoDto.setEmpleadoId(empleado.getUserId());
        return empleadoDto;
    }

    @Override
    public Page<EmpleadoDto> getEmpleados(Pageable pageable) {
        Page<Empleado> empleados = empleadoRepository.findAll(pageable);
        return empleados.map(
                empleado -> new EmpleadoDto(
                        empleado.getUserId(),
                        empleado.getName(),
                        empleado.getLastname(),
                        empleado.getUsername(),
                        empleado.getEmail(),
                        empleado.isActive(),
                        empleado.getRole()
                )
        );
    }

    @Override
    @Transactional
    public GeneralResponse saveMantenimiento(SaveMantenimientoDto mantenimientoDto, String currentUser) {

        Empleado empleado = empleadoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if(!empleado.getUsername().equals(currentUser)) {
            throw new AccessDeniedException();
        }


        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setFecha(mantenimientoDto.getFecha());
        mantenimiento.setDescription(mantenimientoDto.getDescription());
        mantenimiento.setEmpleado(empleado);
        mantenimientoRepository.save(mantenimiento);
        return new GeneralResponse(
                new Date(),
                "Mantenimineto creado con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse editMantenimiento(Long mantenimientoId, EditMantenimientoDto mantenimientoDto, String currentUser) {
        Empleado empleado = empleadoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if(!empleado.getUsername().equals(currentUser)) {
            throw new AccessDeniedException();
        }

        Mantenimiento mantenimiento = mantenimientoRepository.findById(mantenimientoId)
                .orElseThrow(() -> new UsernameNotFoundException("Mantenimiento no encontrado"));

        if (mantenimientoDto.getFecha() != null) {
            mantenimiento.setFecha(mantenimientoDto.getFecha());
        }

        if (mantenimientoDto.getDescription() != null && !mantenimientoDto.getDescription().isBlank()) {
            String desc = mantenimientoDto.getDescription().trim();

            if (desc.length() < 5 || desc.length() > 500) {
                throw new IllegalArgumentException("La descripción debe tener entre 5 y 500 caracteres");
            }

            mantenimiento.setDescription(desc);
        }

        mantenimientoRepository.save(mantenimiento);
        return new GeneralResponse(
                new Date(),
                "Mantenimiento actualizado con éxito",
                HttpStatus.OK.value());
    }

    @Override
    public GeneralResponse deleteMantenimiento(Long mantenimientoId, String currentUser) {
        Empleado empleado = empleadoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if(!empleado.getUsername().equals(currentUser)) {
            throw new AccessDeniedException();
        }

        mantenimientoRepository.deleteById(mantenimientoId);
        return new GeneralResponse(
                new Date(),
                "Mantenimiento eliminado con éxito",
                HttpStatus.OK.value());
    }
}
