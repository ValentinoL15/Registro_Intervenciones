package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.ProfesionalDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IProfesionalService {

    public List<ProfesionalDto> getAllProfesionals();

    public ProfesionalDto getProfesional(Long user_id);

    public Map<String, Object> editProfesional(EditProfesionalDto profesionalDto, String currentUser);

}
