package com.buenos_hijos.intervenciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "email_verification")
public class Email_Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_verification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", referencedColumnName = "userId")
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    private LocalDateTime expiryDate;

    private boolean revoked=false;

    public boolean isExpired() {
        return expiryDate.isBefore(LocalDateTime.now());
    }

    public Email_Verification(User user, LocalDateTime expiryDate, boolean revoked) {
        this.user = user;
        this.expiryDate = expiryDate;
        this.revoked = revoked;
    }

}
