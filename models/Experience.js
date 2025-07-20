import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { 
    type: String,
    enum: ["riddle", "qr", "gps", "photo"], 
    required: true
  },
  solution: { type: String, required: true },
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true }
}, {
  timestamps: true
});

export default mongoose.model("Experience", experienceSchema);
