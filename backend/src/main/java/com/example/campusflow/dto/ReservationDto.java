// dto/ReservationDto.java
package com.example.campusflow.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationDto(Long id, String reference, Long salleId, String salleNom, String batiment,
                             LocalDate date, LocalTime heureDebut, LocalTime heureFin,
                             String motif, String statut) {}