package com.example.campusflow.dto;

import java.util.List;

public record DashboardPersonnelDto(long totalSalles, long sallesLibres, long sallesOccupees,
                                    long coursAujourdhui, long nouvellesAnnonces, List<AnnonceDto> alaUne) {}