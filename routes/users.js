import express from "express";
import User from "../models/User.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requireAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/:id/role", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.role = role;
    await user.save();

    res.json({ message: "Rol actualizado", user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar rol", error });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  if (requesterRole !== "admin" && requesterId !== req.params.id) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

  res.json({ message: "Usuario eliminado correctamente" });
});

export default router;
