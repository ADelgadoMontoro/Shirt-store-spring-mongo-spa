package com.iesvdc.dam.acceso.service;

import java.util.List;
import java.util.Optional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.iesvdc.dam.acceso.model.Reserva;
import com.iesvdc.dam.acceso.repository.ReservaRepository;
import com.iesvdc.dam.acceso.web.ConflictException;
import com.iesvdc.dam.acceso.web.NotFoundException;
import com.iesvdc.dam.acceso.web.BadRequestException;

@Service
public class ReservaService {

    @Autowired
    ReservaRepository reservaRepository;

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public List<Reserva> findByUsuarioId(String usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    public List<Reserva> findByFechaReservaBetween(java.time.Instant inicio, java.time.Instant fin) {
        return reservaRepository.findByFechaReservaBetween(inicio, fin);
    }

    /**
     * No se pueden solapar reservas en el tiempo
     */
    public Reserva add(@RequestBody Reserva reserva) {
        return save(reserva);
    }

    public Optional<Reserva> findById(String id) {
        return reservaRepository.findById(id);
    }

    public Reserva save(Reserva reserva) {
        if (reserva == null) {
            throw new IllegalArgumentException("Reserva no puede ser null");
        }
        if (reserva.getId() == null || reserva.getId().length() < 5) {
            reserva.setId(null);
        }
        validarFechaNoPasada(reserva.getFechaReserva());
        if (reserva.getFechaReserva() != null && reserva.getHorario() != null && reserva.getHorario().getId() != null) {
            if (reservaRepository.existsByFechaReservaAndHorario_Id(reserva.getFechaReserva(), reserva.getHorario().getId())) {
                throw new ConflictException("Ya existe una reserva para ese horario en la fecha indicada");
            }
        }
        return reservaRepository.save(reserva);
    }

    public Reserva updateById(String id, Reserva reserva) {
        Optional<Reserva> oReserva = findById(id);
        if (oReserva.isPresent()) {
            reserva.setId(id);
            validarFechaNoPasada(reserva.getFechaReserva());
            if (reserva.getFechaReserva() != null && reserva.getHorario() != null && reserva.getHorario().getId() != null) {
                if (reservaRepository.existsByFechaReservaAndHorario_IdAndIdNot(
                        reserva.getFechaReserva(), reserva.getHorario().getId(), id)) {
                    throw new ConflictException("Ya existe una reserva para ese horario en la fecha indicada");
                }
            }
            return reservaRepository.save(reserva);
        } else {
            throw new NotFoundException(
                    "Reserva no encontrada: " + id);
        }
    }

    private void validarFechaNoPasada(Instant fechaReserva) {
        if (fechaReserva == null) return;
        LocalDate fecha = fechaReserva.atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate hoy = LocalDate.now(ZoneId.systemDefault());
        if (fecha.isBefore(hoy)) {
            throw new BadRequestException("La fecha de la reserva no puede ser anterior a hoy");
        }
    }

    public void deleteById(String id) {
        if (findById(id).isPresent()) {
            reservaRepository.deleteById(id);
        } else {
            throw new NotFoundException(
                    "Reserva no encontrada: " + id);
        }

    }

    public Reserva updateById(Reserva oldReserva, Reserva reserva) {
        return updateById(oldReserva.getId(), reserva);
    }

}
