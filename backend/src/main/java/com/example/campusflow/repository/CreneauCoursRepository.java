// CreneauCoursRepository.java
package com.example.campusflow.repository;

import com.example.campusflow.entity.CreneauCours;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CreneauCoursRepository extends JpaRepository<CreneauCours, Long> {

    boolean existsBySalleIdAndDateAndHeureDebutLessThanAndHeureFinGreaterThan(
            Long salleId, LocalDate date, LocalTime fin, LocalTime debut);

    List<CreneauCours> findBySalleIdAndDateOrderByHeureDebutAsc(Long salleId, LocalDate date);
            long countByDate(LocalDate date);
}