package com.gym.atlas.data;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Date;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuario") // Usamos "_user" para evitar conflictos con palabras reservadas en SQL
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    private String nomApe;

    private Date fechaNacimiento;

    private Long dniUs;
    private Long telUs;

    private String mailUs;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "idCatUs", nullable = false)
    private CategoriaUs categoria;
    private String password;




    public Usuario() {}



    // --- Getters y Setters estándar ---

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNomApe() {
        return nomApe;
    }

    public void setNomApe(String nomApe) {
        this.nomApe = nomApe;
    }

    public Date getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(Date fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getMailUs() {
        return mailUs;
    }

    public void setMailUs(String mailUs) {
        this.mailUs = mailUs;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public CategoriaUs getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaUs categoria) {
        this.categoria = categoria;
    }

    public Long getDniUs() {
        return dniUs;
    }

    public void setDniUs(Long dniUs) {
        this.dniUs = dniUs;
    }

    public Long getTelUs() {
        return telUs;
    }

    public void setTelUs(Long telUs) {
        this.telUs = telUs;
    }

    // --- Implementación de métodos de UserDetails ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (categoria != null && categoria.getNomCatUs() != null) {
            return List.of(
                    new SimpleGrantedAuthority("ROLE_" + categoria.getNomCatUs().toUpperCase()),
                    new SimpleGrantedAuthority("PERMISO_" + categoria.getTipoPermiso().toUpperCase())
            );
        }
        return List.of();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // En esta aplicación usamos el email como identificador (username)
        return mailUs;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


}