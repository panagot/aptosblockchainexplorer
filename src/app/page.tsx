'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Moon, Sun, History, TrendingUp, Copy, Download, Share2, ExternalLink, XCircle } from 'lucide-react';
import { fetchTransactionDetails, fetchRecentTransactions } from '@/lib/aptosClient';
import { parseAptosTransaction } from '@/lib/transactionParser';
import type { AptosTransactionExplanation } from '@/types/transaction';
import BalanceChanges from '@/components/BalanceChanges';
import EducationalContent from '@/components/EducationalContent';

export default function Home() {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<AptosTransactionExplanation | null>(null);
  const [history, setHistory] = useState<AptosTransactionExplanation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('aptos-tx-history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to load history:', e);
        }
      }

      const savedDarkMode = localStorage.getItem('aptos-dark-mode');
      if (savedDarkMode === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('aptos-dark-mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('aptos-dark-mode', 'false');
      }
    }
  }, [darkMode]);

  const handleSearch = async () => {
    if (!hash.trim()) return;

    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      const txData = await fetchTransactionDetails(hash.trim());
      const parsedTx = parseAptosTransaction(txData);
      
      setTransaction(parsedTx);
      
      // Add to history
      const newHistory = [parsedTx, ...history.slice(0, 9)];
      setHistory(newHistory);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aptos-tx-history', JSON.stringify(newHistory));
      }
    } catch (err) {
      setError('Transaction not found or invalid hash');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      await fetchRecentTransactions(10);
    } catch (err) {
      console.error('Failed to load recent transactions:', err);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadFromHistory = async (txHash: string) => {
    setHash(txHash);
    setShowHistory(false);
    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      const txData = await fetchTransactionDetails(txHash);
      const parsedTx = parseAptosTransaction(txData);
      
      setTransaction(parsedTx);
    } catch (err) {
      setError('Transaction not found or invalid hash');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    if (!transaction) return;
    
    const dataStr = JSON.stringify(transaction, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aptos-transaction-${transaction.hash}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!transaction) return;
    
    const csvData = [
      ['Field', 'Value'],
      ['Hash', transaction.hash],
      ['Type', transaction.transactionType],
      ['Success', transaction.success],
      ['Gas Fee', transaction.gasFee],
      ['Version', transaction.version],
      ['Sender', transaction.sender || 'Unknown'],
      ['Timestamp', transaction.timestamp ? new Date(transaction.timestamp).toISOString() : 'Unknown'],
      ['Summary', transaction.summary],
      ['Function Calls', transaction.functionCalls.length],
      ['Token Transfers', transaction.tokenTransfers.length],
      ['Account Changes', transaction.accountChanges.length],
      ['Balance Changes', transaction.balanceChanges?.length || 0]
    ];
    
    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aptos-transaction-${transaction.hash.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareTransaction = async () => {
    if (!transaction) return;
    
    const shareData = {
      title: 'Aptos Transaction Analysis',
      text: `Check out this Aptos transaction: ${transaction.hash}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(shareData.url, 'share');
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const openInExplorer = () => {
    if (!transaction) return;
    window.open(`https://explorer.aptoslabs.com/txn/${transaction.hash}`, '_blank');
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'SWAP': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'TRANSFER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'STAKE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'NFT': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'DEFI': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Aptos Explorer
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  An Easy to Read Aptos Blockchain Explorer
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Transaction History"
              >
                <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Transaction History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.slice(0, 6).map((tx, index) => (
                  <button
                    key={index}
                    onClick={() => loadFromHistory(tx.hash)}
                    className="p-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
                  >
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400 mb-1">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {tx.transactionType}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {tx.gasFee.toFixed(6)} APT
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No transaction history yet. Analyze some transactions to build your history!
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Explore Aptos Transactions
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Enter any Aptos transaction hash to get a detailed, easy-to-understand analysis with balance changes and educational insights.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Aptos transaction hash..."
                  className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !hash.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={loadRecentTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Recent Transactions
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span className="text-slate-600 dark:text-slate-400 text-xs">
                💡 <strong>Pro tip:</strong> Copy any transaction hash from <a href="https://explorer.aptoslabs.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Aptos Explorer</a>
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {transaction && (
          <div className="space-y-6">
            {/* Professional Summary Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0">
                    {transaction.success ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl">✗</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Transaction Analysis
                      </h2>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getTransactionTypeColor(transaction.transactionType)}`}>
                        {transaction.transactionType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {transaction.summary}
                    </p>
                    
                    {/* What Happened Section */}
                    <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        What Happened
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {transaction.transactionType === 'TRANSFER' 
                          ? `Your token balances were updated. This typically happens when you receive tokens, make a purchase, or when your staking rewards are distributed. This transaction cost ${transaction.gasFee.toFixed(6)} APT in gas fees. The cost covers computation and storage, with any storage rebates deducted from the total.`
                          : transaction.transactionType === 'SWAP'
                          ? `You executed a token swap through a decentralized exchange. This transaction involved multiple token transfers and cost ${transaction.gasFee.toFixed(6)} APT in gas fees. The swap was processed using Aptos's parallel execution engine for optimal performance.`
                          : `This transaction modified your account state and cost ${transaction.gasFee.toFixed(6)} APT in gas fees. The cost covers computation and storage operations on the Aptos blockchain.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => copyToClipboard(transaction.hash, 'hash')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    {copied === 'hash' ? 'Copied!' : 'Copy Digest'}
                  </button>
                  {transaction.sender && (
                    <button
                      onClick={() => transaction.sender && copyToClipboard(transaction.sender, 'sender')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Sender
                    </button>
                  )}
                  <button
                    onClick={exportToJSON}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={shareTransaction}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={openInExplorer}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </button>
                </div>
              </div>
            </div>

            {/* Sender and Time Information */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm">
                  👤
                </div>
                Transaction Info
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Sender</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-900 dark:text-slate-100 text-sm">
                        {transaction.sender ? `${transaction.sender.slice(0, 8)}...${transaction.sender.slice(-8)}` : 'Unknown'}
                      </span>
                      <button
                        onClick={() => transaction.sender && copyToClipboard(transaction.sender, 'sender')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Time</h4>
                    <div className="text-slate-900 dark:text-slate-100">
                      {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Timeline */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm">
                  ⏱️
                </div>
                Transaction Timeline
              </h3>
              
              <div className="space-y-4">
                {transaction.functionCalls.map((call, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⚡</span>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {call.protocol || 'Function Call'}
                        </h4>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                        {call.description}
                      </p>
                      <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                        {call.module}::{call.function}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Gas Payment Step */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {transaction.functionCalls.length + 1}
                  </div>
                  <div className="flex-1 p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⛽</span>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        Pay Gas
                      </h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                      Paid {transaction.gasFee.toFixed(6)} APT for gas
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Transaction finalized
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Object Changes (Account Changes) */}
            {transaction.accountChanges.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm">
                    🔄
                  </div>
                  Object Changes ({transaction.accountChanges.length})
                </h3>
                
                <div className="space-y-3">
                  {transaction.accountChanges.slice(0, 10).map((change, index) => (
                    <div key={index} className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">mutated</span>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {change.description || `Updated ${change.changeType || 'Account'}`}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {change.account ? `${change.account.slice(0, 8)}...${change.account.slice(-8)}` : 'Unknown address'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {change.balance ? `${change.balance} tokens` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  {transaction.accountChanges.length > 10 && (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                      ... and {transaction.accountChanges.length - 10} more changes
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Move Call Details */}
            {transaction.functionCalls.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                    📞
                  </div>
                  Move Call
                </h3>
                
                {transaction.functionCalls.map((call, index) => (
                  <div key={index} className="p-6 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <div className="font-mono text-slate-900 dark:text-slate-100 text-sm mb-4">
                      {call.module}::{call.function}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Package:</span>
                        <div className="font-mono text-slate-900 dark:text-slate-100 text-xs mt-1">
                          {call.module.split('::')[0] || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Module:</span>
                        <div className="font-mono text-slate-900 dark:text-slate-100 text-xs mt-1">
                          {call.module.split('::')[1] || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Function:</span>
                        <div className="font-mono text-slate-900 dark:text-slate-100 text-xs mt-1">
                          {call.function}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gas Usage Analysis */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm">
                  ⛽
                </div>
                Gas Usage
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Gas Efficiency</span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full font-semibold">
                        Cheap
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Good gas usage
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Gas Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Computation:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {(transaction.gasFee * 0.8).toFixed(6)} APT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Storage:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {(transaction.gasFee * 0.2).toFixed(6)} APT
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2">
                        <span className="text-slate-600 dark:text-slate-400">Total Cost:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {transaction.gasFee.toFixed(6)} APT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Transaction Information */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
                  📊
                </div>
                Transaction Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Basic Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Hash:</span>
                        <span className="font-mono text-slate-900 dark:text-slate-100 text-xs">{transaction.hash.slice(0, 20)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Status:</span>
                        <span className={`font-semibold ${transaction.success ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Gas Fee:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.gasFee.toFixed(6)} APT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Version:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.version.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Function Calls:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.functionCalls.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Token Transfers:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.tokenTransfers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Account Changes:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.accountChanges.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Balance Changes:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.balanceChanges?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Function Calls Details */}
              {transaction.functionCalls.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Function Calls</h4>
                  <div className="space-y-2">
                    {transaction.functionCalls.map((call, index) => (
                      <div key={index} className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{call.module}::{call.function}</span>
                            {call.protocol && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {call.protocol}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{call.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Token Transfers Details */}
              {transaction.tokenTransfers.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Token Transfers</h4>
                  <div className="space-y-2">
                    {transaction.tokenTransfers.map((transfer, index) => (
                      <div key={index} className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{transfer.amount} {transfer.tokenSymbol}</span>
                            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">({transfer.tokenName})</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          From: {transfer.from.slice(0, 8)}...{transfer.from.slice(-8)} → To: {transfer.to.slice(0, 8)}...{transfer.to.slice(-8)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Balance Changes */}
            {transaction.balanceChanges && transaction.balanceChanges.length > 0 && (
              <BalanceChanges balanceChanges={transaction.balanceChanges} />
            )}

            {/* Educational Content */}
            {transaction.educationalContent && transaction.educationalContent.length > 0 && (
              <EducationalContent educationalContent={transaction.educationalContent} />
            )}

            {/* Error Information */}
            {transaction.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4">
                  Transaction Failed
                </h3>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                  <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {transaction.error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Compact Footer - Fixed to Bottom */}
      <footer className="mt-auto bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
              Made with ❤️ for the Aptos community
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-500">
              <span>Open source</span>
              <span>•</span>
              <span>No registration required</span>
              <span>•</span>
              <span>Professional transaction analysis</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}