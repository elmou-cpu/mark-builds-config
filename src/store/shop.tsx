import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { products } from "@/data/products";
import type { Product } from "@/data/types";

export interface CartLine {
  productId: string;
  quantity: number;
}

interface ShopState {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  cartItems: { product: Product; quantity: number }[];
  wishlistItems: Product[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  moveToCart: (productId: string) => void;
}

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "mc.cart.v1";
const WISH_KEY = "mc.wishlist.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const moveToCart = useCallback(
    (productId: string) => {
      addToCart(productId, 1);
      setWishlist((prev) => prev.filter((id) => id !== productId));
    },
    [addToCart],
  );

  const value = useMemo<ShopState>(() => {
    const cartItems = cart
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        return product ? { product, quantity: line.quantity } : null;
      })
      .filter((v): v is { product: Product; quantity: number } => v !== null);

    return {
      cart,
      wishlist,
      cartItems,
      wishlistItems: wishlist
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
      cartCount: cart.reduce((s, l) => s + l.quantity, 0),
      cartTotal: cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0),
      cartOpen,
      setCartOpen,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      moveToCart,
    };
  }, [
    cart,
    wishlist,
    cartOpen,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    moveToCart,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
