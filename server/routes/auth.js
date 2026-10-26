import { Router } from "express";
import { protect } from "../middleware/auth.js";

const router = Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Firebase authenticates the user.
// This route synchronizes their MongoDB profile.
router.post("/session", protect, async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();

    if (name && req.user.name !== name) {
      req.user.name = name;
      await req.user.save();
    }

    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
