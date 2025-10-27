import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import fileRoutes from "./routes/files.js";
import { startCleanup } from "./cleanup.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, time: new Date() });
});

// ✅ File upload + download routes
app.use("/api/files", fileRoutes);

// ✅ Start cleanup scheduler
startCleanup();

// ✅ Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
