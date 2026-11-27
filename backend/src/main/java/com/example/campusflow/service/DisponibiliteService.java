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
import com.example.campusflow.dto.OccupationDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

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
    /**
     * Liste les créneaux occupés d'une salle pour une journée : cours programmés, réservations confirmées
     * et indisponibilités actives (RG-BOOK-07, 08, 09). Les périodes qui dépassent la journée sont tronquées.
     * Aucune donnée personnelle n'est exposée (pas de nom d'étudiant ni de motif de réservation).
     */
    @Transactional(readOnly = true)
    public List<OccupationDto> occupations(Long salleId, LocalDate date) {
        LocalDateTime debutJour = date.atStartOfDay();
        LocalDateTime finJour = date.plusDays(1).atStartOfDay();

        List<OccupationDto> resultat = new java.util.ArrayList<>();

        cours.findBySalleIdAndDateOrderByHeureDebutAsc(salleId, date).forEach(c ->
                resultat.add(new OccupationDto("COURS", date, c.getHeureDebut(), c.getHeureFin(),
                        c.getMatiere() + " · " + c.getGroupe())));

        reservations.findBySalleIdAndStatutAndDateDebutLessThanAndDateFinGreaterThanOrderByDateDebutAsc(
                salleId, StatutReservation.CONFIRMEE, finJour, debutJour).forEach(r ->
                resultat.add(tronquer("RESERVATION", date, r.getDateDebut(), r.getDateFin(), "Réservée")));

        indisponibilites.findBySalleIdAndActiveTrueAndDateDebutLessThanAndDateFinGreaterThanOrderByDateDebutAsc(
                salleId, finJour, debutJour).forEach(i ->
                resultat.add(tronquer("INDISPONIBILITE", date, i.getDateDebut(), i.getDateFin(), i.getMotif())));

        resultat.sort(Comparator.comparing(OccupationDto::heureDebut).thenComparing(OccupationDto::heureFin));
        return resultat;
    }

    private OccupationDto tronquer(String type, LocalDate jour, LocalDateTime debut, LocalDateTime fin, String libelle) {
        LocalDateTime debutJour = jour.atStartOfDay();
        LocalDateTime finJour = jour.plusDays(1).atStartOfDay();
        LocalTime heureDebut = debut.isBefore(debutJour) ? LocalTime.MIDNIGHT : debut.toLocalTime();
        LocalTime heureFin = fin.isBefore(finJour) ? fin.toLocalTime() : LocalTime.of(23, 59);
        return new OccupationDto(type, jour, heureDebut, heureFin, libelle);
    }
    
}