package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.ProfesionalDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IProfesionalService {

    public Page<ProfesionalDto> getAllProfesionals(Pageable pageable);

    public ProfesionalDto getProfesional(Long user_id);

    public GeneralResponse editProfesional(EditProfesionalDto profesionalDto, String currentUser);

}
