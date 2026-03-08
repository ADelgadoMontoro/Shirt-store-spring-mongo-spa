package com.iesvdc.dam.acceso.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class OrderUserSnapshot {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "nombre is required")
    private String nombre;

    @NotBlank(message = "email is required")
    @Email(message = "email is not valid")
    private String email;
}
