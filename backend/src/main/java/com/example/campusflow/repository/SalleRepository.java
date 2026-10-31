// SalleRepository.java (ajoute seulement la méthode findByIdForUpdate)
package com.example.campusflow.repository;

import com.example.campusflow.entity.Salle;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalleRepository extends JpaRepository<Salle, Long> {

    Optional<Salle> findByNom(String nom);

    // Verrou pessimiste : sérialise les réservations simultanées sur une même salle
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Salle s where s.id = :id")
    Optional<Salle> findByIdForUpdate(@Param("id") Long id);
}