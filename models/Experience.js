import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["riddle", "qr", "gps", "photo"],
      required: true,
    },
    solution: { type: String, required: true, trim: true },

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

experienceSchema.index({ createdBy: 1, place: 1 });

export default mongoose.model("Experience", experienceSchema);
