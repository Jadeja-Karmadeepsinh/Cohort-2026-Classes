import { Router } from "express";
import User from "../models/user.model.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
        const user = await User.findById(req.user.id).select(
            "_id name email createdAt"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                created_at: user.createdAt
            }
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export const userRoutes = router;
