package com.example.campusflow.controller;

import com.example.campusflow.dto.CommentaireRequest;
import com.example.campusflow.dto.SignalementDto;
import com.example.campusflow.dto.SignalementRequest;
import com.example.campusflow.dto.SignalementStatutRequest;
import com.example.campusflow.enums.StatutSignalement;
import com.example.campusflow.service.CurrentUserService;
import com.example.campusflow.service.SignalementService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** RG-SIG-01 / RG-SIG-04 / RG-SIG-09 : réservé au personnel habilité, contrôlé côté serveur. */
@RestController
@RequestMapping("/signalements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PERSONNEL_HABILITE')")
public class SignalementController {

    private final SignalementService service;
    private final CurrentUserService currentUser;

    @GetMapping
    public List<SignalementDto> lister(@RequestParam(required = false) StatutSignalement statut,
                                       @RequestParam(required = false) Long salleId,
                                       @RequestParam(required = false) String q) {
        return service.lister(statut, salleId, q);
    }

    @GetMapping("/{id}")
    public SignalementDto detail(@PathVariable Long id) {
        return service.detail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SignalementDto creer(@Valid @RequestBody SignalementRequest req) {
        return service.creer(req, currentUser.getPersonnel());
    }

    @PatchMapping("/{id}/statut")
    public SignalementDto changerStatut(@PathVariable Long id, @Valid @RequestBody SignalementStatutRequest req) {
        return service.changerStatut(id, req, currentUser.getPersonnel());
    }

    @PostMapping("/{id}/commentaires")
    @ResponseStatus(HttpStatus.CREATED)
    public SignalementDto commenter(@PathVariable Long id, @Valid @RequestBody CommentaireRequest req) {
        return service.commenter(id, req.texte(), currentUser.getPersonnel());
    }
}
