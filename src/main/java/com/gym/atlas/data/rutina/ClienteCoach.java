package com.gym.atlas.data.rutina;

import com.gym.atlas.data.usuario.Usuario;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cliente_coach")
public class ClienteCoach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCliCou;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsCoach", nullable = false)
    private Usuario coach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idRutina", nullable = false)
    private Rutina rutina;

    private LocalDate fechaPlan;

    @Column(length = 50)
    private String duracionPlan;

    public ClienteCoach() {}

    // Getters y Setters
    public Integer getIdCliCou() { return idCliCou; }
    public void setIdCliCou(Integer idCliCou) { this.idCliCou = idCliCou; }
    public Usuario getCliente() { return cliente; }
    public void setCliente(Usuario cliente) { this.cliente = cliente; }
    public Usuario getCoach() { return coach; }
    public void setCoach(Usuario coach) { this.coach = coach; }
    public Rutina getRutina() { return rutina; }
    public void setRutina(Rutina rutina) { this.rutina = rutina; }
    public LocalDate getFechaPlan() { return fechaPlan; }
    public void setFechaPlan(LocalDate fechaPlan) { this.fechaPlan = fechaPlan; }
    public String getDuracionPlan() { return duracionPlan; }
    public void setDuracionPlan(String duracionPlan) { this.duracionPlan = duracionPlan; }
}