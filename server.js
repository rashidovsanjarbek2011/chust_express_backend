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

// --- Prisma Client with Correct Database URL ---
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
// CORS CONFIGURATION (FULLY FIXED FOR PUBLIC)
// ======================
const allowedOrigins = [
  // Production frontend domains
  "https://express-chust.netlify.app",
  "https://chust-express-frontend.onrender.com",
  "https://chust-express.vercel.app",
  "https://chustexpress.uz",
  "https://www.chustexpress.uz",
  
  // Local development
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  
  // Mobile apps
  "capacitor://localhost",
  "ionic://localhost",
];

console.log("🔗 CORS Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        console.log("✅ Request with no origin allowed");
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked: ${origin}`);
        console.warn(`   Allowed origins: ${allowedOrigins.join(", ")}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
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
  })
);

// ======================
// SOCKET.IO SETUP
// ======================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected");
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

// ======================
// CORE MIDDLEWARE
// ======================
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
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
      environment: process.env.NODE_ENV || "production",
      cors: "enabled"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(200).json({
      status: "degraded",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ======================
// EMERGENCY DB SETUP
// ======================
app.get("/api/setup-db", async (req, res) => {
  const { secret } = req.query;
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: "Unauthorized - need secret" });
  }

  try {
    const { execSync } = require("child_process");
    
    console.log("🔄 Pushing schema to database...");
    const pushOutput = execSync("npx prisma db push --accept-data-loss", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120000,
    });
    
    console.log("🔄 Generating Prisma client...");
    const generateOutput = execSync("npx prisma generate", {
      encoding: "utf-8",
      timeout: 30000,
    });

    res.json({
      success: true,
      message: "Database setup complete - tables created from schema",
      push: pushOutput,
      generate: generateOutput,
    });
  } catch (error) {
    console.error("❌ DB setup error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    });
  }
});

// ======================
// MIGRATION ENDPOINT
// ======================
app.get("/api/migrate", async (req, res) => {
  const { secret } = req.query;
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const results = [];

    const checkColumn = await req.prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Product' AND column_name='images'
    `;

    if (checkColumn.length > 0) {
      await req.prisma.$executeRaw`ALTER TABLE "Product" RENAME COLUMN "images" TO "image"`;
      results.push("Renamed column 'images' to 'image'.");
    } else {
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
  res.send("API is working... (Version: 2.5.1 - Fixed Database Connection)");
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

const startServer = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryDelay = 5000;
  
  try {
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 10s')), 10000)
      )
    ]);
    
    console.log("✅ Database bilan ulanish muvaffaqiyatli");
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server ${PORT}-portda ishga tushdi`);
      console.log(`📍 Health check: https://chust-express-backend.onrender.com/api/health`);
      console.log(`🔗 CORS allowed origins:`, allowedOrigins.length, "origins");
    });
    
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} allaqachon ishlatilmoqda`);
        process.exit(1);
      } else {
        console.error("❌ Server error:", err);
        throw err;
      }
    });
    
  } catch (error) {
    console.error(`❌ Database connection attempt ${retryCount + 1}/${maxRetries + 1} failed`);
    console.error("Error message:", error.message);
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying in ${retryDelay/1000} seconds...`);
      setTimeout(() => startServer(retryCount + 1), retryDelay);
    } else {
      console.error("❌ All database connection attempts failed.");
      console.warn("⚠️ API endpoints that need database will return errors");
      console.warn("⚠️ Check your DATABASE_URL environment variable on Render");
      
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`⚠️ Server started WITHOUT database on port ${PORT}`);
        console.log(`⚠️ Some endpoints will return errors until database connects`);
      });
    }
  }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();