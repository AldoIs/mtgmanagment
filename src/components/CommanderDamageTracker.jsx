import React from 'react';
import { useLifeStore } from '../store/lifeStore';
import { ShieldAlert, Skull, Plus, Minus } from 'lucide-react';

export default function CommanderDamageTracker({ player }) {
  const { players, adjustCommanderDamage } = useLifeStore();

  // Find other active players
  const otherPlayers = players.filter(p => p.id !== player.id && p.active);

  return (
    <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 space-y-3 text-left">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Commander Damage Received</span>
      </div>

      {otherPlayers.length === 0 ? (
        <p className="text-[10px] text-slate-500 italic">No other active players at the table.</p>
      ) : (
        <div className="space-y-2.5">
          {otherPlayers.map((attacker) => {
            const damage = player.commanderDamage[attacker.id] || 0;
            const isLethal = damage >= 21;
            const isNearLethal = damage >= 15 && damage < 21;

            return (
              <div key={attacker.id} className="flex items-center justify-between gap-3 text-xs bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: attacker.color }} />
                  <span className="font-bold text-slate-350 truncate">{attacker.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Warning labels */}
                  {isLethal ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                      <Skull className="w-2.5 h-2.5" /> Lethal
                    </span>
                  ) : isNearLethal ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                      <ShieldAlert className="w-2.5 h-2.5" /> Danger
                    </span>
                  ) : null}

                  {/* Damage Value */}
                  <span className={`font-mono font-bold text-sm min-w-[18px] text-center ${isLethal ? 'text-rose-400' : isNearLethal ? 'text-amber-400' : 'text-slate-300'}`}>
                    {damage}
                  </span>

                  {/* Adjustments */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustCommanderDamage(player.id, attacker.id, -1)}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Decrease Damage"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => adjustCommanderDamage(player.id, attacker.id, 1)}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Increase Damage"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
