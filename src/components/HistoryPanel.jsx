import React from 'react';
import { useStackStore } from '../store/stackStore';
import { History, RotateCcw, Trash2, Wand2, Zap, Sparkles } from 'lucide-react';

export default function HistoryPanel() {
  const { history, undoLastResolve, clearHistory } = useStackStore();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'spell':
        return <Wand2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'trigger':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'ability':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return null;
    }
  };

  // History list should be shown from newest resolved at the top, or chronological.
  // Showing newest at the top is generally best for readability.
  const displayHistory = [...history].reverse();

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white tracking-wide">History</h2>
            <p className="text-xs text-slate-400">Resolved effects</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undoLastResolve}
            disabled={history.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition"
            title="Undo the last resolved effect and place it back on top of stack"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            onClick={clearHistory}
            disabled={history.length === 0}
            className="p-1.5 text-rose-500/85 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg disabled:opacity-30 transition"
            title="Clear resolution history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 max-h-[400px]">
        {displayHistory.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-600">
            <History className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">No resolved effects yet.</p>
          </div>
        ) : (
          displayHistory.map((item) => (
            <div
              key={`${item.id}-resolved-${item.resolutionOrder}`}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-600 shrink-0">
                  #{item.resolutionOrder}
                </span>
                <div
                  className="w-1.5 h-7 rounded shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-200 text-sm truncate">
                    {item.name}
                  </h4>
                  {item.notes && (
                    <p className="text-[10px] text-slate-400 italic truncate max-w-[180px]">
                      {item.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                      {item.playerName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-0.5">
                      {getTypeIcon(item.type)}
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono text-right pl-2 shrink-0">
                <div>Resolved</div>
                <div>{item.resolvedAt}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
