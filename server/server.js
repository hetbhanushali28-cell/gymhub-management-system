const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time notifications
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? allowedOrigins : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Real-time live broadcast announcement from admin to all connected members
  socket.on("admin_broadcast", (data) => {
    console.log("Broadcasting announcement:", data);
    io.emit("notification", {
      id: Date.now(),
      type: "announcement",
      title: "📢 Facility Announcement",
      message: data.message || "New announcement from gym administration",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make io accessible to all Express controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/tiers", require("./routes/tierRoutes"));

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
