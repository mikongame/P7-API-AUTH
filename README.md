# EscapUrbis Backend – API REST AUTH con Roles y Relaciones Bidireccionales

Backend del proyecto **EscapUrbis**, una app para descubrir lugares urbanos de Barcelona mediante retos tipo escape room.

Incluye:

- **Control de usuarios y roles** (`user` y `admin`)
- **CRUD completo** de `Places` (lugares) y `Experiences` (retos)
- **Autenticación segura** con JWT
- **Relaciones bidireccionales** entre modelos (`User` ↔ `Place`, `User` ↔ `Experience`, `Place` ↔ `Experience`)
- **Autorización** basada en rol y propiedad del recurso
- **Eliminación en cascada** de experiencias al borrar un lugar
- **Sincronización automática** de referencias entre colecciones

---
## Stack Tecnológico
- **Node.js** + **Express**
- **MongoDB Atlas** + **Mongoose**
- **JWT** (`jsonwebtoken`) + **bcrypt**
- **dotenv**, **cors**, **readline**
- **Socket.IO** (placeholder para funciones en tiempo real)

---
## Modelos

| Modelo     | Descripción |
|------------|-------------|
| **User**   | Usuarios registrados con rol (`user` o `admin`), referencias a `places` y `experiences` creados |
| **Place**  | Lugar físico con `title`, `description`, `location`, `createdBy` (referencia a `User`) y array de `experiences` |
| **Experience** | Reto asociado a un `Place` y creado por un `User`. Tipos posibles: `riddle`, `qr`, `gps`, `photo` |

---
## Roles y permisos

| Acción                               | user | admin |
|--------------------------------------|:----:|:-----:|
| Ver lugares y retos                  | ✅  | ✅    |
| Crear lugar o experiencia            | ✅ (solo en recursos propios) | ✅ |
| Editar lugar o experiencia           | ✅ (solo en recursos propios) | ✅ |
| Eliminar lugar o experiencia         | ✅ (solo en recursos propios) | ✅ |
| Ver todos los usuarios               | ❌  | ✅    |
| Cambiar rol de usuario               | ❌  | ✅    |
| Eliminar usuario                     | ✅ (solo el suyo) | ✅ |

---
## Endpoints principales

### Autenticación (`/auth`)
| Método | Ruta       | Descripción                  |
|--------|-----------|------------------------------|
| POST   | `/register` | Registro como `user`        |
| POST   | `/login`    | Login y obtención de token  |

---
### Usuarios (`/users`)
| Método | Ruta             | Descripción                                   |
|--------|-----------------|-----------------------------------------------|
| GET    | `/users`        | Listar todos los usuarios (**solo admin**)    |
| PUT    | `/users/:id/role` | Cambiar rol (**solo admin**)                  |
| DELETE | `/users/:id`    | Eliminar usuario (admin o uno mismo)          |

---
### Lugares (`/places`)
| Método | Ruta            | Descripción                                                            |
|--------|----------------|------------------------------------------------------------------------|
| GET    | `/places`      | Ver todos los lugares                                                  |
| GET    | `/places/:id`  | Ver lugar por ID                                                        |
| POST   | `/places`      | Crear lugar (**token requerido**) – `createdBy` = usuario autenticado   |
| PUT    | `/places/:id`  | Editar lugar (**token requerido**, solo admin o propietario)                                 |
| DELETE | `/places/:id`  | Eliminar lugar (**token requerido**, solo admin o propietario). Borra experiencias asociadas |

---

### Experiencias (`/experiences`)
| Método | Ruta                   | Descripción                                                                 |
|--------|-----------------------|-----------------------------------------------------------------------------|
| GET    | `/experiences`        | Ver todas las experiencias                                                  |
| GET    | `/experiences/:id`    | Ver experiencia por ID                                                       |
| POST   | `/experiences`        | Crear experiencia (**token requerido**, solo admin o propietario del lugar)                      |
| PUT    | `/experiences/:id`    | Editar experiencia (**token requerido**, solo admin o propietario de la experiencia)              |
| DELETE | `/experiences/:id`    | Eliminar experiencia (**token requerido**, solo admin o propietario). Limpia referencias en `User` y `Place` |

---
## Comandos

```bash
npm install
npm run dev
node seed.js
```

### Semilla (seed.js)
Permite insertar:
* Un usuario admin inicial (admin@escapurbis.com / admin123)
* Lugares y experiencias predeterminados

O bien crear tus propios datos desde consola

## Conexión MongoDB Atlas
* Acceso abierto (0.0.0.0/0)
* .env incluido para evaluación (usuario temporal)

## Seguridad
Este proyecto contiene credenciales solo para evaluación.
No se deben subir .env a producción ni incluir contraseñas reales en repos públicos.
