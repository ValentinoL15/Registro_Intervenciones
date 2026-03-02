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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username"));

        if(!user.isActive()){
                throw new DisabledException("El usuario no está dado de alta o fue dado de baja, por favor comuníquese con un adminstrador");
        }

        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();

        String roleName = user.getRole().name();
        authorityList.add(new SimpleGrantedAuthority("ROLE_".concat(roleName)));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
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
        String username = loginDTO.getUsername();
        String password = loginDTO.getPassword();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));


        Authentication authentication = this.authenticate(username,password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String access_token = jwtUtils.generateToken(user);
        Long userId = user.getUserId();
        String userRole = user.getRole().name();
        String name = user.getName();
        String lastname = user.getLastname();


        AuthResponse authResponse = new AuthResponse("Logueado correctamente",access_token,username,userId,userRole,name,lastname);
        return authResponse;
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
