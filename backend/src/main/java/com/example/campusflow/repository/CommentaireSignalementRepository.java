package com.example.campusflow.repository;

import com.example.campusflow.entity.CommentaireSignalement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentaireSignalementRepository extends JpaRepository<CommentaireSignalement, Long> {

    @Query("select c from CommentaireSignalement c join fetch c.auteur "
            + "where c.signalement.id = :id order by c.dateCreation asc, c.id asc")
    List<CommentaireSignalement> findBySignalementId(@Param("id") Long id);
}
