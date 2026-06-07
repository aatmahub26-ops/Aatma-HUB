import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, runTransaction, collection, serverTimestamp } from "firebase/firestore";

/**
 * @fileOverview Razorpay Production Verification Node
 * Implements signature verification, idempotency checks, and automated notifications.
 */

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = await req.json();

    // 1. Signature Verification Protocol
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Signature breach detected." }, { status: 400 });
    }

    // 2. Atomic Transaction Execution (Idempotent)
    const result = await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const reqRef = doc(db, "deposit_requests", razorpay_payment_id);
      
      // Idempotency Check: Prevent duplicate credit
      const existingReq = await transaction.get(reqRef);
      if (existingReq.exists() && existingReq.data().status === 'approved') {
        throw new Error("ALREADY_PROCESSED");
      }

      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("USER_NOT_FOUND");

      const userData = userSnap.data();
      const currentBalance = userData.walletBalance || 0;
      const currentLifetime = userData.lifetimeRechargeAmount || 0;

      // Update User Node
      transaction.update(userRef, { 
        walletBalance: currentBalance + amount,
        totalDeposits: (userData.totalDeposits || 0) + amount,
        lifetimeRechargeAmount: currentLifetime + amount
      });

      // Log Transaction Ledger
      const txnRef = doc(collection(db, "transactions"));
      transaction.set(txnRef, {
        userId,
        amount,
        type: "deposit",
        description: `Razorpay Synchronized: ${razorpay_payment_id}`,
        status: "success",
        createdAt: new Date().toISOString(),
        reference: razorpay_payment_id
      });

      // Create Verification Record
      transaction.set(reqRef, {
        userId,
        userEmail: userData.email,
        amount,
        paymentMethod: "Razorpay",
        utr: razorpay_payment_id,
        status: "approved",
        createdAt: new Date().toISOString(),
        automated: true
      });

      // Trigger Dispatch Notification
      const notifRef = doc(collection(db, "notifications"));
      transaction.set(notifRef, {
        userId,
        type: "wallet",
        title: "Recharge Synchronized",
        message: `₹${amount} has been successfully added to your Hub Wallet via Razorpay.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'ALREADY_PROCESSED') {
      return NextResponse.json({ success: true, message: "Duplicate attempt neutralized." });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
