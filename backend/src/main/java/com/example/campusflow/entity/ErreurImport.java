package com.example.campusflow.entity;

import com.example.campusflow.enums.TypeErreurImport;
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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "erreur_import")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class ErreurImport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull(message = "Le numéro de ligne est obligatoire.")
    @Column(name = "numero_ligne", nullable = false)
    private Integer numeroLigne;

    @NotNull(message = "Le type d'erreur est obligatoire.")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_erreur", nullable = false)
    private TypeErreurImport typeErreur;

    @NotBlank(message = "Le message d'erreur est obligatoire.")
    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @NotNull(message = "L'import est obligatoire.")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_emploi_du_temps_id", nullable = false)
    private ImportEmploiDuTemps importEmploiDuTemps;
}
