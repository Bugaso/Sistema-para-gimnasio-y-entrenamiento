package com.gym.atlas.repository.usuario;

import com.gym.atlas.data.usuario.AsistenciaCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaClienteRepository extends JpaRepository<AsistenciaCliente, Integer> {
    // Busca si el cliente tiene una entrada abierta (sin salida registrada aún)
    Optional<AsistenciaCliente> findFirstByClienteIdUsuarioAndFechaHorarioSalidaIsNullOrderByFechaHorarioEntradaDesc(Integer idUsuario);

    @Query("SELECT a FROM AsistenciaCliente a WHERE a.idCliMem.idCliMem = :idCliMem AND a.fechaHorarioEntrada >= :inicioSemana AND a.fechaHorarioEntrada <= :finSemana")
    List<AsistenciaCliente> findAsistenciasPorMembresiaYSemana(
            @Param("idCliMem") Long idCliMem,
            @Param("inicioSemana") LocalDateTime inicioSemana,
            @Param("finSemana") LocalDateTime finSemana
    );

    List<AsistenciaCliente> findAsistenciaClienteByFechaHorarioEntradaBetween(LocalDateTime inicio,LocalDateTime fin);
}