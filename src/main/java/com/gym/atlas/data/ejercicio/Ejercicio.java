package com.gym.atlas.data.ejercicio;

import jakarta.persistence.*;

@Entity
@Table(name = "ejercicio")
public class Ejercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEjercicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCatGen")
    private CatGenEjer categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEquip")
    private Equipamiento equipamiento;

    @Column(length = 150)
    private String nomEjercicio;

    @Column(columnDefinition = "TEXT")
    private String descEjercicio;

    @Column(length = 255)
    private String dirImgEjercicio;

    public Ejercicio() {}

    // Getters y Setters
    public Integer getIdEjercicio() { return idEjercicio; }
    public void setIdEjercicio(Integer idEjercicio) { this.idEjercicio = idEjercicio; }

    public CatGenEjer getCategoria() { return categoria; }
    public void setCategoria(CatGenEjer categoria) { this.categoria = categoria; }

    public Equipamiento getEquipamiento() { return equipamiento; }
    public void setEquipamiento(Equipamiento equipamiento) { this.equipamiento = equipamiento; }

    public String getNomEjercicio() { return nomEjercicio; }
    public void setNomEjercicio(String nomEjercicio) { this.nomEjercicio = nomEjercicio; }

    public String getDescEjercicio() { return descEjercicio; }
    public void setDescEjercicio(String descEjercicio) { this.descEjercicio = descEjercicio; }

    public String getDirImgEjercicio() { return dirImgEjercicio; }
    public void setDirImgEjercicio(String dirImgEjercicio) { this.dirImgEjercicio = dirImgEjercicio; }
}