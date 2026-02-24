package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.UserDTOs.EditUserDto;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PutMapping("/edit")
    public ResponseEntity<Map<String,String>> editUser(@Valid @RequestBody EditUserDto userDto, Principal principal) {
        return ResponseEntity.ok(userService.editUser(userDto, principal.getName()));
    }

}
