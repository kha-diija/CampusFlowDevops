package com.example.campusflow.config;

import com.example.campusflow.entity.Etudiant;
import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.enums.Role;
import com.example.campusflow.enums.TypeSalle;
import com.example.campusflow.repository.SalleRepository;
import com.example.campusflow.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final SalleRepository salleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
        UtilisateurRepository utilisateurRepository,
        SalleRepository salleRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.salleRepository = salleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createEtudiant();
        createPersonnel();
        createSalles();
    }

    private void createEtudiant() {
        if (utilisateurRepository.existsByEmail("etudiant@campusflow.ma")) {
            return;
        }

        Etudiant etudiant = new Etudiant();
        etudiant.setNom("Karim");
        etudiant.setPrenom("Nassim");
        etudiant.setEmail("etudiant@campusflow.ma");
        etudiant.setMotDePasse(passwordEncoder.encode("Etudiant@123"));
        etudiant.setNumeroEtudiant("CNE-2024-001");
        etudiant.setFiliere("Informatique");
        etudiant.setRole(Role.ETUDIANT);
        etudiant.setActif(true);
        utilisateurRepository.save(etudiant);
    }

    private void createPersonnel() {
        if (utilisateurRepository.existsByEmail("personnel@campusflow.ma")) {
            return;
        }

        Personnel personnel = new Personnel();
        personnel.setNom("Benali");
        personnel.setPrenom("Amine");
        personnel.setEmail("personnel@campusflow.ma");
        personnel.setMotDePasse(passwordEncoder.encode("Personnel@123"));
        personnel.setDepartement("Informatique");
        personnel.setMatricule("MAT-2024-001");
        personnel.setAutorisePublication(true);
        personnel.setRole(Role.PERSONNEL_HABILITE);
        personnel.setActif(true);
        utilisateurRepository.save(personnel);
    }

    private void createSalles() {
        createSalleIfAbsent("Amphi A", "A", 180, TypeSalle.AMPHITHEATRE, "Projecteur, tableau interactif");
        createSalleIfAbsent("Salle 101", "B", 40, TypeSalle.SALLE_COURS, "Ordinateurs, vidéoprojecteur");
        createSalleIfAbsent("Laboratoire TP", "C", 20, TypeSalle.SALLE_TP, "Postes de travail, imprimante");
    }

    private void createSalleIfAbsent(String nom, String batiment, int capacite, TypeSalle type, String equipements) {
        if (salleRepository.findByNom(nom).isPresent()) {
            return;
        }

        Salle salle = new Salle();
        salle.setNom(nom);
        salle.setBatiment(batiment);
        salle.setCapacite(capacite);
        salle.setType(type);
        salle.setEquipements(equipements);
        salleRepository.save(salle);
    }
}
