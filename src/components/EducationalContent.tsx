import { BookOpen, Lightbulb, Info } from 'lucide-react';

interface Props {
  educationalContent: string[];
}

export default function EducationalContent({ educationalContent }: Props) {
  if (!educationalContent || educationalContent.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
          📚
        </div>
        Learn About Aptos
      </h3>

      <div className="space-y-4">
        {educationalContent.map((content, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                {content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Aptos Resources */}
      <div className="mt-6 p-4 bg-slate-50/80 dark:bg-slate-700/50 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Want to Learn More About Aptos?</h4>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                • <strong>Move Language:</strong> Aptos uses Move for smart contracts, providing better security through formal verification
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                • <strong>Parallel Execution:</strong> Aptos can process up to 100,000 transactions per second using parallel execution
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                • <strong>Resource Model:</strong> Move&apos;s resource-oriented programming prevents common blockchain vulnerabilities
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                • <strong>Low Fees:</strong> Transactions typically cost less than $0.01 due to efficient parallel processing
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                • <strong>Fast Finality:</strong> Transactions confirm in under 1 second with high throughput
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aptos Ecosystem */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Popular Aptos Protocols</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-purple-800 dark:text-purple-200">
                • <strong>Liquidswap:</strong> DEX for token swaps
              </div>
              <div className="text-purple-800 dark:text-purple-200">
                • <strong>Aries Markets:</strong> Lending protocol
              </div>
              <div className="text-purple-800 dark:text-purple-200">
                • <strong>PancakeSwap:</strong> Multi-chain DEX
              </div>
              <div className="text-purple-800 dark:text-purple-200">
                • <strong>Aptos Coin:</strong> Native token (APT)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
