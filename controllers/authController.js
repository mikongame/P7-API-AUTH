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

// register: NO hashees aquí; deja que el modelo lo haga en pre('save')
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email y password son obligatorios" });
    }

    const normEmail = String(email).trim().toLowerCase();
    const normUsername = String(username).trim();

    if (normUsername.length < 2) {
      return res.status(400).json({ message: "El nombre de usuario es demasiado corto" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Comprobar también username para devolver 409 coherente
    const existing = await User.findOne({ $or: [{ email: normEmail }, { username: normUsername }] });
    if (existing) {
      return res.status(409).json({ message: "Email o username ya registrados" });
    }

    const newUser = await User.create({
      username: normUsername,
      email: normEmail,
      password, // ← raw, lo hashea el pre('save') del modelo
      role: "user",
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: { id: newUser._id, username: newUser.username, role: newUser.role },
      token,
    });
  } catch (error) {
    // Manejo elegante de duplicados únicos (por si se cuela)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email o username ya registrados" });
    }
    console.error("Error en register:", error);
    return res.status(500).json({ message: "Error al registrar" });
  }
};

// login: seleccionar password y usar comparePassword del modelo
export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "email y password son obligatorios" });
    }

    const normEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normEmail }).select("+password"); // <-- clave

    const invalidMsg = "Credenciales inválidas";
    if (!user) return res.status(401).json({ message: invalidMsg });

    const isMatch = await user.comparePassword(String(password)); // <-- usa método del modelo
    if (!isMatch) return res.status(401).json({ message: invalidMsg });

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
