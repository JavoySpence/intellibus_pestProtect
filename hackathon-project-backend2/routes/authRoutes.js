// authRoute.js
import express from "express";
import { signUpUser, loginUser, isLoggedIn } from "../controllers/authControllers.js"; // your signup function

const authRoutes = express.Router();

// Signup route
authRoutes.post("/signup", signUpUser);
// Login route
authRoutes.post("/login", loginUser);

authRoutes.get("/isLoggedin", isLoggedIn)



export default authRoutes;