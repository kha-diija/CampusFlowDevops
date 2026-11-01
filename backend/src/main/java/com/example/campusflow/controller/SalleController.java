// controller/SalleController.java
package com.example.campusflow.controller;

import com.example.campusflow.dto.SalleDto;
import com.example.campusflow.service.SalleService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/salles")
@RequiredArgsConstructor
public class SalleController {

    private final SalleService salleService;

    @GetMapping
    public List<SalleDto> lister(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String batiment,
            @RequestParam(required = false) Integer capaciteMin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime debut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime fin,
            @RequestParam(defaultValue = "false") boolean seulementLibres) {
        return salleService.rechercher(q, batiment, capaciteMin, date, debut, fin, seulementLibres);
    }

    @GetMapping("/{id}")
    public SalleDto detail(@PathVariable Long id) {
        return salleService.trouver(id);
    }
}