// service/DashboardService.java
package com.example.campusflow.service;

import com.example.campusflow.dto.AnnonceDto;
import com.example.campusflow.dto.DashboardDto;
import com.example.campusflow.dto.ReservationDto;
import com.example.campusflow.entity.Utilisateur;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ReservationService reservationService;
    private final AnnonceService annonceService;

    @Transactional(readOnly = true)
    public DashboardDto etudiant(Utilisateur user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime finSemaine = now.toLocalDate().with(DayOfWeek.SUNDAY).atTime(23, 59, 59);

        List<ReservationDto> aVenir = reservationService.mesReservations(user).stream()
                .filter(r -> !"ANNULEE".equals(r.statut())
                        && !"REFUSEE".equals(r.statut())
                        && r.date().atTime(r.heureDebut()).isAfter(now))
                .sorted(Comparator.comparing(r -> r.date().atTime(r.heureDebut())))
                .toList();

        long semaine = aVenir.stream()
                .filter(r -> r.date().atTime(r.heureDebut()).isBefore(finSemaine))
                .count();

        List<AnnonceDto> annonces = annonceService.listerPubliees(null);
        long nouvelles = annonces.stream()
                .filter(a -> a.datePublication() != null && a.datePublication().isAfter(now.minusDays(7)))
                .count();

        return new DashboardDto(aVenir.size(), semaine, nouvelles,
                aVenir.stream().limit(3).toList(), annonces.stream().limit(3).toList());
    }
}