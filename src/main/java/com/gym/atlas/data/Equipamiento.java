package com.gym.atlas.data;

import jakarta.persistence.*;

@Entity
@Table(name = "equipamiento")
public class Equipamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEquipamiento;

    @Column(nullable = false, length = 100)
    private String nomEquipamiento;

    public Equipamiento() {}

    public Integer getIdEquipamiento() { return idEquipamiento; }
    public void setIdEquipamiento(Integer idEquipamiento) { this.idEquipamiento = idEquipamiento; }

    public String getNomEquipamiento() { return nomEquipamiento; }
    public void setNomEquipamiento(String nomEquipamiento) { this.nomEquipamiento = nomEquipamiento; }
}