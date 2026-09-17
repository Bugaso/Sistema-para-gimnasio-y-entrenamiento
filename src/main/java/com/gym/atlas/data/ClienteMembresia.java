package com.gym.atlas.data;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
(name = "cliente-membresia")
public class ClienteMembresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idCliMem")
    private Long idCliMem;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "idMembresia", nullable = false)
    private Membresia membresia;

    @Column(name = "fechaPago")
    private LocalDateTime fechaPago;

    public ClienteMembresia() {}

    public Long getIdCliMem() {
        return idCliMem;
    }

    public void setIdCliMem(Long idCliMem) {
        this.idCliMem = idCliMem;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Membresia getMembresia() {
        return membresia;
    }

    public void setMembresia(Membresia membresia) {
        this.membresia = membresia;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }
}
