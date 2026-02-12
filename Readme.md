# Shirt Store SPA - Spring Boot + MongoDB

Proyecto de aprendizaje para evolucionar una app REST + SPA hacia una **tienda de camisetas**.

## Objetivo
Construir una tienda online con:
- Catálogo de camisetas.
- Login de usuarios.
- Carrito de compra.
- Gestión de pedidos en iteraciones posteriores.

## Stack
- Backend: Spring Boot 3, Spring Web, Spring Data MongoDB, Validation.
- Base de datos: MongoDB.
- Frontend: HTML, Bootstrap, jQuery (SPA ligera sin build tools).

## Estado actual
La base del proyecto ya incluye arquitectura cliente-servidor, API REST y SPA funcional. Estamos adaptándolo del dominio de reservas al dominio e-commerce.

## Roadmap de aprendizaje
1. Crear módulo de camisetas (modelo, repositorio, servicio, controller).
2. Añadir pestaña `Camisetas` en la SPA y listar productos.
3. Implementar autenticación/login.
4. Implementar carrito (añadir, quitar, vaciar, total).
5. Conectar checkout/pedidos.

## Changelog
El historial de cambios del proyecto se registra en `CHANGELOG.md`.

## Ejecución local
1. Configura MongoDB y variables de entorno usadas en `application.yml`.
2. Arranca la app:L

```bash
./mvnw spring-boot:run
```

3. Abre:

```text
http://localhost:8080
```
