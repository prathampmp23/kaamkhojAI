require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./Config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Connect to MongoDB ---
connectDB();

// allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",            // Vite dev
  "https://kaamkhojai.onrender.com",  // Production frontend 
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // For non-browser clients (like curl, Postman) origin can be undefined
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Multer Setup for Audio Uploads ---
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/jobs", jobRoutes);

// --- Health check route (optional but useful on Render) ---
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running.." });
});

// Serve frontend build
app.use(express.static(path.join(__dirname, "client/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
