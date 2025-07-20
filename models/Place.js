import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String, // opcional, puedes usar barrio, dirección o coordenadas
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }]
});

export default mongoose.model("Place", placeSchema);
