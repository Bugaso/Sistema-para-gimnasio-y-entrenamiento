package com.gym.atlas.data.ejercicio;

import jakarta.persistence.*;

@Entity
@Table(name = "catgenejer")
public class CatGenEjer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCategoriaGen;

    @Column(nullable = false, length = 100)
    private String nombreCat;

    public CatGenEjer() {}

    public Integer getIdCategoriaGen() { return idCategoriaGen; }
    public void setIdCategoriaGen(Integer idCategoriaGen) { this.idCategoriaGen = idCategoriaGen; }

    public String getNombreCat() { return nombreCat; }
    public void setNombreCat(String nombreCat) { this.nombreCat = nombreCat; }
}