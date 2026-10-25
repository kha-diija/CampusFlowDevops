package com.example.campusflow.entity;

import com.example.campusflow.enums.StatutSignalement;
import com.example.campusflow.enums.TypeSignalement;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "signalement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull(message = "Le type de signalement est obligatoire.")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_signalement", nullable = false)
    private TypeSignalement type;

    @NotBlank(message = "La description est obligatoire.")
    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @NotNull(message = "La date de création est obligatoire.")
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @NotNull(message = "Le statut est obligatoire.")
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutSignalement statut;

    @Column(name = "commentaire_traitement", length = 2000)
    private String commentaireTraitement;

    @Column(name = "date_resolution")
    private LocalDateTime dateResolution;

    @Column(name = "motif_rejet", length = 2000)
    private String motifRejet;

    @NotNull(message = "La salle concernée est obligatoire.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @NotNull(message = "Le créateur est obligatoire.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createur_id", nullable = false)
    private Personnel createur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Personnel responsable;

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutSignalement.EN_ATTENTE;
        }
    }
}
