package com.example.campusflow.dto;

import java.time.LocalDateTime;

public record AnnonceGestionDto(Long id, String titre, String contenu, String statut,
                                LocalDateTime datePublication, LocalDateTime dateModification,
                                String auteur) {}
