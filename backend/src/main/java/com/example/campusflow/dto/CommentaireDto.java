package com.example.campusflow.dto;

import java.time.LocalDateTime;

public record CommentaireDto(Long id, String texte, String auteur, LocalDateTime dateCreation) {}
