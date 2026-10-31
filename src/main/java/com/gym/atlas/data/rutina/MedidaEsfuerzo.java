package com.gym.atlas.data.rutina;


import jakarta.persistence.*;

@Entity
@Table(name = "medidaesfuerzo")
public class MedidaEsfuerzo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMedidaEsfuerzo;

    @Column(length = 50)
    private String nombreMedida;

    private Integer cantMedida;

    public MedidaEsfuerzo() {}

    // Getters y Setters
    public Integer getIdMedidaEsfuerzo() { return idMedidaEsfuerzo; }
    public void setIdMedidaEsfuerzo(Integer idMedidaEsfuerzo) { this.idMedidaEsfuerzo = idMedidaEsfuerzo; }

    public String getNombreMedida() { return nombreMedida; }
    public void setNombreMedida(String nombreMedida) { this.nombreMedida = nombreMedida; }

    public Integer getCantMedida() { return cantMedida; }
    public void setCantMedida(Integer cantMedida) { this.cantMedida = cantMedida; }
}