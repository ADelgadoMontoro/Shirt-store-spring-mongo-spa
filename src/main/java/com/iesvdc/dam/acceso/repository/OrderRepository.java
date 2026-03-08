package com.iesvdc.dam.acceso.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.iesvdc.dam.acceso.model.Order;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUser_UserId(String userId);

    List<Order> findByCreatedAtBetween(Instant from, Instant to);
}
