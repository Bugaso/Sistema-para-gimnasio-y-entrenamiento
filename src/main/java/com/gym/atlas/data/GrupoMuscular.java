package com.gym.atlas.data;

import jakarta.persistence.*;

@Entity
@Table(name = "grupomuscular")
public class GrupoMuscular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idGrupoMusc;

    @Column(nullable = false, length = 100)
    private String nombreGrupo;

    public GrupoMuscular() {}

    public Integer getIdGrupoMusc() { return idGrupoMusc; }
    public void setIdGrupoMusc(Integer idGrupoMusc) { this.idGrupoMusc = idGrupoMusc; }

    public String getNombreGrupo() { return nombreGrupo; }
    public void setNombreGrupo(String nombreGrupo) { this.nombreGrupo = nombreGrupo; }
}