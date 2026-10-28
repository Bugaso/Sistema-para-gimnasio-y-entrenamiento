package com.gym.atlas.data.usuario;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "historialmedico")
public class HistorialMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idHMedico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @Column(precision = 5, scale = 2)
    private BigDecimal alturaHReg;

    @Column(precision = 5, scale = 2)
    private BigDecimal pesoHReg;

    @Column(length = 255)
    private String condMed;

    @Column(columnDefinition = "TEXT")
    private String descHMed;

    private LocalDate fechaRegHMed;

    public HistorialMedico() {}

    // Getters y Setters
    public Integer getIdHMedico() { return idHMedico; }
    public void setIdHMedico(Integer idHMedico) { this.idHMedico = idHMedico; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public BigDecimal getAlturaHReg() { return alturaHReg; }
    public void setAlturaHReg(BigDecimal alturaHReg) { this.alturaHReg = alturaHReg; }

    public BigDecimal getPesoHReg() { return pesoHReg; }
    public void setPesoHReg(BigDecimal pesoHReg) { this.pesoHReg = pesoHReg; }

    public String getCondMed() { return condMed; }
    public void setCondMed(String condMed) { this.condMed = condMed; }

    public String getDescHMed() { return descHMed; }
    public void setDescHMed(String descHMed) { this.descHMed = descHMed; }

    public LocalDate getFechaRegHMed() { return fechaRegHMed; }
    public void setFechaRegHMed(LocalDate fechaRegHMed) { this.fechaRegHMed = fechaRegHMed; }
}