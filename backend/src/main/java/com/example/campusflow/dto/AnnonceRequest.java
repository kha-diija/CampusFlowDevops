package com.example.campusflow.dto;

import com.example.campusflow.enums.StatutAnnonce;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record AnnonceRequest(
        @NotBlank(message = "Le titre est obligatoire.")
        @Size(max = 255, message = "Le titre ne doit pas dépasser 255 caractères.")
        String titre,
        @NotBlank(message = "La description est obligatoire.")
        @Size(max = 5000, message = "La description ne doit pas dépasser 5000 caractères.")
        String contenu,
        @NotNull(message = "Le statut est obligatoire.")
        StatutAnnonce statut,
        LocalDateTime datePublication) {}
