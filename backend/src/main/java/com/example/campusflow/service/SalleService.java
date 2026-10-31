// service/SalleService.java
package com.example.campusflow.service;

import com.example.campusflow.dto.SalleDto;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.repository.SalleRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SalleService {

    private final SalleRepository salleRepository;
    private final DisponibiliteService disponibiliteService;

    @Transactional(readOnly = true)
    public List<SalleDto> rechercher(String q, String batiment, Integer capaciteMin,
                                     LocalDate date, LocalTime debut, LocalTime fin, boolean seulementLibres) {
        boolean periode = date != null && debut != null && fin != null;
        if (periode && !fin.isAfter(debut)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L'heure de fin doit être postérieure à l'heure de début.");
        }
        String needle = q == null ? "" : q.trim().toLowerCase();

        return salleRepository.findAll().stream()
                .filter(s -> needle.isEmpty() || s.getNom().toLowerCase().contains(needle))
                .filter(s -> batiment == null || batiment.isBlank() || s.getBatiment().equalsIgnoreCase(batiment))
                .filter(s -> capaciteMin == null || s.getCapacite() >= capaciteMin)
                .map(s -> toDto(s, periode
                        ? disponibiliteService.motifOccupation(s.getId(), date, debut, fin).isEmpty()
                        : null))
                .filter(dto -> !seulementLibres || Boolean.TRUE.equals(dto.disponible()))
                .sorted(Comparator.comparing(SalleDto::batiment).thenComparing(SalleDto::nom))
                .toList();
    }

    @Transactional(readOnly = true)
    public SalleDto trouver(Long id) {
        return salleRepository.findById(id)
                .map(s -> toDto(s, null))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable."));
    }

    private SalleDto toDto(Salle s, Boolean disponible) {
        return new SalleDto(s.getId(), s.getNom(), s.getBatiment(), s.getCapacite(),
                s.getType() == null ? null : s.getType().name(), s.getEquipements(), disponible);
    }
}