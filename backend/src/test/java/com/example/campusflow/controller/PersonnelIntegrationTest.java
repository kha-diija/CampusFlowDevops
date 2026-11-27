package com.example.campusflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.campusflow.entity.CreneauCours;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.enums.TypeSalle;
import com.example.campusflow.repository.CreneauCoursRepository;
import com.example.campusflow.repository.SalleRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/** Tests du rôle PERSONNEL : consultation des salles, des occupations et du tableau de bord (lecture seule). */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PersonnelIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private SalleRepository salleRepository;
    @Autowired
    private CreneauCoursRepository creneauCoursRepository;

    private MockMvc mockMvc;
    private Salle salle;
    private final LocalDate jour = LocalDate.now().plusDays(1);

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        salle = new Salle();
        salle.setNom("Salle Test Personnel");
        salle.setBatiment("Y");
        salle.setCapacite(40);
        salle.setType(TypeSalle.SALLE_COURS);
        salle = salleRepository.save(salle);

        CreneauCours cours = new CreneauCours();
        cours.setDate(jour);
        cours.setHeureDebut(LocalTime.of(8, 0));
        cours.setHeureFin(LocalTime.of(10, 0));
        cours.setGroupe("GI5");
        cours.setMatiere("Java");
        cours.setSalle(salle);
        creneauCoursRepository.save(cours);
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_consulte_et_recherche_les_salles() throws Exception {
        mockMvc.perform(get("/salles").param("q", "Test Personnel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").value("Salle Test Personnel"))
                .andExpect(jsonPath("$[0].capacite").value(40));
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_consulte_les_creneaux_d_occupation() throws Exception {
        mockMvc.perform(get("/salles/" + salle.getId() + "/occupations").param("date", jour.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("COURS"))
                .andExpect(jsonPath("$[0].libelle").value("Java · GI5"));
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void occupations_d_une_salle_inconnue_renvoie_404() throws Exception {
        mockMvc.perform(get("/salles/999999/occupations")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_consulte_les_annonces_publiees() throws Exception {
        mockMvc.perform(get("/annonces")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_accede_a_son_tableau_de_bord() throws Exception {
        mockMvc.perform(get("/dashboard/personnel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSalles").isNumber())
                .andExpect(jsonPath("$.sallesLibres").isNumber());
    }

    @Test
    @WithMockUser(username = "etu@test.ma", roles = "ETUDIANT")
    void etudiant_ne_peut_pas_acceder_au_tableau_de_bord_personnel() throws Exception {
        mockMvc.perform(get("/dashboard/personnel")).andExpect(status().isForbidden());
    }

    // ---------- Fonctionnalités interdites au rôle PERSONNEL ----------

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_ne_peut_pas_gerer_les_annonces() throws Exception {
        mockMvc.perform(post("/gestion/annonces").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titre\":\"T\",\"contenu\":\"C\",\"statut\":\"PUBLIEE\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_ne_peut_pas_gerer_les_indisponibilites() throws Exception {
        mockMvc.perform(get("/indisponibilites")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_ne_peut_pas_consulter_les_signalements() throws Exception {
        mockMvc.perform(get("/signalements")).andExpect(status().isForbidden());
    }
}