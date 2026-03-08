package com.iesvdc.dam.acceso.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @NotNull(message = "createdAt is required")
    private Instant createdAt;

    @NotNull(message = "user is required")
    @Valid
    private OrderUserSnapshot user;

    @NotEmpty(message = "items must contain at least one shirt")
    @Valid
    private List<OrderItem> items;

    @NotNull(message = "total is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "total must be greater than 0")
    private BigDecimal total;
}
