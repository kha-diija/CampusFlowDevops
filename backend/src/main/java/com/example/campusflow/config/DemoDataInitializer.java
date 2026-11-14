package com.example.campusflow.config;

import com.example.campusflow.entity.Annonce;
import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.entity.Signalement;
import com.example.campusflow.enums.StatutAnnonce;
import com.example.campusflow.enums.StatutSignalement;
import com.example.campusflow.enums.TypeSignalement;
import com.example.campusflow.repository.AnnonceRepository;
import com.example.campusflow.repository.SalleRepository;
import com.example.campusflow.repository.SignalementRepository;
import com.example.campusflow.repository.UtilisateurRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Données de démonstration (profil dev) : annonces et signalements du personnel habilité. */
@Component
@Order(2)
@Profile("dev")
@RequiredArgsConstructor
public class DemoDataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final SalleRepository salleRepository;
    private final AnnonceRepository annonceRepository;
    private final SignalementRepository signalementRepository;

    @Override
    public void run(String... args) {
        Personnel habilite = utilisateurRepository.findByEmail("personnel@campusflow.ma")
                .filter(u -> u instanceof Personnel)
                .map(u -> (Personnel) u)
                .orElse(null);
        if (habilite == null) {
            return;
        }
        if (annonceRepository.count() == 0) {
            annonce(habilite, "Ouverture des inscriptions aux clubs",
                    "Les inscriptions aux clubs étudiants sont ouvertes jusqu'à la fin du mois.",
                    StatutAnnonce.PUBLIEE, LocalDateTime.now().minusDays(2));
            annonce(habilite, "Maintenance du réseau Wi-Fi",
                    "Une coupure du Wi-Fi est prévue samedi matin dans le bâtiment B.",
                    StatutAnnonce.PUBLIEE, LocalDateTime.now().minusHours(5));
            annonce(habilite, "Calendrier des examens (brouillon)",
                    "Le calendrier définitif sera publié après validation par la direction.",
                    StatutAnnonce.BROUILLON, null);
        }
        if (signalementRepository.count() == 0) {
            signalement(habilite, "Salle 101", TypeSignalement.EQUIPEMENT_DEFECTUEUX,
                    "Le vidéoprojecteur ne s'allume plus.", StatutSignalement.EN_ATTENTE,
                    LocalDateTime.now().minusHours(2));
            signalement(habilite, "Laboratoire TP", TypeSignalement.SALLE_INUTILISABLE,
                    "Fuite d'eau au plafond, la salle est inutilisable.", StatutSignalement.EN_COURS,
                    LocalDateTime.now().minusDays(1));
            signalement(habilite, "Amphi A", TypeSignalement.PROBLEME_DISPONIBILITE,
                    "La salle apparaît libre alors qu'un cours y est programmé.", StatutSignalement.EN_ATTENTE,
                    LocalDateTime.now().minusDays(3));
        }
    }

    private void annonce(Personnel auteur, String titre, String contenu, StatutAnnonce statut,
                         LocalDateTime datePublication) {
        Annonce a = new Annonce();
        a.setAuteur(auteur);
        a.setTitre(titre);
        a.setContenu(contenu);
        a.setStatut(statut);
        a.setDatePublication(datePublication);
        annonceRepository.save(a);
    }

    private void signalement(Personnel createur, String nomSalle, TypeSignalement type, String description,
                             StatutSignalement statut, LocalDateTime dateCreation) {
        Salle salle = salleRepository.findByNom(nomSalle).orElse(null);
        if (salle == null) {
            return;
        }
        Signalement s = new Signalement();
        s.setSalle(salle);
        s.setCreateur(createur);
        s.setType(type);
        s.setDescription(description);
        s.setStatut(statut);
        s.setDateCreation(dateCreation);
        if (statut == StatutSignalement.EN_COURS) {
            s.setResponsable(createur);
        }
        signalementRepository.save(s);
    }
}
