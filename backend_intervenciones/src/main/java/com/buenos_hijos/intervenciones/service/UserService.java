package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.UserDTOs.EditUserDto;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IUserService;
import com.buenos_hijos.intervenciones.utils.JwtUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;
    private final JwtUtils jwtUtils;


    @Override
    @Transactional
    public Map<String, String> editUser(EditUserDto userDto, String currentUser) {

        User user = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (userDto.getName() != null) {
            if (userDto.getName().trim().length() < 3) {
                throw new RuntimeException("El nombre debe contener al menos 3 letras");
            }
            user.setName(userDto.getName());
        }

        if (userDto.getLastname() != null) {
            if (userDto.getLastname().trim().length() < 3) {
                throw new RuntimeException("El apellido debe contener al menos 3 letras");
            }
            user.setLastname(userDto.getLastname());
        }

        if (userDto.getUsername() != null && !userDto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(userDto.getUsername())) {
                throw new RuntimeException("El username ya se encuentra en uso");
            }
            user.setUsername(userDto.getUsername());
        }

        userRepository.save(user);

        // GENERAR NUEVO TOKEN (Fundamental para no perder la sesión)
        String nuevoToken = jwtUtils.generateToken(user);

        // USAR .put() EN LUGAR DE .add()
        Map<String, String> response = new HashMap<>();
        response.put("message", "Usuario actualizado correctamente");
        response.put("token", nuevoToken);

        return response;
    }
}
