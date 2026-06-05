import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import { Trophy, ArrowUp, ArrowDown, Minus, Info, RefreshCw, Crown } from 'lucide-react';
import PlayerProfileModal from './PlayerProfileModal';

export default function LeagueLeaderboard() {
  const { getLeagueStandings, resetLeague } = useLeagueStore();
  const standings = getLeagueStandings();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all league games and stats? This cannot be undone.")) {
      resetLeague();
    }
  };

  const getTrendIcon = (player) => {
    // If no games played, or previous rank was 0, return neutral
    if (player.totalGames === 0 || !player.previousRank || !player.currentRank) {
      return <Minus className="w-3.5 h-3.5 text-slate-500" />;
    }

    const diff = player.previousRank - player.currentRank;
    if (diff > 0) {
      return (
        <span className="flex items-center gap-0.5 text-emerald-400 font-bold text-[10px]">
          <ArrowUp className="w-3 h-3" />
          {diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center gap-0.5 text-rose-500 font-bold text-[10px]">
          <ArrowDown className="w-3 h-3" />
          {Math.abs(diff)}
        </span>
      );
    }
    return <Minus className="w-3.5 h-3.5 text-slate-600" />;
  };

  const hasPlayedGames = standings.some(s => s.totalGames > 0);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
            <Trophy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white tracking-wide">Commander Power Rankings</h2>
            <p className="text-xs text-slate-400">Sorts automatically by computed Power Score</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-450 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset League
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2">Rank</th>
              <th className="pb-3 text-center">Trend</th>
              <th className="pb-3">Player</th>
              <th className="pb-3 text-center">Power Score</th>
              <th className="pb-3 text-center">Points</th>
              <th className="pb-3 text-center">Winrate</th>
              <th className="pb-3 text-center">Elims</th>
              <th className="pb-3 text-right pr-2">Commanders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50 text-sm">
            {standings.map((player, index) => {
              const isFirst = hasPlayedGames && index === 0;

              return (
                <tr
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`cursor-pointer transition hover:bg-slate-900/40 group ${
                    isFirst ? 'bg-yellow-500/5 text-yellow-100' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <td className="py-4 pl-2 font-mono font-bold text-xs text-slate-500">
                    {index + 1}
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center">
                      {getTrendIcon(player)}
                    </div>
                  </td>
                  <td className="py-4 font-bold flex items-center gap-1.5 min-w-[130px]">
                    <span className="group-hover:underline">{player.name}</span>
                    {isFirst && (
                      <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </td>
                  <td className={`py-4 font-black text-center ${isFirst ? 'text-yellow-400' : 'text-slate-100'}`}>
                    {player.powerScore}
                  </td>
                  <td className="py-4 text-center text-slate-300 font-semibold">
                    {player.totalPoints}
                  </td>
                  <td className="py-4 text-center text-slate-400 font-mono text-xs">
                    {(player.winrate * 100).toFixed(0)}%
                  </td>
                  <td className="py-4 text-center text-slate-400">
                    {player.totalEliminations}
                  </td>
                  <td className="py-4 text-right pr-2 font-mono text-xs text-slate-500">
                    {player.uniqueCommandersCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!hasPlayedGames && (
        <p className="text-[11px] text-slate-500 text-center italic">
          No games logged yet. Form games above to build rankings.
        </p>
      )}

      <div className="flex items-center gap-2 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
        <Info className="w-4.5 h-4.5 text-blue-400 shrink-0" />
        <span className="text-[10px] text-slate-400">
          Click on any player row to view their <b>profile modal</b> containing win statistics, deck history, and game logs.
        </span>
      </div>

      {/* Modal Profile Viewer */}
      {selectedPlayerId && (
        <PlayerProfileModal
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
    </div>
  );
}
