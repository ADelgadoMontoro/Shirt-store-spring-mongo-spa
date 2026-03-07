package com.iesvdc.dam.acceso.model;

import java.math.BigDecimal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.iesvdc.dam.acceso.model.enums.Gender;
import com.iesvdc.dam.acceso.model.enums.ShirtSize;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Document(collection = "shirt")
public class Shirt {
    @Id
    private String id;

    @NotBlank(message = "Name cannot be null")
    @Size(max = 60)
    private String nombre;

    @NotNull(message = "Size cannot be null")
    private ShirtSize size;

    @NotNull(message = "Gender cannot be null")
    private Gender gender;

    @NotBlank(message = "Color cannot be null")
    private String color;

    @NotBlank(message = "Brand cannot be null")
    @Size(max=30)
    private String brand;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stock;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Active status cannot be null")
    private Boolean active;
}   
