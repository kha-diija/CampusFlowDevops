// service/DisponibiliteService.java
package com.example.campusflow.service;

import com.example.campusflow.enums.StatutReservation;
import com.example.campusflow.repository.CreneauCoursRepository;
import com.example.campusflow.repository.IndisponibiliteSalleRepository;
import com.example.campusflow.repository.ReservationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DisponibiliteService {

    private final CreneauCoursRepository cours;
    private final IndisponibiliteSalleRepository indisponibilites;
    private final ReservationRepository reservations;

    /** Renvoie le motif d'occupation, ou vide si la salle est libre (RG-BOOK-07, 08, 09). */
    public Optional<String> motifOccupation(Long salleId, LocalDate date, LocalTime debut, LocalTime fin) {
        LocalDateTime d = date.atTime(debut);
        LocalDateTime f = date.atTime(fin);

        if (cours.existsBySalleIdAndDateAndHeureDebutLessThanAndHeureFinGreaterThan(salleId, date, fin, debut)) {
            return Optional.of("La salle est occupée par un cours sur ce créneau.");
        }
        if (indisponibilites.existsBySalleIdAndActiveTrueAndDateDebutLessThanAndDateFinGreaterThan(salleId, f, d)) {
            return Optional.of("La salle est indisponible sur cette période.");
        }
        if (reservations.existsBySalleIdAndStatutAndDateDebutLessThanAndDateFinGreaterThan(
                salleId, StatutReservation.CONFIRMEE, f, d)) {
            return Optional.of("Ce créneau est déjà réservé.");
        }
        return Optional.empty();
    }
}