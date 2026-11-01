// IndisponibiliteSalleRepository.java
package com.example.campusflow.repository;

import com.example.campusflow.entity.IndisponibiliteSalle;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndisponibiliteSalleRepository extends JpaRepository<IndisponibiliteSalle, Long> {

    boolean existsBySalleIdAndActiveTrueAndDateDebutLessThanAndDateFinGreaterThan(
            Long salleId, LocalDateTime fin, LocalDateTime debut);
}