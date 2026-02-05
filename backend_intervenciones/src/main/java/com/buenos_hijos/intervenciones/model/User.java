package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class User {

    public enum RoleType {
        ADMIN,
        PROFESIONAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String name;
    private String lastname;
    @Column(name = "username", unique = true)
    private String username;
    @Column(name = "email", unique = true)
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private RoleType role;

    public User() {
    }

    public User(Long userId, String name, String lastname, String username, String email, String password, RoleType role){
        this.userId = userId;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
