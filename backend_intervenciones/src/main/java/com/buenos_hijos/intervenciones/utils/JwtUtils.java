package com.buenos_hijos.intervenciones.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.buenos_hijos.intervenciones.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtUtils {

    @Value("${security.jwt.private.key}")
    private String secretKey;
    @Value("${security.jwt.user.generator}")
    private String userGenerator;
    @Value("${security.jwt.expiration}")
    private Long expiration;

    private String buildToken(final User user,final Long expirationTime){
        Algorithm algorithm = Algorithm.HMAC256(secretKey);

        String roleName = user.getRole().name();
        String authorities = "ROLE_".concat(roleName);

        long expiryDate = System.currentTimeMillis() + expirationTime;

        return JWT.create()
                .withIssuer(this.userGenerator)
                .withSubject(user.getUsername())
                .withClaim("authorities", authorities)
                .withClaim("email_validation", user.getEmail())
                .withIssuedAt(new Date(System.currentTimeMillis()))
                .withExpiresAt(new Date(expiryDate))
                .withJWTId(UUID.randomUUID().toString())
                .withNotBefore(new Date(System.currentTimeMillis()))
                .sign(algorithm);
    }

    public String extractUsername(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject().toString();
    }

    public Map<String, Claim> getAllClaims(DecodedJWT decodedJWT) {
        return decodedJWT.getClaims();
    }

    public Claim getSpecificClaim(DecodedJWT decodedJWT, String claimName) {
        return decodedJWT.getClaim(claimName);
    }

    public DecodedJWT validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            JWTVerifier jwtVerifier = JWT.require(algorithm)
                    .withIssuer(this.userGenerator)
                    .build();

            DecodedJWT decodedJWT = jwtVerifier.verify(token);
            return decodedJWT;
        }
        catch (JWTVerificationException exception) {
            throw new JWTVerificationException("Invalid token, not authorized");
        }
    }

    public Date extractExpiration(DecodedJWT decodedJWT) {
        return decodedJWT.getExpiresAt();
    }

    private boolean isTokenExpired(DecodedJWT decodedJWT) {
        return extractExpiration(decodedJWT).before(new Date());
    }

    public boolean isTokenValid(String token, User user) {
        try {
            DecodedJWT decodedJWT = validateToken(token);
            String username = extractUsername(decodedJWT);
            return username.equals(user.getUsername()) && !isTokenExpired(decodedJWT);
        } catch (Exception e) {
            return false;
        }
    }


    public String generateToken(final User user) {
        return buildToken(user, expiration);
    }

    public UsernamePasswordAuthenticationToken getAuthentication(String token) {
        try {
            // 1. Validamos el token (si falla, lanza excepción y va al catch)
            DecodedJWT decodedJWT = validateToken(token);

            // 2. Verificamos que no esté expirado
            if (isTokenExpired(decodedJWT)) {
                return null;
            }

            // 3. Extraemos los datos
            String username = extractUsername(decodedJWT);
            String authority = getSpecificClaim(decodedJWT, "authorities").asString();

            // 4. Creamos el token de Spring Security
            return new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority(authority))
            );
        } catch (Exception e) {
            return null; // Token inválido o corrupto
        }
    }


}
