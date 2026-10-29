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
    @JoinColumn(name = "idTipoMembresia", nullable = false)
    private TipoMembresia idTipoMembresia;



    @Column(name="cantCuotas")
    private int cantCuotas;

    @Column(name = "fechaPago")
    private LocalDateTime fechaPago;

    @Column(name = "tipoPago")
    private String tipoPago;

    @Column(name = "cantEfect")
    private Double cantEfect;

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

    public TipoMembresia getIdTipoMembresia() {
        return idTipoMembresia;
    }

    public void setIdTipoMembresia(TipoMembresia idTipoMembresia) {
        this.idTipoMembresia = idTipoMembresia;
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

    public int getCantCuotas() {
        return cantCuotas;
    }

    public void setCantCuotas(int cantCuotas) {
        this.cantCuotas = cantCuotas;
    }

    public Double getCantEfect() {
        return cantEfect;
    }

    public void setCantEfect(Double cantEfect) {
        this.cantEfect = cantEfect;
    }
}
