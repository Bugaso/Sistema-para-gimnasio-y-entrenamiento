package com.gym.atlas.data.membresia;

import jakarta.persistence.*;

import java.util.List;

@Entity
(name = "membresia")
public class Membresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMembresia")
    private Long idMembresia;

    private String descripMembresia;

    private String estado;

    @OneToMany(mappedBy = "membresia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TipoMembresia> tipos;
// Y asegúrate de tener un campo `estado` (String) si no lo tienes para la baja lógica.

    public Membresia(){

    }

    public List<TipoMembresia> getTipos() {
        return tipos;
    }

    public void setTipos(List<TipoMembresia> tipos) {
        this.tipos = tipos;
    }

    public Long getIdMembresia() {
        return idMembresia;
    }

    public void setIdMembresia(Long idMembresia) {
        this.idMembresia = idMembresia;
    }

    public String getDescripMembresia() {
        return descripMembresia;
    }

    public void setDescripMembresia(String descripMembresia) {
        this.descripMembresia = descripMembresia;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
