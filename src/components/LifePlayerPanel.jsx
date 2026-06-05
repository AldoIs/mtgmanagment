import React, { useState } from 'react';
import { useLifeStore } from '../store/lifeStore';
import LifeCommanderSearch from './LifeCommanderSearch';
import CommanderDamageTracker from './CommanderDamageTracker';
import { Sparkles, Swords, Search, Heart, ShieldAlert, Skull } from 'lucide-react';

export default function LifePlayerPanel({ player, isLowest }) {
  const { adjustLife, updateLifePlayer } = useLifeStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showDamage, setShowDamage] = useState(false);

  const handleSelectCommander = (name, image) => {
    updateLifePlayer(player.id, { commanderName: name, commanderImage: image });
    setShowSearch(false);
  };

  // Check if any commander damage is lethal or dangerous
  const damageReceived = Object.values(player.commanderDamage);
  const hasLethalDamage = damageReceived.some(d => d >= 21);
  const hasNearLethalDamage = damageReceived.some(d => d >= 15 && d < 21);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 h-full min-h-0 flex flex-col justify-between ${
        hasLethalDamage 
          ? 'border-rose-600 bg-rose-950/20 shadow-lg shadow-rose-900/10'
          : isLowest && player.life < 40
          ? 'border-amber-500 shadow-md shadow-amber-500/5'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
      }`}
      style={{
        backgroundColor: player.commanderImage ? 'transparent' : undefined
      }}
    >
      {/* Commander Background Image */}
      {player.commanderImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 blur-[1px]"
          style={{ backgroundImage: `url(${player.commanderImage})` }}
        />
      )}

      {/* Layer to dim/overlay background */}
      <div 
        className="absolute inset-0 z-10 bg-slate-950/75 mix-blend-multiply" 
        style={{ backgroundColor: `${player.color}10` }} 
      />

      {/* Main card content container */}
      <div className="relative z-20 p-4 flex-1 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto">
        {/* Card Header (Player name input & identity badge) */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-900/40 pb-2">
          <input
            type="text"
            value={player.name}
            onChange={(e) => updateLifePlayer(player.id, { name: e.target.value })}
            className="bg-transparent font-black text-slate-100 placeholder-slate-500 text-sm focus:outline-none border-b border-transparent focus:border-slate-700 focus:bg-slate-950/30 px-1 rounded max-w-[120px]"
            placeholder="Edit Name"
          />

          <div className="flex items-center gap-1.5">
            {/* Color picker circle */}
            <input
              type="color"
              value={player.color}
              onChange={(e) => updateLifePlayer(player.id, { color: e.target.value })}
              className="w-3.5 h-3.5 rounded-full border border-slate-800 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
            />
            {/* Commander search button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 text-slate-500 hover:text-slate-200 transition"
              title="Search Commander"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Panels Overlay: Search or Damage Matrix */}
        {showSearch ? (
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 my-auto">
            <LifeCommanderSearch
              onSelect={handleSelectCommander}
              onCancel={() => setShowSearch(false)}
            />
          </div>
        ) : showDamage ? (
          <div className="my-auto">
            <CommanderDamageTracker player={player} />
            <button
              onClick={() => setShowDamage(false)}
              className="w-full text-center text-[10px] text-indigo-400 hover:underline mt-2 font-bold uppercase tracking-wider"
            >
              Close Damage Tracker
            </button>
          </div>
        ) : (
          /* DEFAULT: LIFE TOTAL & INCREMENT CONTROLS */
          <div className="my-auto flex flex-col items-center">
            {/* Commander name text */}
            {player.commanderName && (
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md truncate max-w-full mb-1">
                {player.commanderName}
              </span>
            )}

            {/* Lethal warnings */}
            {hasLethalDamage ? (
              <div className="flex items-center gap-1 text-xs text-rose-400 font-bold uppercase animate-pulse mb-1">
                <Skull className="w-3.5 h-3.5" /> Dead (Comm. Dmg)
              </div>
            ) : hasNearLethalDamage ? (
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold uppercase animate-pulse mb-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Danger
              </div>
            ) : player.life <= 0 ? (
              <div className="flex items-center gap-1 text-xs text-rose-500 font-bold uppercase animate-pulse mb-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500/20" /> Defeated
              </div>
            ) : null}

            {/* Life display */}
            <div className="relative group">
              <span 
                className={`text-5xl sm:text-6xl font-black font-mono tracking-tighter ${
                  hasLethalDamage || player.life <= 0
                    ? 'text-rose-500'
                    : isLowest && player.life < 40
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {player.life}
              </span>
            </div>

            {/* Life increments buttons row */}
            <div className="w-full mt-4 space-y-2.5">
              {/* Main Adjustments (-1 / +1) */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => adjustLife(player.id, -1)}
                  className="w-10 h-10 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-lg font-black text-slate-300 hover:text-white transition active:scale-90"
                >
                  -
                </button>
                <button
                  onClick={() => adjustLife(player.id, 1)}
                  className="w-10 h-10 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-lg font-black text-slate-300 hover:text-white transition active:scale-90"
                >
                  +
                </button>
              </div>

              {/* Quick Jump Adjustments (-5 / +5) */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => adjustLife(player.id, -5)}
                  className="px-2 py-1 rounded-lg bg-slate-950/30 hover:bg-slate-900 border border-slate-900 text-[10px] font-bold text-slate-400 hover:text-white transition active:scale-95"
                >
                  -5
                </button>
                <button
                  onClick={() => adjustLife(player.id, 5)}
                  className="px-2 py-1 rounded-lg bg-slate-950/30 hover:bg-slate-900 border border-slate-900 text-[10px] font-bold text-slate-400 hover:text-white transition active:scale-95"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer selector tab (switch to Commander damage tracker) */}
        {!showSearch && !showDamage && (
          <div className="flex items-center justify-center border-t border-slate-900/30 pt-2.5">
            <button
              onClick={() => setShowDamage(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-350 bg-slate-950/80 hover:bg-slate-900 hover:text-white border border-slate-850/80 transition"
            >
              <Swords className="w-3 h-3 text-slate-500" />
              Commander Damage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
