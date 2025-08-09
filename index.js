import "dotenv/config";            // más simple que dotenv.config()
import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import placeRoutes from "./routes/places.js";
import experienceRoutes from "./routes/experiences.js";

const { MONGO_URI, JWT_SECRET, PORT = 3000, CLIENT_ORIGIN = "*" } = process.env;

if (!MONGO_URI) {
  console.error("❌ Falta la variable MONGO_URI en el .env");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ Falta la variable JWT_SECRET en el .env");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST", "PUT", "DELETE"] }
});

// Middlewares
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/places", placeRoutes);
app.use("/experiences", experienceRoutes);

// 404 explícito
app.use((req, res, next) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador de errores (Express 5)
app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error interno" });
});

// Socket.IO (si no lo usas aún, puedes dejarlo)
io.on("connection", (socket) => {
  console.log("🔌 Usuario conectado");
  socket.on("disconnect", () => console.log("❌ Usuario desconectado"));
  socket.on("new-task", (data) => {
    console.log("📩 Nueva tarea recibida por socket:", data);
    io.emit("task-added", data);
  });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    server.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error de conexión a MongoDB:", err);
    process.exit(1);
  }
}

// Apagado limpio
async function shutdown(signal) {
  console.log(`\n🧹 Recibido ${signal}. Cerrando...`);
  try {
    io.close();                     // cierra websockets
    await new Promise((r) => server.close(r)); // deja de aceptar conexiones HTTP
    await mongoose.connection.close();         // cierra pool de Mongo
    console.log("✅ Recursos cerrados. Bye!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error cerrando:", err);
    process.exit(1);
  }
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
