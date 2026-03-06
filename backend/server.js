const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");
const http = require("http"); // 👈 NEW: import http
const { Server } = require("socket.io"); // 👈 NEW: import socket.io

// Load Environment Variables
dotenv.config();

// --- Prisma Client ---
const prisma = new PrismaClient();

// --- EXPRESS APP ---
const app = express();
const server = http.createServer(app); // 👈 NEW: create HTTP server

// ======================
// 🔥 CORS CONFIGURATION (unchanged)
// ======================
const rawOrigins =
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175 , http://192.168.1.9:5173 , ";
const allowedOrigins = rawOrigins.split(/[ ,]+/).map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Accept-Language",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

// ======================
// SOCKET.IO SETUP
// ======================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // reuse your allowed origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available in request object (so controllers can emit)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Optional: listen for socket connections (for debugging)
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ======================
// CORE MIDDLEWARE (unchanged)
// ======================
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files (Images)
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

// Inject Prisma into Request (unchanged)
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// ======================
// ROUTES IMPORT (unchanged)
// ======================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const deliveryCarRoutes = require("./routes/deliveryCarRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Test route (unchanged)
app.get("/", (req, res) => {
  res.send("API is working...");
});

// ======================
// API ROUTES (unchanged)
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/delivery/cars", deliveryCarRoutes);
app.use("/api/admin", adminRoutes);

// ======================
// ERROR HANDLING (unchanged)
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Serverda xatolik yuz berdi",
  });
});

// ======================
// SERVER STARTUP (modified)
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL bilan ulanish muvaffaqiyatli");

    // Use server.listen instead of app.listen
    server.listen(PORT, () => {
      console.log(`✅ Server ${PORT}-portda ishga tushdi (Socket.io ready)`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} allaqachon ishlatilmoqda`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error("❌ DB bilan ulanishda xatolik:", error.message);
    process.exit(1);
  }
};

startServer();
