package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.*;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.model.Cocina;
import com.buenos_hijos.intervenciones.model.Cocinero;
import com.buenos_hijos.intervenciones.model.MenuDia;
import com.buenos_hijos.intervenciones.repository.*;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ICocineroService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.time.LocalDate;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CocineroService implements ICocineroService {

    private final ICocineroRepository cocineroRepository;
    private final IAdminRepository adminRepository;
    private final IUserRepository userRepository;
    private final IMenuDiaRepository menuDiaRepository;
    private final ICocinaRepository cocinaRepository;

    @Override
    public CocineroDto getCocinero(Long userId) {
        Cocinero cocinero = cocineroRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("El cocinero no se encuentra"));
        CocineroDto cocineroDto = new CocineroDto();
        cocineroDto.setUserId(cocinero.getUserId());
        cocineroDto.setName(cocinero.getName());
        cocineroDto.setLastname(cocinero.getLastname());
        cocineroDto.setUsername(cocinero.getUsername());
        cocineroDto.setEmail(cocinero.getEmail());
        cocineroDto.setActive(cocinero.isActive());
        return cocineroDto;
    }

    @Override
    public Page<CocineroDto> getCocineros(Pageable pageable) {
        return cocineroRepository.findAll(pageable).map(cocinero -> {
            CocineroDto dto = new CocineroDto();
            dto.setUserId(cocinero.getUserId());
            dto.setName(cocinero.getName());
            dto.setLastname(cocinero.getLastname());
            dto.setUsername(cocinero.getUsername());
            dto.setEmail(cocinero.getEmail());
            dto.setActive(cocinero.isActive());
            return dto;
        });
    }

    @Override
    public MenuDiaDto getMenu(Long menuId) {
        MenuDia menuDia = menuDiaRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("No se encuentra el menú"));
        MenuDiaDto menuDiaDto = new MenuDiaDto();
        menuDiaDto.setMenuId(menuDia.getMenuId());
        menuDiaDto.setCocineroId(menuDia.getCocinero().getUserId());
        menuDiaDto.setFecha(menuDia.getFecha());
        List<CocinaDto> cocinaDtos = menuDia.getPlatos().stream().map(plato -> {
            CocinaDto cocinaDto = new CocinaDto();
            cocinaDto.setId(plato.getId());
            cocinaDto.setTipoComida(plato.getTipoComida());
            cocinaDto.setDescription(plato.getDescription());
            cocinaDto.setMenuId(menuDia.getMenuId());
            return cocinaDto;
        }).collect(Collectors.toList());
        menuDiaDto.setCocina(cocinaDtos);
        return menuDiaDto;
    }

    @Override
    public Page<MenuDiaDto> getMenus(Pageable pageable) {
        return menuDiaRepository.findAll(pageable).map(menu -> {
            MenuDiaDto dto = new MenuDiaDto();
            dto.setCocineroId(menu.getCocinero().getUserId());
            dto.setMenuId(menu.getMenuId());
            dto.setFecha(menu.getFecha());
            List<CocinaDto> platosDto = menu.getPlatos().stream().map(plato -> {
                CocinaDto cocinaDto = new CocinaDto();
                cocinaDto.setId(plato.getId());
                cocinaDto.setTipoComida(plato.getTipoComida());
                cocinaDto.setDescription(plato.getDescription());
                cocinaDto.setMenuId(menu.getMenuId());
                return cocinaDto;
        }).collect(Collectors.toList());
            dto.setCocina(platosDto);
            return dto;
        });
    }

    private Cocina crearPlato(MenuDia menu, Cocina.TipoComida tipo, String desc) {
        Cocina c = new Cocina();
        c.setTipoComida(tipo);
        c.setDescription(desc);
        c.setMenuDia(menu);
        return c;
    }

    @Override
    @Transactional
    public GeneralResponse createComida(CreateMenuCompletoDto comidaDto, String currentUser) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

        if(menuDiaRepository.existsByFecha(comidaDto.getFecha())){
            throw new RuntimeException("Ya hay un menú para esa fecha");
        }

        MenuDia menuDia = new MenuDia();
        menuDia.setFecha(comidaDto.getFecha());
        menuDia.setCocinero(cocinero);

        menuDia.getPlatos().add(crearPlato(menuDia, Cocina.TipoComida.CELIACO, comidaDto.getDescCeliaco()));
        menuDia.getPlatos().add(crearPlato(menuDia, Cocina.TipoComida.NOCELIACO, comidaDto.getDescNoCeliaco()));

        menuDiaRepository.save(menuDia);
        return new GeneralResponse(new Date(), "Menú completo creado", 201);
    }

    @Override
    @Transactional
    public GeneralResponse editComida(Long cocinaId, EditComidaDto editDto, String currentUser) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

        Cocina cocina = cocinaRepository.findById(cocinaId)
                .orElseThrow(() -> new RuntimeException("No se encuentra la comida"));

        if (!cocina.getMenuDia().getCocinero().getUserId().equals(cocinero.getUserId())) {
            throw new RuntimeException("No tienes permiso para editar este plato");
        }

        if (editDto.getDescription() != null) {
            cocina.setDescription(editDto.getDescription());
        }

        cocinaRepository.save(cocina);

        return new GeneralResponse(
                new Date(),
                "Plato " + cocina.getTipoComida() + " actualizado correctamente",
                HttpStatus.OK.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse editCocinero(EditCocineroDto cocineroDto, String currentUser) {

            Cocinero cocinero = cocineroRepository.findByUsername(cocineroDto.getUsername())
                    .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

            if(!cocinero.getUsername().equals(currentUser)){
                throw new RuntimeException("Acceso denegado: no tienes permisos para editar este usuario");
            }

        if (cocineroDto.getUsername() != null && !cocineroDto.getUsername().equals(cocinero.getUsername())) {
            if (userRepository.existsByUsername(cocineroDto.getUsername())) {
                throw new RuntimeException("El username " + cocineroDto.getUsername() + " ya está en uso.");
            }
            cocinero.setUsername(cocineroDto.getUsername());
        }

            cocinero.setName(cocineroDto.getName());
            cocinero.setLastname(cocineroDto.getLastname());


            cocineroRepository.save(cocinero);

            return new GeneralResponse(
                    new Date(),
                    "Cocinero actualizado con éxito",
                    HttpStatus.OK.value()
            );
    }

    @Override
    @Transactional
    public GeneralResponse deleteMenu(Long menuId, String currentUser) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el cocinero"));

        MenuDia menu = menuDiaRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("No se encuntra el menu"));

        if(!menu.getCocinero().getUserId().equals(cocinero.getUserId())){
            throw new RuntimeException("No tienes permisos para eliminar el menú");
        }

        menuDiaRepository.deleteById(menuId);

        return new GeneralResponse(
                new Date(),
                "Menú del día " + menu.getFecha() + " eliminado con éxito",
                HttpStatus.OK.value()
        );
    }
}
