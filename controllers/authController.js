import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Validación en tiempo de ejecución, no al importar
    throw new Error("JWT_SECRET no está definido en variables de entorno");
  }
  return secret;
};

const generateToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, getJwtSecret(), {
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
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existing = await User.findOne({ email: normEmail });
    if (existing) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // ✅ Opción A (recomendada): dejar que el modelo hashee en pre('save')
    // const newUser = await User.create({ username: normUsername, email: normEmail, password, role: "user" });

    // ✅ Opción B: hashear aquí (si tu modelo no lo hace)
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: normUsername,
      email: normEmail,
      password: hashed,
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

    // 🔒 Unifica respuesta para no revelar si el email existe
    const invalidMsg = "Credenciales inválidas";

    if (!user) {
      return res.status(401).json({ message: invalidMsg });
    }

    // Si tu modelo tiene user.comparePassword, úsalo:
    // const isMatch = await user.comparePassword(password);
    // Si no, compara con bcrypt:
    const isMatch = await bcrypt.compare(String(password), user.password);

    if (!isMatch) {
      return res.status(401).json({ message: invalidMsg });
    }

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
