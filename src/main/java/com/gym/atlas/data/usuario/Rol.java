package com.gym.atlas.data.usuario;

import jakarta.persistence.*;

@Entity
@Table(name = "Rol")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRol;

    @Column(nullable = false, length = 50)
    private String nomCatUs;

    //@Column(length = 100)
    //private String tipoPermiso;

    @Column(nullable = false)
    private Boolean estado;

    public Rol() {}

    // --- Getters y Setters ---

    public Long getIdRol() {
        return idRol;
    }

    public void setIdRol(Long idRol) {
        this.idRol = idRol;
    }

    public String getNomCatUs() {
        return nomCatUs;
    }

    public void setNomCatUs(String nomCatUs) {
        this.nomCatUs = nomCatUs;
    }

//    public String getTipoPermiso() {
//        return tipoPermiso;
//    }
//
//    public void setTipoPermiso(String tipoPermiso) {
//        this.tipoPermiso = tipoPermiso;
//    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }
}