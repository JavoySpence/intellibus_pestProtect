import {pool }from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BehaviorSubject } from "rxjs";

export const currentUserId$ = new BehaviorSubject(null); 



export const signUpUser = async (req, res) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    
    const [existingUsers] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (existingUsers.length > 0) {
        return res.status(409).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);

    
    const [insertResult] = await pool.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword]
    );

    
    res.status(201).json({
        message: "User created successfully",
        userId: insertResult.insertId,  
        email: email                   
    });
};




export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }


    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;
    console.log("Secret", secret)
    if (!secret) {
        return res.status(500).json({ message: "JWT secret key is missing" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1h' });

    res.status(200).json({
        message: "Login successful",
        success: true,
        userId: user.id,
        email: user.email,
        token: token
    });


};


export const isLoggedIn = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization?.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "JWT secret key is missing" });
        }

        
        const decoded = jwt.verify(token, secret);

        req.user = { userId: decoded.userId };

        currentUserId$.next(decoded.userId);

        
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};