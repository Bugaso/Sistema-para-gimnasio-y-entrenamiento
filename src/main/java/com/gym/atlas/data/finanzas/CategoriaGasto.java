package com.gym.atlas.data.finanzas;

import jakarta.persistence.*;

@Entity
@Table(name = "categoriagasto")
public class CategoriaGasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCategoriaGasto;

    @Column(nullable = false, length = 100)
    private String nombreCatGasto;

    public CategoriaGasto() {
    }

    public Integer getIdCategoriaGasto() {
        return idCategoriaGasto;
    }

    public void setIdCategoriaGasto(Integer idCategoriaGasto) {
        this.idCategoriaGasto = idCategoriaGasto;
    }

    public String getNombreCatGasto() {
        return nombreCatGasto;
    }

    public void setNombreCatGasto(String nombreCatGasto) {
        this.nombreCatGasto = nombreCatGasto;
    }
}
