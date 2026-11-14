package com.example.campusflow.dto;

import java.util.List;

public record DashboardHabiliteDto(long signalementsEnAttente, long signalementsEnAttenteDepuisHier,
                                   long signalementsEnCours, Double tempsMoyenTraitementJours,
                                   long annoncesPubliees, long annoncesCeMois,
                                   long indisponibilitesActives, List<SignalementDto> aTraiter) {}
