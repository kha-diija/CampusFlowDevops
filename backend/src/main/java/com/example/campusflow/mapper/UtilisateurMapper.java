package com.example.campusflow.mapper;

import com.example.campusflow.dto.UserResponse;
import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Utilisateur;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurMapper {

    public UserResponse toResponse(Utilisateur utilisateur) {
        UserResponse response = new UserResponse();
        response.setId(utilisateur.getId());
        response.setNom(utilisateur.getNom());
        response.setPrenom(utilisateur.getPrenom());
        response.setEmail(utilisateur.getEmail());
        response.setRole(utilisateur.getRole());
        response.setActif(utilisateur.getActif());
        response.setDateCreation(utilisateur.getDateCreation());

        if (utilisateur instanceof Personnel personnel) {
            response.setAutorisePublication(personnel.isAutorisePublication());
        }

        return response;
    }
}
