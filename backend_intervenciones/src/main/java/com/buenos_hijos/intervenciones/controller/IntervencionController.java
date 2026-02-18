package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.CreateIntervencionDto;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.EditIntervencionDto;
import com.buenos_hijos.intervenciones.dto.IntervencionDTOs.IntervencionDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.InIntervencionService;
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
@RequestMapping("/api/intervenciones")
public class IntervencionController {

    private final InIntervencionService intervencionService;

    @GetMapping()
    public ResponseEntity<Page<IntervencionDto>> getIntervenciones(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(intervencionService.getAllIntervenciones(pageable));
    }

    @GetMapping("/mis-intervenciones")
    public ResponseEntity<Page<IntervencionDto>> getMyIntervenciones(@PageableDefault Pageable pageable,Principal principal){
        return ResponseEntity.ok(intervencionService.getMyIntervenciones(pageable, principal.getName()));
    }

    @GetMapping("/{intervencion_id}")
    public ResponseEntity<IntervencionDto> getIntervencion(@PathVariable Long intervencion_id){
        return ResponseEntity.ok(intervencionService.getIntervencion(intervencion_id));
    }


    @PostMapping("/create")
    public ResponseEntity<GeneralResponse> saveIntervencion(@Valid @RequestBody CreateIntervencionDto intervencionDto,
                                                            Principal principal){
        return ResponseEntity.ok(intervencionService.saveIntervencion(intervencionDto, principal.getName()));
    }

    @PutMapping("/edit/{intervencion_id}")
    public ResponseEntity<GeneralResponse> editIntervencion(@PathVariable Long intervencion_id,
                                                            @Valid @RequestBody EditIntervencionDto intervencionDto,
                                                            Principal principal){
        return ResponseEntity.ok(intervencionService.editIntervencion(intervencion_id,intervencionDto, principal.getName()));
    }



    @DeleteMapping("/{intervencion_id}")
    public ResponseEntity<GeneralResponse> deleteIntervencion(@PathVariable Long intervencion_id,
                                                              Principal principal) {
        return ResponseEntity.ok(intervencionService.deleteIntervencion(intervencion_id, principal.getName()));
    }


}
