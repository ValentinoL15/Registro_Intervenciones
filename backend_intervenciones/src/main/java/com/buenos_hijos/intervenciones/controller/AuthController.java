package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs.AuthResponse;
import com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs.LoginDTO;
import com.buenos_hijos.intervenciones.service.UserServiceImp;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserServiceImp userServiceImp;

    //VERIFICADO
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginDTO loginDTO){
        return ResponseEntity.ok(userServiceImp.login(loginDTO));
    }

}
