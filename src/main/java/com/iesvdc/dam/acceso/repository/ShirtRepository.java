package com.iesvdc.dam.acceso.repository;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.iesvdc.dam.acceso.model.Shirt;

public interface ShirtRepository extends MongoRepository<Shirt, String>{
    
}
