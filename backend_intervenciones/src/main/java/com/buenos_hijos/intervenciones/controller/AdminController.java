package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.SaveCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.dto.UserDTOs.CreateUserDto;
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

    //VERIFICADO
    @GetMapping("/{userId}")
    public ResponseEntity<AdminDto> getAdmin(@PathVariable Long userId){
        return ResponseEntity.ok(adminService.getAdmin(userId));
    }

    //VERIFICADO
    @GetMapping()
    public ResponseEntity<Page<AdminDto>> getAdmins(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(adminService.getAllAdmins(pageable));
    }

    //VERIFICADO
    @PostMapping("/create")
    public ResponseEntity<GeneralResponse> createAdmin(@Valid @RequestBody CreateAdminDto adminDto){
        return ResponseEntity.ok(adminService.saveAdmin(adminDto));
    }

    //VERIFICADO
    @PostMapping("/create-user")
    public ResponseEntity<GeneralResponse> createUser(@Valid @RequestBody CreateUserDto userDto,
                                                             Principal principal){
        return ResponseEntity.ok(adminService.saveUser(userDto,principal.getName()));
    }

    //VERIFICADO
    @PutMapping("/edit-admin")
    public ResponseEntity<GeneralResponse> editAdmin(@Valid @RequestBody EditAdminDto adminDto,
                                                     Principal principal){
        return ResponseEntity.ok(adminService.editAdmin(adminDto,principal.getName()));
    }

    //VERIFICADO
    @DeleteMapping("/delete-account/{userId}")
    public ResponseEntity<GeneralResponse> deleteAdmin(Principal principal,
                                                       @PathVariable Long userId){
        return ResponseEntity.ok(adminService.deleteAdmin(principal.getName(), userId));
    }

    //VERIFICADO
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<GeneralResponse> deleteUser(Principal principal,
                                                             @PathVariable Long userId){
        return ResponseEntity.ok(adminService.deleteUser(principal.getName(), userId));
    }

    @PutMapping("/altaBaja/{userId}")
    public ResponseEntity<GeneralResponse> altaBajaUser(@PathVariable Long userId,
                                                               Principal principal){
        return ResponseEntity.ok(adminService.altaBajaUser(userId, principal.getName()));
    }






}
