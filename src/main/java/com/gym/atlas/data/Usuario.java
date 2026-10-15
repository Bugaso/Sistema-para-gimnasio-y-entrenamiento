package com.gym.atlas.data;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Date;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "Usuario") // Respetando mayúsculas como en el script original
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(nullable = false, length = 150)
    private String nomApe;

    private Date fechaNacimiento;

    @Column(unique = true, nullable = false)
    private Long dniUs;

    private Long telUs;
    private Long contacoE;

    @Column(unique = true, length = 100)
    private String mailUs;

    @Column(nullable = false)
    private String password;

    private String dirFotoUs;

    // CORRECCIÓN: La relación correcta con RolUs es OneToMany porque un Usuario puede tener varios registros en RolUs
    // Utilizamos fetch EAGER para que cargue los roles inmediatamente y Spring Security pueda validar los accesos.
    @OneToMany(mappedBy = "usuario", fetch = FetchType.EAGER)
    private List<RolUs> rolesUsuario = new ArrayList<>();

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

    public Long getContacoE() {
        return contacoE;
    }

    public void setContacoE(Long contacoE) {
        this.contacoE = contacoE;
    }

    public String getMailUs() {
        return mailUs;
    }

    public void setMailUs(String mailUs) {
        this.mailUs = mailUs;
    }

    public String getDirFotoUs() {
        return dirFotoUs;
    }

    public void setDirFotoUs(String dirFotoUs) {
        this.dirFotoUs = dirFotoUs;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<RolUs> getRolesUsuario() {
        return rolesUsuario;
    }

    public void setRolesUsuario(List<RolUs> rolesUsuario) {
        this.rolesUsuario = rolesUsuario;
    }

    // --- Implementación de métodos de UserDetails ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // CORRECCIÓN: Iteramos sobre los registros intermedios para buscar el Rol y sus atributos
        if (rolesUsuario != null) {
            for (RolUs rolUsuario : rolesUsuario) {
                if (rolUsuario.getRol() != null) {
                    Rol rol = rolUsuario.getRol();

                    if (rol.getNomCatUs() != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNomCatUs().toUpperCase()));
                    }
                    if (rol.getTipoPermiso() != null) {
                        authorities.add(new SimpleGrantedAuthority("PERMISO_" + rol.getTipoPermiso().toUpperCase()));
                    }
                }
            }
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
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