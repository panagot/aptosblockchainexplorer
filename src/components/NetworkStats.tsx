'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Users, Zap, Clock, DollarSign } from 'lucide-react';

interface NetworkStats {
  tps: number;
  blockHeight: number;
  totalTransactions: number;
  averageGasPrice: number;
  activeValidators: number;
  networkHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function NetworkStats() {
  const [stats, setStats] = useState<NetworkStats>({
    tps: 0,
    blockHeight: 0,
    totalTransactions: 0,
    averageGasPrice: 0,
    activeValidators: 0,
    networkHealth: 'good'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching network stats (in a real app, you'd call Aptos API)
    const fetchStats = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in production, fetch from Aptos API
      setStats({
        tps: Math.floor(Math.random() * 50) + 20, // 20-70 TPS
        blockHeight: 15000000 + Math.floor(Math.random() * 1000),
        totalTransactions: 500000000 + Math.floor(Math.random() * 1000000),
        averageGasPrice: 100 + Math.floor(Math.random() * 50),
        activeValidators: 100 + Math.floor(Math.random() * 20),
        networkHealth: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as 'excellent' | 'good' | 'fair'
      });
      
      setLoading(false);
    };

    fetchStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'fair': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">
            📊
          </div>
          Aptos Network Status
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Live</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">TPS</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.tps}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Transactions/sec
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Block Height</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.blockHeight.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Current block
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total TXs</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {(stats.totalTransactions / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            All time
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Gas</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.averageGasPrice}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Gas units
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Validators</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.activeValidators}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Active
          </div>
        </div>
        
        <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getHealthIcon(stats.networkHealth)}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">Health</span>
          </div>
          <div className={`text-2xl font-bold capitalize ${getHealthColor(stats.networkHealth)}`}>
            {stats.networkHealth}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Network status
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚡</span>
          <span className="font-semibold text-slate-900 dark:text-white">Aptos Performance</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Aptos achieves high throughput through parallel execution and the Move language. 
          The network can process up to 100,000 TPS with sub-second finality.
        </p>
      </div>
    </div>
  );
}
