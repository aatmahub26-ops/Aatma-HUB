import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const callback = body.callback_query;
    if (!callback) {
      return NextResponse.json({ ok: true });
    }

    const data = callback.data || "";

    let status = "";
    let orderId = "";

    if (data.startsWith("approve_")) {
      status = "Completed";
      orderId = data.replace("approve_", "");
    }

    if (data.startsWith("reject_")) {
      status = "Rejected";
      orderId = data.replace("reject_", "");
    }

    if (!orderId) {
      return NextResponse.json({ ok: false });
    }

    await adminDb.collection("orders").doc(orderId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "callback failed" },
      { status: 500 }
    );
  }
}
