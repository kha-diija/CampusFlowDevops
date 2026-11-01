// dto/DashboardDto.java
package com.example.campusflow.dto;

import java.util.List;

public record DashboardDto(long reservationsAVenir, long reservationsSemaine, long nouvellesAnnonces,
                           List<ReservationDto> prochainesReservations, List<AnnonceDto> alaUne) {}