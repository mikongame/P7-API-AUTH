import User from "../models/User.js";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en variables de entorno");
}

const generateToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email y password son obligatorios" });
    }

    const normEmail = String(email).trim().toLowerCase();
    const normUsername = String(username).trim();

    if (normUsername.length < 2) {
      return res
        .status(400)
        .json({ message: "El nombre de usuario es demasiado corto" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existing = await User.findOne({ email: normEmail });
    if (existing) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const newUser = await User.create({
      username: normUsername,
      email: normEmail,
      password,
      role: "user",
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: { id: newUser._id, username: newUser.username, role: newUser.role },
      token,
    });
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ message: "Error al registrar" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email y password son obligatorios" });
    }

    const normEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normEmail });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = generateToken(user);
    return res.json({
      message: "Login correcto",
      user: { id: user._id, username: user.username, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en login" });
  }
};
