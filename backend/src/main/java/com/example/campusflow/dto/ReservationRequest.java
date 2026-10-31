// dto/ReservationRequest.java
package com.example.campusflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationRequest(
        @NotNull(message = "La salle est obligatoire.") Long salleId,
        @NotNull(message = "La date est obligatoire.") LocalDate date,
        @NotNull(message = "L'heure de début est obligatoire.") LocalTime heureDebut,
        @NotNull(message = "L'heure de fin est obligatoire.") LocalTime heureFin,
        @NotBlank(message = "Le motif est obligatoire.")
        @Size(max = 255, message = "Le motif ne doit pas dépasser 255 caractères.") String motif) {}