package com.gym.atlas.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity(name = "categoriaus")
public class CategoriaUs {
    @Id
    private Long idCatUs;

    private String nomCatUs;

    @Column(name = "tipoPermiso", nullable = false)
    private String tipoPermiso;


    @OneToMany(mappedBy = "categoria")
    private List<Usuario> usuarios;

    public Long getIdCatUs() {
        return idCatUs;
    }

    public void setIdCatUs(Long idCatUs) {
        this.idCatUs = idCatUs;
    }

    public String getNomCatUs() {
        return nomCatUs;
    }

    public void setNomCatUs(String nomCatUs) {
        this.nomCatUs = nomCatUs;
    }

    public String getTipoPermiso() {
        return tipoPermiso;
    }

    public void setTipoPermiso(String tipoPermiso) {
        this.tipoPermiso = tipoPermiso;
    }


}
