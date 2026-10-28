package com.gym.atlas.data.usuario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "RolUs")
public class RolUs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRolUs;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idRol")
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario")
    @JsonIgnore
    private Usuario usuario;

    @Column(length = 50)
    private String estado;

    public RolUs() {}

    // --- Getters y Setters ---

    public Long getIdRolUs() {
        return idRolUs;
    }

    public void setIdRolUs(Long idRolUs) {
        this.idRolUs = idRolUs;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getEstado() {
        return estado.toUpperCase();
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}