import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";
import { adminAuth } from "../config/firebaseAdmin.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please sign in to continue.",
      });
    }

    const token = header.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    const email = (decoded.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(401).json({
        message: "A verified email address is required.",
      });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();

    const role = adminEmail && email === adminEmail ? "admin" : "customer";
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.firebaseUid = decoded.uid;
        user.role = role;

        if (decoded.name && !user.name) {
          user.name = decoded.name;
        }

        await user.save();
      } else {
        user = await User.create({
          firebaseUid: decoded.uid,
          name: decoded.name || email.split("@")[0],
          email,
          role,
        });
      }
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);

    return res.status(401).json({
      message: "Your session is invalid. Please sign in again.",
    });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
}
