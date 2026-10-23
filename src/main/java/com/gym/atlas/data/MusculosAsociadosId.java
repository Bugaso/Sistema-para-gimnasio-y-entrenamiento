package com.gym.atlas.data;

import java.io.Serializable;
import java.util.Objects;

public class MusculosAsociadosId implements Serializable {
    // Los nombres deben coincidir con los nombres de las propiedades en la Entidad
    private Integer grupoMuscular;
    private Integer ejercicio;

    public MusculosAsociadosId() {}

    public MusculosAsociadosId(Integer grupoMuscular, Integer ejercicio) {
        this.grupoMuscular = grupoMuscular;
        this.ejercicio = ejercicio;
    }

    // Getters, Setters, Equals y HashCode (Obligatorios en IdClass)
    public Integer getGrupoMuscular() { return grupoMuscular; }
    public void setGrupoMuscular(Integer grupoMuscular) { this.grupoMuscular = grupoMuscular; }

    public Integer getEjercicio() { return ejercicio; }
    public void setEjercicio(Integer ejercicio) { this.ejercicio = ejercicio; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MusculosAsociadosId that = (MusculosAsociadosId) o;
        return Objects.equals(grupoMuscular, that.grupoMuscular) && Objects.equals(ejercicio, that.ejercicio);
    }

    @Override
    public int hashCode() {
        return Objects.hash(grupoMuscular, ejercicio);
    }
}