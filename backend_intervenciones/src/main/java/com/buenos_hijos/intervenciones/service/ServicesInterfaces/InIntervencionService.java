package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.CreateIntervencionDto;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.EditIntervencionDto;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.IntervencionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface InIntervencionService {

    public Page<IntervencionDto> getAllIntervenciones(LocalDate desde, LocalDate hasta,Pageable pageable);

    public Page<IntervencionDto> getMyIntervenciones(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser);

    public IntervencionDto getIntervencion(Long intervencion_id);

    public GeneralResponse saveIntervencion(CreateIntervencionDto intervencionDto, String currentUser);

    public GeneralResponse editIntervencion(Long intervencion_id, EditIntervencionDto intervencionDto, String currentUser);

    public GeneralResponse deleteIntervencion(Long intervencion_id, String currentUser);

}
