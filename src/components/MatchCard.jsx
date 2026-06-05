import React from 'react';
import { Check, Trophy } from 'lucide-react';

export default function MatchCard({ match, roundIndex, onRecordResult }) {
  const { id, playerAId, playerBId, playerAName, playerBName, winnerId, scoreA, scoreB, isBye, isCompleted } = match;

  const handleSetResult = (winningPlayerId, winsA, winsB) => {
    onRecordResult(roundIndex, id, winningPlayerId, winsA, winsB);
  };

  if (isBye) {
    const activePlayerName = playerAId === 'bye' ? playerBName : playerAName;
    return (
      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex items-center justify-between opacity-70">
        <div>
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">Bye Match</span>
          <span className="text-sm font-semibold text-slate-300">{activePlayerName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/15">
          <Trophy className="w-3.5 h-3.5" />
          Bye Win
        </div>
      </div>
    );
  }

  const isWinnerA = isCompleted && winnerId === playerAId;
  const isWinnerB = isCompleted && winnerId === playerBId;

  return (
    <div className={`bg-slate-950/60 border rounded-xl p-4 transition ${isCompleted ? 'border-slate-850' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Player A details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-bold truncate ${isWinnerA ? 'text-blue-400' : isWinnerB ? 'text-slate-500' : 'text-slate-200'}`}>
              {playerAName}
            </span>
            {isWinnerA && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
          </div>
          <div className="text-xs text-slate-500">Wins: {scoreA}</div>
        </div>

        {/* VS Separator */}
        <span className="text-xs font-black text-slate-600 px-2 select-none">VS</span>

        {/* Player B details */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between mb-1 flex-row-reverse">
            <span className={`text-sm font-bold truncate ${isWinnerB ? 'text-indigo-400' : isWinnerA ? 'text-slate-500' : 'text-slate-200'}`}>
              {playerBName}
            </span>
            {isWinnerB && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
          </div>
          <div className="text-xs text-slate-500">Wins: {scoreB}</div>
        </div>
      </div>

      {/* Score Quick Selection Row */}
      <div className="mt-4 pt-3 border-t border-slate-900/60">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2 text-center">
          Record Results
        </span>
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <button
            onClick={() => handleSetResult(playerAId, 2, 0)}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition border ${
              isCompleted && winnerId === playerAId && scoreA === 2 && scoreB === 0
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            2 - 0
          </button>
          <button
            onClick={() => handleSetResult(playerAId, 2, 1)}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition border ${
              isCompleted && winnerId === playerAId && scoreA === 2 && scoreB === 1
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            2 - 1
          </button>
          <button
            onClick={() => handleSetResult(playerBId, 1, 2)}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition border ${
              isCompleted && winnerId === playerBId && scoreA === 1 && scoreB === 2
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            1 - 2
          </button>
          <button
            onClick={() => handleSetResult(playerBId, 0, 2)}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition border ${
              isCompleted && winnerId === playerBId && scoreA === 0 && scoreB === 2
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            0 - 2
          </button>
        </div>
      </div>
    </div>
  );
}
