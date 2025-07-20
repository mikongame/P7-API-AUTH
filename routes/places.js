import express from "express";
import Place from "../models/Place.js";
import Experience from "../models/Experience.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const places = await Place.find().populate("experiences");
  res.json(places);
});

router.get("/:id", async (req, res) => {
  const place = await Place.findById(req.params.id).populate("experiences");
  if (!place) return res.status(404).json({ message: "Lugar no encontrado" });
  res.json(place);
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, location } = req.body;

    const nuevoLugar = await Place.create({
      title,
      description,
      location,
      createdBy: req.user.id
    });

    res.status(201).json(nuevoLugar);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el lugar", error });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { experiences, ...rest } = req.body;
  const updated = await Place.findByIdAndUpdate(req.params.id, rest, { new: true });
  if (!updated) return res.status(404).json({ message: "Lugar no encontrado" });
  res.json(updated);
});

router.delete("/:id", verifyToken, async (req, res) => {
  await Place.findByIdAndDelete(req.params.id);
  res.json({ message: "Lugar eliminado" });
});

export default router;
