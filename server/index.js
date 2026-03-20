require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { Memory, Photo, Video, Feedback, toJSON } = require("./models");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MongoDB Connection ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set. Copy .env.example → .env and fill in your Atlas URI.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Upload Directories ────────────────────────────────────────────────────────
["uploads/photos", "uploads/videos"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.mimetype.startsWith("video/") ? "uploads/videos" : "uploads/photos");
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const okExt  = allowed.test(path.extname(file.originalname).toLowerCase());
    const okMime = allowed.test(file.mimetype);
    if (okExt && okMime) return cb(null, true);
    cb(new Error("Only images and videos are allowed"));
  },
});

// ── Helper: async error wrapper ───────────────────────────────────────────────
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// ══════════════════════════════════════════════════════════════════════════════
//  MEMORIES
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/memories", wrap(async (req, res) => {
  const docs = await Memory.find().sort({ createdAt: -1 });
  res.json(docs.map(toJSON));
}));

app.post("/api/memories", wrap(async (req, res) => {
  const { title, content, author, emoji } = req.body;
  if (!title || !content || !author)
    return res.status(400).json({ error: "Title, content, and author are required" });
  const doc = await Memory.create({ title, content, author, emoji: emoji || "💭" });
  res.status(201).json(toJSON(doc));
}));

app.patch("/api/memories/:id/like", wrap(async (req, res) => {
  const { userId } = req.body;
  const doc = await Memory.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Memory not found" });
  if (doc.likedBy.includes(userId)) {
    doc.likes   = Math.max(0, doc.likes - 1);
    doc.likedBy = doc.likedBy.filter((u) => u !== userId);
  } else {
    doc.likes  += 1;
    doc.likedBy.push(userId);
  }
  await doc.save();
  res.json(toJSON(doc));
}));

app.delete("/api/memories/:id", wrap(async (req, res) => {
  const doc = await Memory.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Memory not found" });
  res.json({ success: true });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  PHOTOS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/photos", wrap(async (req, res) => {
  const docs = await Photo.find().sort({ createdAt: -1 });
  res.json(docs.map(toJSON));
}));

app.post("/api/photos", upload.single("photo"), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Photo file is required" });
  const doc = await Photo.create({
    filename: req.file.filename,
    url:      `/uploads/photos/${req.file.filename}`,
    caption:  req.body.caption || "",
    author:   req.body.author  || "Anonymous",
  });
  res.status(201).json(toJSON(doc));
}));

app.delete("/api/photos/:id", wrap(async (req, res) => {
  const doc = await Photo.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Photo not found" });
  const filePath = path.join(__dirname, "uploads/photos", doc.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  VIDEOS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/videos", wrap(async (req, res) => {
  const docs = await Video.find().sort({ createdAt: -1 });
  res.json(docs.map(toJSON));
}));

app.post("/api/videos", upload.single("video"), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Video file is required" });
  const doc = await Video.create({
    filename: req.file.filename,
    url:      `/uploads/videos/${req.file.filename}`,
    title:    req.body.title  || "Team Video",
    author:   req.body.author || "Anonymous",
  });
  res.status(201).json(toJSON(doc));
}));

app.delete("/api/videos/:id", wrap(async (req, res) => {
  const doc = await Video.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Video not found" });
  const filePath = path.join(__dirname, "uploads/videos", doc.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  FEEDBACKS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/feedbacks", wrap(async (req, res) => {
  const docs = await Feedback.find().sort({ createdAt: -1 });
  res.json(docs.map(toJSON));
}));

app.post("/api/feedbacks", wrap(async (req, res) => {
  const { author, message, rating, role } = req.body;
  if (!author || !message)
    return res.status(400).json({ error: "Author and message are required" });
  const doc = await Feedback.create({
    author, message,
    rating: rating || 5,
    role:   role   || "Team Member",
  });
  res.status(201).json(toJSON(doc));
}));

app.delete("/api/feedbacks/:id", wrap(async (req, res) => {
  const doc = await Feedback.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Feedback not found" });
  res.json({ success: true });
}));

// ══════════════════════════════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/stats", wrap(async (req, res) => {
  const [memories, photos, videos, feedbacks] = await Promise.all([
    Memory.countDocuments(),
    Photo.countDocuments(),
    Video.countDocuments(),
    Feedback.countDocuments(),
  ]);
  res.json({ memories, photos, videos, feedbacks });
}));

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Wonderbiz Memories server running on http://localhost:${PORT}`);
});
