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

    public MenuDiaDto getMenu(Long menuId);

    public Page<MenuDiaDto> getMenus(Pageable pageable);

    public GeneralResponse createComida(CreateMenuCompletoDto comidaDto, String currentUser);

    public GeneralResponse editComida(Long cocinaId, EditComidaDto comidaDto, String currentUser);

    public GeneralResponse editCocinero(EditCocineroDto cocineroDto, String currentUser);

    public GeneralResponse deleteMenu(Long menuId, String currentUser);




}
