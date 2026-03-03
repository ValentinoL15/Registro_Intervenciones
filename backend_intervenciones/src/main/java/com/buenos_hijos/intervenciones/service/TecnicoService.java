package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.CreateDescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.DescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.EditDescriptionDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.EditTecnicoDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.TecnicoDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.model.Admin;
import com.buenos_hijos.intervenciones.model.HorarioAsistencia;
import com.buenos_hijos.intervenciones.model.Tecnico2;
import com.buenos_hijos.intervenciones.model.Tecnico_Description;
import com.buenos_hijos.intervenciones.repository.IAdminRepository;
import com.buenos_hijos.intervenciones.repository.ITecDescriptionRepository;
import com.buenos_hijos.intervenciones.repository.ITecnicoRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ITecnicoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TecnicoService implements ITecnicoService {

    private final ITecnicoRepository tecnicoRepository;
    private final ITecDescriptionRepository tecDescriptionRepository;
    private final IUserRepository userRepository;
    private final IAdminRepository adminRepository;

    @Override
    public TecnicoDto getTecnico(Long tecnicoId) {

        Tecnico2 tecnico2 = tecnicoRepository.findById(tecnicoId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        TecnicoDto tecnicoDto = new TecnicoDto();
        tecnicoDto.setUserId(tecnico2.getUserId());
        tecnicoDto.setUsername(tecnico2.getUsername());
        tecnicoDto.setName(tecnico2.getName());
        tecnicoDto.setLastname(tecnico2.getLastname());
        tecnicoDto.setEmail(tecnico2.getEmail());
        tecnicoDto.setRole(tecnico2.getRole());
        tecnicoDto.setHourly(tecnico2.getHourly());
        tecnicoDto.setActive(tecnicoDto.isActive());
        tecnicoDto.setDegree(tecnicoDto.getDegree());
        if(tecnico2.getHorarioAsistencias() != null) {
            List<HorarioAsistenciaDto> horarioAsistenciasDto = tecnico2.getHorarioAsistencias().stream().map(
                    horarioAsistencia ->  {
                        HorarioAsistenciaDto horarioAsistenciaDto = new HorarioAsistenciaDto();
                        horarioAsistenciaDto.setId(horarioAsistencia.getId());
                        horarioAsistenciaDto.setInicio(horarioAsistencia.getInicio());
                        horarioAsistenciaDto.setFin(horarioAsistencia.getFin());
                        horarioAsistenciaDto.setDia(horarioAsistencia.getDia());
                        horarioAsistenciaDto.setUser_id(horarioAsistencia.getTecnico2().getUserId());
                        return horarioAsistenciaDto;
                    }
            ).collect(Collectors.toList());
            tecnicoDto.setHorarioAsistencias(horarioAsistenciasDto);
        }


        return tecnicoDto;

    }

    @Override
    public List<TecnicoDto> getTecnicos() {
        List<Tecnico2> tecnico2 = tecnicoRepository.findAll();
        return tecnico2.stream().map(
                tecnico -> {
                    TecnicoDto dto = new TecnicoDto();
                    dto.setUserId(tecnico.getUserId());
                    dto.setUsername(tecnico.getUsername());
                    dto.setName(tecnico.getName());
                    dto.setLastname(tecnico.getLastname());
                    dto.setEmail(tecnico.getEmail());
                    dto.setRole(tecnico.getRole());
                    dto.setHourly(tecnico.getHourly());
                    dto.setActive(tecnico.isActive());
                    dto.setDegree(tecnico.getDegree());
                    if(tecnico.getHorarioAsistencias() != null) {
                        List<HorarioAsistenciaDto> horarioAsistenciasDto = tecnico.getHorarioAsistencias().stream().map(
                                horarioAsistencia ->  {
                                    HorarioAsistenciaDto horarioAsistenciaDto = new HorarioAsistenciaDto();
                                    horarioAsistenciaDto.setId(horarioAsistencia.getId());
                                    horarioAsistenciaDto.setInicio(horarioAsistencia.getInicio());
                                    horarioAsistenciaDto.setFin(horarioAsistencia.getFin());
                                    horarioAsistenciaDto.setDia(horarioAsistencia.getDia());
                                    horarioAsistenciaDto.setUser_id(horarioAsistencia.getTecnico2().getUserId());
                                    return horarioAsistenciaDto;
                                }
                        ).collect(Collectors.toList());
                        dto.setHorarioAsistencias(horarioAsistenciasDto);
                    }
                    return dto;
                }
        ).collect(Collectors.toList());
    }

    @Override
    public Page<DescriptionDto> getMyDescriptions(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser) {
        // Definimos rangos por defecto si los parámetros son nulos para que la query no falle
        LocalDate fechaDesde = (desde != null) ? desde : LocalDate.of(1970, 1, 1);
        LocalDate fechaHasta = (hasta != null) ? hasta : LocalDate.of(2099, 12, 31);

        // Llamamos al nuevo método filtrado
        Page<Tecnico_Description> descriptionPage = tecDescriptionRepository
                .findByTecnico2_UsernameAndFechaBetween(currentUser, fechaDesde, fechaHasta, pageable);

        return descriptionPage.map(description -> new DescriptionDto(
                description.getId(),
                description.getDescription(),
                description.getFecha(),
                description.getTecnico2().getUserId()
        ));
    }

    @Override
    public Page<DescriptionDto> getAllDescriptions(LocalDate desde, LocalDate hasta, Pageable pageable) {
        LocalDate fechaDesde = (desde != null) ? desde : LocalDate.of(1970, 1, 1);
        LocalDate fechaHasta = (hasta != null) ? hasta : LocalDate.of(2099, 12, 31);

        // Usamos un método del repo que busque por rango de fechas para TODOS los técnicos
        Page<Tecnico_Description> descriptionPage = tecDescriptionRepository.findByFechaBetween(fechaDesde, fechaHasta, pageable);

        return descriptionPage.map(description -> new DescriptionDto(
                description.getId(),
                description.getDescription(),
                description.getFecha(),
                description.getTecnico2().getUserId()
        ));
    }

    @Override
    @Transactional
    public GeneralResponse createDescription(CreateDescriptionDto descriptionDto, String currentUser) {

        Tecnico2 tecnico2 = tecnicoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if(descriptionDto.getFecha().isAfter(LocalDate.now())){
            throw new RuntimeException("No puedes asignar una tarea posterior al dia de hoy");
        }

        Tecnico_Description tecnicoDescription = new Tecnico_Description();
        tecnicoDescription.setDescription(descriptionDto.getDescription());
        tecnicoDescription.setFecha(descriptionDto.getFecha());
        tecnicoDescription.setTecnico2(tecnico2);
        tecDescriptionRepository.save(tecnicoDescription);
        return new GeneralResponse(
                new Date(),
                "Descripción creada con éxito",
                HttpStatus.OK.value()
        );

    }

    @Override
    public GeneralResponse editDescription(Long descriptionId, EditDescriptionDto descriptionDto, String currentUser) {

        Tecnico2 tecnico2 = tecnicoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        Tecnico_Description tecnicoDescription = tecDescriptionRepository.findById(descriptionId)
                .orElseThrow(() -> new RuntimeException("Descripción no encontrada"));

        if(!tecnico2.getUserId().equals(tecnicoDescription.getTecnico2().getUserId())){
            throw new AccessDeniedException();
        }

        if(descriptionDto.getDescription() != null) {
            String desc = descriptionDto.getDescription().trim();
            if(desc.length() < 10 || desc.length() > 500){
                throw new IllegalArgumentException("La descripción debe tener entre 10 y 500 caracteres.");
            }
            tecnicoDescription.setDescription(descriptionDto.getDescription());
        }
        if(descriptionDto.getFecha() != null){
            if(descriptionDto.getFecha().isAfter(LocalDate.now())){
                throw new RuntimeException("No puedes asignar una tarea posterior al dia de hoy");
            }
            tecnicoDescription.setFecha(descriptionDto.getFecha());
        }

        tecDescriptionRepository.save(tecnicoDescription);
        return new GeneralResponse(
                new Date(),
                "Descripción actualizada correctamente",
                HttpStatus.OK.value()
        );
    }

    @Override
    public GeneralResponse deleteDescription(Long descriptionId, String currentUser) {

        Tecnico2 tecnico2 = tecnicoRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        Tecnico_Description tecnicoDescription = tecDescriptionRepository.findById(descriptionId)
                .orElseThrow(() -> new RuntimeException("Descripción no encontrada"));

        if(!tecnico2.getUserId().equals(tecnicoDescription.getTecnico2().getUserId())){
            throw new AccessDeniedException();
        }

        tecDescriptionRepository.deleteById(descriptionId);
        return new GeneralResponse(
                new Date(),
                "Descripción eliminada correctamente",
                HttpStatus.OK.value()
        );
    }
}
