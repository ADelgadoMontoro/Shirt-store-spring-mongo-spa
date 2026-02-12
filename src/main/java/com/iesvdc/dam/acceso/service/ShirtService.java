package com.iesvdc.dam.acceso.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.iesvdc.dam.acceso.model.Shirt;

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