package com.iesvdc.dam.acceso.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.iesvdc.dam.acceso.model.Shirt;
import com.iesvdc.dam.acceso.model.enums.Gender;
import com.iesvdc.dam.acceso.model.enums.ShirtSize;

import com.iesvdc.dam.acceso.repository.ShirtRepository;
import com.iesvdc.dam.acceso.web.BadRequestException;
import com.iesvdc.dam.acceso.web.NotFoundException;

@Service
public class ShirtService {

    @Autowired
    ShirtRepository shirtRepository;

    public List<Shirt> findAll(){
        return shirtRepository.findAll();
    }

    public Optional<Shirt> findById(String id){
        return shirtRepository.findById(id);
    }

    public Shirt findRequiredById(String id) {
        if (id == null || id.isBlank()) {
            throw new BadRequestException("El id de camiseta es obligatorio");
        }
        return findById(id)
            .orElseThrow(() -> new NotFoundException("Camiseta no encontrada: " + id));
    }

    public List<Shirt> findByFilters(
        ShirtSize size,
        Gender gender,
        String brand,
        Double minPrice,
        Double maxPrice,
        Boolean active
    ) {
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new BadRequestException("minPrice no puede ser mayor que maxPrice");
        }

        List<Shirt> all = shirtRepository.findAll();
        List<Shirt> result = new ArrayList<>();
        String brandNormalized = null;
        if (brand != null && !brand.isBlank()) {
            brandNormalized = brand.trim().toLowerCase();
        }

        for (Shirt s : all) {
            if (size != null && !size.equals(s.getSize())) {
                continue;
            }
            if (gender != null && !gender.equals(s.getGender())) {
                continue;
            }
            if (brandNormalized != null) {
                if (s.getBrand() == null || !s.getBrand().toLowerCase().contains(brandNormalized)) {
                    continue;
                }
            }
            if (minPrice != null) {
                if (s.getPrice() == null || s.getPrice().doubleValue() < minPrice) {
                    continue;
                }
            }
            if (maxPrice != null) {
                if (s.getPrice() == null || s.getPrice().doubleValue() > maxPrice) {
                    continue;
                }
            }
            if (active != null && !active.equals(s.getActive())) {
                continue;
            }
            result.add(s);
        }

        return result;
    }
    
    public Shirt save(Shirt shirt){
        if (shirt == null) {
            throw new BadRequestException("La camiseta es obligatoria");
        }
        if (shirt.getId()==null || shirt.getId().length()<5) {
            shirt.setId(null);
        }
        return shirtRepository.save(shirt);
    }
    public void deleteById(String id){
        if (findById(id).isPresent()){
            shirtRepository.deleteById(id);
        }else{
            throw new NotFoundException("Camiseta no encontrada: " + id);
        }
    }
    public Shirt updateById(String id, Shirt shirt){
        if (shirt == null) {
            throw new BadRequestException("La camiseta es obligatoria");
        }
        Optional<Shirt> oShirt = findById(id);
        if (oShirt.isPresent()) {
            shirt.setId(id);
            return shirtRepository.save(shirt);
        }else{
            throw new NotFoundException("Camiseta no encontrada: " + id);
        }
    }
    public Shirt updateById(Shirt oldShirt, Shirt shirt){
        if (oldShirt == null || oldShirt.getId() == null || oldShirt.getId().isBlank()) {
            throw new BadRequestException("La camiseta original con ID es obligatoria");
        }
        return updateById(oldShirt.getId(), shirt);
    }
}
/*
Aquí he añadido comprobaciones para que no me vengan valores nulos
*/
