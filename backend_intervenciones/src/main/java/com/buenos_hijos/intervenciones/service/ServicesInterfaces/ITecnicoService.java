package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.CreateDescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.DescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.EditDescriptionDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.EditTecnicoDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.TecnicoDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface ITecnicoService {

    public TecnicoDto getTecnico(Long tecnicoId);

    public List<TecnicoDto> getTecnicos();

    public Page<DescriptionDto> getMyDescriptions(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser);

    public Page<DescriptionDto> getAllDescriptions(LocalDate desde, LocalDate hasta, Pageable pageable);

    public GeneralResponse createDescription(CreateDescriptionDto descriptionDto, String currentUser);

    public GeneralResponse editDescription(Long descriptionId, EditDescriptionDto descriptionDto, String currentUser);

    public GeneralResponse deleteDescription(Long descriptionId, String currentUser);


}
