package com.gym.atlas.data.membresia;

import com.gym.atlas.data.usuario.Usuario;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cliente_membresia")
public class ClienteMembresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idClienteMembresia")
    private Long idCliMem;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "idMembresia", nullable = false)
    private Membresia membresia;

    @Column(name = "fechaPago")
    private LocalDateTime fechaPago;

    @Column(name = "tipoPago")
    private String tipoPago;
    @Column(name = "costoTotal")
    private Double costoTotal;

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

    public Double getCostoTotal() {
        return costoTotal;
    }

    public void setCostoTotal(Double costoTotal) {
        this.costoTotal = costoTotal;
    }

    public String getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }
}
