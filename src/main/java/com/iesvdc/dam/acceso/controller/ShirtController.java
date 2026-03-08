package com.iesvdc.dam.acceso.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iesvdc.dam.acceso.model.Shirt;
import com.iesvdc.dam.acceso.model.enums.Gender;
import com.iesvdc.dam.acceso.model.enums.ShirtSize;
import com.iesvdc.dam.acceso.service.ShirtService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;


@RestController
@RequestMapping("/api/shirts")
public class ShirtController {

    private final ShirtService shirtService;
    

    public ShirtController(ShirtService shirtService) {
        this.shirtService = shirtService;
    }

    @GetMapping({"","/"})
    public List<Shirt> findAll(
        @RequestParam(required = false) ShirtSize size,
        @RequestParam(required = false) Gender gender,
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(required = false) Boolean active
    ) {
        if (size == null && gender == null && brand == null && minPrice == null && maxPrice == null && active == null) {
            return shirtService.findAll();
        }
        return shirtService.findByFilters(size, gender, brand, minPrice, maxPrice, active);
    }

    @GetMapping("/{id}")
    public Shirt findById(@PathVariable String id) {
        return shirtService.findRequiredById(id);
    }

    @PostMapping({"","/"})
    @ResponseStatus(HttpStatus.CREATED)
    public Shirt save(
        @Valid
        @RequestBody Shirt shirt) {
         
        return shirtService.save(shirt);
    }
    
    @PutMapping("/{id}")
    public Shirt update(
        @PathVariable String id,
        @Valid @RequestBody Shirt shirt){
        return shirtService.updateById(id, shirt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id){
        shirtService.deleteById(id);
    }
}
