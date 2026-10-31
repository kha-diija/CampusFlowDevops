// controller/DashboardController.java
package com.example.campusflow.controller;

import com.example.campusflow.dto.DashboardDto;
import com.example.campusflow.service.CurrentUserService;
import com.example.campusflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUser;

    @GetMapping("/etudiant")
    public DashboardDto etudiant() {
        return dashboardService.etudiant(currentUser.get());
    }
}