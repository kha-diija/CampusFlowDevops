// dto/SalleDto.java
package com.example.campusflow.dto;

public record SalleDto(Long id, String nom, String batiment, int capacite,
                       String type, String equipements, Boolean disponible) {}