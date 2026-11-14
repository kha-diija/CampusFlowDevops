// IndisponibiliteSalleRepository.java
package com.example.campusflow.repository;

import com.example.campusflow.entity.IndisponibiliteSalle;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IndisponibiliteSalleRepository extends JpaRepository<IndisponibiliteSalle, Long> {

    boolean existsBySalleIdAndActiveTrueAndDateDebutLessThanAndDateFinGreaterThan(
            Long salleId, LocalDateTime fin, LocalDateTime debut);

    @Query("select i from IndisponibiliteSalle i join fetch i.salle join fetch i.createur "
            + "order by i.dateDebut desc")
    List<IndisponibiliteSalle> findAllDetailed();

    @Query("select i from IndisponibiliteSalle i join fetch i.salle join fetch i.createur "
            + "where i.id = :id")
    Optional<IndisponibiliteSalle> findDetailedById(@Param("id") Long id);

    long countByActiveTrueAndDateFinAfter(LocalDateTime maintenant);

    boolean existsBySignalementIdAndActiveTrueAndDateFinAfter(Long signalementId, LocalDateTime maintenant);

    @Query("select i.signalement.id from IndisponibiliteSalle i "
            + "where i.active = true and i.dateFin > :maintenant and i.signalement is not null")
    List<Long> findSignalementIdsAvecIndisponibiliteActive(@Param("maintenant") LocalDateTime maintenant);
}
