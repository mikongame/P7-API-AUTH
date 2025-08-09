import express from "express";
import Experience from "../models/Experience.js";
import Place from "../models/Place.js";
import User from "../models/User.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
const ALLOWED_TYPES = ["riddle", "qr", "gps", "photo"];

const isOwnerOrAdmin = (req, ownerId) =>
  req.user.role === "admin" || ownerId?.toString() === req.user.id;

router.get("/", async (_req, res) => {
  try {
    const experiences = await Experience.find()
      .populate("place")
      .populate("createdBy", "username role");
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener experiencias" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id)
      .populate("place")
      .populate("createdBy", "username role");
    if (!experience)
      return res.status(404).json({ message: "Experiencia no encontrada" });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la experiencia" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { text, type, solution, placeId } = req.body ?? {};

    if (!text || !type || !solution || !placeId) {
      return res.status(400).json({
        message: "text, type, solution y placeId son obligatorios",
      });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "type no válido" });
    }

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: "Place no encontrado" });
    }

    if (!isOwnerOrAdmin(req, place.createdBy)) {
      return res
        .status(403)
        .json({ message: "No puedes crear experiencias en este lugar" });
    }

    const experience = await Experience.create({
      text: String(text).trim(),
      type,
      solution: String(solution).trim(),
      place: placeId,
      createdBy: req.user.id,
    });

    await Promise.all([
      Place.findByIdAndUpdate(placeId, { $addToSet: { experiences: experience._id } }),
      User.findByIdAndUpdate(req.user.id, { $addToSet: { experiences: experience._id } }),
    ]);

    const populated = await Experience.findById(experience._id)
      .populate("place")
      .populate("createdBy", "username role");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error al crear experiencia" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { place, createdBy, ...rest } = req.body ?? {};

    const experience = await Experience.findById(req.params.id);
    if (!experience)
      return res.status(404).json({ message: "Experiencia no encontrada" });

    if (!isOwnerOrAdmin(req, experience.createdBy)) {
      return res.status(403).json({ message: "No autorizado para editar" });
    }

    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: rest },
      { new: true, runValidators: true }
    )
      .populate("place")
      .populate("createdBy", "username role");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar experiencia" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience)
      return res.status(404).json({ message: "Experiencia no encontrada" });

    if (!isOwnerOrAdmin(req, experience.createdBy)) {
      return res.status(403).json({ message: "No autorizado para eliminar" });
    }

    await Experience.findByIdAndDelete(req.params.id);
    await Promise.all([
      Place.findByIdAndUpdate(experience.place, {
        $pull: { experiences: experience._id },
      }),
      User.findByIdAndUpdate(experience.createdBy, {
        $pull: { experiences: experience._id },
      }),
    ]);

    res.json({ message: "Experiencia eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar experiencia" });
  }
});

export default router;
