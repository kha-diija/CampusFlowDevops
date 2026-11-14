package com.example.campusflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentaireRequest(
        @NotBlank(message = "Le commentaire est obligatoire.")
        @Size(max = 2000, message = "Le commentaire ne doit pas dépasser 2000 caractères.")
        String texte) {}
