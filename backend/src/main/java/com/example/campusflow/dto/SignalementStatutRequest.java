package com.example.campusflow.dto;

import com.example.campusflow.enums.StatutSignalement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignalementStatutRequest(
        @NotNull(message = "Le statut est obligatoire.") StatutSignalement statut,
        @Size(max = 2000, message = "Le commentaire ne doit pas dépasser 2000 caractères.") String commentaire,
        @Size(max = 2000, message = "Le motif ne doit pas dépasser 2000 caractères.") String motifRejet) {}
