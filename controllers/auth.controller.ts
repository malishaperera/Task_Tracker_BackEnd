import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import {generateAccessToken, generateRefreshToken} from "./util/token.controller";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response):Promise<void> => {
    try {
        const { email, password, name, country } = req.body;

        // Email already exists check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({ email, password: hashedPassword, name, country });
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString(), email, name, country);
        const refreshToken = generateRefreshToken(user._id.toString(), email);

        // Save refresh token to DB
        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

//Login
export const login = async (req: Request, res: Response):Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString(), user.email, user.name, user.country);
        const refreshToken = generateRefreshToken(user._id.toString(), user.email);

        // Save refresh token to DB
        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Refresh Token Controller
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as {
            id: string,
            email: string
        };

        // Check if token exists in DB
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            res.status(403).json({ error: "Invalid or expired refresh token" });
            return;
        }

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user._id.toString(), user.email, user.name, user.country);
        const newRefreshToken = generateRefreshToken(user._id.toString(), user.email);

        // Update refresh token in DB (token rotation)
        await RefreshToken.findOneAndReplace(
            { token: refreshToken },
            {
                token: newRefreshToken,
                user: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        res.status(401).json({ error: "Invalid refresh token" });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ error: "Refresh token required" });
        return;
    }

    try {
        const result = await RefreshToken.deleteOne({ token: refreshToken });
        if (result.deletedCount === 0) {
            res.status(404).json({ error: "Token not found" });
            return;
        }
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Server error" });
    }
};