package com.iesvdc.dam.acceso.model;

import java.math.BigDecimal;

import com.iesvdc.dam.acceso.model.enums.ShirtSize;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class OrderItem {

    @NotBlank(message = "shirtId is required")
    private String shirtId;

    @NotBlank(message = "nombre is required")
    private String nombre;

    @NotNull(message = "size is required")
    private ShirtSize size;

    @NotNull(message = "unitPrice is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "unitPrice must be greater than 0")
    private BigDecimal unitPrice;

    @Min(value = 1, message = "quantity must be at least 1")
    private int quantity;
}
