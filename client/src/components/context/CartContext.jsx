import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
const CartContext = createContext(null);
const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem("shopsphere_cart")) || [];
  } catch {
    return [];
  }
};
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(
    () => localStorage.setItem("shopsphere_cart", JSON.stringify(items)),
    [items],
  );
  const addItem = (
    product,
    size = product.sizes?.[0] || "One Size",
    quantity = 1,
  ) =>
    setItems((current) => {
      const key = `${product._id}-${size}`;
      const found = current.find((item) => item.key === key);
      if (found)
        return current.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item,
        );
      return [
        ...current,
        {
          key,
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          stock: product.stock,
          size,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  const updateQuantity = (key, quantity) =>
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(Number(quantity) || 1, item.stock),
              ),
            }
          : item,
      ),
    );
  const removeItem = (key) =>
    setItems((current) => current.filter((item) => item.key !== key));
  const clearCart = () => setItems([]);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      count,
    }),
    [items, subtotal, count],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  return useContext(CartContext);
}
