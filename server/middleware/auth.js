
import { adminAuth } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    // 1. Extract Firebase ID token
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please sign in to continue.",
      });
    }

    const token = header.slice(7);

    // 2. Verify Firebase token
    const decoded = await adminAuth.verifyIdToken(token);

    const firebaseUid = decoded.uid;
    const email = (decoded.email || "").toLowerCase().trim();
    const phoneNumber = decoded.phone_number || "";

    // 3. Find existing user by Firebase UID
    let user = await User.findOne({ firebaseUid });

    // 4. Try linking an existing email account
    if (!user && email) {
      user = await User.findOne({ email });

      if (user) {
        user.firebaseUid = firebaseUid;

        if (decoded.name && !user.name) {
          user.name = decoded.name;
        }

        if (phoneNumber && !user.phoneNumber) {
          user.phoneNumber = phoneNumber;
        }

        await user.save();
      }
    }

    // 5. Try linking an existing phone account
    if (!user && phoneNumber) {
      user = await User.findOne({ phoneNumber });

      if (user) {
        user.firebaseUid = firebaseUid;

        if (decoded.name && !user.name) {
          user.name = decoded.name;
        }

        if (email && !user.email) {
          user.email = email;
        }

        await user.save();
      }
    }

    // 6. Create a new customer if no account exists
    if (!user) {
      user = await User.create({
        firebaseUid,
        name:
          decoded.name ||
          (email ? email.split("@")[0] : "ShopSphere Customer"),
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        role: "customer",
      });
    }

    // 7. Update missing profile information
    let profileUpdated = false;

    if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      profileUpdated = true;
    }

    if (decoded.name && !user.name) {
      user.name = decoded.name;
      profileUpdated = true;
    }

    if (email && !user.email) {
      user.email = email;
      profileUpdated = true;
    }

    if (phoneNumber && !user.phoneNumber) {
      user.phoneNumber = phoneNumber;
      profileUpdated = true;
    }

    if (profileUpdated) {
      await user.save();
    }

    // 8. Attach user to request
    req.user = user;

    return next();

  } catch (error) {
    // 9. Recover from simultaneous authentication requests
    if (error.code === 11000) {
      try {
        const firebaseUid = error.keyValue?.firebaseUid;

        if (firebaseUid) {
          const existingUser = await User.findOne({ firebaseUid });

          if (existingUser) {
            req.user = existingUser;
            return next();
          }
        }

        // Fallback: use the verified token's UID
        const header = req.headers.authorization || "";
        const token = header.slice(7);
        const decoded = await adminAuth.verifyIdToken(token);

        const existingUser = await User.findOne({
          firebaseUid: decoded.uid,
        });

        if (existingUser) {
          req.user = existingUser;
          return next();
        }
      } catch (recoveryError) {
        console.error(
          "Authentication recovery failed:",
          recoveryError.message
        );
      }
    }

    console.error(
      "Firebase authentication failed:",
      error.message
    );

    return res.status(401).json({
      message: "Your session is invalid. Please sign in again.",
    });
  }
}

// 10. Admin-only authorization
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  return next();
}
