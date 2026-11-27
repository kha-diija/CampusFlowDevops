// service/DashboardPersonnelService.java
package com.example.campusflow.service;

import com.example.campusflow.dto.AnnonceDto;
import com.example.campusflow.dto.DashboardPersonnelDto;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.repository.CreneauCoursRepository;
import com.example.campusflow.repository.SalleRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Tableau de bord en lecture seule du rôle PERSONNEL. */
@Service
@RequiredArgsConstructor
public class DashboardPersonnelService {

    private final SalleRepository salleRepository;
    private final CreneauCoursRepository creneauCoursRepository;
    private final DisponibiliteService disponibiliteService;
    private final AnnonceService annonceService;

    @Transactional(readOnly = true)
    public DashboardPersonnelDto get() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate aujourdhui = now.toLocalDate();

        // Instant présent : minute courante (bornée pour rester dans la journée)
        LocalTime debut = now.toLocalTime().withSecond(0).withNano(0);
        if (debut.isAfter(LocalTime.of(23, 58))) {
            debut = LocalTime.of(23, 58);
        }
        LocalTime fin = debut.plusMinutes(1);

        List<Salle> salles = salleRepository.findAll();
        final LocalTime d = debut;
        long occupees = salles.stream()
                .filter(s -> disponibiliteService.motifOccupation(s.getId(), aujourdhui, d, fin).isPresent())
                .count();

        List<AnnonceDto> annonces = annonceService.listerPubliees(null);
        long nouvelles = annonces.stream()
                .filter(a -> a.datePublication() != null && a.datePublication().isAfter(now.minusDays(7)))
                .count();

        return new DashboardPersonnelDto(
                salles.size(),
                salles.size() - occupees,
                occupees,
                creneauCoursRepository.countByDate(aujourdhui),
                nouvelles,
                annonces.stream().limit(3).toList());
    }
}