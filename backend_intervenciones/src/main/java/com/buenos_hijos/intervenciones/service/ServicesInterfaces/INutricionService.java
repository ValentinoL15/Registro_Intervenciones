package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.CreateDescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.DescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.EditDescriptionDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.NutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.NutricionistaDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionSemanalDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

public interface INutricionService {

    public NutricionistaDto getNutricionista(Long nutricionistaId);

    public Page<NutricionistaDto> getNutricionistas(Pageable pageable);

    public NutricionSemanalDto getReporte(Long nutricionId);

    public Page<NutricionSemanalDto> getReportes(Pageable pageable,LocalDate desde, LocalDate hasta);

    public Page<NutricionSemanalDto> getMisReportes(Pageable pageable, LocalDate desde, LocalDate hasta,String currentUser);

    public GeneralResponse saveNutricionSemanal(SaveNutricionSemanalDto nutricionSemanalDto, MultipartFile archivo , String currentUser);

    public GeneralResponse editNutricionSemanal(Long id,EditNutricionSemanalDto nutricionSemanalDto, MultipartFile nuevoArchivo,String currentUser);

    public GeneralResponse deleteNutricionSemanal(Long nutricionSemanalId, String currentUser);

    public Page<DescriptionDto> getMyDescriptions(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser);

    public Page<DescriptionDto> getAllDescriptions(LocalDate desde, LocalDate hasta, Pageable pageable);

    public GeneralResponse saveDescription(CreateDescriptionDto descriptionDto, String currentUser);

    public GeneralResponse editDescription(Long descriptionId, EditDescriptionDto descriptionDto,String currentUser);

    public GeneralResponse deleteDescription(Long descriptionId, String currentUser);


}
