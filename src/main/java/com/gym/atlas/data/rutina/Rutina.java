package com.gym.atlas.data.rutina;

import com.gym.atlas.data.usuario.Usuario;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "rutina")
public class Rutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRutina;

    @Column(length = 150, nullable = false)
    private String nombreRutina;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "esPlantilla")
    private Boolean esPlantilla; // true = Plantilla general, false = Personalizada

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsCoach", nullable = false)
    private Usuario coach;

    private LocalDate fechaCreacion;

    public Rutina() {}

    // Getters y Setters
    public Integer getIdRutina() { return idRutina; }
    public void setIdRutina(Integer idRutina) { this.idRutina = idRutina; }
    public String getNombreRutina() { return nombreRutina; }
    public void setNombreRutina(String nombreRutina) { this.nombreRutina = nombreRutina; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Boolean getEsPlantilla() { return esPlantilla; }
    public void setEsPlantilla(Boolean esPlantilla) { this.esPlantilla = esPlantilla; }
    public Usuario getCoach() { return coach; }
    public void setCoach(Usuario coach) { this.coach = coach; }
    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}