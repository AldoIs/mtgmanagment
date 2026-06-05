import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import { UserPlus, Trash2, Users } from 'lucide-react';

export default function LeaguePlayerManager() {
  const { leaguePlayers, addLeaguePlayer, removeLeaguePlayer } = useLeagueStore();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addLeaguePlayer(name);
    setName('');
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-extrabold text-xl text-white tracking-wide">League Players</h2>
          <p className="text-xs text-slate-400">Register new players into the Commander League pool</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player Name (e.g. Aldo, Fabrizio...)"
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Registered Pool ({leaguePlayers.length})
        </h3>

        {leaguePlayers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600 border border-dashed border-slate-850 rounded-xl">
            No players registered yet. Add names above.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {leaguePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850/60 rounded-xl"
              >
                <span className="text-sm font-semibold text-slate-200 pl-1">{player.name}</span>
                <button
                  onClick={() => removeLeaguePlayer(player.id)}
                  className="text-rose-500/70 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg transition"
                  title="Delete player from league"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
