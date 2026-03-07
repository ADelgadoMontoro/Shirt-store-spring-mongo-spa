# Shirt Store SPA - Spring Boot + MongoDB

Proyecto de aprendizaje para evolucionar una app REST + SPA hacia una **tienda de camisetas**.

## Objetivo
Aunque sea un proyecto de aprendizaje, el objetivo es implementar una base **completa** de backend y frontend:
- Catálogo de camisetas.
- Login de usuarios.
- Carrito de compra.
- Gestión de pedidos en iteraciones posteriores.
- API REST con todos los endpoints necesarios para operar el dominio.
- Servicios con todos los métodos de negocio necesarios (sin dejar “huecos”).

## Stack
- Backend: Spring Boot 3, Spring Web, Spring Data MongoDB, Validation.
- Base de datos: MongoDB.
- Frontend: HTML, Bootstrap, jQuery (SPA ligera sin build tools).

## Estado actual
La base del proyecto ya incluye arquitectura cliente-servidor, API REST y SPA funcional. Estamos adaptándolo del dominio de reservas al dominio e-commerce.

## API mínima obligatoria (fase camisetas)
Endpoints que deben existir:
- `GET /api/shirts` listar camisetas.
- `GET /api/shirts/{id}` obtener camiseta por id.
- `POST /api/shirts` crear camiseta.
- `PUT /api/shirts/{id}` actualizar camiseta completa.
- `DELETE /api/shirts/{id}` eliminar camiseta.

Servicios/métodos necesarios:
- `findAll()`
- `findById(id)`
- `save(shirt)`
- `updateById(id, shirt)`
- `deleteById(id)`

Repositorio mínimo:
- `MongoRepository<Shirt, String>` y, si hace falta, búsquedas por filtros (`size`, `gender`, `brand`, `price`).

## Próximas fases
1. Completar módulo `Shirt` (modelo, repositorio, servicio, controller, validaciones y manejo de errores).
2. Añadir pestaña `Camisetas` en la SPA y consumir la API.
3. Implementar autenticación/login.
4. Implementar carrito (añadir, quitar, vaciar, total).
5. Conectar pedidos/checkout.

## Changelog
El historial de cambios del proyecto se registra en `CHANGELOG.md`.

## Ejecución local
1. Configura MongoDB y variables de entorno usadas en `application.yml`.
2. Arranca la app:

```bash
./mvnw spring-boot:run
```

3. Abre:

```text
http://localhost:8080
```
