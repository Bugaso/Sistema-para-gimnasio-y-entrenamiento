package com.gym.atlas.data.rutina;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "historial_rutina")
public class HistorialRutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idHistRut")
    private Integer idHistRut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idRutina", nullable = false)
    private Rutina rutina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCliCou", nullable = false)
    private ClienteCoach asignacion;

    @Column(name = "fechaRegistro", nullable = false)
    private LocalDate fechaRegistro;

    // Constructor vacío requerido por JPA
    public HistorialRutina() {}

    // Getters y Setters
    public Integer getIdHistRut() {
        return idHistRut;
    }

    public void setIdHistRut(Integer idHistRut) {
        this.idHistRut = idHistRut;
    }

    public Rutina getRutina() {
        return rutina;
    }

    public void setRutina(Rutina rutina) {
        this.rutina = rutina;
    }

    public ClienteCoach getAsignacion() {
        return asignacion;
    }

    public void setAsignacion(ClienteCoach asignacion) {
        this.asignacion = asignacion;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}