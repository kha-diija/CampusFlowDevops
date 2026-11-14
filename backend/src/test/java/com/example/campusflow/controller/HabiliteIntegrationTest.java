package com.example.campusflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.campusflow.entity.Personnel;
import com.example.campusflow.entity.Salle;
import com.example.campusflow.enums.Role;
import com.example.campusflow.enums.TypeSalle;
import com.example.campusflow.repository.SalleRepository;
import com.example.campusflow.repository.UtilisateurRepository;
import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/** Tests des permissions et des règles métier du personnel habilité (annonces, signalements, indisponibilités). */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class HabiliteIntegrationTest {

    private static final String HABILITE = "habilite@test.ma";

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private SalleRepository salleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private Salle salle;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        savePersonnel(HABILITE, Role.PERSONNEL_HABILITE, "MAT-H-1");
        savePersonnel("simple@test.ma", Role.PERSONNEL, "MAT-S-1");

        salle = new Salle();
        salle.setNom("Salle Test Habilite");
        salle.setBatiment("Z");
        salle.setCapacite(30);
        salle.setType(TypeSalle.SALLE_COURS);
        salle = salleRepository.save(salle);
    }

    private void savePersonnel(String email, Role role, String matricule) {
        Personnel p = new Personnel();
        p.setNom("Test");
        p.setPrenom("Personnel");
        p.setEmail(email);
        p.setMotDePasse(passwordEncoder.encode("Secret@123"));
        p.setMatricule(matricule);
        p.setRole(role);
        p.setAutorisePublication(true);
        utilisateurRepository.save(p);
    }

    private static final String ANNONCE_JSON =
            "{\"titre\":\"Titre\",\"contenu\":\"Contenu de l'annonce\",\"statut\":\"PUBLIEE\"}";

    // ---------- Permissions (RG-NEWS-02, RG-SIG-01, RG-SIG-04) ----------

    @Test
    @WithMockUser(username = "etu@test.ma", roles = "ETUDIANT")
    void etudiant_ne_peut_pas_ajouter_une_annonce() throws Exception {
        mockMvc.perform(post("/gestion/annonces").contentType(MediaType.APPLICATION_JSON).content(ANNONCE_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "simple@test.ma", roles = "PERSONNEL")
    void personnel_simple_ne_peut_ni_lister_ni_creer_de_signalement() throws Exception {
        mockMvc.perform(get("/signalements")).andExpect(status().isForbidden());
        mockMvc.perform(post("/signalements").contentType(MediaType.APPLICATION_JSON)
                .content("{\"salleId\":" + salle.getId() + ",\"type\":\"AUTRE\",\"description\":\"x\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "gest@test.ma", roles = "GESTIONNAIRE_EMPLOI_DU_TEMPS")
    void gestionnaire_ne_peut_pas_declarer_une_indisponibilite() throws Exception {
        mockMvc.perform(get("/indisponibilites")).andExpect(status().isForbidden());
    }

    // ---------- Annonces ----------

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void habilite_publie_et_modifie_une_annonce() throws Exception {
        String body = mockMvc.perform(post("/gestion/annonces").contentType(MediaType.APPLICATION_JSON)
                        .content(ANNONCE_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statut").value("PUBLIEE"))
                .andExpect(jsonPath("$.datePublication").isNotEmpty())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        Number id = JsonPath.read(body, "$.id");

        mockMvc.perform(patch("/gestion/annonces/" + id + "/statut").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"ARCHIVEE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ARCHIVEE"));
    }

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void annonce_sans_titre_est_refusee() throws Exception {
        mockMvc.perform(post("/gestion/annonces").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titre\":\"\",\"contenu\":\"abc\",\"statut\":\"BROUILLON\"}"))
                .andExpect(status().isBadRequest());
    }

    // ---------- Signalements ----------

    private Number creerSignalement() throws Exception {
        String body = mockMvc.perform(post("/signalements").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"salleId\":" + salle.getId()
                                + ",\"type\":\"EQUIPEMENT_DEFECTUEUX\",\"description\":\"Projecteur HS\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statut").value("EN_ATTENTE"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return JsonPath.read(body, "$.id");
    }

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void rejet_sans_motif_est_refuse_puis_accepte_avec_motif_et_le_signalement_est_cloture() throws Exception {
        Number id = creerSignalement();

        mockMvc.perform(patch("/signalements/" + id + "/statut").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"REJETE\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/signalements/" + id + "/statut").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"REJETE\",\"motifRejet\":\"Doublon\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("REJETE"))
                .andExpect(jsonPath("$.motifRejet").value("Doublon"));

        mockMvc.perform(patch("/signalements/" + id + "/statut").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"EN_COURS\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void resolution_renseigne_la_date_et_conserve_le_commentaire() throws Exception {
        Number id = creerSignalement();

        mockMvc.perform(patch("/signalements/" + id + "/statut").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"EN_COURS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_COURS"))
                .andExpect(jsonPath("$.responsable").isNotEmpty());

        mockMvc.perform(patch("/signalements/" + id + "/statut").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"RESOLU\",\"commentaire\":\"Lampe remplacée\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("RESOLU"))
                .andExpect(jsonPath("$.dateResolution").isNotEmpty())
                .andExpect(jsonPath("$.commentaires.length()").value(1));
    }

    // ---------- Indisponibilités ----------

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void indisponibilite_rend_la_salle_non_disponible_puis_la_levee_la_libere() throws Exception {
        LocalDate demain = LocalDate.now().plusDays(1);
        String body = mockMvc.perform(post("/indisponibilites").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"salleId\":" + salle.getId()
                                + ",\"dateDebut\":\"" + demain.atTime(9, 0) + "\""
                                + ",\"dateFin\":\"" + demain.atTime(12, 0) + "\""
                                + ",\"motif\":\"Fuite d'eau\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statut").value("A_VENIR"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        Number id = JsonPath.read(body, "$.id");

        String dispo = "/salles?date=" + demain + "&debut=10:00&fin=11:00";
        mockMvc.perform(get(dispo))
                .andExpect(jsonPath("$[?(@.nom=='Salle Test Habilite')].disponible").value(false));

        mockMvc.perform(patch("/indisponibilites/" + id + "/lever"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("LEVEE"));

        mockMvc.perform(get(dispo))
                .andExpect(jsonPath("$[?(@.nom=='Salle Test Habilite')].disponible").value(true));
    }

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void indisponibilite_avec_fin_avant_debut_est_refusee() throws Exception {
        LocalDateTime debut = LocalDateTime.now().plusDays(2);
        mockMvc.perform(post("/indisponibilites").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"salleId\":" + salle.getId()
                                + ",\"dateDebut\":\"" + debut + "\""
                                + ",\"dateFin\":\"" + debut.minusHours(1) + "\""
                                + ",\"motif\":\"Test\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = HABILITE, roles = "PERSONNEL_HABILITE")
    void tableau_de_bord_compte_les_signalements_en_attente() throws Exception {
        creerSignalement();
        mockMvc.perform(get("/dashboard/personnel-habilite"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signalementsEnAttente").value(1))
                .andExpect(jsonPath("$.aTraiter.length()").value(1));
    }
}
