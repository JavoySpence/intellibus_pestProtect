import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import { aiRouter } from "./routes/aiRoutes.js";
import chatRoutes from "./routes/chatHistoryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: "*",
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRouter);
app.use("/api/chat", chatRoutes);

// Angular build folder
const angularDistPath = path.join(__dirname, "dist/trade-genie-frontend");

// Serve Angular static files
app.use(express.static(angularDistPath));

// Angular SPA fallback (important)
app.get("*", (req, res) => {
  res.sendFile(path.join(angularDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});