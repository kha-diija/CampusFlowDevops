// service/ReservationService.java
package com.example.campusflow.service;

import com.example.campusflow.dto.ReservationDto;
import com.example.campusflow.dto.ReservationRequest;
import com.example.campusflow.entity.Reservation;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.entity.Utilisateur;
import com.example.campusflow.enums.Role;
import com.example.campusflow.enums.StatutReservation;
import com.example.campusflow.repository.ReservationRepository;
import com.example.campusflow.repository.SalleRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final SalleRepository salleRepository;
    private final DisponibiliteService disponibiliteService;

    @Transactional
    public ReservationDto creer(ReservationRequest req, Utilisateur user) {
        if (user.getRole() != Role.ETUDIANT) { // RG-BOOK-01
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seuls les étudiants peuvent réserver une salle.");
        }
        if (!req.heureFin().isAfter(req.heureDebut())) { // RG-BOOK-05
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L'heure de fin doit être postérieure à l'heure de début.");
        }
        LocalDateTime debut = req.date().atTime(req.heureDebut());
        LocalDateTime fin = req.date().atTime(req.heureFin());
        if (debut.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Impossible de réserver dans le passé.");
        }

        // Verrou sur la salle : deux demandes simultanées sont traitées l'une après l'autre
        Salle salle = salleRepository.findByIdForUpdate(req.salleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable."));

        // RG-BOOK-06 à 09
        disponibiliteService.motifOccupation(salle.getId(), req.date(), req.heureDebut(), req.heureFin())
                .ifPresent(motif -> { throw new ResponseStatusException(HttpStatus.CONFLICT, motif); });

        Reservation r = new Reservation();
        r.setSalle(salle);
        r.setUtilisateur(user);
        r.setDateDebut(debut);
        r.setDateFin(fin);
        r.setMotif(req.motif().trim());
        r.setStatut(StatutReservation.CONFIRMEE);
        return toDto(reservationRepository.save(r));
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> mesReservations(Utilisateur user) { // RG-BOOK-02
        return reservationRepository.findByUtilisateurId(user.getId()).stream().map(this::toDto).toList();
    }

    @Transactional
    public ReservationDto annuler(Long id, Utilisateur user) { // RG-BOOK-03
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable."));
        if (!r.getUtilisateur().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous ne pouvez annuler que vos propres réservations.");
        }
        if (r.getStatut() == StatutReservation.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation est déjà annulée.");
        }
        if (r.getStatut() == StatutReservation.REFUSEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation a été refusée.");
        }
        if (r.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Une réservation commencée ou passée ne peut plus être annulée.");
        }
        r.setStatut(StatutReservation.ANNULEE);
        return toDto(r);
    }

    private ReservationDto toDto(Reservation r) {
        Salle s = r.getSalle();
        return new ReservationDto(
                r.getId(),
                "RES-" + r.getDateDebut().getYear() + "-" + String.format("%03d", r.getId()),
                s.getId(), s.getNom(), s.getBatiment(),
                r.getDateDebut().toLocalDate(), r.getDateDebut().toLocalTime(), r.getDateFin().toLocalTime(),
                r.getMotif(), r.getStatut().name());
    }
}