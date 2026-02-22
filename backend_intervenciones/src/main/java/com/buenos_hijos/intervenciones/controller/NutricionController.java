package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionSemanalDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.INutricionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/nutricion")
@RequiredArgsConstructor
public class NutricionController {

    private final INutricionService nutricionService;

    @PostMapping(value = "/subir-reporte", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GeneralResponse> subirReporte(
            @ModelAttribute SaveNutricionSemanalDto dto, // Spring llena fechaInicio y fechaFinal aquí
            @RequestParam("archivo") MultipartFile archivo,
            Principal principal) {

        return ResponseEntity.ok(nutricionService.saveNutricionSemanal(dto, archivo, principal.getName()));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GeneralResponse> editReporte(
            @PathVariable Long id,
            @ModelAttribute EditNutricionSemanalDto dto,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo,
            Principal principal) {

        return ResponseEntity.ok(nutricionService.editNutricionSemanal(id, dto, archivo, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<GeneralResponse> deleteReporte(
            @PathVariable Long id,
            Principal principal) {

        return ResponseEntity.ok(nutricionService.deleteNutricionSemanal(id, principal.getName()));
    }

}
