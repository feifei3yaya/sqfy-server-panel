import client from './client';

export interface CDK {
  code: string;
  type: string;
  value: number;
  isUsed: boolean;
  usedBy: string | null;
  createdAt: string;
}

export interface GenerateCDKParams {
  type: string;
  value: number;
  amount: number;
}

export interface RedeemCDKParams {
  code: string;
  steamId: string;
}

export interface RedeemCDKResponse {
  type: string;
  value: number;
}

export const getCDKs = () => client.get<CDK[]>('/cdk');
export const generateCDK = (data: GenerateCDKParams) => client.post('/cdk/generate', data);
export const redeemCDK = (data: RedeemCDKParams) => client.post<RedeemCDKResponse>('/cdk/redeem', data);
