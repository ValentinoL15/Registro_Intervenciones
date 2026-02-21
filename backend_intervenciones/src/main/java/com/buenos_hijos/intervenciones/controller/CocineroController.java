package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.*;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ICocineroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @GetMapping("/comidas")
    public ResponseEntity<List<AdminCocinaResponseDto>> getComidas() {
        return ResponseEntity.ok(cocineroService.getAllComidas());
    }

    @PostMapping("/create")
    public ResponseEntity<GeneralResponse> saveCocina(@Valid @RequestBody CreateCocinaBatchDto batchDto, Principal principal) {
        return ResponseEntity.ok(cocineroService.createComida(batchDto, principal.getName()));
    }

    @PutMapping("/edit")
    public ResponseEntity<GeneralResponse> editCocinero(@Valid @RequestBody EditCocineroDto cocineroDto, Principal principal){
        return ResponseEntity.ok(cocineroService.editCocinero(cocineroDto, principal.getName()));
    }

    @PutMapping("/edit-comida/{fechaOriginal}")
    public ResponseEntity<GeneralResponse> editComida(@PathVariable @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate fechaOriginal,
                                                        @Valid @RequestBody CreateCocinaBatchDto batchDto,
                                                      Principal principal) {
        return ResponseEntity.ok(cocineroService.editComida(batchDto, principal.getName(), fechaOriginal));
    }

    @DeleteMapping("/delete-comida/{fechaOriginal}")
    public ResponseEntity<GeneralResponse> deleteComida(@PathVariable @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate fechaOriginal,
                                                       Principal principal) {
        return ResponseEntity.ok(cocineroService.deleteComida(fechaOriginal, principal.getName()));
    }


}
