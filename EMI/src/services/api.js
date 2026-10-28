
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

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
