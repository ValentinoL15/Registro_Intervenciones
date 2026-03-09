package com.buenos_hijos.intervenciones.repository;

import com.buenos_hijos.intervenciones.model.ChangePassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPasswordRepository extends JpaRepository<ChangePassword,Long> {

    Optional<ChangePassword> findByToken(String token);

    List<ChangePassword> findByEmail(String email);

}
