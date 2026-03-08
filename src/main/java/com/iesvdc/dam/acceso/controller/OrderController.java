package com.iesvdc.dam.acceso.controller;

import java.time.Instant;
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

import com.iesvdc.dam.acceso.model.Order;
import com.iesvdc.dam.acceso.service.OrderService;
import com.iesvdc.dam.acceso.web.NotFoundException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    OrderService orderService;

    @GetMapping({"","/"})
    public List<Order> findAll() {
        return orderService.findAll();
    }

    @GetMapping("/{id}")
    public Order findById(@PathVariable String id) {
        return orderService.findById(id)
            .orElseThrow(() -> new NotFoundException("Pedido no encontrado: " + id));
    }

    @GetMapping("/user/{userId}")
    public List<Order> findByUserId(@PathVariable String userId) {
        return orderService.findByUserId(userId);
    }

    @GetMapping("/between")
    public List<Order> findByCreatedAtBetween(
        @RequestParam Instant from,
        @RequestParam Instant to
    ) {
        return orderService.findByCreatedAtBetween(from, to);
    }

    @PostMapping({"","/"})
    @ResponseStatus(HttpStatus.CREATED)
    public Order save(@Valid @RequestBody Order order) {
        return orderService.save(order);
    }

    @PutMapping("/{id}")
    public Order update(@PathVariable String id, @Valid @RequestBody Order order) {
        return orderService.updateById(id, order);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        orderService.deleteById(id);
    }
}
