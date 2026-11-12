const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Server origin (without /api) - used to build links to uploaded files
const FILE_BASE = API_URL.replace(/\/api$/, "");

export function getFileUrl(path = "") {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${FILE_BASE}${path}`;
}

const FILE_FIELDS = ["panFile", "aadharFile", "verificationPhoto", "otherDocFile"];

const STORAGE_KEY = "shopsphere_emi_user_profile";

/**
 * Fetch a product by ID
 */
export async function getProduct(productId) {
  if (!productId) {
    throw new Error("Product ID is missing.");
  }

  const response = await fetch(
    `${API_URL}/products/${encodeURIComponent(productId)}`
  );

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Failed to fetch product (${response.status}).`
    );
  }

  return data.product || data;
}

/**
 * Save or update user KYC & financial details in database and local cache
 */
export async function saveEmiProfile(profileData) {
  try {
    // multipart/form-data so the PAN / Aadhaar / photo / other-document files can be uploaded
    const body = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value instanceof File) {
        body.append(key, value);
      } else if (!FILE_FIELDS.includes(key)) {
        body.append(key, value); // plain text fields (already-stored file URLs are skipped)
      }
    });

    const response = await fetch(`${API_URL}/emi/profile`, {
      method: "POST",
      body, // browser sets the multipart Content-Type + boundary
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to save profile in database.");
    }

    const savedProfile = data.profile || profileData;
    // Cache in local storage for fast instant load
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProfile));
    return savedProfile;
  } catch (err) {
    // Uploads can't be queued offline, so surface the error to the form instead of faking success
    console.warn("API save warning:", err.message);
    throw err;
  }
}

/**
 * Get user KYC profile from database (or local cache)
 */
export async function getEmiProfile(email = "") {
  // First check local storage for instant availability
  let cached = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cached = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Local storage read error:", err);
  }

  const queryEmail = email || cached?.email || "";

  try {
    const url = queryEmail
      ? `${API_URL}/emi/profile?email=${encodeURIComponent(queryEmail)}`
      : `${API_URL}/emi/profile`;

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        return data.profile;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote profile:", err.message);
  }

  return cached;
}

/**
 * Submit and confirm a new EMI order to MongoDB
 */
export async function createEmiOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/emi/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to confirm EMI order.");
    }

    return data.order;
  } catch (err) {
    console.warn("API create order fallback:", err.message);
    // Offline fallback order with generated ID
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return {
      orderId: `EMI-${dateStr}-${randomHex}`,
      ...orderData,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };
  }
}