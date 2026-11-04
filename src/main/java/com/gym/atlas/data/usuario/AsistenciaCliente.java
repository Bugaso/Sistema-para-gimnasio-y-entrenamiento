package com.gym.atlas.data.usuario;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asistenciacliente")
public class AsistenciaCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idAsistencia")
    private Integer idAsistencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idRecepcionista")
    private Usuario recepcionista;

    @Column(name = "FechaHorarioEntrada")
    private LocalDateTime fechaHorarioEntrada;

    @Column(name = "FechaHorarioSalida")
    private LocalDateTime fechaHorarioSalida;

    public AsistenciaCliente() {}

    // Getters y Setters
    public Integer getIdAsistencia() { return idAsistencia; }
    public void setIdAsistencia(Integer idAsistencia) { this.idAsistencia = idAsistencia; }
    public Usuario getCliente() { return cliente; }
    public void setCliente(Usuario cliente) { this.cliente = cliente; }
    public Usuario getRecepcionista() { return recepcionista; }
    public void setRecepcionista(Usuario recepcionista) { this.recepcionista = recepcionista; }
    public LocalDateTime getFechaHorarioEntrada() { return fechaHorarioEntrada; }
    public void setFechaHorarioEntrada(LocalDateTime fechaHorarioEntrada) { this.fechaHorarioEntrada = fechaHorarioEntrada; }
    public LocalDateTime getFechaHorarioSalida() { return fechaHorarioSalida; }
    public void setFechaHorarioSalida(LocalDateTime fechaHorarioSalida) { this.fechaHorarioSalida = fechaHorarioSalida; }
}