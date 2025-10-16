import { TrendingUp, TrendingDown, DollarSign, Coins } from 'lucide-react';
import type { BalanceChange } from '@/types/transaction';

interface Props {
  balanceChanges: BalanceChange[];
}

export default function BalanceChanges({ balanceChanges }: Props) {
  if (!balanceChanges || balanceChanges.length === 0) {
    return null;
  }

  const totalValue = balanceChanges.reduce((sum, change) => {
    const usdValue = parseFloat(change.usdValue.replace(/[$,K]/g, '')) || 0;
    return sum + (change.changeType === 'increase' ? usdValue : -usdValue);
  }, 0);

  const isProfit = totalValue > 0;
  const isLoss = totalValue < 0;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
          💰
        </div>
        Balance Changes
      </h3>

      {/* Total Value Change */}
      <div className="mb-6 p-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isProfit ? (
              <TrendingUp className="w-6 h-6 text-green-500" />
            ) : isLoss ? (
              <TrendingDown className="w-6 h-6 text-red-500" />
            ) : (
              <DollarSign className="w-6 h-6 text-slate-500" />
            )}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Portfolio Impact
            </span>
          </div>
          <div className={`text-lg font-bold ${
            isProfit ? 'text-green-600 dark:text-green-400' : 
            isLoss ? 'text-red-600 dark:text-red-400' : 
            'text-slate-600 dark:text-slate-400'
          }`}>
            {isProfit ? '+' : ''}${Math.abs(totalValue).toFixed(2)}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {isProfit ? 'Your portfolio value increased' : 
           isLoss ? 'Your portfolio value decreased' : 
           'No net change in portfolio value'}
        </p>
      </div>

      {/* Individual Balance Changes */}
      <div className="space-y-3">
        {balanceChanges.map((change, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                change.changeType === 'increase' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {change.changeType === 'increase' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {getTokenSymbol(change.tokenType)} Balance
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {change.changeType === 'increase' ? 'Received' : 'Sent'} {Math.abs(change.change).toFixed(6)} {getTokenSymbol(change.tokenType)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${
                change.changeType === 'increase' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {change.changeType === 'increase' ? '+' : '-'}{change.usdValue}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {change.changeType === 'increase' ? 'Gained' : 'Spent'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Balance Changes Explained</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              These values are calculated using current market prices and may differ from the actual prices at the time of your transaction. 
              Balance changes show the net effect on your portfolio from this transaction on the Aptos blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTokenSymbol(tokenType: string): string {
  if (tokenType.includes('aptos_coin')) return 'APT';
  if (tokenType.includes('usdc')) return 'USDC';
  if (tokenType.includes('usdt')) return 'USDT';
  if (tokenType.includes('pancake')) return 'CAKE';
  return 'TOKEN';
}
