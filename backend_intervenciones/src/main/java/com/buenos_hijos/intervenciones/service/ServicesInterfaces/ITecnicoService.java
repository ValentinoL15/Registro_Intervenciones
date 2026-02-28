package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.EditTecnicoDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.TecnicoDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ITecnicoService {

    public TecnicoDto getTecnico(Long tecnicoId);

    public List<TecnicoDto> getTecnicos();

    public GeneralResponse editTecnico(Long tecnicoId, EditTecnicoDto tecnicoDto, String gcurrentUser);


}
