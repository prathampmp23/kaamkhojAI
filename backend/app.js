require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const connectDB = require("./Config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const mongoose = require("mongoose");

// --- Service Initialization ---

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
connectDB();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Multer Setup for Audio Uploads ---
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});


const geminiRoutes = require("./routes/geminiRoutes");
const voiceRoutes = require("./routes/voiceRoutes");

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/jobs", jobRoutes);

// --- Static File Serving for Production ---
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// --- Catch-All Route ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// --- Server Initialization ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
