package com.example.campusflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.campusflow.entity.Etudiant;
import com.example.campusflow.enums.Role;
import com.example.campusflow.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        utilisateurRepository.deleteAll();

        Etudiant etudiant = new Etudiant();
        etudiant.setNom("Test");
        etudiant.setPrenom("Etudiant");
        etudiant.setEmail("etudiant@campusflow.ma");
        etudiant.setMotDePasse(passwordEncoder.encode("Etudiant@123"));
        etudiant.setCne("CNE123");
        etudiant.setFiliere("Informatique");
        etudiant.setRole(Role.ETUDIANT);
        utilisateurRepository.save(etudiant);
    }

    @Test
    void login_shouldReturnTokenAndUser_whenCredentialsAreValid() throws Exception {
        String requestBody = "{\"email\":\"etudiant@campusflow.ma\",\"password\":\"Etudiant@123\"}";

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.email").value("etudiant@campusflow.ma"))
            .andExpect(jsonPath("$.user.role").value("ETUDIANT"));
    }

    @Test
    void login_shouldReturn401_whenPasswordIsIncorrect() throws Exception {
        String requestBody = "{\"email\":\"etudiant@campusflow.ma\",\"password\":\"Mauvais@123\"}";

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andDo(print())
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("E-mail ou mot de passe incorrect"));
    }

    @Test
    void login_shouldReturn401_whenEmailDoesNotExist() throws Exception {
        String requestBody = "{\"email\":\"inconnu@campusflow.ma\",\"password\":\"Etudiant@123\"}";

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andDo(print())
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("E-mail ou mot de passe incorrect"));
    }

    @Test
    void protectedEndpoint_shouldReturn401_withoutToken() throws Exception {
        mockMvc.perform(get("/auth/me"))
            .andDo(print())
            .andExpect(status().isUnauthorized());
    }
}
