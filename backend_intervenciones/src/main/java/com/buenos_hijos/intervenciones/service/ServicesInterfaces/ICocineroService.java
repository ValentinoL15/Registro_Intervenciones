package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.*;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICocineroService {

    public CocineroDto getCocinero(Long userId);

    public Page<CocineroDto> getCocineros(Pageable pageable);

    public GeneralResponse createComida(CreateCocinaBatchDto cocinaDto, String currentUser);

    public GeneralResponse editCocinero(EditCocineroDto cocineroDto, String currentUser);




}
