import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 500 },
    type: { type: String, enum: ["riddle", "qr", "gps", "photo"], required: true },
    solution: { type: String, required: true, trim: true, maxlength: 200 },
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; } },
    toObject: { transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; } },
  }
);

// Índice compuesto eficaz para consultas por propietario y lugar
experienceSchema.index({ createdBy: 1, place: 1 });

export default mongoose.model("Experience", experienceSchema);
