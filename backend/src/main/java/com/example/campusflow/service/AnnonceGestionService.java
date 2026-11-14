package com.example.campusflow.service;

import com.example.campusflow.dto.AnnonceGestionDto;
import com.example.campusflow.dto.AnnonceRequest;
import com.example.campusflow.entity.Annonce;
import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Utilisateur;
import com.example.campusflow.enums.StatutAnnonce;
import com.example.campusflow.repository.AnnonceRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Gestion des annonces par le personnel habilité (RG-NEWS-02, RG-NEWS-03). */
@Service
@RequiredArgsConstructor
public class AnnonceGestionService {

    private final AnnonceRepository annonceRepository;

    @Transactional(readOnly = true)
    public List<AnnonceGestionDto> lister(String q, StatutAnnonce statut) {
        String needle = q == null ? "" : q.trim().toLowerCase();
        return annonceRepository.findAllDetailed().stream()
                .filter(a -> statut == null || a.getStatut() == statut)
                .filter(a -> needle.isEmpty()
                        || a.getTitre().toLowerCase().contains(needle)
                        || a.getContenu().toLowerCase().contains(needle))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AnnonceGestionDto creer(AnnonceRequest req, Personnel auteur) {
        Annonce annonce = new Annonce();
        annonce.setAuteur(auteur);
        appliquer(annonce, req);
        return toDto(annonceRepository.saveAndFlush(annonce));
    }

    @Transactional
    public AnnonceGestionDto modifier(Long id, AnnonceRequest req) {
        Annonce annonce = trouver(id);
        appliquer(annonce, req);
        return toDto(annonceRepository.saveAndFlush(annonce));
    }

    @Transactional
    public AnnonceGestionDto changerStatut(Long id, StatutAnnonce statut) {
        Annonce annonce = trouver(id);
        annonce.setStatut(statut);
        if (statut == StatutAnnonce.PUBLIEE && annonce.getDatePublication() == null) {
            annonce.setDatePublication(LocalDateTime.now());
        }
        return toDto(annonceRepository.saveAndFlush(annonce));
    }

    private Annonce trouver(Long id) {
        return annonceRepository.findDetailedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable."));
    }

    private void appliquer(Annonce annonce, AnnonceRequest req) {
        LocalDateTime now = LocalDateTime.now();
        if (req.statut() == StatutAnnonce.PUBLIEE && req.datePublication() != null
                && req.datePublication().isAfter(now.plusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de publication ne peut pas être dans le futur.");
        }
        annonce.setTitre(req.titre().trim());
        annonce.setContenu(req.contenu().trim());
        annonce.setStatut(req.statut());
        if (req.datePublication() != null) {
            annonce.setDatePublication(req.datePublication());
        }
        if (req.statut() == StatutAnnonce.PUBLIEE && annonce.getDatePublication() == null) {
            annonce.setDatePublication(now);
        }
    }

    private AnnonceGestionDto toDto(Annonce a) {
        Utilisateur u = a.getAuteur();
        return new AnnonceGestionDto(a.getId(), a.getTitre(), a.getContenu(), a.getStatut().name(),
                a.getDatePublication(), a.getDateModification(), u.getPrenom() + " " + u.getNom());
    }
}
