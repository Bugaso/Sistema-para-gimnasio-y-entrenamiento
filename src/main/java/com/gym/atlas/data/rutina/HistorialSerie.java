package com.gym.atlas.data.rutina;

import com.gym.atlas.data.ejercicio.Ejercicio;
import jakarta.persistence.*;

@Entity
@Table(name = "historial_serie")
public class HistorialSerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idSerie")
    private Integer idSerie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idHistRut", nullable = false)
    private HistorialRutina historialRutina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEjercicio", nullable = false)
    private Ejercicio ejercicio;

    @Column(name = "nroSerie", nullable = false)
    private Integer nroSerie;

    @Column(name = "nroRepeticiones")
    private Integer nroRepeticiones;

    @Column(name = "nroPeso")
    private Double nroPeso;

    @Column(name = "medidaEsfuerzo", length = 45)
    private String medidaEsfuerzo;

    @Column(name = "cantMedida")
    private Integer cantMedida;

    @Column(name = "tiempoSegundos")
    private Integer tiempoSegundos;

    // Constructor vacío requerido por JPA
    public HistorialSerie() {}

    // Getters y Setters
    public Integer getIdSerie() {
        return idSerie;
    }

    public void setIdSerie(Integer idSerie) {
        this.idSerie = idSerie;
    }

    public HistorialRutina getHistorialRutina() {
        return historialRutina;
    }

    public void setHistorialRutina(HistorialRutina historialRutina) {
        this.historialRutina = historialRutina;
    }

    public Ejercicio getEjercicio() {
        return ejercicio;
    }

    public void setEjercicio(Ejercicio ejercicio) {
        this.ejercicio = ejercicio;
    }

    public Integer getNroSerie() {
        return nroSerie;
    }

    public void setNroSerie(Integer nroSerie) {
        this.nroSerie = nroSerie;
    }

    public Integer getNroRepeticiones() {
        return nroRepeticiones;
    }

    public void setNroRepeticiones(Integer nroRepeticiones) {
        this.nroRepeticiones = nroRepeticiones;
    }

    public Double getNroPeso() {
        return nroPeso;
    }

    public void setNroPeso(Double nroPeso) {
        this.nroPeso = nroPeso;
    }

    public String getMedidaEsfuerzo() {
        return medidaEsfuerzo;
    }

    public void setMedidaEsfuerzo(String medidaEsfuerzo) {
        this.medidaEsfuerzo = medidaEsfuerzo;
    }

    public Integer getCantMedida() {
        return cantMedida;
    }

    public void setCantMedida(Integer cantMedida) {
        this.cantMedida = cantMedida;
    }

    public Integer getTiempoSegundos() {
        return tiempoSegundos;
    }

    public void setTiempoSegundos(Integer tiempoSegundos) {
        this.tiempoSegundos = tiempoSegundos;
    }
}