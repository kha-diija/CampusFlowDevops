package com.example.campusflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "etudiant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Etudiant extends Utilisateur {

    @Column(name = "numero_etudiant", unique = true)
    private String numeroEtudiant;

    @Column(name = "filiere", nullable = false)
    private String filiere;

    @Transient
    public String getCne() {
        return numeroEtudiant;
    }

    @Transient
    public void setCne(String cne) {
        this.numeroEtudiant = cne;
    }
}
