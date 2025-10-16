import type { AptosTransactionExplanation, AccountChange, FunctionCall, TokenTransfer, BalanceChange, TransactionType } from '@/types/transaction';
import { getProtocolName, getTokenInfo } from './aptosClient';

export function parseAptosTransaction(tx: unknown): AptosTransactionExplanation {
  const t = tx as Record<string, unknown>;
  const hash = t.hash as string;
  const success = t.success as boolean;
  const gasUsed = (t.gas_used as number) || 0;
  const gasUnitPrice = (t.gas_unit_price as number) || 0;
  const gasFee = (gasUsed * gasUnitPrice) / 1e8; // Convert to APT
  const version = t.version as number;
  const blockHeight = t.block_height as number;
  const timestamp = t.timestamp ? parseInt(t.timestamp as string) * 1000 : undefined;

  // Debug logging
  console.log('Parsing Aptos transaction:', {
    hash,
    success,
    events: t.events,
    payload: t.payload,
    changes: t.changes
  });

  // Parse account changes
  const accountChanges = parseAccountChanges(tx);
  
  // Parse function calls
  const functionCalls = parseFunctionCalls(tx);
  
  // Parse token transfers
  const tokenTransfers = parseTokenTransfers(tx);
  
  // Determine transaction type
  const transactionType = determineTransactionType(functionCalls);
  
  // Generate summary
  const summary = generateSummary(transactionType, functionCalls, tokenTransfers);
  
  // Generate error message if failed
  const error = success ? undefined : JSON.stringify(t.vm_status);

  // Parse balance changes
  const balanceChanges = parseBalanceChanges(tx);
  
  // Generate educational content
  const educationalContent = generateEducationalContent(transactionType, functionCalls, tokenTransfers, balanceChanges);
  
  // Extract sender
  const sender = t.sender as string;

  return {
    hash,
    success,
    summary,
    timestamp,
    gasUsed,
    gasUnitPrice,
    gasFee,
    version,
    blockHeight,
    sender,
    accountChanges,
    functionCalls,
    tokenTransfers,
    transactionType,
    error,
    balanceChanges,
    educationalContent
  };
}

function parseAccountChanges(tx: unknown): AccountChange[] {
  const changes: AccountChange[] = [];
  
  const t = tx as Record<string, unknown>;
  if (t.changes) {
    const changesArray = t.changes as Array<Record<string, unknown>>;
    changesArray.forEach((change) => {
      if (change.type === 'write_resource' || change.type === 'write_table_item') {
        changes.push({
          account: change.address as string,
          changeType: 'modified',
          balance: 0, // Will be calculated separately
          sequenceNumber: change.sequence_number as number,
          description: `Account ${change.address} was modified`
        });
      }
    });
  }
  
  return changes;
}

function parseFunctionCalls(tx: unknown): FunctionCall[] {
  const calls: FunctionCall[] = [];
  
  const t = tx as Record<string, unknown>;
  if (t.payload && (t.payload as Record<string, unknown>).function) {
    const payload = t.payload as Record<string, unknown>;
    const functionName = payload.function as string;
    const moduleName = functionName.split('::')[0] + '::' + functionName.split('::')[1];
    const func = functionName.split('::')[2];
    
    calls.push({
      module: moduleName,
      function: func,
      arguments: (payload.arguments as unknown[]) || [],
      typeArguments: (payload.type_arguments as string[]) || [],
      description: generateFunctionDescription(moduleName, func),
      protocol: getProtocolName(moduleName)
    });
  }
  
  return calls;
}

function parseTokenTransfers(tx: unknown): TokenTransfer[] {
  const transfers: TokenTransfer[] = [];
  
  const t = tx as Record<string, unknown>;
  if (t.events) {
    const eventsArray = t.events as Array<Record<string, unknown>>;
    eventsArray.forEach((event) => {
      const eventType = event.type as string;
      const eventData = event.data as Record<string, unknown>;
      
      // Handle traditional coin transfers
      if (eventType.includes('::coin::CoinWithdrawn') || eventType.includes('::coin::CoinDeposited')) {
        const tokenType = eventType.split('::')[0] + '::' + eventType.split('::')[1] + '::' + eventType.split('::')[2];
        const tokenInfo = getTokenInfo(tokenType);
        
        transfers.push({
          from: (eventData.sender as string) || 'unknown',
          to: (eventData.receiver as string) || 'unknown',
          amount: parseFloat(eventData.amount as string) / Math.pow(10, tokenInfo.decimals),
          tokenType,
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          description: `${tokenInfo.symbol} transfer`
        });
      }
      
      // Handle fungible asset transfers (newer Aptos system)
      else if (eventType.includes('::Transfer') || eventType.includes('::Deposit')) {
        const amount = eventData.amount as string;
        const from = eventData.from as string;
        const receiver = eventData.receiver as string;
        
        // Try to determine token type from the event type
        let tokenType = '0x1::aptos_coin::AptosCoin'; // Default to APT
        let tokenInfo = getTokenInfo(tokenType);
        
        // Check if it's a custom token transfer
        if (eventType.includes('rKGEN::Transfer')) {
          tokenType = 'rKGEN Token';
          tokenInfo = { name: 'rKGEN Token', symbol: 'rKGEN', decimals: 8 };
        }
        
        transfers.push({
          from: from || 'unknown',
          to: receiver || 'unknown',
          amount: parseFloat(amount) / Math.pow(10, tokenInfo.decimals),
          tokenType,
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          description: `${tokenInfo.symbol} transfer`
        });
      }
    });
  }
  
  return transfers;
}

function parseBalanceChanges(tx: unknown): BalanceChange[] {
  const balanceChanges: BalanceChange[] = [];
  
  const t = tx as Record<string, unknown>;
  if (t.events) {
    const balanceMap = new Map<string, { pre: number; post: number; tokenType: string }>();
    const eventsArray = t.events as Array<Record<string, unknown>>;
    
    eventsArray.forEach((event) => {
      const eventType = event.type as string;
      const eventData = event.data as Record<string, unknown>;
      
      // Handle traditional coin transfers
      if (eventType.includes('::coin::CoinWithdrawn')) {
        const account = eventData.sender as string;
        const tokenType = eventType.split('::')[0] + '::' + eventType.split('::')[1] + '::' + eventType.split('::')[2];
        const amount = parseFloat(eventData.amount as string) / 1e8; // Convert to APT
        
        if (!balanceMap.has(account)) {
          balanceMap.set(account, { pre: 0, post: 0, tokenType });
        }
        const current = balanceMap.get(account)!;
        current.pre += amount;
        current.post = current.pre - amount;
      } else if (eventType.includes('::coin::CoinDeposited')) {
        const account = eventData.receiver as string;
        const tokenType = eventType.split('::')[0] + '::' + eventType.split('::')[1] + '::' + eventType.split('::')[2];
        const amount = parseFloat(eventData.amount as string) / 1e8; // Convert to APT
        
        if (!balanceMap.has(account)) {
          balanceMap.set(account, { pre: 0, post: 0, tokenType });
        }
        const current = balanceMap.get(account)!;
        current.post += amount;
      }
      
      // Handle fungible asset transfers (newer Aptos system)
      else if (eventType.includes('::Transfer') || eventType.includes('::Deposit')) {
        const amount = parseFloat(eventData.amount as string);
        const from = eventData.from as string;
        const receiver = eventData.receiver as string;
        
        // Determine token type
        let tokenType = '0x1::aptos_coin::AptosCoin';
        if (eventType.includes('rKGEN::Transfer')) {
          tokenType = 'rKGEN Token';
        }
        
        // Handle sender (decrease)
        if (from) {
          if (!balanceMap.has(from)) {
            balanceMap.set(from, { pre: 0, post: 0, tokenType });
          }
          const current = balanceMap.get(from)!;
          current.pre += amount / 1e8; // Convert to token units
          current.post = current.pre - amount / 1e8;
        }
        
        // Handle receiver (increase)
        if (receiver) {
          if (!balanceMap.has(receiver)) {
            balanceMap.set(receiver, { pre: 0, post: 0, tokenType });
          }
          const current = balanceMap.get(receiver)!;
          current.post += amount / 1e8; // Convert to token units
        }
      }
    });
    
    balanceMap.forEach((balance, account) => {
      const change = balance.post - balance.pre;
      if (change !== 0) {
        balanceChanges.push({
          account,
          preBalance: balance.pre,
          postBalance: balance.post,
          change,
          changeType: change > 0 ? 'increase' : 'decrease',
          usdValue: calculateUSDValue(balance.tokenType, Math.abs(change)),
          tokenType: balance.tokenType
        });
      }
    });
  }
  
  return balanceChanges;
}

function calculateUSDValue(tokenType: string, amount: number): string {
  // Mock USD prices for popular Aptos tokens (in a real app, you'd fetch from an API)
  const prices: { [key: string]: number } = {
    '0x1::aptos_coin::AptosCoin': 15.00, // APT
    '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T': 1.00, // USDC
    '0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eec6ce2c7e0b3a6add9f96::coin::T': 1.00, // USDT
    '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::pancake_coin::PancakeCoin': 2.50, // CAKE
    'rKGEN Token': 0.05, // rKGEN token
  };

  const price = prices[tokenType] || 0;
  const usdValue = amount * price;
  
  if (usdValue < 0.01) {
    return '< $0.01';
  } else if (usdValue < 1) {
    return `$${usdValue.toFixed(3)}`;
  } else if (usdValue < 1000) {
    return `$${usdValue.toFixed(2)}`;
  } else {
    return `$${(usdValue / 1000).toFixed(2)}K`;
  }
}

function generateFunctionDescription(module: string, functionName: string): string {
  const protocol = getProtocolName(module);
  
  switch (functionName) {
    case 'transfer':
      return `Transfer tokens via ${protocol}`;
    case 'swap':
      return `Token swap on ${protocol}`;
    case 'stake':
      return `Stake tokens via ${protocol}`;
    case 'unstake':
      return `Unstake tokens via ${protocol}`;
    case 'mint':
      return `Mint new tokens via ${protocol}`;
    case 'burn':
      return `Burn tokens via ${protocol}`;
    case 'deposit':
      return `Deposit liquidity to ${protocol}`;
    case 'withdraw':
      return `Withdraw liquidity from ${protocol}`;
    default:
      return `${functionName} operation on ${protocol}`;
  }
}

function determineTransactionType(functionCalls: FunctionCall[]): TransactionType {
  // Check for swaps
  if (functionCalls.some(call => 
    call.function.includes('swap') ||
    call.module.includes('liquidswap') ||
    call.module.includes('pancake')
  )) {
    return 'SWAP';
  }
  
  // Check for transfers
  if (functionCalls.some(call => 
    call.function.includes('transfer') ||
    call.function.includes('transfer_coins')
  )) {
    return 'TRANSFER';
  }
  
  // Check for staking
  if (functionCalls.some(call => 
    call.function.includes('stake') ||
    call.function.includes('delegate')
  )) {
    return 'STAKE';
  }
  
  // Check for NFTs
  if (functionCalls.some(call => 
    call.module.includes('token') ||
    call.function.includes('mint')
  )) {
    return 'NFT';
  }
  
  // Check for DeFi
  if (functionCalls.some(call => 
    call.module.includes('liquidity') ||
    call.function.includes('deposit') ||
    call.function.includes('withdraw')
  )) {
    return 'DEFI';
  }
  
  return 'unknown';
}

function generateSummary(transactionType: TransactionType, functionCalls: FunctionCall[], tokenTransfers: TokenTransfer[]): string {
  switch (transactionType) {
    case 'SWAP':
      return `Token swap transaction involving ${tokenTransfers.length} token transfers`;
    case 'TRANSFER':
      return `Token transfer transaction moving ${tokenTransfers.length} different tokens`;
    case 'STAKE':
      return `Staking transaction delegating tokens to validators`;
    case 'NFT':
      return `NFT transaction involving token minting or transfer`;
    case 'DEFI':
      return `DeFi transaction involving liquidity or lending operations`;
    default:
      return `Aptos transaction with ${functionCalls.length} function calls`;
  }
}

function generateEducationalContent(transactionType: TransactionType, functionCalls: FunctionCall[], tokenTransfers: TokenTransfer[], balanceChanges: BalanceChange[]): string[] {
  const content: string[] = [];

  // Protocol-specific educational content
  switch (transactionType) {
    case 'SWAP':
      content.push("💡 Token swaps on Aptos are executed through decentralized exchanges like Liquidswap or PancakeSwap. These platforms use automated market makers (AMMs) to provide liquidity and determine exchange rates with Move's parallel execution for faster processing.");
      break;
    case 'TRANSFER':
      content.push("💡 Aptos transfers are extremely fast and efficient, leveraging Move's resource-oriented programming model. The parallel execution engine allows multiple transfers to be processed simultaneously, reducing congestion and fees.");
      break;
    case 'STAKE':
      content.push("💡 Staking on Aptos helps secure the network while earning rewards. The Move language ensures type safety and prevents common staking vulnerabilities. Validators process transactions and maintain the blockchain.");
      break;
    case 'NFT':
      content.push("💡 NFTs on Aptos use the Aptos Token standard, which is more flexible and efficient than traditional NFT standards. Move's resource model ensures NFTs are treated as first-class citizens with strong ownership guarantees.");
      break;
    case 'DEFI':
      content.push("💡 Aptos DeFi protocols like Aries Markets and Liquidswap leverage Move's safety features and parallel execution. The resource-oriented model prevents common DeFi exploits like reentrancy attacks.");
      break;
  }

  // Balance change educational content
  if (balanceChanges.length > 0) {
    const totalValue = balanceChanges.reduce((sum, change) => {
      const usdValue = parseFloat(change.usdValue.replace(/[$,K]/g, '')) || 0;
      return sum + (change.changeType === 'increase' ? usdValue : -usdValue);
    }, 0);

    if (totalValue > 0) {
      content.push("💰 Your portfolio value increased from this transaction. This could be from trading profits, staking rewards, or receiving tokens.");
    } else if (totalValue < 0) {
      content.push("📉 Your portfolio value decreased from this transaction. This is normal for trades, fees, or when sending tokens to others.");
    }
  }

  // Aptos-specific educational content
  if (functionCalls.some(call => call.module.includes('aptos_coin'))) {
    content.push("⚡ Aptos uses the Move language for smart contracts, which provides better security through formal verification and prevents common blockchain vulnerabilities like reentrancy attacks.");
  }

  if (tokenTransfers.length > 0) {
    content.push("🔄 Token transfers on Aptos use the Aptos Coin standard, which is built on Move's resource model. This ensures type safety and prevents common token-related bugs.");
  }

  // Move language education
  content.push("🚀 Aptos's Move language and parallel execution engine enable high throughput (up to 100,000 TPS) while maintaining security. The resource-oriented programming model ensures assets are handled safely.");

  return content;
}