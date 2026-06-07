
/**
 * @fileOverview Standardized Provider Adapters for Aatma HUB 2.0.
 * Modular structure to handle various top-up APIs.
 */

export interface ProviderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  balance?: number;
}

export interface DispatchPayload {
  playerId: string;
  zoneId?: string;
  sku: string;
}

export abstract class BaseProvider {
  abstract id: string;
  abstract name: string;
  
  // Logic to call the actual API
  abstract dispatch(payload: DispatchPayload): Promise<ProviderResponse>;
  
  // Logic to fetch balance
  abstract getBalance(): Promise<number>;
}

export class SmileOneAdapter extends BaseProvider {
  id = 'smile-one';
  name = 'Smile.one';

  async dispatch(payload: DispatchPayload): Promise<ProviderResponse> {
    // Logic: In production, call Smile.one API with endpoint + keys
    // For now, simulate success
    console.log(`[SmileOne] Dispatching ${payload.sku} to ${payload.playerId}(${payload.zoneId})`);
    return { success: true, orderId: `SML-${Date.now()}` };
  }

  async getBalance(): Promise<number> {
    return 50000;
  }
}

export class MooGoldAdapter extends BaseProvider {
  id = 'moogold';
  name = 'MooGold';

  async dispatch(payload: DispatchPayload): Promise<ProviderResponse> {
    console.log(`[MooGold] Dispatching ${payload.sku} to ${payload.playerId}`);
    return { success: true, orderId: `MOO-${Date.now()}` };
  }

  async getBalance(): Promise<number> {
    return 12000;
  }
}

export class UniPinAdapter extends BaseProvider {
  id = 'unipin';
  name = 'UniPin';

  async dispatch(payload: DispatchPayload): Promise<ProviderResponse> {
    console.log(`[UniPin] Dispatching ${payload.sku} to ${payload.playerId}`);
    return { success: true, orderId: `UNI-${Date.now()}` };
  }

  async getBalance(): Promise<number> {
    return 8000;
  }
}
