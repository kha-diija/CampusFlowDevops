package com.example.campusflow.dto;

import com.example.campusflow.enums.TypeSignalement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignalementRequest(
        @NotNull(message = "La salle concernée est obligatoire.") Long salleId,
        @NotNull(message = "Le type de problème est obligatoire.") TypeSignalement type,
        @NotBlank(message = "La description est obligatoire.")
        @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères.")
        String description) {}
