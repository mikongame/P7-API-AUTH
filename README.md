EscapUrbis Backend – API REST AUTH con Roles
Backend del proyecto EscapUrbis, una app que permite descubrir lugares urbanos en Barcelona a través de retos tipo escape room.

Este backend implementa:

Control de usuarios y roles (user y admin)

CRUD completo de Places (lugares) y Experiences (retos)

Autenticación segura con JWT

Relaciones entre modelos

🔧 Stack Tecnológico
Node.js + Express

MongoDB Atlas + Mongoose

JWT (jsonwebtoken) + bcrypt

dotenv, cors, readline

📁 Modelos
Modelo	Descripción
User	Usuarios registrados con rol (user o admin)
Place	Lugar físico con title, description, location, y createdBy (referencia a User)
Experience	Reto vinculado a un Place. Puede ser de tipo riddle, qr, gps, etc.

🔐 Roles y permisos
Acción	user	admin
Ver lugares y retos	✅	✅
Crear lugar o experiencia	✅	✅
Ver todos los usuarios	❌	✅
Cambiar rol de usuario	❌	✅
Eliminar usuario	✅ (solo el suyo)	✅ (cualquiera)

🧪 Endpoints principales
🔐 Autenticación (/auth)
Método	Ruta	Descripción
POST	/register	Registro como user
POST	/login	Login y obtención de token

👥 Usuarios (/users)
Método	Ruta	Descripción
GET	/users	Listar todos los usuarios (solo admin)
PUT	/users/:id/role	Cambiar rol (solo admin)
DELETE	/users/:id	Eliminar usuario (admin o uno mismo)

📍 Lugares (/places)
Método	Ruta	Descripción
GET	/places	Ver todos los lugares
POST	/places	Crear nuevo lugar (requiere token)
PUT	/places/:id	Editar lugar (requiere token)
DELETE	/places/:id	Eliminar lugar (requiere token)

🧩 Experiencias (/experiences)
Método	Ruta	Descripción
GET	/experiences	Ver todas las experiencias
POST	/experiences	Crear experiencia (requiere token)
PUT	/experiences/:id	Editar experiencia
DELETE	/experiences/:id	Eliminar experiencia

⚙️ Comandos
bash
Copiar
Editar
npm install       # Instalar dependencias
npm run dev       # Iniciar servidor con nodemon
node seed.js      # Semilla con admin + lugares y experiencias
🌱 Semilla (seed.js)
Permite insertar:

Un usuario admin inicial (admin@escapurbis.com / admin123)

Lugares y experiencias predeterminados

O bien crear tus propios datos desde consola

🌍 Conexión MongoDB Atlas
Acceso abierto (0.0.0.0/0)

.env incluido para evaluación (usuario temporal)

URI de conexión se lee desde process.env.MONGO_URI

⚠️ Seguridad
Este proyecto contiene credenciales solo para evaluación.
No se deben subir .env a producción ni incluir contraseñas reales en repos públicos.