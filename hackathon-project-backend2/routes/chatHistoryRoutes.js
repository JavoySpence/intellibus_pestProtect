// chatHistoryRoutes.js
import express from "express";
import { addToChatHistory, getUserChatHistory, addToChatHistory2} from "../controllers/chatControllers.js";

const chatRoutes = express.Router();

// Route to add message
chatRoutes.post("/add", addToChatHistory);
chatRoutes.post("/add2", addToChatHistory2);
// Route to fetch user chat history
chatRoutes.get("/:user_id", getUserChatHistory);

export default chatRoutes;