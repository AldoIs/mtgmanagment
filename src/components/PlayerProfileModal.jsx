import React from 'react';
import { createPortal } from 'react-dom';
import { useLeagueStore } from '../store/leagueStore';
import { X, Award, Skull, PlusCircle, AlertCircle, BookOpen, Star } from 'lucide-react';

export default function PlayerProfileModal({ playerId, onClose }) {
  const { leaguePlayers, games } = useLeagueStore();
  
  const player = leaguePlayers.find(p => p.id === playerId);
  if (!player) return null;

  // Retrieve player records across all games
  const playerGames = games.filter(g => g.playerRecords.some(r => r.playerId === playerId));
  
  // Calculate individual stats
  const totalGames = playerGames.length;
  let wins = 0;
  let totalEliminations = 0;
  let totalPoints = 0;
  let totalVarietyPoints = 0;
  let totalTopKillPoints = 0;
  let totalConceded = 0;
  const commanderFrequency = {};
  const deckList = [];

  const gameRecords = playerGames.map((g) => {
    const record = g.playerRecords.find(r => r.playerId === playerId);
    
    // Stats accumulators
    if (record.placement === 1) wins++;
    totalEliminations += record.eliminationsCount;
    totalPoints += record.pointsEarned;
    if (record.varietyBonusActive) totalVarietyPoints++;
    if (record.eliminatedTopPlayer) totalTopKillPoints++;
    if (record.penaltyActive) totalConceded++;
    
    commanderFrequency[record.commanderName] = (commanderFrequency[record.commanderName] || 0) + 1;
    if (!deckList.includes(record.deckName)) deckList.push(record.deckName);

    return {
      gameId: g.id,
      date: g.date,
      record,
      gamePlayersCount: g.playerRecords.length,
      allPlayers: g.playerRecords,
    };
  });

  const winrate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  // Sort commanders by most played
  const sortedCommanders = Object.entries(commanderFrequency).sort((a, b) => b[1] - a[1]);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto cursor-default flex flex-col gap-5 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <div>
            <h3 className="font-black text-xl text-white tracking-wide">{player.name}</h3>
            <p className="text-xs text-slate-500">Commander League Profile</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Winrate</span>
            <span className="text-lg font-black text-white font-mono">{winrate.toFixed(0)}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">({wins} / {totalGames} Games)</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Points</span>
            <span className="text-lg font-black text-blue-400 font-mono">{totalPoints}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Points Score</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Eliminations</span>
            <span className="text-lg font-black text-rose-400 font-mono">{totalEliminations}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Opponents Out</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Commanders</span>
            <span className="text-lg font-black text-indigo-400 font-mono">{sortedCommanders.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Unique Played</span>
          </div>
        </div>

        {/* Meta / Decks History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Decks & Commanders</span>
            </h4>
            {sortedCommanders.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No deck logs yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {sortedCommanders.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-xs p-1">
                    <span className="font-semibold text-slate-300">{name}</span>
                    <span className="text-slate-500 font-mono">{count} {count === 1 ? 'game' : 'games'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Breakdown */}
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Points Breakdown</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Variety Bonuses (+1 pts)</span>
                <span className="font-mono text-slate-200">{totalVarietyPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Eliminated Leaders (+1 pts)</span>
                <span className="font-mono text-slate-200">{totalTopKillPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Concessions / Self-Outs (-1 pts)</span>
                <span className="font-mono text-rose-400">{totalConceded}</span>
              </div>
              <div className="flex justify-between">
                <span>Kill Points (+1 per elim)</span>
                <span className="font-mono text-slate-200">{totalEliminations}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Games Log Timeline */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">Recent Games Log</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {gameRecords.length === 0 ? (
              <p className="text-xs text-slate-650 italic text-center py-6">No games registered under this player.</p>
            ) : (
              gameRecords.reverse().map(({ gameId, date, record, gamePlayersCount, allPlayers }) => {
                const isWinner = record.placement === 1;

                return (
                  <div 
                    key={gameId} 
                    className="p-3.5 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">{date}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          isWinner ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {record.placement === 1 ? '1st' : `${record.placement}th`}
                        </span>
                      </div>
                      
                      <div className="font-black text-slate-200 mt-1">
                        {record.commanderName} <span className="font-normal text-slate-400 text-[11px]">({record.deckName})</span>
                      </div>
                      
                      {/* Eliminations */}
                      {record.eliminationsCount > 0 && (
                        <div className="text-[10px] text-rose-400/90 font-medium flex items-center gap-0.5 mt-1">
                          <Skull className="w-3 h-3" />
                          {record.eliminationsCount} {record.eliminationsCount === 1 ? 'Elimination' : 'Eliminations'}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-bold text-slate-200 text-sm">{record.pointsEarned} pts</span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                        {record.varietyBonusActive && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 px-1 rounded">Variety</span>
                        )}
                        {record.eliminatedTopPlayer && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-yellow-500/10 border border-yellow-500/15 text-yellow-400 px-1 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-400" /> Leader</span>
                        )}
                        {record.penaltyActive && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/15 text-rose-400 px-1 rounded">Penalty</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
