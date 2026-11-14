package com.example.campusflow.controller;

import com.example.campusflow.dto.AnnonceGestionDto;
import com.example.campusflow.dto.AnnonceRequest;
import com.example.campusflow.dto.AnnonceStatutRequest;
import com.example.campusflow.enums.StatutAnnonce;
import com.example.campusflow.service.AnnonceGestionService;
import com.example.campusflow.service.CurrentUserService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** RG-NEWS-02 / RG-NEWS-04 : réservé au personnel habilité, contrôlé côté serveur. */
@RestController
@RequestMapping("/gestion/annonces")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PERSONNEL_HABILITE')")
public class AnnonceGestionController {

    private final AnnonceGestionService service;
    private final CurrentUserService currentUser;

    @GetMapping
    public List<AnnonceGestionDto> lister(@RequestParam(required = false) String q,
                                          @RequestParam(required = false) StatutAnnonce statut) {
        return service.lister(q, statut);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnnonceGestionDto creer(@Valid @RequestBody AnnonceRequest req) {
        return service.creer(req, currentUser.getPersonnel());
    }

    @PutMapping("/{id}")
    public AnnonceGestionDto modifier(@PathVariable Long id, @Valid @RequestBody AnnonceRequest req) {
        return service.modifier(id, req);
    }

    @PatchMapping("/{id}/statut")
    public AnnonceGestionDto changerStatut(@PathVariable Long id, @Valid @RequestBody AnnonceStatutRequest req) {
        return service.changerStatut(id, req.statut());
    }
}
