import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * @fileOverview PhonePe Payment Order Creation Node
 * Implements the standard PhonePe V1 API integration structure.
 * Refined to capture dynamic mobile identity where available.
 */

export async function POST(req: Request) {
  try {
    const { amount, userId, email, phone } = await req.json();
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    
    const transactionId = `T${Date.now()}`;
    
    // Logic: Use provided phone, or fallback to placeholder for sandbox testing
    const mobileIdentity = phone || "9999999999";
    
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: amount * 100, // Amount in paise
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet/verify?tid=${transactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/verify`,
      mobileNumber: mobileIdentity,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const dataPayload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const fullURL = dataPayload + "/pg/v1/pay" + saltKey;
    const checksum = crypto.createHash("sha256").update(fullURL).digest("hex") + "###" + saltIndex;

    return NextResponse.json({
      success: true,
      data: {
        payload: dataPayload,
        checksum: checksum,
        transactionId: transactionId
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}