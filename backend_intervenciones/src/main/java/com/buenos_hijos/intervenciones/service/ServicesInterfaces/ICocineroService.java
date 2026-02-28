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

    public Page<MenuDiaDto> getMenus(LocalDate desde, LocalDate hasta,Pageable pageable);

    public Page<MenuDiaDto> getMyMenus(LocalDate desde, LocalDate hasta,Pageable pageable, String currentUser);

    public PlatoDto getPlato(Long id);

    public Page<PlatoDto> getPlatos(Pageable pageable);

    public GeneralResponse createComida(CreateMenuCompletoDto comidaDto, String currentUser);

    public GeneralResponse editComida(Long cocinaId, EditComidaDto comidaDto, String currentUser);

    public GeneralResponse editFechaMenu(Long menuId, EditFechaMenuDto fechaMenuDto, String currentUser);

    public GeneralResponse editCocinero(EditCocineroDto cocineroDto, String currentUser);

    public GeneralResponse deleteMenu(Long menuId, String currentUser);




}
