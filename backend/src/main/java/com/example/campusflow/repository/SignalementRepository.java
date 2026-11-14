package com.example.campusflow.repository;

import com.example.campusflow.entity.Signalement;
import com.example.campusflow.enums.StatutSignalement;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {

    @Query("select s from Signalement s join fetch s.salle join fetch s.createur "
            + "left join fetch s.responsable order by s.dateCreation desc")
    List<Signalement> findAllDetailed();

    @Query("select s from Signalement s join fetch s.salle join fetch s.createur "
            + "left join fetch s.responsable where s.id = :id")
    Optional<Signalement> findDetailedById(@Param("id") Long id);

    @Query("select s from Signalement s join fetch s.salle join fetch s.createur "
            + "left join fetch s.responsable where s.statut in :statuts order by s.dateCreation desc")
    List<Signalement> findByStatuts(@Param("statuts") Collection<StatutSignalement> statuts);

    @Query("select s from Signalement s where s.statut = :statut and s.dateResolution is not null")
    List<Signalement> findResolus(@Param("statut") StatutSignalement statut);

    long countByStatut(StatutSignalement statut);

    long countByStatutAndDateCreationAfter(StatutSignalement statut, LocalDateTime depuis);
}
