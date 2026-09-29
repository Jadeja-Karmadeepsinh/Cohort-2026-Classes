import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether user already exists
    const existing = await User.findOne({
      email: normalizedEmail
    });

    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const userDoc = await User.create({
      name,
      email: normalizedEmail,
      password: hashed
    });

    // JWT payload
    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email
    };

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Store refresh token
    await RefreshToken.create({
        userId: userDoc._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Register error:", error);

    // MongoDB duplicate-key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    res.status(500).json({
      message: "Server error"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const payload = {
        id: user._id.toString(),
        email: user.email
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token
    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
        message: "Server error"
    });
  }  
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

    // Check whether refresh token exists in DB
    const stored = await RefreshToken.findOne({
        token: refreshToken
    });
    
    if (!stored) return res.status(401).json({ message: "Refresh token revoked" });

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const payload = { id: decoded.id, email: decoded.email };
      const accessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      // Delete old refresh token
      await RefreshToken.deleteOne({
          token: refreshToken
      });

      // Store new refresh token
      await RefreshToken.create({
          userId: stored.userId,
          token: newRefreshToken,
          expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
          )
      });

      console.log(accessToken);
      console.log(newRefreshToken);

      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    console.error("Refresh error:", error);

    res.status(500).json({
        message: "Server error"
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await RefreshToken.deleteOne({
          token: refreshToken
      });
    }
    res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
        message: "Server error"
    });
  }  
});

export const authRoutes = router;
