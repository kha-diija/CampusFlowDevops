package com.example.campusflow.dto;

import com.example.campusflow.enums.StatutAnnonce;
import jakarta.validation.constraints.NotNull;

public record AnnonceStatutRequest(@NotNull(message = "Le statut est obligatoire.") StatutAnnonce statut) {}
