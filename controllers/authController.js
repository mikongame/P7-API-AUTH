import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Función para generar token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Registro de usuario (solo rol "user")
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: { id: newUser._id, username: newUser.username, role: newUser.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar", error });
  }
};

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = generateToken(user);
    res.json({
      message: "Login correcto",
      user: { id: user._id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Error en login", error });
  }
};
