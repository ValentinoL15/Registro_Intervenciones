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
    public List<CocineroDto> getCocineros() {
        return cocineroRepository.findAll().stream().map(cocinero -> {
            CocineroDto dto = new CocineroDto();
            dto.setUserId(cocinero.getUserId());
            dto.setName(cocinero.getName());
            dto.setLastname(cocinero.getLastname());
            dto.setUsername(cocinero.getUsername());
            dto.setEmail(cocinero.getEmail());
            dto.setHourly(cocinero.getHourly());
            dto.setActive(cocinero.isActive());
            return dto;
        }).collect(Collectors.toList());
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
    public Page<MenuDiaDto> getMenus(LocalDate desde, LocalDate hasta, Pageable pageable) {
        // Normalización de fechas (rango infinito por defecto)
        LocalDate start = (desde != null) ? desde : LocalDate.of(1900, 1, 1);
        LocalDate end = (hasta != null) ? hasta : LocalDate.of(2100, 12, 31);

        return menuDiaRepository.findByFechaBetween(start, end, pageable)
                .map(this::convertToDto);
    }

    @Override
    public Page<MenuDiaDto> getMyMenus(LocalDate desde, LocalDate hasta, Pageable pageable, String currentUser) {
        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("Cocinero no encontrado"));

        LocalDate start = (desde != null) ? desde : LocalDate.of(1900, 1, 1);
        LocalDate end = (hasta != null) ? hasta : LocalDate.of(2100, 12, 31);

        return menuDiaRepository.findByCocineroAndFechaBetween(cocinero, start, end, pageable)
                .map(this::convertToDto);
    }

    // Método de mapeo centralizado
    private MenuDiaDto convertToDto(MenuDia menu) {
        MenuDiaDto dto = new MenuDiaDto();
        dto.setCocineroId(menu.getCocinero().getUserId());
        dto.setMenuId(menu.getMenuId());
        dto.setFecha(menu.getFecha());
        dto.setNombreCocinero(menu.getCocinero().getName() + " " + menu.getCocinero().getLastname());

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
    }

    @Override
    public PlatoDto getPlato(Long id) {
        Cocina cocina = cocinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plato no encontrado"));

        PlatoDto dto = new PlatoDto();
        dto.setId(cocina.getId());
        dto.setTipoComida(cocina.getTipoComida());
        dto.setDescription(cocina.getDescription());

        if (cocina.getMenuDia() != null) {
            dto.setMenuId(cocina.getMenuDia().getMenuId());
        }

        return dto;
    }

    @Override
    public Page<PlatoDto> getPlatos(Pageable pageable) {
        Page<Cocina> platosPage = cocinaRepository.findAll(pageable);

        return platosPage.map(cocina -> {
            PlatoDto dto = new PlatoDto();
            dto.setId(cocina.getId());
            dto.setTipoComida(cocina.getTipoComida());
            dto.setDescription(cocina.getDescription());
            dto.setMenuId(cocina.getMenuDia().getMenuId());
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

        MenuDia menuDia = new MenuDia();
        if (comidaDto.getFecha().isAfter(LocalDate.now())) {
            throw new RuntimeException("No se puede crear un menú para una fecha posterior a la de hoy");
        }
        menuDia.setCocinero(cocinero);
        menuDia.setFecha(comidaDto.getFecha());

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
    public GeneralResponse editFechaMenu(Long menuId, EditFechaMenuDto editDto, String currentUser) {
        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

        MenuDia menu = menuDiaRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("No se encuentra el menú"));

        if (!menu.getCocinero().getUserId().equals(cocinero.getUserId())) {
            throw new RuntimeException("No tienes permiso para editar este menú");
        }

        if (editDto.getFecha() != null) {
            if (editDto.getFecha().isAfter(LocalDate.now())) {
                throw new RuntimeException("No se puede crear un menú para una fecha posterior a la de hoy");
            }
            menu.setFecha(editDto.getFecha());
        }

        menuDiaRepository.save(menu);

        return new GeneralResponse(new Date(), "Fecha actualizada correctamente", HttpStatus.OK.value());
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
