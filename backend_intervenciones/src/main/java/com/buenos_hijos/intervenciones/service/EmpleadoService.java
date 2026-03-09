package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditMantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.MantenimientoDto;
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

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

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
        empleadoDto.setHourly(empleado.getHourly());
        empleadoDto.setUserId(empleado.getUserId());
        return empleadoDto;
    }

    @Override
    public List<EmpleadoDto> getEmpleados() {
        List<Empleado> empleados = empleadoRepository.findAll();
        return empleados.stream().map(
                empleado -> new EmpleadoDto(
                        empleado.getUserId(),
                        empleado.getName(),
                        empleado.getLastname(),
                        empleado.getUsername(),
                        empleado.getEmail(),
                        empleado.getHourly(),
                        empleado.isActive(),
                        empleado.getRole()
                )
        ).collect(Collectors.toList());
    }

    @Override
    public MantenimientoDto getMantenimiento(Long mantenimientoId) {
        return mantenimientoRepository.findById(mantenimientoId)
                .map(mantenimiento -> {
                    MantenimientoDto dto = new MantenimientoDto();
                    dto.setMantenimientoId(mantenimiento.getMantenimientoId());
                    dto.setFecha(mantenimiento.getFecha());
                    dto.setDescription(mantenimiento.getDescription());
                    if (mantenimiento.getEmpleado() != null) {
                        dto.setEmpleadoId(mantenimiento.getEmpleado().getUserId());
                    }
                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("No se encontró el mantenimiento con ID: " + mantenimientoId));
    }

    @Override
    public Page<MantenimientoDto> getMyMantenimientos(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser) {

        Empleado empleado = empleadoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        LocalDate start = (desde != null) ? desde : LocalDate.of(1900, 1, 1);
        LocalDate end = (hasta != null) ? hasta : LocalDate.of(2100, 12, 31);

        return mantenimientoRepository.findByEmpleadoAndFechaBetween(empleado, start, end, pageable)
                .map(this::convertToDto);
    }

    @Override
    public Page<MantenimientoDto> getAllMantenimientos(LocalDate desde, LocalDate hasta, Pageable pageable) {
        LocalDate start = (desde != null) ? desde : LocalDate.of(1900, 1, 1);
        LocalDate end = (hasta != null) ? hasta : LocalDate.of(2100, 12, 31);

        Page<Mantenimiento> mantenimientos = mantenimientoRepository.findByFechaBetween(start, end, pageable);

        return mantenimientos.map(this::convertToDto);
    }

    private MantenimientoDto convertToDto(Mantenimiento mantenimiento) {
        MantenimientoDto dto = new MantenimientoDto();
        dto.setMantenimientoId(mantenimiento.getMantenimientoId());
        dto.setFecha(mantenimiento.getFecha());
        dto.setDescription(mantenimiento.getDescription());

        if (mantenimiento.getEmpleado() != null) {
            dto.setEmpleadoId(mantenimiento.getEmpleado().getUserId());
            dto.setNombreEmpleado(mantenimiento.getEmpleado().getName() + " " +
                    mantenimiento.getEmpleado().getLastname());
        } else {
            dto.setNombreEmpleado("Empleado no asignado");
        }
        return dto;
    }

    @Override
    @Transactional
    public GeneralResponse saveMantenimiento(SaveMantenimientoDto mantenimientoDto, String currentUser) {

        Empleado empleado = empleadoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if(!empleado.getUsername().equals(currentUser)) {
            throw new AccessDeniedException();
        }

        if(mantenimientoDto.getFecha().isAfter(LocalDate.now())){
            throw new RuntimeException("No puedes crear un arreglo un dia posterior al de hoy");
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
