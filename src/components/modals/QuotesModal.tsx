import React from 'react';
import { Quote, Sparkles, X } from 'lucide-react';
import { POPULAR_QUOTES } from '../../data/fonts';

interface QuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote: (quoteText: string) => void;
}

export const QuotesModal: React.FC<QuotesModalProps> = ({
  isOpen,
  onClose,
  onSelectQuote,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Quotes Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quotes List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {POPULAR_QUOTES.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectQuote(item.quote);
                onClose();
              }}
              className="p-3.5 rounded-lg bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800 hover:border-cyan-500/50 cursor-pointer transition-all group shadow-sm"
            >
              <p className="text-xs font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors leading-relaxed">
                "{item.quote}"
              </p>
              <div className="text-[10px] text-neutral-500 mt-1.5 flex items-center justify-between">
                <span>— {item.author}</span>
                <span className="text-cyan-400 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Use Quote →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
