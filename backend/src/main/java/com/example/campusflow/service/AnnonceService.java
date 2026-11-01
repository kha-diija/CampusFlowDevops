// service/AnnonceService.java
package com.example.campusflow.service;

import com.example.campusflow.dto.AnnonceDto;
import com.example.campusflow.entity.Annonce;
import com.example.campusflow.entity.Utilisateur;
import com.example.campusflow.enums.StatutAnnonce;
import com.example.campusflow.repository.AnnonceRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepository;

    @Transactional(readOnly = true)
    public List<AnnonceDto> listerPubliees(String q) { // RG-NEWS-01 : lecture seule, publiées uniquement
        String needle = q == null ? "" : q.trim().toLowerCase();
        return annonceRepository.findPubliees(StatutAnnonce.PUBLIEE).stream()
                .filter(a -> needle.isEmpty()
                        || a.getTitre().toLowerCase().contains(needle)
                        || a.getContenu().toLowerCase().contains(needle))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnnonceDto detail(Long id) {
        return annonceRepository.findByIdAndStatut(id, StatutAnnonce.PUBLIEE)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable."));
    }

    private AnnonceDto toDto(Annonce a) {
        Utilisateur u = a.getAuteur();
        return new AnnonceDto(a.getId(), a.getTitre(), a.getContenu(), a.getDatePublication(),
                u.getPrenom() + " " + u.getNom());
    }
}