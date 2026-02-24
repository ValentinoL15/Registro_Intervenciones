package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditMantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.MantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveMantenimientoDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IEmpleadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@RestController
@RequestMapping("/api/empleado")
@RequiredArgsConstructor
public class EmpleadoController {

    private final IEmpleadoService empleadoService;

    @GetMapping()
    public ResponseEntity<Page<EmpleadoDto>> getEmpleados(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(empleadoService.getEmpleados(pageable));
    }

    @GetMapping("/{empleadoId}")
    public ResponseEntity<EmpleadoDto> getEmpleado(@PathVariable Long empleadoId){
        return ResponseEntity.ok(empleadoService.getEmpleado(empleadoId));
    }

    @GetMapping("/mantenimiento")
    public ResponseEntity<Page<MantenimientoDto>> getMantenimientos(@PageableDefault Pageable pageable, Principal principal){
        return ResponseEntity.ok(empleadoService.getMantenimientos(pageable, principal.getName()));
    }

    @GetMapping("/mantenimiento/{mantenimientoId}")
    public ResponseEntity<MantenimientoDto> getMantenimiento(@PathVariable Long mantenimientoId){
        return ResponseEntity.ok(empleadoService.getMantenimiento(mantenimientoId));
    }

    @PostMapping("/crear-mantenimiento")
    public ResponseEntity<GeneralResponse> createMantenimiento(@Valid @RequestBody SaveMantenimientoDto mantenimientoDto, Principal principal) {
        return ResponseEntity.ok(empleadoService.saveMantenimiento(mantenimientoDto, principal.getName()));
    }

    @PutMapping("/edit-mantenimiento/{mantenimientoId}")
    public ResponseEntity<GeneralResponse> editMantenimiento(@PathVariable Long mantenimientoId,@Valid @RequestBody EditMantenimientoDto mantenimientoDto, Principal principal){
        return ResponseEntity.ok(empleadoService.editMantenimiento(mantenimientoId,mantenimientoDto,principal.getName()));
    }

    @DeleteMapping("/{mantenimientoId}")
    public ResponseEntity<GeneralResponse> deleteMantenimiento(@PathVariable Long mantenimientoId,Principal principal) {
        return ResponseEntity.ok(empleadoService.deleteMantenimiento(mantenimientoId, principal.getName()));
    }

}
