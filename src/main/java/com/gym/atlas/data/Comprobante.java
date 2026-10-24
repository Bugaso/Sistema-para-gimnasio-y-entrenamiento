package com.gym.atlas.data;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "comprobante")
public class Comprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idComprobante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCatGasto", nullable = false)
    private CategoriaGasto categoriaGasto;

    @Column(length = 255)
    private String descripcionGasto;

    private LocalDate fechaDelComprobante;

    private LocalDateTime fechaRegistroGasto;

    @Column(precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(length = 50)
    private String estado;

    public Comprobante() {}

    // Getters y Setters
    public Integer getIdComprobante() { return idComprobante; }
    public void setIdComprobante(Integer idComprobante) { this.idComprobante = idComprobante; }

    public CategoriaGasto getCategoriaGasto() { return categoriaGasto; }
    public void setCategoriaGasto(CategoriaGasto categoriaGasto) { this.categoriaGasto = categoriaGasto; }

    public String getDescripcionGasto() { return descripcionGasto; }
    public void setDescripcionGasto(String descripcionGasto) { this.descripcionGasto = descripcionGasto; }

    public LocalDate getFechaDelComprobante() { return fechaDelComprobante; }
    public void setFechaDelComprobante(LocalDate fechaDelComprobante) { this.fechaDelComprobante = fechaDelComprobante; }

    public LocalDateTime getFechaRegistroGasto() { return fechaRegistroGasto; }
    public void setFechaRegistroGasto(LocalDateTime fechaRegistroGasto) { this.fechaRegistroGasto = fechaRegistroGasto; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}