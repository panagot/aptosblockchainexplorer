import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
// import type { AptosTransactionExplanation } from '@/types/transaction';

// Initialize Aptos client
const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);

// Popular Aptos protocols and their module addresses
export const PROTOCOL_MAPPINGS: { [key: string]: string } = {
  // DEXs
  '0x1::coin': 'Aptos Coin',
  '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12': 'Liquidswap',
  '0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af': 'Aries Markets',
  '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4': 'PancakeSwap',
  '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool': 'Liquidswap Pool',
  
  // Lending
  '0x1::aptos_account': 'Aptos Account',
  '0x1::aptos_coin': 'Aptos Coin',
  
  // NFTs
  '0x3::token': 'Aptos Token',
  '0x4::collection': 'Aptos Collection',
  
  // Staking
  '0x1::delegation_pool': 'Delegation Pool',
  '0x1::stake': 'Stake',
  
  // Custom Tokens
  'rKGEN': 'rKGEN Token',
  '0xebebfeea655b30ae5d63e932dda7755b53dad71a32bbe7a8ec616a907f491611': 'rKGEN Protocol',
};

// Popular Aptos tokens
export const POPULAR_TOKENS: { [key: string]: { name: string; symbol: string; decimals: number } } = {
  '0x1::aptos_coin::AptosCoin': { name: 'Aptos', symbol: 'APT', decimals: 8 },
  '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  '0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eec6ce2c7e0b3a6add9f96::coin::T': { name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::pancake_coin::PancakeCoin': { name: 'PancakeSwap Token', symbol: 'CAKE', decimals: 8 },
  '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::LiquidityPool': { name: 'Liquidswap LP', symbol: 'LP', decimals: 8 },
  'rKGEN Token': { name: 'rKGEN Token', symbol: 'rKGEN', decimals: 8 },
};

export function getProtocolName(address: string): string {
  return PROTOCOL_MAPPINGS[address] || 'Unknown Protocol';
}

export function getTokenInfo(tokenType: string): { name: string; symbol: string; decimals: number } {
  return POPULAR_TOKENS[tokenType] || { name: 'Unknown Token', symbol: 'UNK', decimals: 8 };
}

export async function fetchTransactionDetails(hash: string): Promise<unknown> {
  try {
    const transaction = await aptos.getTransactionByHash({ transactionHash: hash });
    return transaction;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw new Error('Failed to fetch transaction details');
  }
}

export async function fetchRecentTransactions(limit: number = 10): Promise<string[]> {
  try {
    const transactions = await aptos.getTransactions({
      options: {
        limit,
      },
    });
    
    return transactions.map(tx => tx.hash);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}

export function detectTransactionType(functionCalls: unknown[]): string {
  // Check for swaps
  if (functionCalls.some(call => {
    const c = call as { module?: string; function?: string };
    return c.module?.includes('liquidswap') || 
           c.module?.includes('pancake') ||
           c.function?.includes('swap');
  })) {
    return 'SWAP';
  }
  
  // Check for transfers
  if (functionCalls.some(call => {
    const c = call as { function?: string };
    return c.function?.includes('transfer') ||
           c.function?.includes('transfer_coins');
  })) {
    return 'TRANSFER';
  }
  
  // Check for staking
  if (functionCalls.some(call => {
    const c = call as { function?: string };
    return c.function?.includes('stake') ||
           c.function?.includes('delegate');
  })) {
    return 'STAKE';
  }
  
  // Check for NFTs
  if (functionCalls.some(call => {
    const c = call as { module?: string; function?: string };
    return c.module?.includes('token') ||
           c.function?.includes('mint');
  })) {
    return 'NFT';
  }
  
  // Check for DeFi
  if (functionCalls.some(call => {
    const c = call as { module?: string; function?: string };
    return c.module?.includes('liquidity') ||
           c.module?.includes('lending') ||
           c.function?.includes('deposit') ||
           c.function?.includes('withdraw');
  })) {
    return 'DEFI';
  }
  
  return 'unknown';
}
