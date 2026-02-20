package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.CocinaDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.CocineroDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.CreateCocinaBatchDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.EditCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ICocineroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


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

    @PostMapping("/create")
    public ResponseEntity<GeneralResponse> saveCocina(@Valid @RequestBody CreateCocinaBatchDto batchDto, Principal principal) {
        return ResponseEntity.ok(cocineroService.createComida(batchDto, principal.getName()));
    }

    @PutMapping("/edit")
    public ResponseEntity<GeneralResponse> editCocinero(@Valid @RequestBody EditCocineroDto cocineroDto, Principal principal){
        return ResponseEntity.ok(cocineroService.editCocinero(cocineroDto, principal.getName()));
    }


}
