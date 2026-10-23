package com.gym.atlas.data;

import jakarta.persistence.*;

@Entity
@Table(name = "musculosasociados")
@IdClass(MusculosAsociadosId.class)
public class MusculosAsociados {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGrupoMusc", nullable = false)
    private GrupoMuscular grupoMuscular;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEjercicio", nullable = false)
    private Ejercicio ejercicio;

    @Column(length = 50)
    private String prioridadMusc;

    public MusculosAsociados() {}

    public GrupoMuscular getGrupoMuscular() { return grupoMuscular; }
    public void setGrupoMuscular(GrupoMuscular grupoMuscular) { this.grupoMuscular = grupoMuscular; }

    public Ejercicio getEjercicio() { return ejercicio; }
    public void setEjercicio(Ejercicio ejercicio) { this.ejercicio = ejercicio; }

    public String getPrioridadMusc() { return prioridadMusc; }
    public void setPrioridadMusc(String prioridadMusc) { this.prioridadMusc = prioridadMusc; }
}