package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.ProfesionalDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.repository.IProfesionalRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IProfesionalService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ProfesionalService implements IProfesionalService {

    private final IUserRepository userRepository;
    private final IProfesionalRepository profesionalRepository;


    @Override
    public Page<ProfesionalDto> getAllProfesionals(Pageable pageable) {
        Page<Profesional> profesionals = profesionalRepository.findAll(pageable);
        Page<ProfesionalDto> profesionalDtos = profesionals.map(
                prof -> new ProfesionalDto(
                        prof.getUserId(),
                        prof.getName(),
                        prof.getLastname(),
                        prof.getUsername(),
                        prof.getEmail(),
                        prof.getRole(),
                        prof.getHourly(),
                        prof.getDays(),
                        prof.getTurno(),
                        prof.isActive()
                )
        );
        return profesionalDtos;
    }

    @Override
    public ProfesionalDto getProfesional(Long userId) {

        Profesional profesional = profesionalRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Profesional no encontrado"));

        ProfesionalDto profesionalDto = new ProfesionalDto(
                profesional.getUserId(),
                profesional.getName(),
                profesional.getLastname(),
                profesional.getUsername(),
                profesional.getEmail(),
                profesional.getRole(),
                profesional.getHourly(),
                profesional.getDays(),
                profesional.getTurno(),
                profesional.isActive()
        );
        return profesionalDto;
    }

    @Override
    @Transactional
    public GeneralResponse editProfesional(EditProfesionalDto profesionalDto, String currentUser) {

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
        if(profesionalDto.getDays() != null) {
            profesional.setDays(profesionalDto.getDays());
        }
        if(profesionalDto.getUsername() != null) {
            // Solo validar si el username que llega es distinto al que ya tiene el profesional
            if (!profesionalDto.getUsername().equals(profesional.getUsername())) {
                if(userRepository.existsByUsername(profesionalDto.getUsername())){
                    throw new RuntimeException("El username ya está en uso, por favor elige otro");
                }
                profesional.setUsername(profesionalDto.getUsername());
            }
        }
        if(profesionalDto.getHourly() != null) {
            profesional.setHourly(profesionalDto.getHourly());
        }
        if(profesionalDto.getTurno() != null) {
            profesional.setTurno(profesionalDto.getTurno());
        }
        profesionalRepository.save(profesional);
        return new GeneralResponse(
                new Date(),
                "Profesional editado con éxito",
                HttpStatus.OK.value()
        );
    }

}
