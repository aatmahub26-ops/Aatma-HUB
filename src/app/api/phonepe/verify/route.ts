import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, runTransaction, collection, serverTimestamp } from "firebase/firestore";

/**
 * @fileOverview PhonePe Post-Payment Verification Node
 * Features idempotency locks and automated player notifications.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { response } = body;
    
    // 1. Decode Response Intelligence
    const decodedBase64 = Buffer.from(response, 'base64').toString('binary');
    const decodedResponse = JSON.parse(decodedBase64);

    if (decodedResponse.success && decodedResponse.code === 'PAYMENT_SUCCESS') {
      const { merchantTransactionId, amount, merchantUserId } = decodedResponse.data;
      const actualAmount = amount / 100;

      // 2. Atomic Credit Protocol (Idempotent)
      const result = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", merchantUserId);
        const reqRef = doc(db, "deposit_requests", merchantTransactionId);
        
        const existingReq = await transaction.get(reqRef);
        if (existingReq.exists() && existingReq.data().status === 'approved') {
          throw new Error("ALREADY_PROCESSED");
        }

        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("USER_NOT_FOUND");

        const userData = userSnap.data();
        const currentBalance = userData.walletBalance || 0;
        const currentLifetime = userData.lifetimeRechargeAmount || 0;

        // Sync Balance
        transaction.update(userRef, { 
          walletBalance: currentBalance + actualAmount,
          lifetimeRechargeAmount: currentLifetime + actualAmount
        });

        // Log Ledger
        const txnRef = doc(collection(db, "transactions"));
        transaction.set(txnRef, {
          userId: merchantUserId,
          amount: actualAmount,
          type: "deposit",
          description: `PhonePe Synchronized: ${merchantTransactionId}`,
          status: "success",
          createdAt: new Date().toISOString(),
          reference: merchantTransactionId
        });

        // Create Verification Record
        transaction.set(reqRef, {
          userId: merchantUserId,
          userEmail: userData.email,
          amount: actualAmount,
          paymentMethod: "PhonePe",
          utr: merchantTransactionId,
          status: "approved",
          createdAt: new Date().toISOString(),
          automated: true
        });

        // Trigger Notification
        const notifRef = doc(collection(db, "notifications"));
        transaction.set(notifRef, {
          userId: merchantUserId,
          type: "wallet",
          title: "Gateway Credit Success",
          message: `₹${actualAmount} added to your account via PhonePe.`,
          read: false,
          createdAt: new Date().toISOString()
        });

        return { success: true };
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, message: "Gateway reported failure." });
  } catch (error: any) {
    if (error.message === 'ALREADY_PROCESSED') {
      return NextResponse.json({ success: true, message: "Duplicate attempt neutralized." });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
