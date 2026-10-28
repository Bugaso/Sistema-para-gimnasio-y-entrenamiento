package com.gym.atlas.data.membresia;

import jakarta.persistence.*;

@Entity(name="tipomembresia")
public class TipoMembresia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTipoMem")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idMembresia")
    private Membresia membresia;

    @Column(name = "duracionDiaMes")
    private int duracionMembresia;
    private int diasAsistencia;
    private boolean planificacion;
    private double costoMembresia;

    @Column(name = "estado")
    private boolean estado;

    public Membresia getMembresia() {
        return membresia;
    }

    public void setMembresia(Membresia membresia) {
        this.membresia = membresia;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public int getDuracionMembresia() {
        return duracionMembresia;
    }

    public void setDuracionMembresia(int duracionMembresia) {
        this.duracionMembresia = duracionMembresia;
    }

    public int getDiasAsistencia() {
        return diasAsistencia;
    }

    public void setDiasAsistencia(int diasAsistencia) {
        this.diasAsistencia = diasAsistencia;
    }

    public boolean isPlanificacion() {
        return planificacion;
    }

    public void setPlanificacion(boolean planificacion) {
        this.planificacion = planificacion;
    }

    public double getCostoMembresia() {
        return costoMembresia;
    }

    public void setCostoMembresia(double costoMembresia) {
        this.costoMembresia = costoMembresia;
    }

    public boolean isEstado() {
        return estado;
    }

    public void setEstado(boolean estado) {
        this.estado = estado;
    }
}
