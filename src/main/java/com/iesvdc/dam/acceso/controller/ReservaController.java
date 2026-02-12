package com.iesvdc.dam.acceso.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.iesvdc.dam.acceso.model.Reserva;
import com.iesvdc.dam.acceso.service.ReservaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    ReservaService reservaService;

    @GetMapping({"","/"})
    public List<Reserva> findAll() {
        return reservaService.findAll();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Reserva> findByUsuarioId(@PathVariable String usuarioId) {
        return reservaService.findByUsuarioId(usuarioId);
    }

    @GetMapping("/entre")
    public List<Reserva> findByFechaReservaBetween(
        @RequestParam java.time.Instant inicio,
        @RequestParam java.time.Instant fin
    ) {
        return reservaService.findByFechaReservaBetween(inicio, fin);
    }

    @PostMapping({"","/"})
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva save(
        @Valid
        @RequestBody Reserva reserva) {
        return reservaService.save(reserva);
    }

    @PutMapping("/{id}")
    public Reserva update(
        @PathVariable String id,
        @Valid @RequestBody Reserva reserva){
            
        return reservaService.updateById(id, reserva);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id){
        reservaService.deleteById(id);
    }
}
