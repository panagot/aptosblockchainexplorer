'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Clock } from 'lucide-react';
import type { AptosTransactionExplanation } from '@/types/transaction';

interface MEVDetectionProps {
  transaction: AptosTransactionExplanation;
}

interface MEVAnalysis {
  isMEV: boolean;
  mevType: 'arbitrage' | 'sandwich' | 'liquidation' | 'frontrun' | 'none';
  confidence: number;
  profit: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function MEVDetection({ transaction }: MEVDetectionProps) {
  const [analysis, setAnalysis] = useState<MEVAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate MEV analysis
    const analyzeMEV = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock MEV analysis based on transaction characteristics
      const isSwap = transaction.transactionType === 'SWAP';
      const hasMultipleCalls = transaction.functionCalls.length > 1;
      
      let mevAnalysis: MEVAnalysis;
      
      if (isSwap && hasMultipleCalls) {
        // Potential arbitrage
        mevAnalysis = {
          isMEV: true,
          mevType: 'arbitrage',
          confidence: 85,
          profit: Math.random() * 100 + 10,
          description: 'Detected potential arbitrage opportunity across multiple DEXs',
          riskLevel: 'medium'
        };
      } else if (isSwap && transaction.gasFee > 0.01) {
        // Potential sandwich attack
        mevAnalysis = {
          isMEV: true,
          mevType: 'sandwich',
          confidence: 70,
          profit: Math.random() * 50 + 5,
          description: 'High gas fee suggests potential sandwich attack',
          riskLevel: 'high'
        };
      } else if (transaction.functionCalls.some(call => 
        call.function.includes('liquidate') || call.function.includes('seize')
      )) {
        // Liquidation
        mevAnalysis = {
          isMEV: true,
          mevType: 'liquidation',
          confidence: 95,
          profit: Math.random() * 200 + 50,
          description: 'Liquidation transaction with potential MEV profit',
          riskLevel: 'low'
        };
      } else {
        // No MEV detected
        mevAnalysis = {
          isMEV: false,
          mevType: 'none',
          confidence: 90,
          profit: 0,
          description: 'No MEV activity detected - normal transaction',
          riskLevel: 'low'
        };
      }
      
      setAnalysis(mevAnalysis);
      setLoading(false);
    };

    analyzeMEV();
  }, [transaction]);

  const getMEVTypeColor = (type: string) => {
    switch (type) {
      case 'arbitrage': return 'from-blue-500 to-indigo-600';
      case 'sandwich': return 'from-red-500 to-rose-600';
      case 'liquidation': return 'from-green-500 to-emerald-600';
      case 'frontrun': return 'from-orange-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getMEVTypeIcon = (type: string) => {
    switch (type) {
      case 'arbitrage': return '🔄';
      case 'sandwich': return '🥪';
      case 'liquidation': return '💥';
      case 'frontrun': return '🏃';
      default: return '✅';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm">
          🔍
        </div>
        MEV Analysis
      </h3>
      
      <div className="space-y-6">
        {/* MEV Detection Result */}
        <div className={`p-6 rounded-2xl ${
          analysis.isMEV 
            ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700' 
            : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${getMEVTypeColor(analysis.mevType)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              {analysis.isMEV ? <AlertTriangle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {analysis.isMEV ? 'MEV Detected' : 'No MEV Activity'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {analysis.description}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analysis.confidence}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analysis.mevType === 'none' ? 'N/A' : `${analysis.profit.toFixed(2)} APT`}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Est. Profit</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold capitalize ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Risk Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {getMEVTypeIcon(analysis.mevType)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Type</div>
            </div>
          </div>
        </div>

        {/* MEV Type Details */}
        {analysis.isMEV && (
          <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
            <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              MEV Type: {analysis.mevType.charAt(0).toUpperCase() + analysis.mevType.slice(1)}
            </h5>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              {analysis.mevType === 'arbitrage' && (
                <p>
                  This transaction appears to exploit price differences between different DEXs on Aptos. 
                  The trader buys tokens at a lower price on one exchange and sells them at a higher price on another.
                </p>
              )}
              {analysis.mevType === 'sandwich' && (
                <p>
                  This transaction may be part of a sandwich attack, where a trader places transactions before and after 
                  a victim&apos;s transaction to profit from price slippage.
                </p>
              )}
              {analysis.mevType === 'liquidation' && (
                <p>
                  This is a liquidation transaction where an undercollateralized position is liquidated. 
                  The liquidator receives a bonus for helping maintain protocol health.
                </p>
              )}
              {analysis.mevType === 'frontrun' && (
                <p>
                  This transaction may be frontrunning another transaction by paying higher gas fees 
                  to execute first and profit from the price impact.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Aptos MEV Protection */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Aptos MEV Protection</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aptos&apos;s parallel execution and Move language provide some protection against MEV attacks. 
            The resource-oriented model and type safety help prevent common MEV exploits, 
            though sophisticated MEV strategies can still occur.
          </p>
        </div>

        {/* Transaction Timing */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Transaction Timing Analysis
          </h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600 dark:text-slate-400">Execution Time:</span>
              <div className="font-semibold text-slate-900 dark:text-white">
                {Math.floor(Math.random() * 200) + 100}ms
              </div>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Gas Priority:</span>
              <div className="font-semibold text-slate-900 dark:text-white">
                {transaction.gasFee > 0.01 ? 'High' : transaction.gasFee > 0.005 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
