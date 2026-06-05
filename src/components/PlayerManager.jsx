import React, { useState } from 'react';
import { useDraftStore } from '../store/draftStore';
import { UserPlus, Trash2, ShieldAlert, Play } from 'lucide-react';

export default function PlayerManager() {
  const { players, addPlayer, removePlayer, startTournament } = useDraftStore();
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    addPlayer(playerName);
    setPlayerName('');
  };

  const isLimitReached = players.length >= 8;
  const isStartDisabled = players.length < 4;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
      <div>
        <h2 className="font-extrabold text-xl text-white tracking-wide">Player Registration</h2>
        <p className="text-xs text-slate-400">Add 4 to 8 players to start the draft tournament pairings</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="e.g. Aldo, Fabrizio..."
          disabled={isLimitReached}
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm disabled:opacity-40"
          required
        />
        <button
          type="submit"
          disabled={isLimitReached}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-30 disabled:hover:bg-blue-600 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span className="sm:inline hidden">Add Player</span>
        </button>
      </form>

      {/* Player Count Warning */}
      {isLimitReached && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Maximum player capacity reached (8 players).</span>
        </div>
      )}

      {/* Registered Players List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Registered Players ({players.length}/8)
        </h3>
        
        {players.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
            No players registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-850 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                  <span className="text-sm font-semibold text-slate-200 truncate">{player.name}</span>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="text-rose-500/70 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg transition"
                  title="Remove player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Tournament CTA */}
      <div className="pt-2 border-t border-slate-800/60">
        <button
          onClick={startTournament}
          disabled={isStartDisabled}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-40 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition"
        >
          <Play className="w-5 h-5 fill-white" />
          Generate Round-Robin Matches
        </button>
        {isStartDisabled && (
          <p className="text-[10px] text-slate-500 text-center mt-2">
            You need at least 4 players to generate pairings.
          </p>
        )}
      </div>
    </div>
  );
}
