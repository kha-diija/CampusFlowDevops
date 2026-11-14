package com.example.campusflow.service;

import com.example.campusflow.dto.DashboardHabiliteDto;
import com.example.campusflow.entity.Signalement;
import com.example.campusflow.enums.StatutAnnonce;
import com.example.campusflow.enums.StatutSignalement;
import com.example.campusflow.repository.AnnonceRepository;
import com.example.campusflow.repository.IndisponibiliteSalleRepository;
import com.example.campusflow.repository.SignalementRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardHabiliteService {

    private final SignalementRepository signalements;
    private final AnnonceRepository annonces;
    private final IndisponibiliteSalleRepository indisponibilites;
    private final SignalementService signalementService;

    @Transactional(readOnly = true)
    public DashboardHabiliteDto get() {
        LocalDateTime now = LocalDateTime.now();

        List<Signalement> resolus = signalements.findResolus(StatutSignalement.RESOLU);
        Double tempsMoyen = resolus.isEmpty() ? null : arrondi(resolus.stream()
                .mapToDouble(s -> Duration.between(s.getDateCreation(), s.getDateResolution()).toMinutes() / 1440.0)
                .average().orElse(0));

        return new DashboardHabiliteDto(
                signalements.countByStatut(StatutSignalement.EN_ATTENTE),
                signalements.countByStatutAndDateCreationAfter(StatutSignalement.EN_ATTENTE, now.minusHours(24)),
                signalements.countByStatut(StatutSignalement.EN_COURS),
                tempsMoyen,
                annonces.countByStatut(StatutAnnonce.PUBLIEE),
                annonces.countByStatutAndDatePublicationGreaterThanEqual(
                        StatutAnnonce.PUBLIEE, now.toLocalDate().withDayOfMonth(1).atStartOfDay()),
                indisponibilites.countByActiveTrueAndDateFinAfter(now),
                signalementService.aTraiter(5));
    }

    private static double arrondi(double valeur) {
        return Math.round(valeur * 10.0) / 10.0;
    }
}
