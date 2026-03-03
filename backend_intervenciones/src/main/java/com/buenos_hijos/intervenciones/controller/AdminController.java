package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.EditCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.EditTecnicoDto;
import com.buenos_hijos.intervenciones.dto.UserDTOs.CreateUserDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
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

    @PutMapping("/edit-tecnico/{tecnicoId}")
    public ResponseEntity<GeneralResponse> editTecnico(@PathVariable Long tecnicoId, @RequestBody EditTecnicoDto tecnicoDto) {
        return ResponseEntity.ok(adminService.editTecnico(tecnicoId,tecnicoDto));
    }

    @PutMapping("/edit-profesional/{profesionalId}")
    public ResponseEntity<GeneralResponse> editProfesional(@PathVariable Long profesionalId, @RequestBody EditProfesionalDto profesionalDto) {
        return ResponseEntity.ok(adminService.editProfesional(profesionalId,profesionalDto));
    }

    @PutMapping("/edit-cocinero/{cocineroId}")
    public ResponseEntity<GeneralResponse> editCocinero(@PathVariable Long cocineroId, @RequestBody EditCocineroDto cocineroDto) {
        return ResponseEntity.ok(adminService.editCocinero(cocineroId,cocineroDto));
    }

    @PutMapping("/edit-nutricionista/{nutricionistaId}")
    public ResponseEntity<GeneralResponse> editNutricionista(@PathVariable Long nutricionistaId, @RequestBody EditNutricionistaDto nutricionistaDto) {
        return ResponseEntity.ok(adminService.editNutricionista(nutricionistaId,nutricionistaDto));
    }

    @PutMapping("/edit-empleado/{empleadoId}")
    public ResponseEntity<GeneralResponse> editEmpleado(@PathVariable Long empleadoId, @RequestBody EditEmpleadoDto empleadoDto) {
        return ResponseEntity.ok(adminService.editEmpleado(empleadoId,empleadoDto));
    }



}
