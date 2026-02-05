package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "admins")
public class Admin extends User{

    public Admin(Long userId, String name, String lastname, String username, String email, String password, RoleType role) {
        super(userId, name, lastname, username, email, password, role);
    }

    public Admin() {
    }
}
