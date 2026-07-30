import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import memberRoutes from "./routes/members.js";
import eventRoutes from "./routes/events.js";
import newsRoutes from "./routes/news.js";
import documentRoutes from "./routes/documents.js";
import galleryRoutes from "./routes/gallery.js";
import paymentRoutes from "./routes/payments.js";
import alumniRoutes from "./routes/alumni.js";
import notificationRoutes from "./routes/notifications.js";
import contactRoutes from "./routes/contact.js";
import opportunityRoutes from "./routes/opportunities.js";
import resourceRoutes from "./routes/resources.js";
import dashboardRoutes from "./routes/dashboard.js";
import committeeRoutes from "./routes/committees.js";
import studentRoutes from "./routes/students.js";
import ticketRoutes from "./routes/tickets.js";
import checkInRoutes from "./routes/checkin.js";
import drawRoutes from "./routes/draw.js";
import ticketProductRoutes from "./routes/ticketProducts.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// CRITICAL: CORS must be FIRST middleware
// Add manual CORS headers for maximum compatibility
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  // List of allowed origins
  const allowedOrigins = [
    'https://gamataa-barattoota-ada-aa-bargaa.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Allow specific origins or domains that end with .vercel.app, .onrender.com, or localhost
  if (origin && (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin.includes('localhost')
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // In production, allow all for now (can be restricted later)
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});

// Also use cors package as backup
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/committees", committeeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/checkin", checkInRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/ticket-products", ticketProductRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to GBAABW API", status: "Running" });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
