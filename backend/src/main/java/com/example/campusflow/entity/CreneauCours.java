package com.example.campusflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "creneau_cours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class CreneauCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull(message = "La date est obligatoire.")
    @Column(name = "date_cours", nullable = false)
    private LocalDate date;

    @NotNull(message = "L'heure de début est obligatoire.")
    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @NotNull(message = "L'heure de fin est obligatoire.")
    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;

    @NotBlank(message = "Le groupe est obligatoire.")
    @Column(name = "groupe", nullable = false)
    private String groupe;

    @NotBlank(message = "La matière est obligatoire.")
    @Column(name = "matiere", nullable = false)
    private String matiere;

    @NotNull(message = "La salle est obligatoire.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_emploi_du_temps_id")
    private ImportEmploiDuTemps importEmploiDuTemps;
}
