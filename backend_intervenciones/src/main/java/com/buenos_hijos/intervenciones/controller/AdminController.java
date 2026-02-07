package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IAdminService;
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
@RequestMapping("/api/admin")
public class AdminController {

    private final IAdminService adminService;

    @GetMapping("/{userId}")
    public ResponseEntity<AdminDto> getAdmin(@PathVariable Long userId){
        return ResponseEntity.ok(adminService.getAdmin(userId));
    }

    @GetMapping()
    public ResponseEntity<Page<AdminDto>> getAdmins(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(adminService.getAllAdmins(pageable));
    }

    @PostMapping("/create")
    public ResponseEntity<GeneralResponse> createAdmin(@Valid @RequestBody CreateAdminDto adminDto){
        return ResponseEntity.ok(adminService.saveAdmin(adminDto));
    }

    @PostMapping("/create-profesional")
    public ResponseEntity<GeneralResponse> createProfesional(@Valid @RequestBody CreateProfesionalDto profesionalDto,
                                                             Principal principal){
        return ResponseEntity.ok(adminService.saveProfesional(profesionalDto,principal.getName()));
    }

    @PutMapping("/edit-admin")
    public ResponseEntity<GeneralResponse> editAdmin(@Valid @RequestBody EditAdminDto adminDto,
                                                     Principal principal){
        return ResponseEntity.ok(adminService.editAdmin(adminDto,principal.getName()));
    }

    @DeleteMapping("/delete-account/{userId}")
    public ResponseEntity<GeneralResponse> deleteAdmin(Principal principal,
                                                       @PathVariable Long userId){
        return ResponseEntity.ok(adminService.deleteAdmin(principal.getName(), userId));
    }

    @DeleteMapping("/delete-profesional/{profesionalId}")
    public ResponseEntity<GeneralResponse> deleteProfesional(Principal principal,
                                                             @PathVariable Long profesionalId){
        return ResponseEntity.ok(adminService.deleteProfesional(principal.getName(), profesionalId));
    }

    @PutMapping("/baja/{profesionalId}")
    public ResponseEntity<GeneralResponse> bajaProfesional(Principal principal,
                                                           @PathVariable Long profesionalId){
        return ResponseEntity.ok(adminService.bajaProfesional(principal.getName(), profesionalId));
    }

    @PutMapping("/alta/{profesionalId}")
    public ResponseEntity<GeneralResponse> altaProfesional(Principal principal,
                                                           @PathVariable Long profesionalId){
        return ResponseEntity.ok(adminService.altaProfesional(principal.getName(), profesionalId));
    }






}
