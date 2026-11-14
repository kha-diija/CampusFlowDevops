package com.example.campusflow.controller;

import com.example.campusflow.dto.IndisponibiliteDto;
import com.example.campusflow.dto.IndisponibiliteRequest;
import com.example.campusflow.service.CurrentUserService;
import com.example.campusflow.service.IndisponibiliteService;
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

@RestController
@RequestMapping("/indisponibilites")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PERSONNEL_HABILITE')")
public class IndisponibiliteController {

    private final IndisponibiliteService service;
    private final CurrentUserService currentUser;

    @GetMapping
    public List<IndisponibiliteDto> lister(@RequestParam(defaultValue = "false") boolean seulementActives) {
        return service.lister(seulementActives);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IndisponibiliteDto creer(@Valid @RequestBody IndisponibiliteRequest req) {
        return service.creer(req, currentUser.getPersonnel());
    }

    @PatchMapping("/{id}/lever")
    public IndisponibiliteDto lever(@PathVariable Long id) {
        return service.lever(id);
    }
}
