
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment,
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  packageId: string;
  packageName: string;
  price: number;
  quantity: number;
  playerGameId: string;
  playerServerId?: string;
  imageUrl?: string;
  extraData?: { [key: string]: any }; // NEW: Support for dynamic fields
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  totalPrice: 0,
  loading: true,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
      setItems(cartItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to add items to cart.", variant: "destructive" });
      return;
    }

    // Use a unique ID based on product, package, and player ID to merge similar items or create new entries
    const itemId = `${item.productId}_${item.packageId}_${item.playerGameId}`;
    const cartRef = doc(db, "users", user.uid, "cart", itemId);

    try {
      await setDoc(cartRef, {
        ...item,
        createdAt: serverTimestamp(),
      }, { merge: true });
      
      toast({ title: "Added to Cart", description: `${item.packageName} for ${item.productName} added.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
      toast({ title: "Removed from Cart" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const updateQuantity = async (itemId: string, delta: number) => {
    if (!user) return;
    const itemRef = doc(db, "users", user.uid, "cart", itemId);
    const item = items.find(i => i.id === itemId);
    
    if (item && item.quantity + delta <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      await updateDoc(itemRef, {
        quantity: increment(delta)
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.delete(doc(db, "users", user.uid, "cart", item.id));
    });
    await batch.commit();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, itemCount, totalPrice, loading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
