package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.ProfesionalDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IProfesionalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profesional")
@RequiredArgsConstructor
public class ProfesionalController {

    private final IProfesionalService profesionalService;

    @GetMapping()
    public ResponseEntity<Page<ProfesionalDto>> getProfesionals(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(profesionalService.getAllProfesionals(pageable));
    }

    @GetMapping("/{profesionalId}")
    public ResponseEntity<ProfesionalDto> getProfesional(@PathVariable Long profesionalId){
        return ResponseEntity.ok(profesionalService.getProfesional(profesionalId));
    }

    @PutMapping("/edit-profesional")
    public ResponseEntity<GeneralResponse> editProfesional(@Valid @RequestBody EditProfesionalDto profesionalDto,
                                                           Principal principal){
        return ResponseEntity.ok(profesionalService.editProfesional(profesionalDto, principal.getName()));
    }

}
