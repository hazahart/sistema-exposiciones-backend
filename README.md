# Sistema de Exposiciones — Backend

API REST para la gestión de materias, grupos, equipos y evaluaciones con rúbrica.

## Stack

- Node.js + Express
- Supabase (PostgreSQL)
- JWT (jsonwebtoken + bcryptjs)

## Deploy

API disponible en: https://sistema-exposiciones-backend.onrender.com/api/v1

## Requisitos

- Node.js v18+
- Cuenta en [Supabase](https://supabase.com)

## Instalación

```bash
git clone https://github.com/tu-usuario/sistema-exposiciones-backend.git
cd sistema-exposiciones-backend
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
```

La `SUPABASE_SERVICE_KEY` se obtiene en **Supabase → Settings → API → service_role**.

El `JWT_SECRET` se puede generar con:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Base de datos

Ejecuta los scripts en el SQL Editor de Supabase en este orden:

1. `docs/schema.sql` — crea las tablas
2. `docs/seed.sql` — inserta datos de prueba

Para resetear la base de datos vuelve a ejecutar `schema.sql` y luego `seed.sql`.

## Ejecución

```bash
npm run dev   # Desarrollo
npm start     # Producción
```

El servidor corre en `http://localhost:{PORT}/api/v1`

## Endpoints

| Método | Ruta                          | Descripción                         | Auth | Admin |
|--------|-------------------------------|-------------------------------------|------|-------|
| POST   | `/api/v1/auth/login`          | Login con matrícula y password      | ❌    | ❌     |
| GET    | `/api/v1/materias`            | Listar materias (paginado + filtro) | ✅    | ❌     |
| POST   | `/api/v1/materias`            | Crear materia                       | ✅    | ✅     |
| GET    | `/api/v1/materias/:id`        | Obtener materia                     | ✅    | ❌     |
| PUT    | `/api/v1/materias/:id`        | Actualizar materia                  | ✅    | ✅     |
| DELETE | `/api/v1/materias/:id`        | Eliminar materia                    | ✅    | ✅     |
| GET    | `/api/v1/alumnos`             | Listar alumnos                      | ✅    | ❌     |
| POST   | `/api/v1/alumnos`             | Registrar alumno                    | ✅    | ✅     |
| GET    | `/api/v1/alumnos/:id`         | Obtener alumno                      | ✅    | ❌     |
| PUT    | `/api/v1/alumnos/:id`         | Actualizar alumno                   | ✅    | ✅     |
| DELETE | `/api/v1/alumnos/:id`         | Eliminar alumno                     | ✅    | ✅     |
| GET    | `/api/v1/grupos`              | Listar grupos con alumnos           | ✅    | ❌     |
| POST   | `/api/v1/grupos`              | Crear grupo                         | ✅    | ✅     |
| GET    | `/api/v1/grupos/:id`          | Obtener grupo                       | ✅    | ❌     |
| PUT    | `/api/v1/grupos/:id`          | Actualizar grupo                    | ✅    | ✅     |
| DELETE | `/api/v1/grupos/:id`          | Eliminar grupo                      | ✅    | ✅     |
| POST   | `/api/v1/grupos/:id/alumnos`  | Inscribir alumno a grupo            | ✅    | ✅     |
| DELETE | `/api/v1/grupos/:id/alumnos`  | Remover alumno de grupo             | ✅    | ✅     |
| GET    | `/api/v1/equipos`             | Listar equipos con integrantes      | ✅    | ❌     |
| POST   | `/api/v1/equipos`             | Crear equipo                        | ✅    | ✅     |
| GET    | `/api/v1/equipos/:id`         | Obtener equipo                      | ✅    | ❌     |
| PUT    | `/api/v1/equipos/:id`         | Actualizar equipo                   | ✅    | ✅     |
| DELETE | `/api/v1/equipos/:id`         | Eliminar equipo                     | ✅    | ✅     |
| POST   | `/api/v1/equipos/:id/alumnos` | Asignar alumno a equipo             | ✅    | ✅     |
| DELETE | `/api/v1/equipos/:id/alumnos` | Remover alumno de equipo            | ✅    | ✅     |
| GET    | `/api/v1/exposiciones`        | Listar exposiciones con estado      | ✅    | ❌     |
| POST   | `/api/v1/exposiciones`        | Programar exposición                | ✅    | ✅     |
| GET    | `/api/v1/exposiciones/:id`    | Obtener exposición                  | ✅    | ❌     |
| PUT    | `/api/v1/exposiciones/:id`    | Actualizar exposición               | ✅    | ✅     |
| DELETE | `/api/v1/exposiciones/:id`    | Eliminar exposición                 | ✅    | ✅     |
| GET    | `/api/v1/criterios`           | Listar criterios                    | ✅    | ❌     |
| POST   | `/api/v1/criterios`           | Crear criterio                      | ✅    | ✅     |
| GET    | `/api/v1/criterios/:id`       | Obtener criterio                    | ✅    | ❌     |
| PUT    | `/api/v1/criterios/:id`       | Actualizar criterio                 | ✅    | ✅     |
| DELETE | `/api/v1/criterios/:id`       | Eliminar criterio                   | ✅    | ✅     |
| GET    | `/api/v1/evaluaciones`        | Listar evaluaciones                 | ✅    | ❌     |
| POST   | `/api/v1/evaluaciones`        | Registrar evaluación                | ✅    | ❌     |
| GET    | `/api/v1/evaluaciones/:id`    | Obtener evaluación                  | ✅    | ❌     |
| DELETE | `/api/v1/evaluaciones/:id`    | Eliminar evaluación                 | ✅    | ✅     |

## Roles

| Rol      | Descripción                                                  |
|----------|--------------------------------------------------------------|
| `admin`  | Acceso total — CRUD completo en todos los recursos           |
| `alumno` | Solo lectura + registrar evaluaciones de exposiciones ajenas |

## Reglas de negocio

- Un alumno no puede evaluar una exposición de su propio equipo
- Un alumno solo puede evaluar una vez cada exposición (409 en duplicado)
- El campo `estado` en exposiciones indica: `propia`, `evaluada` o `pendiente` según el alumno autenticado
- La `calificacion_final` se calcula automáticamente ponderando cada criterio por su `peso_porcentaje`

## Especificación OpenAPI

El contrato de la API está en `docs/openapi.yaml`.

## Estructura del proyecto

```
src/
├── config/          # Cliente de Supabase
├── controllers/     # Lógica de negocio por recurso
├── middlewares/     # auth, isAdmin, errorHandler
├── routes/          # Definición de rutas
└── validators/      # Validaciones
docs/
├── openapi.yaml     # Especificación OpenAPI v2
├── schema.sql       # Schema de base de datos
└── seed.sql         # Datos de prueba
index.js             # Entry point
```