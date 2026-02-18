package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.CreateIntervencionDto;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.EditIntervencionDto;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.IntervencionDto;
import com.buenos_hijos.intervenciones.model.Admin;
import com.buenos_hijos.intervenciones.model.Intervencion;
import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IProfesionalRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.repository.InIntervencionRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.InIntervencionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IntervencionService implements InIntervencionService {

    private final InIntervencionRepository intervencionRepository;
    private final IUserRepository userRepository;
    private final IProfesionalRepository profesionalRepository;

    @Override
    @Transactional
    public Page<IntervencionDto> getAllIntervenciones(@PageableDefault Pageable pageable) {
        Page<Intervencion> intervenciones = intervencionRepository.findAll(pageable);

        return intervenciones.map(intervencion -> {
            // Extraemos solo los IDs de la lista de profesionales
            List<Long> idsProfesionales = intervencion.getProfesionales().stream()
                    .map(Profesional::getUserId) // Asegúrate de que el método sea getUserId() según tu modelo
                    .collect(Collectors.toList());

            return new IntervencionDto(
                    intervencion.getIntervencionId(),
                    intervencion.getCreador().getUserId(),
                    intervencion.getTipo(),
                    intervencion.getNombre(),
                    intervencion.getFecha(),
                    intervencion.getHora(),
                    intervencion.getMotivo(),
                    intervencion.getIntervencion(),
                    intervencion.getObservaciones(),
                    idsProfesionales
            );
        });
    }

    @Override
    public Page<IntervencionDto> getMyIntervenciones(Pageable pageable, String currentUser) {

        User user = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el usuario"));

        if (!user.getUsername().equals(currentUser)) {
            throw new RuntimeException("Accesso denegado: No tienes los permisos suficientes para ver las intervenciones");
        }

        Page<Intervencion> intervenciones = intervencionRepository.findByCreadorUserId(pageable, user.getUserId());

        return intervenciones.map(intervencion -> {
            List<Long> idsProfesionales = intervencion.getProfesionales().stream()
                    .map(Profesional::getUserId)
                    .collect(Collectors.toList());

            return new IntervencionDto(
                    intervencion.getIntervencionId(),
                    intervencion.getCreador().getUserId(),
                    intervencion.getTipo(),
                    intervencion.getNombre(),
                    intervencion.getFecha(),
                    intervencion.getHora(),
                    intervencion.getMotivo(),
                    intervencion.getIntervencion(),
                    intervencion.getObservaciones(),
                    idsProfesionales
            );
        });
    }

    @Override
    @Transactional
    public IntervencionDto getIntervencion(Long intervencion_id) {
        Intervencion intervencion = intervencionRepository.findById(intervencion_id)
                .orElseThrow(() -> new RuntimeException("Intervención no encontrada con ID: " + intervencion_id));

        // 2. Extraemos los IDs de los profesionales
        List<Long> profesionalesIds = intervencion.getProfesionales().stream()
                .map(Profesional::getUserId) // Usamos el ID heredado de User
                .collect(Collectors.toList());

        // 3. Mapeamos y retornamos el DTO
        return new IntervencionDto(
                intervencion.getIntervencionId(),
                intervencion.getCreador().getUserId(),
                intervencion.getTipo(),
                intervencion.getNombre(),
                intervencion.getFecha(),
                intervencion.getHora(),
                intervencion.getMotivo(),
                intervencion.getIntervencion(),
                intervencion.getObservaciones(),
                profesionalesIds
        );
    }

    @Override
    @Transactional
    public GeneralResponse saveIntervencion(CreateIntervencionDto intervencionDto, String currentUser) {
        Profesional prof = profesionalRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El usuario con nombre " + currentUser + " no se encuentra en la base de datos"));

        List<Profesional> participantes = profesionalRepository.findAllById(intervencionDto.getProfesionalesIds());

        Intervencion intervencion = new Intervencion();
        intervencion.setCreador(prof);
        intervencion.setTipo(intervencionDto.getTipo());
        intervencion.setNombre(intervencionDto.getNombre());
        intervencion.setHora(intervencionDto.getHora());
        intervencion.setFecha(intervencionDto.getFecha());
        intervencion.setMotivo(intervencionDto.getMotivo());
        intervencion.setIntervencion(intervencionDto.getIntervencion());
        intervencion.setObservaciones(intervencionDto.getObservaciones());
        intervencion.setProfesionales(participantes);
        intervencionRepository.save(intervencion);
        return new GeneralResponse(
                new Date(),
                "Intervención creada exitosamente",
                HttpStatus.CREATED.value()
        );
    }

    @Override
    public GeneralResponse editIntervencion(Long intervencion_id, EditIntervencionDto intervencionDto, String currentUser) {
        Intervencion intervencion = intervencionRepository.findById(intervencion_id)
                .orElseThrow(() -> new RuntimeException("No se encuentra la intervención con id " + intervencion_id));

        Profesional profesional = profesionalRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El usuario con el username " + currentUser + " no se encuentra en la base de datos"));

        if(!intervencion.getCreador().getUsername().equals(currentUser)){
            throw new RuntimeException("No tienes permisos para editar esta intervención ya que no has sido el creador de la misma");
        }

        if(intervencionDto.getFecha() != null){
            intervencion.setFecha(intervencionDto.getFecha());
        }
        if(intervencionDto.getIntervencion() != null){
            intervencion.setIntervencion(intervencionDto.getIntervencion());
        }
        if(intervencionDto.getTipo() != null){
            intervencion.setTipo(intervencionDto.getTipo());
        }
        if(intervencionDto.getNombre() != null){
            intervencion.setNombre(intervencionDto.getNombre());
        }
        if(intervencionDto.getObservaciones() != null) {
            intervencion.setObservaciones(intervencionDto.getObservaciones());
        }
        if(intervencionDto.getMotivo() != null){
            intervencion.setMotivo(intervencionDto.getMotivo());
        }
        intervencionRepository.save(intervencion);
        return new GeneralResponse(
                new Date(),
                "Intervención editada con éxito",
                HttpStatus.OK.value()
        );
    }


    @Override
    public GeneralResponse deleteIntervencion(Long intervencion_id, String currentUser) {
        Intervencion intervencion = intervencionRepository.findById(intervencion_id)
                .orElseThrow(() -> new RuntimeException("No se encuentra la intervención con id " + intervencion_id));

        if(!intervencion.getCreador().getUsername().equals(currentUser)){
            throw new RuntimeException("No tienes permisos para eliminar esta intervención ya que no has sido el creador de la misma");
        }

        intervencionRepository.deleteById(intervencion_id);
        return new GeneralResponse(
                new Date(),
                "Intervención eliminada con éxito",
                HttpStatus.OK.value()
                );

    }
}
