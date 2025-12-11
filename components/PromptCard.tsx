import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { PromptResult } from '../types';

interface PromptCardProps {
  data: PromptResult;
  index: number;
}

const PromptCard: React.FC<PromptCardProps> = ({ data, index }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-all duration-300 shadow-lg group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            {index + 1}
          </span>
          <h3 className="text-md font-semibold text-white tracking-wide">{data.angle.replace(/_/g, ' ')}</h3>
        </div>
        <button
          onClick={copyToClipboard}
          className={`p-2 rounded-lg transition-all duration-200 ${
            copied 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
          title="Copy Prompt"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-50"></div>
        <p className="pl-4 text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap">
          {data.prompt}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Terminal size={12} />
        <span>Ready for NanoBanana Pro</span>
      </div>
    </div>
  );
};

export default PromptCard;