import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wand2, Zap, Sparkles, Trash2, ArrowUp, ArrowDown, FileText, Maximize2 } from 'lucide-react';

export default function StackItem({ item, index, isTop, totalItems, onMoveUp, onMoveDown, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);

  const getTypeIcon = () => {
    switch (item.type) {
      case 'spell':
        return <Wand2 className="w-5 h-5 text-indigo-400" />;
      case 'trigger':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ability':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'spell':
        return 'Spell';
      case 'trigger':
        return 'Trigger';
      case 'ability':
        return 'Ability';
      default:
        return '';
    }
  };

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 border ${
        isTop
          ? 'top-stack-item border-slate-100 bg-slate-900/90 shadow-2xl'
          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/50'
      }`}
      style={{
        '--glow-color': `${item.color}80`,
        borderLeft: `6px solid ${item.color}`,
      }}
    >
      {/* Top indicator badge */}
      {isTop && (
        <span
          className="absolute -top-3 left-4 px-3 py-0.5 text-xs font-black uppercase tracking-wider rounded-full text-white animate-pulse"
          style={{ backgroundColor: item.color }}
        >
          TOP (Resolves Next)
        </span>
      )}

      {/* Full screen modal card preview using React Portal to escape parents' clipping container */}
      {showPreview && item.cardImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative max-w-[280px] sm:max-w-[340px] w-full animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={item.cardImage} 
              alt={item.name} 
              className="w-full rounded-2xl shadow-2xl border border-slate-800 bg-slate-950"
            />
            <div className="text-center text-xs text-slate-400 mt-4 font-semibold bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 w-fit mx-auto">
              Click anywhere to close
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Card Artwork Thumbnail on Left */}
        {item.cardImage && (
          <div 
            className="relative shrink-0 select-none group cursor-pointer"
            onClick={() => setShowPreview(true)}
            title="Click to view full card image"
          >
            <img 
              src={item.cardImage} 
              alt={item.name} 
              className="w-12 h-16 object-cover rounded-lg border border-slate-700/80 group-hover:border-blue-400 transition shadow"
            />
            {/* Maximize overlay indicator */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">
              #{index + 1}
            </span>
            <span
              className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border"
              style={{
                borderColor: `${item.color}40`,
                color: item.color,
                backgroundColor: `${item.color}15`,
              }}
            >
              {getTypeIcon()}
              <span className="capitalize">{getTypeLabel()}</span>
            </span>
            <span className="text-xs text-slate-500 sm:ml-auto">{item.timestamp}</span>
          </div>

          <h3 className={`font-bold tracking-wide truncate ${isTop ? 'text-lg text-white' : 'text-slate-200'}`}>
            {item.name}
          </h3>

          {/* Custom Notes Section */}
          {item.notes && (
            <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs bg-slate-900/60 py-1 px-2.5 rounded-lg border border-slate-800/40 w-fit max-w-full">
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate italic">{item.notes}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-semibold text-slate-300">
              {item.playerName}
            </span>
          </div>
        </div>

        {/* Action buttons (Reordering + fizzle/delete) */}
        <div className="flex flex-col sm:flex-row items-center gap-1 self-center shrink-0">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === totalItems - 1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition"
            title="Move Up (toward top)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition"
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-400 hover:bg-rose-950/40 transition"
            title="Fizzle / Delete (Countered)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
