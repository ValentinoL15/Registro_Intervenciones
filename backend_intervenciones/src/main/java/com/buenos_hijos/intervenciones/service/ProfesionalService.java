package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.ProfesionalDto;
import com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs.DisponibilidadDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.embeddables.Disponibilidad;
import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.repository.IProfesionalRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IProfesionalService;
import com.buenos_hijos.intervenciones.utils.JwtUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfesionalService implements IProfesionalService {

    private final IUserRepository userRepository;
    private final IProfesionalRepository profesionalRepository;
    private final JwtUtils jwtUtils;


    @Override
    public Page<ProfesionalDto> getAllProfesionals(Pageable pageable) {
        Page<Profesional> profesionals = profesionalRepository.findAll(pageable);
        return profesionals.map(prof -> {
            // Convertimos la lista de Disponibilidad (Entity) a DisponibilidadDto
            List<DisponibilidadDto> dispDtos = prof.getDisponibilidad().stream()
                    .map(disp -> new DisponibilidadDto(disp.getDia(), disp.getTurno()))
                    .collect(Collectors.toList());

            return new ProfesionalDto(
                    prof.getUserId(),
                    prof.getName(),
                    prof.getLastname(),
                    prof.getUsername(),
                    prof.getEmail(),
                    prof.getRole(),
                    prof.getHourly(),
                    dispDtos,
                    prof.isActive()
            );
        });
    }

    @Override
    public ProfesionalDto getProfesional(Long userId) {

        Profesional profesional = profesionalRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Profesional no encontrado"));

        List<DisponibilidadDto> disponibilidadDtos = profesional.getDisponibilidad().stream()
                .map(disp -> new DisponibilidadDto(disp.getDia(), disp.getTurno()))
                .collect(Collectors.toList());

        ProfesionalDto profesionalDto = new ProfesionalDto(
                profesional.getUserId(),
                profesional.getName(),
                profesional.getLastname(),
                profesional.getUsername(),
                profesional.getEmail(),
                profesional.getRole(),
                profesional.getHourly(),
                disponibilidadDtos,
                profesional.isActive()
        );
        return profesionalDto;
    }

    @Override
    @Transactional
    public Map<String, Object> editProfesional(EditProfesionalDto profesionalDto, String currentUser) {

        Profesional profesional = profesionalRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("No se encuentra el id del profesional"));

        if(!currentUser.equals(profesional.getUsername())){
            throw new AccessDeniedException("No tienes permisos para realizar esta acción");
        }

        if(profesionalDto.getName() != null) {
            profesional.setName(profesionalDto.getName());
        }
        if(profesionalDto.getLastname() != null){
            profesional.setLastname(profesionalDto.getLastname());
        }
        if(profesionalDto.getHourly() != null) {
            profesional.setHourly(profesionalDto.getHourly());
        }
        if (profesionalDto.getDisponibilidades() != null) {
            profesional.getDisponibilidad().clear();

            Set<String> combinacionesVistas = new HashSet<>();
            List<Disponibilidad> nuevasDisponibilidades = profesionalDto.getDisponibilidades().stream()
                    .map(dto -> {
                        if (dto.getDia() == null || dto.getTurno() == null) {
                            throw new RuntimeException("Cada disponibilidad debe tener un día y un turno asignado");
                        }

                        String claveUnica = dto.getDia().toString() + "-" + dto.getTurno().toString();

                        if (!combinacionesVistas.add(claveUnica)) {
                            throw new RuntimeException("No puedes asignar el turno " + dto.getTurno() +
                                    " para el día " + dto.getDia() + " más de una vez.");
                        }

                        Disponibilidad disp = new Disponibilidad();
                        disp.setDia(dto.getDia());
                        disp.setTurno(dto.getTurno());
                        return disp;
                    })
                    .collect(Collectors.toList());

            profesional.getDisponibilidad().addAll(nuevasDisponibilidades);
        }

        if(profesionalDto.getUsername() != null) {
            if (!profesionalDto.getUsername().equals(profesional.getUsername())) {
                if(userRepository.existsByUsername(profesionalDto.getUsername())){
                    throw new RuntimeException("El username ya está en uso");
                }
                profesional.setUsername(profesionalDto.getUsername());
            }
        }

        profesionalRepository.save(profesional);
        String nuevoToken = jwtUtils.generateToken(profesional);

        // Devolvemos un Map para incluir el mensaje y el token
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("message", "Profesional editado con éxito");
        response.put("status", HttpStatus.OK.value());
        response.put("token", nuevoToken); // <--- ESTO ES LO QUE FALTA

        return response;
    }

}
