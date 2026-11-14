package com.example.campusflow.dto;

import java.time.LocalDateTime;

/** statut : EN_COURS, A_VENIR, TERMINEE ou LEVEE. */
public record IndisponibiliteDto(Long id, Long salleId, String salleNom, String batiment,
                                 LocalDateTime dateDebut, LocalDateTime dateFin, String motif,
                                 boolean active, String statut, Long signalementId,
                                 String createur, long reservationsEnConflit) {}
