import express from "express";
import Place from "../models/Place.js";
import Experience from "../models/Experience.js";
import User from "../models/User.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

const isOwnerOrAdmin = (req, ownerId) =>
  req.user.role === "admin" || ownerId?.toString() === req.user.id;

router.get("/", async (_req, res) => {
  try {
    const places = await Place.find()
      .populate("experiences")
      .populate("createdBy", "username role");
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener lugares" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate("experiences")
      .populate("createdBy", "username role");
    if (!place) return res.status(404).json({ message: "Lugar no encontrado" });
    res.json(place);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el lugar" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, location } = req.body ?? {};
    if (!title) {
      return res.status(400).json({ message: "title es obligatorio" });
    }

    const nuevoLugar = await Place.create({
      title: String(title).trim(),
      description: description?.trim(),
      location: location?.trim(),
      createdBy: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { places: nuevoLugar._id },
    });

    const populated = await Place.findById(nuevoLugar._id)
      .populate("experiences")
      .populate("createdBy", "username role");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el lugar" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Lugar no encontrado" });

    if (!isOwnerOrAdmin(req, place.createdBy)) {
      return res.status(403).json({ message: "No autorizado para editar" });
    }

    const { experiences, createdBy, ...rest } = req.body ?? {};

    const updated = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: rest },
      { new: true, runValidators: true }
    )
      .populate("experiences")
      .populate("createdBy", "username role");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el lugar" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Lugar no encontrado" });

    if (!isOwnerOrAdmin(req, place.createdBy)) {
      return res.status(403).json({ message: "No autorizado para eliminar" });
    }

    const exps = await Experience.find({ place: place._id }, "_id createdBy");
    const expIds = exps.map((e) => e._id);

    await Experience.deleteMany({ _id: { $in: expIds } });

    if (expIds.length > 0) {
      await User.updateMany(
        { experiences: { $in: expIds } },
        { $pull: { experiences: { $in: expIds } } }
      );
    }

    await User.findByIdAndUpdate(place.createdBy, {
      $pull: { places: place._id },
    });

    await Place.findByIdAndDelete(place._id);

    res.json({ message: "Lugar y experiencias asociadas eliminados" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el lugar" });
  }
});

export default router;
