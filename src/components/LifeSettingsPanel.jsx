import React, { useState } from 'react';
import { useLifeStore } from '../store/lifeStore';
import { Plus, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Settings2, RefreshCw } from 'lucide-react';

export default function LifeSettingsPanel() {
  const {
    players,
    layoutOrder,
    addLifePlayer,
    removeLifePlayer,
    toggleLifePlayerActive,
    reorderLifePlayers,
    resetLifeTotals,
    resetCommanderDamage
  } = useLifeStore();

  const [newName, setNewName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    // Choose a random color for the player
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addLifePlayer(newName, randomColor);
    setNewName('');
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...layoutOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    reorderLifePlayers(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index >= layoutOrder.length - 1) return;
    const newOrder = [...layoutOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    reorderLifePlayers(newOrder);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
          <Settings2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-extrabold text-base text-white tracking-wide">Tracker Settings</h2>
          <p className="text-[10px] text-slate-400 font-medium">Configure players and board ordering</p>
        </div>
      </div>

      {/* Add Player */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New player..."
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl transition active:scale-95 flex items-center justify-center shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Reset options */}
      <div className="grid grid-cols-2 gap-2 border-b border-slate-850/60 pb-5">
        <button
          onClick={resetLifeTotals}
          className="flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-slate-300 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl transition"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Life
        </button>
        <button
          onClick={resetCommanderDamage}
          className="flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-slate-300 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl transition"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Comm Dmg
        </button>
      </div>

      {/* Reorder and visibility controls */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Board Layout Reordering
        </h3>

        <div className="space-y-2">
          {layoutOrder.map((id, index) => {
            const player = players.find(p => p.id === id);
            if (!player) return null;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  player.active 
                    ? 'bg-slate-950/40 border-slate-850' 
                    : 'bg-slate-950/10 border-slate-900/60 opacity-40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-xs font-semibold text-slate-200 truncate pr-1">
                    {player.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Swap arrows */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === layoutOrder.length - 1}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>

                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleLifePlayerActive(player.id)}
                    className="p-1 text-slate-500 hover:text-slate-200 transition"
                    title={player.active ? "Hide Player" : "Show Player"}
                  >
                    {player.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Remove player */}
                  <button
                    onClick={() => removeLifePlayer(player.id)}
                    className="p-1 text-rose-500/70 hover:text-rose-400 transition"
                    title="Delete Player"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
