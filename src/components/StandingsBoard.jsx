import React from 'react';
import { useDraftStore } from '../store/draftStore';
import { Trophy, RefreshCw, Star } from 'lucide-react';

export default function StandingsBoard() {
  const { getStandings, resetTournament, rounds } = useDraftStore();
  const standings = getStandings();

  // Find the highest number of wins to identify ties/leaders
  const maxWins = standings.length > 0 ? standings[0].wins : 0;
  const hasPlayedMatches = standings.some(s => s.matchesPlayed > 0);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white tracking-wide">Leaderboard</h2>
            <p className="text-xs text-slate-400">Current tournament standings</p>
          </div>
        </div>

        <button
          onClick={resetTournament}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
          title="Reset Draft Tournament"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Draft
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2">Rank</th>
              <th className="pb-3">Player</th>
              <th className="pb-3 text-center">Wins</th>
              <th className="pb-3 text-center">Losses</th>
              <th className="pb-3 text-center">Played</th>
              <th className="pb-3 text-right pr-2">Games W/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60 text-sm">
            {standings.map((player, index) => {
              // Highlight leaders (only if matches have been played)
              const isLeader = hasPlayedMatches && player.wins === maxWins;

              return (
                <tr
                  key={player.id}
                  className={`transition ${
                    isLeader ? 'bg-yellow-500/5 text-yellow-200' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <td className="py-3.5 pl-2 font-mono font-bold text-xs text-slate-500">
                    {index + 1}
                  </td>
                  <td className="py-3.5 font-bold flex items-center gap-1.5 min-w-[120px]">
                    <span className="truncate">{player.name}</span>
                    {isLeader && (
                      <span className="text-yellow-400" title="Current Leader">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-black text-center text-slate-200">
                    {player.wins}
                  </td>
                  <td className="py-3.5 text-center text-slate-400">
                    {player.losses}
                  </td>
                  <td className="py-3.5 text-center text-slate-500">
                    {player.matchesPlayed}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-mono text-xs text-slate-400">
                    {player.gameWins} - {player.gameLosses}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty standings helper */}
      {!hasPlayedMatches && (
        <p className="text-[11px] text-slate-500 text-center italic">
          Start recording match scores to update the leaderboard rankings.
        </p>
      )}
    </div>
  );
}
