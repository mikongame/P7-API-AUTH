import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Ruta para registrar nuevos usuarios (siempre como "user")
router.post("/register", register);

// Ruta para hacer login y obtener token
router.post("/login", login);

export default router;
