import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ Falta la variable MONGO_URI en el .env");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err);
    process.exit(1);
  });

// Rutas
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import placeRoutes from "./routes/places.js";
import experienceRoutes from "./routes/experiences.js";

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/places", placeRoutes);
app.use("/experiences", experienceRoutes);

// WebSockets (opcional)
io.on("connection", (socket) => {
  console.log("🔌 Usuario conectado");

  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado");
  });

  socket.on("new-task", (data) => {
    console.log("📩 Nueva tarea recibida por socket:", data);
    io.emit("task-added", data);
  });
});

// Servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
