package com.example.campusflow.entity;

import com.example.campusflow.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(
    name = "utilisateur",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_utilisateur_email", columnNames = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public abstract class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @ToString.Include
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "actif", nullable = false)
    private Boolean actif = true;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        if (actif == null) {
            actif = true;
        }
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }

    @JsonIgnore
    public String getMotDePasseHash() {
        return motDePasse;
    }

    public void setMotDePasseHash(String motDePasseHash) {
        this.motDePasse = motDePasseHash;
    }

    @JsonIgnore
    public String getPassword() {
        return motDePasse;
    }

    public boolean canReserveSalle() {
        return role == Role.ETUDIANT || role == Role.PERSONNEL || role == Role.PERSONNEL_HABILITE || role == Role.GESTIONNAIRE_EMPLOI_DU_TEMPS;
    }

    public boolean canManageAnnouncements() {
        return role == Role.PERSONNEL_HABILITE;
    }

    public boolean canHandleReports() {
        return role == Role.PERSONNEL_HABILITE;
    }

    public boolean canImportTimetable() {
        return role == Role.GESTIONNAIRE_EMPLOI_DU_TEMPS;
    }
}
