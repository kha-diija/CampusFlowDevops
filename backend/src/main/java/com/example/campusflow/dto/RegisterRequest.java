package com.example.campusflow.dto;

import com.example.campusflow.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire.")
    private String prenom;

    @NotBlank(message = "L'e-mail est obligatoire.")
    @Email(message = "Veuillez saisir une adresse e-mail valide.")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères.")
    private String password;

    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Le numéro étudiant est invalide.")
    private String numeroEtudiant;

    @NotBlank(message = "La filière est obligatoire.")
    private String filiere;

    private Role role = Role.ETUDIANT;
}
