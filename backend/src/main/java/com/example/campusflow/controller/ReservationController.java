// controller/ReservationController.java
package com.example.campusflow.controller;

import com.example.campusflow.dto.ReservationDto;
import com.example.campusflow.dto.ReservationRequest;
import com.example.campusflow.service.CurrentUserService;
import com.example.campusflow.service.ReservationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final CurrentUserService currentUser;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationDto creer(@Valid @RequestBody ReservationRequest req) {
        return reservationService.creer(req, currentUser.get());
    }

    @GetMapping("/mes")
    public List<ReservationDto> mesReservations() {
        return reservationService.mesReservations(currentUser.get());
    }

    @PatchMapping("/{id}/annuler")
    public ReservationDto annuler(@PathVariable Long id) {
        return reservationService.annuler(id, currentUser.get());
    }
}