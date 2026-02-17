package com.buenos_hijos.intervenciones.controller;

import com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs.AuthResponse;
import com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs.LoginDTO;
import com.buenos_hijos.intervenciones.dto.UserDTOs.UserDto;
import com.buenos_hijos.intervenciones.service.UserServiceImp;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    //VERIFICADO
    @GetMapping("/user/{user_id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long user_id) {
        return ResponseEntity.ok(userServiceImp.getUser(user_id));
    }

}
