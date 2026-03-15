import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import authRoutes from './routes/authRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import chatRoutes from './routes/chatHistoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: "*" // For production, replace "*" with your frontend URL
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", authRoutes);
app.use('/api/ai', aiRouter);
app.use('/api/chat', chatRoutes);


const angularDistPath = path.join(__dirname, "dist/trade-genie-frontend"); // make sure this matches angular.json "outputPath"
app.use(express.static(angularDistPath));


app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});