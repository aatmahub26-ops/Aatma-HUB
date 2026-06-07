'use server';
/**
 * @fileOverview Unified AI Gaming Assistant for Aatma HUB 2.0.
 * 
 * Access restricted to paying users.
 * - Locked if lifetimeRechargeAmount <= 0 AND totalOrders <= 0.
 * - Usage Limits:
 *   - Basic (Recharge > 0): 10/day
 *   - Pro (Recharge > 100): 50/day
 *   - Elite (Recharge > 500): Unlimited
 *   - Admin: Unlimited
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, setDoc, increment, serverTimestamp } from 'firebase/firestore';

// --- Tools ---

const getOrderStatus = ai.defineTool(
  {
    name: 'getOrderStatus',
    description: 'Checks the real-time status of a gaming top-up order using its Order ID.',
    inputSchema: z.object({
      orderId: z.string().describe('The unique Order ID (e.g. 5qWz...)'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      status: z.string().optional(),
      packageName: z.string().optional(),
      price: z.number().optional(),
      error: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const docRef = doc(db, "orders", input.orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          found: true,
          status: data.status,
          packageName: data.packageName,
          price: data.price,
        };
      }
      return { found: false };
    } catch (e: any) {
      return { found: false, error: "Access Denied: Intelligence node restricted." };
    }
  }
);

const recommendProducts = ai.defineTool(
  {
    name: 'recommendProducts',
    description: 'Recommends game top-ups or digital services based on budget.',
    inputSchema: z.object({
      maxBudget: z.number().optional().describe('Maximum budget in INR (₹)'),
      category: z.string().optional().describe('MOBA, RPG, Battle Royale, OTT, Gift Cards'),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      startingPrice: z.number(),
    })),
  },
  async (input) => {
    try {
      const q = query(collection(db, "catalog"), where("isEnabled", "==", true), limit(5));
      const snap = await getDocs(q);
      let products = snap.docs.map(d => {
        const data = d.data();
        const minPrice = data.packages?.length > 0 ? Math.min(...data.packages.map((p: any) => p.price)) : 0;
        return {
          id: d.id,
          name: data.name,
          category: data.category,
          startingPrice: minPrice,
        };
      });
      return products;
    } catch (e: any) {
      return [];
    }
  }
);

// --- Flow ---

const AssistantInputSchema = z.object({
  query: z.string().describe('The user\'s message.'),
  language: z.string().optional().describe('The language code (e.g. "en", "hi").'),
  userId: z.string().optional().describe('The Firebase UID of the user.'),
  userContext: z.object({
    isLoggedIn: z.boolean(),
    role: z.string().optional(),
    firstName: z.string().optional(),
    currentRank: z.string().optional(),
  }).optional(),
});

const AssistantOutputSchema = z.object({
  answer: z.string().describe('The assistant\'s response in Markdown.'),
  suggestedAction: z.string().optional().describe('Internal UI code.'),
  remainingQuota: z.number().optional().describe('Remaining daily messages.'),
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

/**
 * Executes a single AI generation request. 
 */
export async function aatmaAiAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return aatmaAiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aatmaAiPrompt',
  input: { schema: AssistantInputSchema },
  output: { schema: AssistantOutputSchema },
  tools: [getOrderStatus, recommendProducts],
  system: `You are Aatma AI, the elite gaming assistant for Aatma HUB 2.0.
Your tone is professional, authoritative, and helpful.

CRITICAL: If the user asks a simple question or a math question like "What is 2 + 2?", answer directly and precisely. 
Example: If the user asks "What is 2 + 2?", respond with "2 + 2 = 4".
Do NOT use tools for simple arithmetic.

You are an expert on:
1. Wallet: Min recharge ₹10.
2. Orders: Check status using getOrderStatus if ID provided. 
3. Products: Use recommendProducts for suggestions.`,
  prompt: `Target Language: {{{language}}}

User Context:
{{#if userContext.isLoggedIn}}
- Identity: {{{userContext.firstName}}}
- Platform Rank: {{{userContext.currentRank}}}
- Role: {{{userContext.role}}}
{{else}}
- Identity: Guest Operator (Encourage joining the HUB for rewards)
{{/if}}

User Signal: {{{query}}}`,
});

const aatmaAiFlow = ai.defineFlow(
  {
    name: 'aatmaAiFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    console.log(`[aatmaAiFlow] Checking protocol for UID: ${input.userId || 'Guest'}`);

    // 1. Authentication Check
    if (!input.userId) {
       return { answer: "GUEST LOCK: Please sign in and recharge your hub wallet to unlock Aatma Intelligence.", suggestedAction: "AUTH" };
    }

    // 2. Profile Intelligence
    const userRef = doc(db, "users", input.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
       return { answer: "IDENTITY ERROR: Profile node not found in ecosystem.", suggestedAction: "RELOAD" };
    }

    const userData = userSnap.data();
    const isAdmin = userData.role === 'admin';
    const totalRecharged = userData.lifetimeRechargeAmount || 0;
    const totalOrders = userData.totalOrders || 0;

    // 3. Access Condition (Locked for non-paying users)
    if (!isAdmin && totalRecharged <= 0 && totalOrders <= 0) {
       return { answer: "PROTOCOL LOCK: Recharge your hub wallet to unlock Aatma Intelligence.", suggestedAction: "LOCK" };
    }

    // 4. Usage Limits Logic
    let dailyLimit = 10;
    if (totalRecharged > 500) dailyLimit = 999999; // Unlimited
    else if (totalRecharged > 100) dailyLimit = 50;

    let currentCount = 0;
    const dateStr = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, "users", input.userId, "ai_usage", dateStr);

    if (!isAdmin && dailyLimit < 999999) {
       const usageSnap = await getDoc(usageRef);
       currentCount = usageSnap.exists() ? usageSnap.data().count : 0;

       if (currentCount >= dailyLimit) {
          return { 
            answer: `QUOTA EXHAUSTED: You have used your daily limit of ${dailyLimit} messages. Recharge above ₹100 for 50/day, or ₹500 for Unlimited.`, 
            suggestedAction: "UPGRADE",
            remainingQuota: 0
          };
       }
    }

    // 5. Execution
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Intelligence Node returned empty response.');
    }

    // 6. Record Consumption
    if (!isAdmin) {
       await setDoc(usageRef, { 
         count: increment(1), 
         lastUsed: serverTimestamp() 
       }, { merge: true });
    }
    
    return {
      ...output,
      remainingQuota: isAdmin ? undefined : (dailyLimit === 999999 ? undefined : dailyLimit - (currentCount + 1))
    };
  }
);
