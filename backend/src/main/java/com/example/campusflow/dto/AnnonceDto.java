// dto/AnnonceDto.java
package com.example.campusflow.dto;

import java.time.LocalDateTime;

public record AnnonceDto(Long id, String titre, String contenu, LocalDateTime datePublication, String auteur) {}