package com.example.campusflow.service;

import com.example.campusflow.dto.CommentaireDto;
import com.example.campusflow.dto.SignalementDto;
import com.example.campusflow.dto.SignalementRequest;
import com.example.campusflow.dto.SignalementStatutRequest;
import com.example.campusflow.entity.CommentaireSignalement;
import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.entity.Signalement;
import com.example.campusflow.enums.StatutSignalement;
import com.example.campusflow.repository.CommentaireSignalementRepository;
import com.example.campusflow.repository.IndisponibiliteSalleRepository;
import com.example.campusflow.repository.SalleRepository;
import com.example.campusflow.repository.SignalementRepository;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Suivi administratif des signalements (RG-SIG-01 à RG-SIG-09). */
@Service
@RequiredArgsConstructor
public class SignalementService {

    private final SignalementRepository signalements;
    private final CommentaireSignalementRepository commentaires;
    private final SalleRepository salles;
    private final IndisponibiliteSalleRepository indisponibilites;

    @Transactional(readOnly = true)
    public List<SignalementDto> lister(StatutSignalement statut, Long salleId, String q) {
        String needle = q == null ? "" : q.trim().toLowerCase();
        Set<Long> avecIndisponibilite = idsAvecIndisponibiliteActive();
        return signalements.findAllDetailed().stream()
                .filter(s -> statut == null || s.getStatut() == statut)
                .filter(s -> salleId == null || s.getSalle().getId().equals(salleId))
                .filter(s -> needle.isEmpty()
                        || s.getDescription().toLowerCase().contains(needle)
                        || s.getSalle().getNom().toLowerCase().contains(needle))
                .map(s -> toDto(s, avecIndisponibilite.contains(s.getId()), List.of()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SignalementDto> aTraiter(int limite) {
        Set<Long> avecIndisponibilite = idsAvecIndisponibiliteActive();
        return signalements.findByStatuts(List.of(StatutSignalement.EN_ATTENTE, StatutSignalement.EN_COURS))
                .stream()
                .limit(limite)
                .map(s -> toDto(s, avecIndisponibilite.contains(s.getId()), List.of()))
                .toList();
    }

    @Transactional(readOnly = true)
    public SignalementDto detail(Long id) {
        return versDetail(trouver(id));
    }

    @Transactional
    public SignalementDto creer(SignalementRequest req, Personnel createur) {
        Salle salle = salles.findById(req.salleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable."));
        Signalement s = new Signalement();
        s.setSalle(salle);
        s.setCreateur(createur);
        s.setType(req.type());
        s.setDescription(req.description().trim());
        s.setStatut(StatutSignalement.EN_ATTENTE); // RG-SIG-03
        return versDetail(signalements.saveAndFlush(s));
    }

    @Transactional
    public SignalementDto changerStatut(Long id, SignalementStatutRequest req, Personnel auteur) {
        Signalement s = trouver(id);
        StatutSignalement cible = req.statut();

        if (s.getStatut() == StatutSignalement.RESOLU || s.getStatut() == StatutSignalement.REJETE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce signalement est déjà clôturé.");
        }
        if (cible == s.getStatut()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le signalement a déjà ce statut.");
        }
        if (cible == StatutSignalement.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Un signalement pris en charge ne peut pas revenir en attente.");
        }

        String commentaire = nettoyer(req.commentaire());
        String motif = nettoyer(req.motifRejet());
        if (cible == StatutSignalement.REJETE && motif == null) { // RG-SIG-05
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Un motif est obligatoire pour rejeter un signalement.");
        }

        s.setStatut(cible);
        if (s.getResponsable() == null) {
            s.setResponsable(auteur);
        }
        if (cible == StatutSignalement.RESOLU) {
            s.setDateResolution(LocalDateTime.now());
        }
        if (cible == StatutSignalement.REJETE) {
            s.setMotifRejet(motif);
        }
        if (commentaire != null) { // RG-SIG-06
            ajouterCommentaire(s, commentaire, auteur);
        }
        // RG-SIG-08 : aucun changement automatique sur les indisponibilités de salle.
        return versDetail(signalements.saveAndFlush(s));
    }

    @Transactional
    public SignalementDto commenter(Long id, String texte, Personnel auteur) {
        Signalement s = trouver(id);
        ajouterCommentaire(s, texte.trim(), auteur);
        return versDetail(signalements.saveAndFlush(s));
    }

    private void ajouterCommentaire(Signalement s, String texte, Personnel auteur) {
        CommentaireSignalement c = new CommentaireSignalement();
        c.setSignalement(s);
        c.setAuteur(auteur);
        c.setTexte(texte);
        commentaires.saveAndFlush(c);
        s.setCommentaireTraitement(texte);
    }

    private Signalement trouver(Long id) {
        return signalements.findDetailedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Signalement introuvable."));
    }

    private Set<Long> idsAvecIndisponibiliteActive() {
        return new HashSet<>(indisponibilites.findSignalementIdsAvecIndisponibiliteActive(LocalDateTime.now()));
    }

    private SignalementDto versDetail(Signalement s) {
        boolean indisponible = indisponibilites
                .existsBySignalementIdAndActiveTrueAndDateFinAfter(s.getId(), LocalDateTime.now());
        List<CommentaireDto> historique = commentaires.findBySignalementId(s.getId()).stream()
                .map(c -> new CommentaireDto(c.getId(), c.getTexte(),
                        c.getAuteur().getPrenom() + " " + c.getAuteur().getNom(), c.getDateCreation()))
                .toList();
        return toDto(s, indisponible, historique);
    }

    private SignalementDto toDto(Signalement s, boolean indisponibiliteActive, List<CommentaireDto> historique) {
        Personnel createur = s.getCreateur();
        Personnel responsable = s.getResponsable();
        return new SignalementDto(
                s.getId(), s.getSalle().getId(), s.getSalle().getNom(), s.getSalle().getBatiment(),
                s.getType().name(), s.getDescription(), s.getStatut().name(), s.getDateCreation(),
                createur.getPrenom() + " " + createur.getNom(),
                responsable == null ? null : responsable.getPrenom() + " " + responsable.getNom(),
                s.getCommentaireTraitement(), s.getMotifRejet(), s.getDateResolution(),
                indisponibiliteActive, historique);
    }

    private static String nettoyer(String valeur) {
        if (valeur == null) {
            return null;
        }
        String trimmed = valeur.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
