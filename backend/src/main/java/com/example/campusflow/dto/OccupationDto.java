package com.example.campusflow.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Créneau pendant lequel une salle n'est pas libre.
 * type : COURS, RESERVATION ou INDISPONIBILITE.
 */
public record OccupationDto(String type, LocalDate date, LocalTime heureDebut, LocalTime heureFin, String libelle) {}