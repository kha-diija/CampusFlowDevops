// controller/DashboardController.java
package com.example.campusflow.controller;

import com.example.campusflow.dto.DashboardDto;
import com.example.campusflow.dto.DashboardHabiliteDto;
import com.example.campusflow.service.CurrentUserService;
import com.example.campusflow.service.DashboardHabiliteService;
import com.example.campusflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final DashboardHabiliteService dashboardHabiliteService;
    private final CurrentUserService currentUser;

    @GetMapping("/etudiant")
    public DashboardDto etudiant() {
        return dashboardService.etudiant(currentUser.get());
    }

    @GetMapping("/personnel-habilite")
    @PreAuthorize("hasRole('PERSONNEL_HABILITE')")
    public DashboardHabiliteDto personnelHabilite() {
        return dashboardHabiliteService.get();
    }
}
