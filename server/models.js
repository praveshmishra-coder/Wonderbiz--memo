const mongoose = require("mongoose");

// ── Memory ────────────────────────────────────────────────────────────────────
const memorySchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author:  { type: String, required: true, trim: true },
    emoji:   { type: String, default: "💭" },
    likes:   { type: Number, default: 0 },
    likedBy: [{ type: String }],
  },
  { timestamps: true }
);

// ── Team Photo ────────────────────────────────────────────────────────────────
const photoSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url:      { type: String, required: true },
    caption:  { type: String, default: "" },
    author:   { type: String, default: "Anonymous" },
  },
  { timestamps: true }
);

// ── Team Video ────────────────────────────────────────────────────────────────
const videoSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url:      { type: String, required: true },
    title:    { type: String, default: "Team Video" },
    author:   { type: String, default: "Anonymous" },
  },
  { timestamps: true }
);

// ── Feedback ──────────────────────────────────────────────────────────────────
const feedbackSchema = new mongoose.Schema(
  {
    author:  { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating:  { type: Number, default: 5, min: 1, max: 5 },
    role:    { type: String, default: "Team Member" },
  },
  { timestamps: true }
);

// Helper: convert Mongoose doc to plain JSON with `id` field
const toJSON = (doc) => {
  const obj = doc.toObject({ virtuals: true });
  obj.id = obj._id.toString();
  obj.createdAt = obj.createdAt?.toISOString?.() ?? obj.createdAt;
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = {
  Memory:   mongoose.model("Memory",   memorySchema),
  Photo:    mongoose.model("Photo",    photoSchema),
  Video:    mongoose.model("Video",    videoSchema),
  Feedback: mongoose.model("Feedback", feedbackSchema),
  toJSON,
};
