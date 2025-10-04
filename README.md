🧠 Inventory Backend — Reto Técnico MR Recluta
<p align="center"> <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="100" alt="Nest Logo" /></a> </p> <p align="center"> <b>API Backend desarrollada con NestJS + TypeScript + PostgreSQL</b><br/> Cumple con autenticación JWT, roles RBAC, auditoría, idempotencia, control de concurrencia, pruebas automatizadas y prueba de carga. </p>

🚀 Descripción General

Este proyecto implementa un backend modular, escalable y seguro para un sistema de inventarios, desarrollado en NestJS + TypeScript, usando PostgreSQL como base de datos y TypeORM como ORM.

Está diseñado para correr localmente y preparado para despliegue en AWS (API Gateway + Lambda o EC2).

🧩 Características principales
🔐 Autenticación y roles (RBAC)

JWT (/auth/login) con roles:

admin: gestiona todo

operator: crea, edita y consulta

viewer: solo lectura

Decoradores @Roles() y @Public()

Guards globales JwtAuthGuard y RolesGuard

📦 Gestión de Productos

CRUD completo con búsqueda, filtros, ordenamiento y paginación en servidor

Validaciones con class-validator y ValidationPipe

Importar y exportar CSV con validación y reporte de errores

🧾 Auditoría

Registro automático de operaciones (create, update, delete)

Guarda usuario, acción, entidad, antes/después del cambio

Consultable por administrador (/audit)

🌀 Idempotencia

Header Idempotency-Key para evitar duplicaciones en peticiones POST

Resultados cacheados en tabla idempotency_keys

🔄 Control de Concurrencia

Implementado con @VersionColumn() (TypeORM)

Uso de headers ETag e If-Match

Devuelve 409 Conflict si otro usuario actualizó el registro

🧱 Migraciones

Migraciones automáticas con Liquibase

Sincronización entre entorno local y test (inventory_test)

🧪 Pruebas

Unitarias: Services y Controllers con mocks (Jest)

Integración: API + BD con TypeORM

E2E: flujo completo (login → CRUD → export CSV)

Swagger/OpenAPI: /api/docs

⚡ Prueba de Carga (Autocannon)

Se ejecutó un test de rendimiento con el flujo:

Login (admin)

Carga de 100 requests/seg a /products por 2 minutos

📊 Resultados promedio:

100 req/s estables

Latencia media: <10 ms

Errores: 0

Throughput: ~1.2 MB/s

Resultados guardados en load-test-result.json

🧠 Stack Tecnológico
| Tecnología           | Uso                        |
| -------------------- | -------------------------- |
| **NestJS**           | Framework principal        |
| **TypeScript**       | Tipado estático            |
| **PostgreSQL**       | Base de datos relacional   |
| **TypeORM**          | ORM y control de entidades |
| **Liquibase**        | Migraciones de esquema     |
| **JWT + Guards**     | Autenticación y roles      |
| **Helmet / CORS**    | Seguridad HTTP             |
| **Jest + Supertest** | Pruebas unitarias y E2E    |
| **Autocannon**       | Prueba de carga            |


🧰 Instalación y ejecución
# Instalar dependencias
npm install

# Correr entorno de desarrollo
npm run start:dev

# Correr pruebas unitarias e integración
npm run test

# Correr pruebas E2E
npm run test:e2e

# Generar cobertura
npm run test:cov

📘 Documentación

Swagger/OpenAPI disponible en:

http://localhost:3000/api/docs

📊 Prueba de Carga

Para ejecutar la prueba de carga:

node src/test/load-test.js


Resultados generados en:

load-test-result.json

👤 Autor

Sebastián Mendoza
Desarrollador FullStack
💻 Proyecto Reto Técnico MR Recluta