package com.example.campusflow.entity;

import com.example.campusflow.enums.StatutImport;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "import_emploi_du_temps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class ImportEmploiDuTemps {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "Le nom du fichier est obligatoire.")
    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @NotNull(message = "La date d'import est obligatoire.")
    @Column(name = "date_importation", nullable = false)
    private LocalDateTime dateImportation;

    @NotNull(message = "La période de début est obligatoire.")
    @Column(name = "periode_debut", nullable = false)
    private LocalDate periodeDebut;

    @NotNull(message = "La période de fin est obligatoire.")
    @Column(name = "periode_fin", nullable = false)
    private LocalDate periodeFin;

    @NotNull(message = "Le statut est obligatoire.")
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutImport statut;

    @Column(name = "nombre_lignes_lues", nullable = false)
    private Integer nombreLignesLues = 0;

    @Column(name = "nombre_lignes_importees", nullable = false)
    private Integer nombreLignesImportees = 0;

    @Column(name = "nombre_erreurs", nullable = false)
    private Integer nombreErreurs = 0;

    @NotNull(message = "Le gestionnaire est obligatoire.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gestionnaire_id", nullable = false)
    private Personnel gestionnaire;

    @OneToMany(mappedBy = "importEmploiDuTemps", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ErreurImport> erreurs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateImportation == null) {
            dateImportation = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutImport.EN_COURS;
        }
        if (nombreLignesLues == null) {
            nombreLignesLues = 0;
        }
        if (nombreLignesImportees == null) {
            nombreLignesImportees = 0;
        }
        if (nombreErreurs == null) {
            nombreErreurs = 0;
        }
    }
}
