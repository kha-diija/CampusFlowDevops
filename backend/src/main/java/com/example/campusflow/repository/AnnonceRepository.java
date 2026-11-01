// AnnonceRepository.java
package com.example.campusflow.repository;

import com.example.campusflow.entity.Annonce;
import com.example.campusflow.enums.StatutAnnonce;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    @Query("select a from Annonce a join fetch a.auteur where a.statut = :statut "
            + "order by a.datePublication desc")
    List<Annonce> findPubliees(StatutAnnonce statut);

    @Query("select a from Annonce a join fetch a.auteur where a.id = :id and a.statut = :statut")
    Optional<Annonce> findByIdAndStatut(Long id, StatutAnnonce statut);
}