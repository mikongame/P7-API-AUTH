import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al listar usuarios", error: error.message });
  }
});


router.put("/:id/role", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido. Valores permitidos: 'user' | 'admin'." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.role = role;
    await user.save();

    res.json({
      message: "Rol actualizado",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar rol", error: error.message });
  }
});


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole !== "admin" && requesterId !== id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
  }
});

export default router;
