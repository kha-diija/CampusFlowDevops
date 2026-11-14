package com.example.campusflow.dto;

import java.time.LocalDateTime;
import java.util.List;

/** {@code commentaires} n'est renseigné que pour le détail d'un signalement. */
public record SignalementDto(Long id, Long salleId, String salleNom, String batiment,
                             String type, String description, String statut,
                             LocalDateTime dateCreation, String createur, String responsable,
                             String commentaireTraitement, String motifRejet,
                             LocalDateTime dateResolution, boolean indisponibiliteActive,
                             List<CommentaireDto> commentaires) {}
