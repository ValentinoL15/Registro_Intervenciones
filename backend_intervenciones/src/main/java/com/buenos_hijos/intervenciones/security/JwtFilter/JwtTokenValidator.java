package com.buenos_hijos.intervenciones.security.JwtFilter;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.UserServiceImp;
import com.buenos_hijos.intervenciones.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtTokenValidator extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final IUserRepository userRepository;
    private final UserServiceImp userServiceImp;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/auth") || requestURI.startsWith("/api/email")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwtToken = authHeader.substring(7);

            try {
                DecodedJWT decodedJWT = jwtUtils.validateToken(jwtToken);
                String username = jwtUtils.extractUsername(decodedJWT);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    // 2. Obtener la entidad USER (Para cumplir con tu método isTokenValid)
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

                    // 3. Validar el token usando la entidad User
                    if (jwtUtils.isTokenValid(jwtToken, user)) {

                        // Necesitamos UserDetails para que Spring Security funcione correctamente
                        UserDetails userDetails = userServiceImp.loadUserByUsername(username);

                        // 4. CREAR EL TOKEN DE AUTENTICACIÓN
                        // Al pasar 'userDetails' como primer parámetro, el Principal dejará de ser null
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // 5. ESTABLECER EL CONTEXTO UNA SOLA VEZ
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                // Opcional: response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            }
        }

        // IMPORTANTE: Solo un doFilter al final para seguir la cadena
        filterChain.doFilter(request, response);

    }
}
