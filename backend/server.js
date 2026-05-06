const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");
const http = require("http");
const { Server } = require("socket.io");

// Load Environment Variables
dotenv.config();

// --- Prisma Client ---
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// --- EXPRESS APP ---
const app = express();
const server = http.createServer(app);

// ======================
// CORS CONFIGURATION
// ======================
app.use(
  cors({
    origin: true,
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
  })
);

// ======================
// SOCKET.IO SETUP
// ======================
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ======================
// CORE MIDDLEWARE
// ======================
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

// Inject Prisma into Request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// ======================
// ROUTES IMPORT
// ======================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const deliveryCarRoutes = require("./routes/deliveryCarRoutes");
const adminRoutes = require("./routes/adminRoutes");
const extraRoutes = require("./routes/extra.routes");

// ======================
// HEALTH CHECK ENDPOINT
// ======================
app.get("/api/health", async (req, res) => {
  try {
    await req.prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

// ======================
// TEMPORARY MIGRATION ENDPOINT (ONE-TIME USE)
// ======================
// TEMPORARY MIGRATION ENDPOINT (ONE-TIME USE)
app.get("/api/migrate", async (req, res) => {
  const { secret } = req.query;
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const results = [];

    // 1. Check if column "images" exists and rename to "image" if it does
    const checkColumn = await req.prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Product' AND column_name='images'
    `;

    if (checkColumn.length > 0) {
      await req.prisma.$executeRaw`ALTER TABLE "Product" RENAME COLUMN "images" TO "image"`;
      results.push("Renamed column 'images' to 'image'.");
    } else {
      // 2. If "image" doesn't exist, create it (fallback)
      const checkImage = await req.prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='Product' AND column_name='image'
      `;
      if (checkImage.length === 0) {
        await req.prisma.$executeRaw`ALTER TABLE "Product" ADD COLUMN "image" TEXT`;
        results.push("Added missing column 'image'.");
      } else {
        results.push("Column 'image' already exists.");
      }
    }

    // 3. Regenerate Prisma Client (to ensure it matches schema)
    const { exec } = require("child_process");
    exec("npx prisma generate", (err, stdout, stderr) => {
      if (err) {
        console.error("Prisma generate error:", stderr);
        results.push("Prisma generate failed: " + stderr);
      } else {
        results.push("Prisma client regenerated.");
      }

      res.json({
        success: true,
        actions: results,
        output: stdout || "see actions",
      });
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("API is working... (Version: 2.5.0)");
});

// ======================
// API ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/delivery/cars", deliveryCarRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/extra", extraRoutes);

// ======================
// ERROR HANDLING
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  if (err.message && err.message.includes("Timed out fetching a new connection from the connection pool")) {
    console.error("🚨 RENDER CONNECTION POOL ERROR!");
    return res.status(503).json({
      success: false,
      message: "Database connection pool exhausted. Add ?connection_limit=3 to DATABASE_URL.",
      details: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Serverda xatolik yuz berdi",
  });
});

// ======================
// SERVER STARTUP
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database bilan ulanish muvaffaqiyatli");

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server ${PORT}-portda ishga tushdi (Available on network)`);
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
    console.error("❌ Database bilan ulanishda xatolik");
    console.error("Error message:", error.message);
    process.exit(1);
  }
};

startServer();