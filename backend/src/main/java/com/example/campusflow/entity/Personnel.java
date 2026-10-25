package com.example.campusflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "personnel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Personnel extends Utilisateur {

    @Column(name = "matricule", unique = true)
    private String matricule;

    @Column(name = "departement")
    private String departement;

    @Column(name = "autorise_publication", nullable = false)
    private boolean autorisePublication;

    @OneToMany(mappedBy = "auteur", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Actualite> actualites = new ArrayList<>();

    @OneToMany(mappedBy = "gestionnaire", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Reservation> reservations = new ArrayList<>();

    @Transient
    public String getMatriculeLegacy() {
        return matricule;
    }

    @Transient
    public void setMatriculeLegacy(String matricule) {
        this.matricule = matricule;
    }
}
