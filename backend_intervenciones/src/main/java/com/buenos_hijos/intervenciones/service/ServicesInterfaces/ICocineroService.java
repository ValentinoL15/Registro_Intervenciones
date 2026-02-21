package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.*;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface ICocineroService {

    public CocineroDto getCocinero(Long userId);

    public Page<CocineroDto> getCocineros(Pageable pageable);

    public List<AdminCocinaResponseDto> getAllComidas();

    public GeneralResponse createComida(CreateCocinaBatchDto cocinaDto, String currentUser);

    public GeneralResponse editComida(CreateCocinaBatchDto batchDto, String currentUser, LocalDate fechaOriginal);

    public GeneralResponse editCocinero(EditCocineroDto cocineroDto, String currentUser);

    public GeneralResponse deleteComida(LocalDate fechaOriginal, String currentUser);




}
