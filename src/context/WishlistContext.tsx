
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (gameId: string) => Promise<void>;
  isInWishlist: (gameId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
});

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const unsub = onSnapshot(collection(db, "users", user.uid, "wishlist"), (snap) => {
      setWishlist(snap.docs.map(d => d.id));
    });

    return () => unsub();
  }, [user]);

  const toggleWishlist = async (gameId: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Authenticate to save favorites.", variant: "destructive" });
      return;
    }

    const ref = doc(db, "users", user.uid, "wishlist", gameId);
    if (wishlist.includes(gameId)) {
      await deleteDoc(ref);
      toast({ title: "Removed from Wishlist" });
    } else {
      await setDoc(ref, { gameId, createdAt: serverTimestamp() });
      toast({ title: "Added to Wishlist", description: "Node saved to your player cabinet." });
    }
  };

  const isInWishlist = (gameId: string) => wishlist.includes(gameId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
