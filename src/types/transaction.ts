export interface AptosTransactionExplanation {
  hash: string;
  success: boolean;
  summary: string;
  timestamp?: number;
  gasUsed: number;
  gasUnitPrice: number;
  gasFee: number; // in APT
  version: number;
  blockHeight?: number;
  sender?: string;
  
  // Account changes
  accountChanges: AccountChange[];
  
  // Move function calls
  functionCalls: FunctionCall[];
  
  // Token transfers
  tokenTransfers: TokenTransfer[];
  
  // Transaction type
  transactionType: TransactionType;
  
  // Error information
  error?: string;
  
  // Balance changes
  balanceChanges?: BalanceChange[];
  
  // Educational content
  educationalContent?: string[];
}

export interface AccountChange {
  account: string;
  changeType: 'created' | 'modified' | 'deleted';
  balance: number;
  sequenceNumber?: number;
  description: string;
}

export interface FunctionCall {
  module: string;
  function: string;
  arguments: unknown[];
  typeArguments: string[];
  description: string;
  protocol?: string;
}

export interface TokenTransfer {
  from: string;
  to: string;
  amount: number;
  tokenType: string;
  tokenName?: string;
  tokenSymbol?: string;
  decimals: number;
  description: string;
}

export interface BalanceChange {
  account: string;
  preBalance: number;
  postBalance: number;
  change: number;
  changeType: 'increase' | 'decrease';
  usdValue: string;
  tokenType: string;
}

export type TransactionType = 
  | 'transfer'
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'create_account'
  | 'close_account'
  | 'nft_mint'
  | 'nft_transfer'
  | 'program_deploy'
  | 'burn'
  | 'SWAP'
  | 'TRANSFER'
  | 'STAKE'
  | 'NFT'
  | 'DEFI'
  | 'LIQUIDITY'
  | 'GOVERNANCE'
  | 'unknown';

export interface Action {
  type: 'transfer' | 'swap' | 'stake' | 'create' | 'modify' | 'delete' | 'mint' | 'burn' | 'liquidity' | 'governance';
  description: string;
  icon: string;
}
