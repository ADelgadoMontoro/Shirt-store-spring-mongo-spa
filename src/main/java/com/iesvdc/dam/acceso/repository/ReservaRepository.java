package com.iesvdc.dam.acceso.repository;

import com.iesvdc.dam.acceso.model.Reserva;

import java.util.List;
import java.time.Instant;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservaRepository extends MongoRepository<Reserva, String> {

    List<Reserva> findByUsuarioId(String usuarioId);

    List<Reserva> findByFechaReservaBetween(Instant inicio, Instant fin);

    boolean existsByFechaReservaAndHorario_Id(Instant fechaReserva, String horarioId);

    boolean existsByFechaReservaAndHorario_IdAndIdNot(Instant fechaReserva, String horarioId, String id);
}
