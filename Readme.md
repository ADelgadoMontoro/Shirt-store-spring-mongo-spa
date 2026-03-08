# ADT06 - Spring REST + MongoDB (Tienda de camisetas, perfil ADMIN)

Proyecto de clase basado en Spring Boot + MongoDB + SPA (HTML/Bootstrap/jQuery) adaptado al dominio de tienda de camisetas.

## 1. Funcionalidades implementadas

### Camisetas (CRUD completo)
- Crear camiseta.
- Listar camisetas.
- Editar camiseta.
- Eliminar camiseta.

### Usuarios (CRUD completo)
- Crear usuario.
- Listar usuarios.
- Editar usuario.
- Eliminar usuario.
- Campo `rol` incluido en el modelo.

### Pedidos (maestro-detalle)
- Crear pedido.
- Listar pedidos.
- Ver detalle de pedido.
- Eliminar pedido.

Modelo documental aplicado:
- Documento maestro: `Order`.
- Detalle embebido: `items` (`OrderItem`).
- Snapshot de usuario embebido: `OrderUserSnapshot`.

## 2. Stack técnico
- Java 21
- Spring Boot 3 (Web, Validation, Data MongoDB)
- MongoDB
- Frontend: HTML + Bootstrap + jQuery
- Maven Wrapper (`mvnw`)

## 3. Estructura relevante
- Backend Java: `src/main/java/com/iesvdc/dam/acceso`
- Frontend SPA: `src/main/resources/static`
- Configuración Spring: `src/main/resources/application*.yml`
- Entorno DevContainer: `.devcontainer/`

## 4. Variables de entorno
Copia `.env.example` a `.env` y ajusta valores:

```bash
cp .env.example .env
```

## 5. Ejecución

### Opción A: Docker (recomendada)
Levantar MongoDB y Mongo Express:

```bash
docker compose -f .devcontainer/docker-compose.yml up -d mongo mongo-express
```

Arrancar Spring Boot en local (PowerShell):

```powershell
$env:SPRING_DATA_MONGODB_URI="mongodb://root:CHANGE_ME_PASSWORD@localhost:27017/reservas_db?authSource=admin"
.\mvnw spring-boot:run
```

Arrancar Spring Boot en local (bash):

```bash
SPRING_DATA_MONGODB_URI="mongodb://root:CHANGE_ME_PASSWORD@localhost:27017/reservas_db?authSource=admin" ./mvnw spring-boot:run
```

### Opción B: DevContainer completo
Abrir el proyecto en VS Code con Dev Containers y lanzar:

```bash
./mvnw spring-boot:run
```

## 6. Acceso
- App web: `http://localhost:8080`
- Mongo Express: `http://localhost:8081`

## 7. Evidencias para la entrega (checklist)
- [ ] Captura CRUD camisetas.
- [ ] Captura CRUD usuarios.
- [ ] Captura creación de pedido.
- [ ] Captura listado + detalle de pedido (maestro-detalle).
- [ ] Breve justificación del modelo documental:
  - [ ] por qué `items` va embebido en `Order`.
  - [ ] por qué no se usa colección separada para líneas de pedido.

## 8. Notas
- El perfil asumido en esta práctica es ADMIN.
- No se implementa autenticación real en esta iteración.
