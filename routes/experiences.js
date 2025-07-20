import express from "express";
import Experience from "../models/Experience.js";
import Place from "../models/Place.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const experiences = await Experience.find().populate("place");
  res.json(experiences);
});

router.get("/:id", async (req, res) => {
  const experience = await Experience.findById(req.params.id).populate("place");
  if (!experience) return res.status(404).json({ message: "Experiencia no encontrada" });
  res.json(experience);
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { text, type, solution, placeId } = req.body;

    const experience = await Experience.create({
      text,
      type,
      solution,
      place: placeId
    });

    await Place.findByIdAndUpdate(placeId, {
      $addToSet: { experiences: experience._id }
    });

    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ message: "Error al crear experiencia", error });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Experiencia no encontrada" });
  res.json(updated);
});

router.delete("/:id", verifyToken, async (req, res) => {
  const experience = await Experience.findByIdAndDelete(req.params.id);
  if (experience) {
    await Place.findByIdAndUpdate(experience.place, {
      $pull: { experiences: experience._id }
    });
  }
  res.json({ message: "Experiencia eliminada" });
});

export default router;
