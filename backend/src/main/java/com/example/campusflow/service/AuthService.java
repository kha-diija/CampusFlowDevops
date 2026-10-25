package com.example.campusflow.service;

import com.example.campusflow.dto.LoginRequest;
import com.example.campusflow.dto.LoginResponse;
import com.example.campusflow.dto.RegisterRequest;
import com.example.campusflow.dto.UserResponse;
import com.example.campusflow.entity.Etudiant;
import com.example.campusflow.entity.Utilisateur;
import com.example.campusflow.enums.Role;
import com.example.campusflow.mapper.UtilisateurMapper;
import com.example.campusflow.repository.UtilisateurRepository;
import com.example.campusflow.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final UtilisateurMapper utilisateurMapper;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        AuthenticationManager authenticationManager,
        UtilisateurRepository utilisateurRepository,
        JwtService jwtService,
        UtilisateurMapper utilisateurMapper,
        PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.utilisateurRepository = utilisateurRepository;
        this.jwtService = jwtService;
        this.utilisateurMapper = utilisateurMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            if (!authentication.isAuthenticated()) {
                throw new BadCredentialsException("E-mail ou mot de passe incorrect");
            }
        } catch (AuthenticationException exception) {
            throw new BadCredentialsException("E-mail ou mot de passe incorrect");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("E-mail ou mot de passe incorrect"));

        if (!Boolean.TRUE.equals(utilisateur.getActif())) {
            throw new BadCredentialsException("E-mail ou mot de passe incorrect");
        }

        String token = jwtService.generateToken(utilisateur);
        return new LoginResponse(token, utilisateurMapper.toResponse(utilisateur));
    }

    public UserResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà pour cette adresse e-mail.");
        }

        Role requestedRole = request.getRole() == null ? Role.ETUDIANT : request.getRole();
        if (requestedRole != Role.ETUDIANT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Le rôle demandé n'est pas autorisé à l'inscription publique.");
        }

        Etudiant etudiant = new Etudiant();
        etudiant.setNom(request.getNom());
        etudiant.setPrenom(request.getPrenom());
        etudiant.setEmail(request.getEmail());
        etudiant.setMotDePasse(passwordEncoder.encode(request.getPassword()));
        etudiant.setRole(Role.ETUDIANT);
        etudiant.setActif(true);
        etudiant.setNumeroEtudiant(request.getNumeroEtudiant());
        etudiant.setFiliere(request.getFiliere());

        Utilisateur saved = utilisateurRepository.save(etudiant);
        return utilisateurMapper.toResponse(saved);
    }

    public UserResponse getCurrentUser(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        return utilisateurMapper.toResponse(utilisateur);
    }

    public void forgotPassword(String email) {
        logger.info("[DEV] Lien de réinitialisation pour {} : http://localhost:5173/reset-password?token=dev-reset-token-{}", email, email);
    }

    public UserResponse getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalArgumentException("Utilisateur non authentifié.");
        }

        return getCurrentUser(authentication.getName());
    }
}
