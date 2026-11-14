package com.example.campusflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record IndisponibiliteRequest(
        @NotNull(message = "La salle est obligatoire.") Long salleId,
        @NotNull(message = "La date de début est obligatoire.") LocalDateTime dateDebut,
        @NotNull(message = "La date de fin est obligatoire.") LocalDateTime dateFin,
        @NotBlank(message = "Le motif est obligatoire.")
        @Size(max = 1000, message = "Le motif ne doit pas dépasser 1000 caractères.")
        String motif,
        Long signalementId) {}
