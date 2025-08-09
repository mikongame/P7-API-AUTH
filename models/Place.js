import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
      // ❌ Quitamos `index: true` para evitar duplicados
    },

    experiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience"
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

// Índice compuesto o simple, pero definido solo una vez
placeSchema.index({ createdBy: 1 });

export default mongoose.model("Place", placeSchema);
