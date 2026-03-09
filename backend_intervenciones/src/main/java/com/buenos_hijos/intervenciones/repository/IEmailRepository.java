package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.Email_Verification;
import com.buenos_hijos.intervenciones.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IEmailRepository extends JpaRepository<Email_Verification,Long> {

    @Query("SELECT e FROM Email_Verification e WHERE e.user = :user AND e.revoked = false AND e.expiryDate > CURRENT_TIMESTAMP ORDER BY e.expiryDate DESC")
    List<Email_Verification> findActiveVerificationByUser(@Param("user") User user, Pageable pageable);

    @Modifying // Necesario para consultas de modificación (UPDATE/DELETE)
    @Query("UPDATE Email_Verification e SET e.revoked = true WHERE e.user = :user AND e.revoked = false")
    void revokeAllPreviousCodesByUser(@Param("user") User user);

    Optional<Email_Verification> findByToken(String token);

}
