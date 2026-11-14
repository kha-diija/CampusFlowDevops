package com.example.campusflow.service;

import com.example.campusflow.dto.IndisponibiliteDto;
import com.example.campusflow.dto.IndisponibiliteRequest;
import com.example.campusflow.entity.IndisponibiliteSalle;
import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.entity.Signalement;
import com.example.campusflow.enums.StatutReservation;
import com.example.campusflow.repository.IndisponibiliteSalleRepository;
import com.example.campusflow.repository.ReservationRepository;
import com.example.campusflow.repository.SalleRepository;
import com.example.campusflow.repository.SignalementRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Déclaration et levée des indisponibilités de salles (RG-SIG-07, RG-SIG-08, RG-BOOK-09). */
@Service
@RequiredArgsConstructor
public class IndisponibiliteService {

    private final IndisponibiliteSalleRepository indisponibilites;
    private final SalleRepository salles;
    private final SignalementRepository signalements;
    private final ReservationRepository reservations;

    @Transactional(readOnly = true)
    public List<IndisponibiliteDto> lister(boolean seulementActives) {
        LocalDateTime now = LocalDateTime.now();
        return indisponibilites.findAllDetailed().stream()
                .filter(i -> !seulementActives || (Boolean.TRUE.equals(i.getActive()) && i.getDateFin().isAfter(now)))
                .map(i -> toDto(i, now))
                .toList();
    }

    @Transactional
    public IndisponibiliteDto creer(IndisponibiliteRequest req, Personnel createur) {
        LocalDateTime now = LocalDateTime.now();
        if (!req.dateFin().isAfter(req.dateDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin doit être postérieure à la date de début.");
        }
        if (!req.dateFin().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La période d'indisponibilité doit se terminer dans le futur.");
        }

        // Même verrou que les réservations : sérialise les opérations concurrentes sur une salle.
        Salle salle = salles.findByIdForUpdate(req.salleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable."));

        Signalement signalement = null;
        if (req.signalementId() != null) {
            signalement = signalements.findById(req.signalementId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Signalement introuvable."));
            if (!signalement.getSalle().getId().equals(salle.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Le signalement ne concerne pas cette salle.");
            }
        }

        if (indisponibilites.existsBySalleIdAndActiveTrueAndDateDebutLessThanAndDateFinGreaterThan(
                salle.getId(), req.dateFin(), req.dateDebut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une indisponibilité est déjà active sur cette période pour cette salle.");
        }

        IndisponibiliteSalle i = new IndisponibiliteSalle();
        i.setSalle(salle);
        i.setCreateur(createur);
        i.setSignalement(signalement);
        i.setDateDebut(req.dateDebut());
        i.setDateFin(req.dateFin());
        i.setMotif(req.motif().trim());
        i.setActive(true);
        return toDto(indisponibilites.saveAndFlush(i), now);
    }

    @Transactional
    public IndisponibiliteDto lever(Long id) {
        IndisponibiliteSalle i = indisponibilites.findDetailedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Indisponibilité introuvable."));
        if (!Boolean.TRUE.equals(i.getActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette indisponibilité est déjà levée.");
        }
        i.setActive(false);
        return toDto(indisponibilites.saveAndFlush(i), LocalDateTime.now());
    }

    private IndisponibiliteDto toDto(IndisponibiliteSalle i, LocalDateTime now) {
        boolean active = Boolean.TRUE.equals(i.getActive());
        String statut;
        if (!active) {
            statut = "LEVEE";
        } else if (i.getDateFin().isBefore(now)) {
            statut = "TERMINEE";
        } else if (i.getDateDebut().isAfter(now)) {
            statut = "A_VENIR";
        } else {
            statut = "EN_COURS";
        }
        long conflits = active && i.getDateFin().isAfter(now)
                ? reservations.countBySalleIdAndStatutAndDateDebutLessThanAndDateFinGreaterThan(
                        i.getSalle().getId(), StatutReservation.CONFIRMEE, i.getDateFin(), i.getDateDebut())
                : 0;
        Personnel c = i.getCreateur();
        return new IndisponibiliteDto(i.getId(), i.getSalle().getId(), i.getSalle().getNom(),
                i.getSalle().getBatiment(), i.getDateDebut(), i.getDateFin(), i.getMotif(), active, statut,
                i.getSignalement() == null ? null : i.getSignalement().getId(),
                c.getPrenom() + " " + c.getNom(), conflits);
    }
}
