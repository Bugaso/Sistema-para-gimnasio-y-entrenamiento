package com.gym.atlas.data.rutina;

import com.gym.atlas.data.ejercicio.Ejercicio;
import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "detalle_rutina")
public class DetalleRutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idRutina", nullable = false)
    private Rutina rutina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEjercicio", nullable = false)
    private Ejercicio ejercicio;

    // Si aún no creaste la entidad MedidaEsfuerzo, créala de forma simple (idMedidaEsfuerzo, nombreMedida)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idMedidaEsfuerzo")
    private MedidaEsfuerzo medidaEsfuerzo;

    @Column(length = 20, nullable = false)
    private String diaSemana;

    @Column(length = 50)
    private String rangoSeries;

    @Column(length = 50)
    private String rangoRep;

    @Column(length = 50)
    private String rangoPeso;

    private LocalTime tiempoEstimado;

    public DetalleRutina() {}

    // Getters y Setters
    public Integer getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Integer idDetalle) { this.idDetalle = idDetalle; }
    public Rutina getRutina() { return rutina; }
    public void setRutina(Rutina rutina) { this.rutina = rutina; }
    public Ejercicio getEjercicio() { return ejercicio; }
    public void setEjercicio(Ejercicio ejercicio) { this.ejercicio = ejercicio; }
    public MedidaEsfuerzo getMedidaEsfuerzo() { return medidaEsfuerzo; }
    public void setMedidaEsfuerzo(MedidaEsfuerzo medidaEsfuerzo) { this.medidaEsfuerzo = medidaEsfuerzo; }
    public String getDiaSemana() { return diaSemana; }
    public void setDiaSemana(String diaSemana) { this.diaSemana = diaSemana; }
    public String getRangoSeries() { return rangoSeries; }
    public void setRangoSeries(String rangoSeries) { this.rangoSeries = rangoSeries; }
    public String getRangoRep() { return rangoRep; }
    public void setRangoRep(String rangoRep) { this.rangoRep = rangoRep; }
    public String getRangoPeso() { return rangoPeso; }
    public void setRangoPeso(String rangoPeso) { this.rangoPeso = rangoPeso; }
    public LocalTime getTiempoEstimado() { return tiempoEstimado; }
    public void setTiempoEstimado(LocalTime tiempoEstimado) { this.tiempoEstimado = tiempoEstimado; }
}