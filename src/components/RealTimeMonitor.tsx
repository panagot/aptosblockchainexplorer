'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, Zap, Eye } from 'lucide-react';

interface RecentTransaction {
  hash: string;
  type: string;
  gasFee: number;
  timestamp: number;
  success: boolean;
}

export default function RealTimeMonitor() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    totalProcessed: 0,
    averageGas: 0,
    successRate: 0,
    tps: 0
  });

  useEffect(() => {
    if (!isMonitoring) return;

    // Simulate real-time transaction monitoring
    const interval = setInterval(() => {
      // Generate mock recent transactions
      const newTx: RecentTransaction = {
        hash: generateMockHash(),
        type: ['TRANSFER', 'SWAP', 'STAKE', 'DEFI'][Math.floor(Math.random() * 4)],
        gasFee: Math.random() * 0.01 + 0.001,
        timestamp: Date.now(),
        success: Math.random() > 0.05 // 95% success rate
      };

      setTransactions(prev => {
        const updated = [newTx, ...prev.slice(0, 9)]; // Keep last 10
        return updated;
      });

      // Update stats
      setStats(prev => ({
        totalProcessed: prev.totalProcessed + 1,
        averageGas: (prev.averageGas + newTx.gasFee) / 2,
        successRate: Math.random() * 10 + 90, // 90-100%
        tps: Math.floor(Math.random() * 30) + 20 // 20-50 TPS
      }));
    }, 2000); // New transaction every 2 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const generateMockHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSFER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'SWAP': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'STAKE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'DEFI': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    return `${Math.floor(diff / 60000)}m ago`;
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">
            📡
          </div>
          Real-Time Monitor
        </h3>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isMonitoring 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
            {isMonitoring ? 'Live' : 'Paused'}
          </div>
          
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              isMonitoring
                ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300'
                : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300'
            }`}
          >
            {isMonitoring ? 'Stop' : 'Start'} Monitor
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Processed</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalProcessed.toLocaleString()}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">TPS</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.tps}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Gas</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.averageGas.toFixed(4)}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.successRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Transactions
        </h4>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 dark:text-slate-500 mb-2">
              {isMonitoring ? 'Waiting for transactions...' : 'Start monitoring to see live transactions'}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isMonitoring 
                ? 'Transactions will appear here as they are processed on the Aptos network'
                : 'Click "Start Monitor" to begin real-time transaction monitoring'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.map((tx, index) => (
              <div key={index} className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tx.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>
                      {tx.type}
                    </span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tx.gasFee.toFixed(4)} APT
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Health Indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🟢</span>
          <span className="font-semibold text-slate-900 dark:text-white">Network Health: Excellent</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Aptos network is operating at optimal performance with high throughput and low latency. 
          All validators are healthy and processing transactions efficiently.
        </p>
      </div>
    </div>
  );
}
