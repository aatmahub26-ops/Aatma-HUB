
'use client';

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, runTransaction, serverTimestamp } from "firebase/firestore";
import { SmileOneAdapter, MooGoldAdapter, UniPinAdapter, BaseProvider } from "./provider-adapters";

/**
 * @fileOverview Aatma HUB Fulfillment Engine.
 * Handles priority routing, failover, and order status synchronization.
 */

const ADAPTER_REGISTRY: Record<string, BaseProvider> = {
  'smile-one': new SmileOneAdapter(),
  'moogold': new MooGoldAdapter(),
  'unipin': new UniPinAdapter(),
};

export async function processFulfillment(orderId: string) {
  console.log(`[FulfillmentEngine] Initializing protocol for order: ${orderId}`);
  
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) throw new Error("Order node not found.");
    const orderData = orderSnap.data();

    // 1. Fetch Active Providers sorted by priority
    const providersQuery = query(
      collection(db, "providers"), 
      where("isEnabled", "==", true),
      orderBy("priority", "asc")
    );
    const providersSnap = await getDocs(providersQuery);
    const activeProviders = providersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (activeProviders.length === 0) {
      throw new Error("No operational provider nodes available.");
    }

    // 2. Select Provider Logic (Iterate for Failover)
    let selectedProvider: any = null;
    let dispatchResult: any = null;

    for (const provider of activeProviders) {
      const adapter = ADAPTER_REGISTRY[provider.id];
      if (!adapter) continue;

      // Check balance eligibility (Simplified check)
      if (provider.balance < orderData.price) {
        console.warn(`[Failover] Provider ${provider.id} insufficient balance. Shifting payload...`);
        continue;
      }

      // 3. Execute Dispatch Protocol
      try {
        dispatchResult = await adapter.dispatch({
          playerId: orderData.playerGameId,
          zoneId: orderData.playerServerId,
          sku: orderData.packageId // In production, map this to provider-specific SKU
        });

        if (dispatchResult.success) {
          selectedProvider = provider;
          break; // Fulfillment successful
        }
      } catch (err) {
        console.error(`[Failover] Provider ${provider.id} error:`, err);
        // Continue loop for failover to next node
      }
    }

    // 4. Update System State
    if (selectedProvider && dispatchResult.success) {
      await updateDoc(orderRef, {
        status: "Completed",
        providerId: selectedProvider.id,
        providerOrderId: dispatchResult.orderId,
        fulfilledAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });

      // Update provider analytics
      const providerRef = doc(db, "providers", selectedProvider.id);
      await updateDoc(providerRef, {
        totalRequests: (selectedProvider.totalRequests || 0) + 1,
        successRate: 100, // In production, calculate actual percentage
        balance: selectedProvider.balance - orderData.price,
        lastSuccess: new Date().toISOString()
      });

      return { success: true, message: "Order fulfilled via " + selectedProvider.name };
    } else {
      await updateDoc(orderRef, {
        status: "Failed",
        error: "All operational nodes failed to dispatch.",
        updatedAt: serverTimestamp()
      });
      return { success: false, error: "Exhausted all failover routes." };
    }

  } catch (error: any) {
    console.error("[FulfillmentEngine] Critical Breach:", error.message);
    return { success: false, error: error.message };
  }
}
