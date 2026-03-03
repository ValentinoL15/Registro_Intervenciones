package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.CreateDescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.DescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.EditDescriptionDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.NutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.NutricionistaDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionSemanalDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.INutricionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/nutricionista")
@RequiredArgsConstructor
public class NutricionController {

    private final INutricionService nutricionService;

    @GetMapping("/{nutricionistaId}")
    public ResponseEntity<NutricionistaDto> getNutricionista(@PathVariable Long nutricionistaId) {
        return ResponseEntity.ok(nutricionService.getNutricionista(nutricionistaId));
    }

    @GetMapping()
    public ResponseEntity<Page<NutricionistaDto>> getNutricionistas(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(nutricionService.getNutricionistas(pageable));
    }

    @GetMapping("/myDescriptions")
    public ResponseEntity<Page<DescriptionDto>> getMyDescriptions(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                                                  @PageableDefault(size = 8, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable,
                                                                  Principal principal) {
        return ResponseEntity.ok(nutricionService.getMyDescriptions(desde, hasta, pageable, principal.getName()));
    }

    //VERIFICADO
    @GetMapping("/descriptions")
    public ResponseEntity<Page<DescriptionDto>> getAllDescriptions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @PageableDefault(size = 8, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable){

        // PASAR LOS PARÁMETROS AQUÍ
        return ResponseEntity.ok(nutricionService.getAllDescriptions(desde, hasta, pageable));
    }

    @PostMapping("/create-description")
    public ResponseEntity<GeneralResponse> creatDescription(@Valid @RequestBody CreateDescriptionDto descriptionDto, Principal principal) {
        return ResponseEntity.ok(nutricionService.saveDescription(descriptionDto, principal.getName()));
    }

    //VERIFICADO
    @PutMapping("/edit-description/{descriptionId}")
    public ResponseEntity<GeneralResponse> editDescription(@PathVariable Long descriptionId, @RequestBody EditDescriptionDto descriptionDto, Principal principal){
        return ResponseEntity.ok(nutricionService.editDescription(descriptionId,descriptionDto, principal.getName()));
    }

    //VERIFICADO
    @DeleteMapping("/{descriptionId}")
    public ResponseEntity<GeneralResponse> deleteDescription(@PathVariable Long descriptionId, Principal principal){
        return ResponseEntity.ok(nutricionService.deleteDescription(descriptionId, principal.getName()));
    }

    @GetMapping("/reportes")
    public ResponseEntity<Page<NutricionSemanalDto>> getReportes(@PageableDefault(size = 8, sort = "fechaInicio", direction = Sort.Direction.DESC) Pageable pageable,
                                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(nutricionService.getReportes(pageable,desde,hasta));
    }

    @GetMapping("/myReportes")
    public ResponseEntity<Page<NutricionSemanalDto>> getMyReportes(@PageableDefault(size = 8, sort = "fechaInicio", direction = Sort.Direction.DESC) Pageable pageable,
                                                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                                                   Principal principal){
        return ResponseEntity.ok(nutricionService.getMisReportes(pageable,desde,hasta, principal.getName()));
    }

    @GetMapping("/reporte/{nutricionId}")
    public ResponseEntity<NutricionSemanalDto> getReporte(@PathVariable Long nutricionId) {
        return ResponseEntity.ok(nutricionService.getReporte(nutricionId));
    }

    @PostMapping(value = "/subir-reporte", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GeneralResponse> subirReporte(
            @ModelAttribute SaveNutricionSemanalDto dto,
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

    @DeleteMapping("/reporte/{id}")
    public ResponseEntity<GeneralResponse> deleteReporte(
            @PathVariable Long id,
            Principal principal) {

        return ResponseEntity.ok(nutricionService.deleteNutricionSemanal(id, principal.getName()));
    }


}
