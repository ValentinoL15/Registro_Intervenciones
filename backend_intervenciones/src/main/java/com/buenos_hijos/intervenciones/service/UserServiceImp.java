package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs.AuthResponse;
import com.buenos_hijos.intervenciones.dto.AuthReponsesDTOs.LoginDTO;
import com.buenos_hijos.intervenciones.dto.UserDTOs.UserDto;
import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserDetailsService {

    private final IUserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String loginInput) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(loginInput, loginInput)
                .orElseThrow(() -> new UsernameNotFoundException("No se encuentra el usuario con: " + loginInput));

        if(!user.isActive()){
            throw new DisabledException("El usuario no está dado de alta o fue dado de baja...");
        }

        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();
        authorityList.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), // Seguimos usando el username real para el objeto UserDetails
                user.getPassword(),
                authorityList);

    }

    public Authentication authenticate(String username, String password) {
        UserDetails userDetails = this.loadUserByUsername(username);

        if(userDetails == null) {
            throw new BadCredentialsException("Invalid username o password");
        }
        if(!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Contraseña inválida");
        }

        return new UsernamePasswordAuthenticationToken(username, userDetails.getPassword(), userDetails.getAuthorities());

    }

    public AuthResponse login(LoginDTO loginDTO) {
        String loginInput = loginDTO.getUsername(); // El input del usuario
        String password = loginDTO.getPassword();

        // Buscamos por username o email
        User user = userRepository.findByUsernameOrEmail(loginInput, loginInput)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // Autenticamos usando el loginInput (que loadUserByUsername procesará)
        Authentication authentication = this.authenticate(loginInput, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String access_token = jwtUtils.generateToken(user);

        // Retornamos el username real del usuario, sin importar si entró con el email
        return new AuthResponse(
                "Logueado correctamente",
                access_token,
                user.getUsername(),
                user.getUserId(),
                user.getRole().name(),
                user.getName(),
                user.getLastname(),
                user.getEmail()
        );
    }

    public UserDto getUser(Long user_id) {
        User user = userRepository.findById(user_id)
                .orElseThrow(() -> new RuntimeException("No se encuentra el usuario"));
        UserDto userDto = new UserDto(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getLastname(),
                user.getUsername(),
                null,
                user.getRole(),
                null
        );
        return userDto;
    }

    public User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("No se encuentra el usuario"));
        return user;
    }
}
