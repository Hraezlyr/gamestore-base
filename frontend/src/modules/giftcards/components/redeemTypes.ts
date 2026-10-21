export interface RedeemCodePayload {
  code: string;
}

export interface RedeemCodeResponse {
  code: string;
  credited_amount: string;
  redeemed_at: string;
  message: string;
}

export interface RedeemCodeErrorResponse {
  detail?: string;
  code?: string[];
}

export type RedeemStatus = 'idle' | 'loading' | 'success' | 'error';
