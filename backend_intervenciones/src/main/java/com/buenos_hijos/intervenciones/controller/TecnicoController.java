package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.CreateDescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.DescriptionDto;
import com.buenos_hijos.intervenciones.dto.DescriptionTecDTOs.EditDescriptionDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.TecnicoDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ITecnicoService;
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
@RequestMapping("/api/tecnico")
public class TecnicoController {

    private final ITecnicoService tecnicoService;

    //VERIFICADO
    @GetMapping()
    public ResponseEntity<List<TecnicoDto>> getTecnicos() {
        return ResponseEntity.ok(tecnicoService.getTecnicos());
    }

    //VERIFICADO
    @GetMapping("/{tecnicoId}")
    public ResponseEntity<TecnicoDto> getTecnico(@PathVariable Long tecnicoId){
        return ResponseEntity.ok(tecnicoService.getTecnico(tecnicoId));
    }

    //VERIFICADO
    @GetMapping("/myDescriptions")
    public ResponseEntity<Page<DescriptionDto>> getMyDescriptions(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                                                  @PageableDefault(size = 8, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable,
                                                                  Principal principal) {
        return ResponseEntity.ok(tecnicoService.getMyDescriptions(desde, hasta, pageable, principal.getName()));
    }

    //VERIFICADO
    @GetMapping("/descriptions")
    public ResponseEntity<Page<DescriptionDto>> getAllDescriptions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @PageableDefault(size = 8, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable){

        // PASAR LOS PARÁMETROS AQUÍ
        return ResponseEntity.ok(tecnicoService.getAllDescriptions(desde, hasta, pageable));
    }

    //VERIFICADO
    @PostMapping("/create-description")
    public ResponseEntity<GeneralResponse> creatDescription(@Valid @RequestBody CreateDescriptionDto descriptionDto, Principal principal) {
        return ResponseEntity.ok(tecnicoService.createDescription(descriptionDto, principal.getName()));
    }

    //VERIFICADO
    @PutMapping("/edit-description/{descriptionId}")
    public ResponseEntity<GeneralResponse> editDescription(@PathVariable Long descriptionId, @RequestBody EditDescriptionDto descriptionDto, Principal principal){
        return ResponseEntity.ok(tecnicoService.editDescription(descriptionId,descriptionDto, principal.getName()));
    }

    //VERIFICADO
    @DeleteMapping("/{descriptionId}")
    public ResponseEntity<GeneralResponse> deleteDescription(@PathVariable Long descriptionId, Principal principal){
        return ResponseEntity.ok(tecnicoService.deleteDescription(descriptionId, principal.getName()));
    }

}
