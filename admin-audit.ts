
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * @fileOverview Administrative Audit & Security Logging Utility
 * Captures all governance actions and security signals for platform integrity.
 */

export type AdminActionType = 
  | 'USER_BAN' 
  | 'USER_UNBAN' 
  | 'WALLET_ADJUST' 
  | 'ORDER_STATUS' 
  | 'DEPOSIT_AUDIT' 
  | 'CATALOG_CHANGE' 
  | 'PROVIDER_TOGGLE'
  | 'SECURITY_BREACH_ATTEMPT'
  | 'UNAUTHORIZED_ADMIN_ACCESS'
  | 'RATE_LIMIT_COOLDOWN';

export interface AuditLog {
  adminId?: string;
  adminEmail?: string;
  action: AdminActionType;
  targetId?: string;
  details: string;
  metadata?: any;
}

export async function logAdminAction(log: AuditLog) {
  try {
    await addDoc(collection(db, "admin_activity_logs"), {
      ...log,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to commit signal:", error);
  }
}

/**
 * Logs a security-related event.
 */
export async function logSecurityEvent(type: AdminActionType, details: string, metadata?: any) {
  return logAdminAction({
    action: type,
    details,
    metadata
  });
}
