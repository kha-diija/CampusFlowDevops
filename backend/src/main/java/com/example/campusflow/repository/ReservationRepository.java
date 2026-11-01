// ReservationRepository.java
package com.example.campusflow.repository;

import com.example.campusflow.entity.Reservation;
import com.example.campusflow.enums.StatutReservation;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Chevauchement : début existant < fin demandée ET fin existante > début demandé
    boolean existsBySalleIdAndStatutAndDateDebutLessThanAndDateFinGreaterThan(
            Long salleId, StatutReservation statut, LocalDateTime fin, LocalDateTime debut);

    @Query("select r from Reservation r join fetch r.salle "
            + "where r.utilisateur.id = :uid order by r.dateDebut desc")
    List<Reservation> findByUtilisateurId(@Param("uid") Long uid);
}