package com.iesvdc.dam.acceso.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.iesvdc.dam.acceso.model.Order;
import com.iesvdc.dam.acceso.model.OrderItem;
import com.iesvdc.dam.acceso.repository.OrderRepository;
import com.iesvdc.dam.acceso.web.BadRequestException;
import com.iesvdc.dam.acceso.web.NotFoundException;

@Service
public class OrderService {

    @Autowired
    OrderRepository orderRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Optional<Order> findById(String id) {
        return orderRepository.findById(id);
    }

    public List<Order> findByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("El userId es obligatorio");
        }
        return orderRepository.findByUser_UserId(userId);
    }

    public List<Order> findByCreatedAtBetween(Instant from, Instant to) {
        if (from == null || to == null) {
            throw new BadRequestException("from y to son obligatorios");
        }
        if (from.isAfter(to)) {
            throw new BadRequestException("from no puede ser mayor que to");
        }
        return orderRepository.findByCreatedAtBetween(from, to);
    }

    public Order save(Order order) {
        validarPedido(order);

        if (order.getId() == null || order.getId().length() < 5) {
            order.setId(null);
        }
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(Instant.now());
        }

        return orderRepository.save(order);
    }

    public Order updateById(String id, Order order) {
        if (id == null || id.isBlank()) {
            throw new BadRequestException("El id del pedido es obligatorio");
        }
        if (findById(id).isEmpty()) {
            throw new NotFoundException("Pedido no encontrado: " + id);
        }

        validarPedido(order);
        order.setId(id);
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(Instant.now());
        }

        return orderRepository.save(order);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            throw new BadRequestException("El id del pedido es obligatorio");
        }
        if (findById(id).isPresent()) {
            orderRepository.deleteById(id);
        } else {
            throw new NotFoundException("Pedido no encontrado: " + id);
        }
    }

    private void validarPedido(Order order) {
        if (order == null) {
            throw new BadRequestException("El pedido es obligatorio");
        }
        if (order.getUser() == null) {
            throw new BadRequestException("El usuario del pedido es obligatorio");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BadRequestException("El pedido debe tener al menos una camiseta");
        }

        BigDecimal totalCalculado = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            if (item == null) {
                throw new BadRequestException("Las líneas del pedido no pueden ser null");
            }
            if (item.getQuantity() <= 0) {
                throw new BadRequestException("La cantidad debe ser mayor que 0");
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("El precio unitario debe ser mayor que 0");
            }

            BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalCalculado = totalCalculado.add(subtotal);
        }

        if (order.getTotal() == null) {
            order.setTotal(totalCalculado);
        } else if (order.getTotal().compareTo(totalCalculado) != 0) {
            throw new BadRequestException("El total no coincide con la suma de las líneas");
        }
    }
}
