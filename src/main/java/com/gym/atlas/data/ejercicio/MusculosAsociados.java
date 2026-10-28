package com.gym.atlas.data.ejercicio;

import jakarta.persistence.*;

@Entity
@Table(name = "musculosasociados", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"idGrupoMusc", "idEjercicio"}) // Evita duplicados
})
public class MusculosAsociados {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMuscAsociados;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGrupoMusc", nullable = false)
    private GrupoMuscular grupoMuscular;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEjercicio", nullable = false)
    private Ejercicio ejercicio;

    @Column(length = 50)
    private String prioridadMusc;

    public MusculosAsociados() {}

    public Integer getIdMuscAsociados() { return idMuscAsociados; }
    public void setIdMuscAsociados(Integer idMuscAsociados) { this.idMuscAsociados = idMuscAsociados; }

    public GrupoMuscular getGrupoMuscular() { return grupoMuscular; }
    public void setGrupoMuscular(GrupoMuscular grupoMuscular) { this.grupoMuscular = grupoMuscular; }

    public Ejercicio getEjercicio() { return ejercicio; }
    public void setEjercicio(Ejercicio ejercicio) { this.ejercicio = ejercicio; }

    public String getPrioridadMusc() { return prioridadMusc; }
    public void setPrioridadMusc(String prioridadMusc) { this.prioridadMusc = prioridadMusc; }
}