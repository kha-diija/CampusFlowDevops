// controller/AnnonceController.java
package com.example.campusflow.controller;

import com.example.campusflow.dto.AnnonceDto;
import com.example.campusflow.service.AnnonceService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService annonceService;

    @GetMapping
    public List<AnnonceDto> lister(@RequestParam(required = false) String q) {
        return annonceService.listerPubliees(q);
    }

    @GetMapping("/{id}")
    public AnnonceDto detail(@PathVariable Long id) {
        return annonceService.detail(id);
    }
}