package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.*;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ICocineroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cocinero")
public class CocineroController {

    private final ICocineroService cocineroService;

    @GetMapping()
    public ResponseEntity<Page<CocineroDto>> getAllCocineros(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(cocineroService.getCocineros(pageable));
    }

    @GetMapping("/{cocineroId}")
    public ResponseEntity<CocineroDto> getCocinero(@PathVariable Long cocineroId){
        return ResponseEntity.ok(cocineroService.getCocinero(cocineroId));
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<MenuDiaDto> getMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(cocineroService.getMenu(menuId));
    }

    @GetMapping("/menu")
    public ResponseEntity<Page<MenuDiaDto>> getMenus(@PageableDefault(size = 8, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta){
        return ResponseEntity.ok(cocineroService.getMenus(desde,hasta,pageable));
    }

    @GetMapping("/myMenu")
    public ResponseEntity<Page<MenuDiaDto>> getMyMenus(@PageableDefault(size = 8, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable,
                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                                       Principal principal){
        return ResponseEntity.ok(cocineroService.getMyMenus(desde, hasta, pageable, principal.getName()));
    }

    @GetMapping("/plato/{id}")
    public ResponseEntity<PlatoDto> getPlato(@PathVariable Long id) {
        return ResponseEntity.ok(cocineroService.getPlato(id));
    }

    @GetMapping("/plato")
    public ResponseEntity<Page<PlatoDto>> getPlatos(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(cocineroService.getPlatos(pageable));
    }

    @PostMapping("/create-comida")
    public ResponseEntity<GeneralResponse> saveCocina(@Valid @RequestBody CreateMenuCompletoDto menuDto, Principal principal) {
        return ResponseEntity.ok(cocineroService.createComida(menuDto, principal.getName()));
    }

    @PutMapping("/edit-comida/{cocinaId}")
    public ResponseEntity<GeneralResponse> editComida(@PathVariable Long cocinaId,
                                                      @Valid @RequestBody EditComidaDto comidaDto,
                                                      Principal principal) {
        return ResponseEntity.ok(cocineroService.editComida(cocinaId,comidaDto, principal.getName()));
    }

    @PutMapping("/menu/edit-fecha/{menuId}")
    public ResponseEntity<GeneralResponse> editFechaMenu(@PathVariable Long menuId,
                                                         @RequestBody EditFechaMenuDto fechaMenuDto,
                                                         Principal principal) {
        return ResponseEntity.ok(cocineroService.editFechaMenu(menuId,fechaMenuDto, principal.getName()));
    }

    @PutMapping("/edit")
    public ResponseEntity<GeneralResponse> editCocinero(@Valid @RequestBody EditCocineroDto cocineroDto, Principal principal){
        return ResponseEntity.ok(cocineroService.editCocinero(cocineroDto, principal.getName()));
    }


    @DeleteMapping("/menu/{menuId}")
    public ResponseEntity<GeneralResponse> deleteComida(@PathVariable Long menuId,
                                                       Principal principal) {
        return ResponseEntity.ok(cocineroService.deleteMenu(menuId, principal.getName()));
    }


}
