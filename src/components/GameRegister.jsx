import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import { Play, Plus, X, Skull, Award, AlertCircle, Save, Swords } from 'lucide-react';

export default function GameRegister() {
  const { leaguePlayers, registerGame } = useLeagueStore();
  
  // Game Setup States
  const [selectedPlayers, setSelectedPlayers] = useState([]); // Array of { id, name, deckName, commanderName }
  const [isGameActive, setIsGameActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Elimination Progress States
  const [activePlayers, setActivePlayers] = useState([]); // Players still in the game
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]); // List of { playerId, name, deckName, commanderName, eliminationOrderIndex, eliminatedBy, penaltyActive }
  const [gameDate, setGameDate] = useState(new Date().toLocaleDateString());

  const handleAddPlayer = (playerId) => {
    if (selectedPlayers.some(p => p.id === playerId)) return;
    if (selectedPlayers.length >= 6) return;

    const p = leaguePlayers.find(x => x.id === playerId);
    if (p) {
      setSelectedPlayers([...selectedPlayers, { id: p.id, name: p.name, deckName: '', commanderName: '' }]);
      setErrorMessage('');
    }
  };

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleDetailChange = (playerId, field, value) => {
    setSelectedPlayers(selectedPlayers.map(p => p.id === playerId ? { ...p, [field]: value } : p));
  };

  const handleStartGame = () => {
    if (selectedPlayers.length < 3) {
      setErrorMessage('You need at least 3 players to start a Commander game.');
      return;
    }
    if (selectedPlayers.some(p => !p.deckName.trim() || !p.commanderName.trim())) {
      setErrorMessage('Please fill in Deck and Commander names for all players.');
      return;
    }

    // Initialize tracking lists
    setActivePlayers([...selectedPlayers]);
    setEliminatedPlayers([]);
    setIsGameActive(true);
    setErrorMessage('');
  };

  const handleEliminatePlayer = (playerId, eliminatedById = null, isConcession = false) => {
    const p = activePlayers.find(x => x.id === playerId);
    if (!p) return;

    const orderIdx = eliminatedPlayers.length; // First out gets index 0
    const record = {
      playerId: p.id,
      name: p.name,
      deckName: p.deckName,
      commanderName: p.commanderName,
      eliminationOrderIndex: orderIdx,
      eliminatedBy: eliminatedById,
      penaltyActive: isConcession,
    };

    setEliminatedPlayers([...eliminatedPlayers, record]);
    
    const remaining = activePlayers.filter(x => x.id !== playerId);
    setActivePlayers(remaining);

    // If only 1 player remains, they are automatically the winner!
    if (remaining.length === 1) {
      const winner = remaining[0];
      const winnerRecord = {
        playerId: winner.id,
        name: winner.name,
        deckName: winner.deckName,
        commanderName: winner.commanderName,
        eliminationOrderIndex: orderIdx + 1, // Winner gets highest index (n-1)
        eliminatedBy: null,
        penaltyActive: false,
      };
      setEliminatedPlayers(prev => [...prev, winnerRecord]);
      setActivePlayers([]);
    }
  };

  const handleSaveResult = () => {
    // Register game using the collected elimination records
    registerGame(gameDate, eliminatedPlayers);

    // Reset Form
    setSelectedPlayers([]);
    setEliminatedPlayers([]);
    setActivePlayers([]);
    setIsGameActive(false);
  };

  const handleCancelGame = () => {
    setIsGameActive(false);
    setSelectedPlayers([]);
    setEliminatedPlayers([]);
    setActivePlayers([]);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white tracking-wide">Register Commander Game</h2>
            <p className="text-xs text-slate-400">Log eliminations and deck details in real-time</p>
          </div>
        </div>

        {isGameActive && (
          <button
            onClick={handleCancelGame}
            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 transition"
          >
            Cancel Game
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isGameActive ? (
        /* STEP 1: GAME SETUP */
        <div className="space-y-5">
          {/* Quick Player Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Players (3 to 6 players)
            </label>
            <div className="flex flex-wrap gap-2">
              {leaguePlayers.map((p) => {
                const isSelected = selectedPlayers.some(x => x.id === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => isSelected ? handleRemovePlayer(p.id) : handleAddPlayer(p.id)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
              {leaguePlayers.length === 0 && (
                <p className="text-xs text-slate-500 italic">No league players registered yet. Add players in League Settings first.</p>
              )}
            </div>
          </div>

          {/* Form details for selected players */}
          {selectedPlayers.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Decks & Commanders</h3>
              <div className="space-y-3">
                {selectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl flex flex-col md:flex-row md:items-center gap-3"
                  >
                    <div className="md:w-1/4 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">{player.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-slate-500 hover:text-rose-400 md:hidden p-1 rounded hover:bg-slate-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Deck Name (e.g. Dinosaurs)"
                        value={player.deckName}
                        onChange={(e) => handleDetailChange(player.id, 'deckName', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Commander (e.g. Gishath)"
                        value={player.commanderName}
                        onChange={(e) => handleDetailChange(player.id, 'commanderName', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-slate-500 hover:text-rose-400 hidden md:block p-1.5 rounded hover:bg-slate-900 transition"
                      title="Remove player"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action trigger */}
          {selectedPlayers.length >= 3 && (
            <div className="pt-4 border-t border-slate-850 flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Game Date</label>
                <input
                  type="text"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 w-full max-w-[150px]"
                />
              </div>
              <button
                type="button"
                onClick={handleStartGame}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/10 transition active:scale-95 flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Elimination Tracker
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: ACTIVE GAME TRACKER (ELIMINATION ORDER LOG) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Active Players Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Skull className="w-4 h-4 text-slate-500 animate-pulse" />
                <span>Active Players ({activePlayers.length})</span>
              </h3>
              
              <div className="space-y-3">
                {activePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-slate-100">{player.name}</span>
                        <span className="text-[10px] text-indigo-400 font-bold block mt-0.5">
                          {player.commanderName}
                        </span>
                      </div>
                      
                      {/* Concede Button */}
                      <button
                        onClick={() => handleEliminatePlayer(player.id, null, true)}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
                        title="Concede early or self-eliminate (-1 Penalty)"
                      >
                        Self-Out / Concede
                      </button>
                    </div>

                    {/* Elimination options */}
                    {activePlayers.length > 1 && (
                      <div className="pt-2.5 border-t border-slate-900 flex flex-col gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Eliminated by:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activePlayers
                            .filter(other => other.id !== player.id)
                            .map((killer) => (
                              <button
                                key={killer.id}
                                onClick={() => handleEliminatePlayer(player.id, killer.id, false)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 rounded-lg transition"
                              >
                                {killer.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Placements & Elimination Logs Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-4 h-4 text-slate-500" />
                <span>Elimination Log / Placements</span>
              </h3>

              <div className="bg-slate-950/30 border border-slate-850 rounded-xl p-4 space-y-3 min-h-[160px]">
                {eliminatedPlayers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12 italic">
                    Log player eliminations to build placements.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {/* Reverse to show latest event or show sequentially. Sequential is fine. */}
                    {[...eliminatedPlayers].reverse().map((record, index) => {
                      const placementLabel = 
                        record.eliminationOrderIndex === selectedPlayers.length - 1 
                          ? '1st (Winner)' 
                          : `${selectedPlayers.length - record.eliminationOrderIndex}th Place`;
                          
                      const isWinner = record.eliminationOrderIndex === selectedPlayers.length - 1;

                      return (
                        <div
                          key={record.playerId}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isWinner
                              ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-100'
                              : 'bg-slate-950/60 border-slate-900 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                              {placementLabel}
                            </div>
                            <span className="text-sm font-bold block mt-0.5">{record.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {record.commanderName}
                            </span>
                          </div>

                          <div className="text-right">
                            {record.penaltyActive ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                                Conceded (-1)
                              </span>
                            ) : record.eliminatedBy ? (
                              <div className="text-[10px] text-slate-400">
                                Eliminated by <span className="font-bold text-slate-200">{
                                  selectedPlayers.find(x => x.id === record.eliminatedBy)?.name
                                }</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Save Game Results Button (only active when game is finished) */}
              {activePlayers.length === 0 && (
                <button
                  type="button"
                  onClick={handleSaveResult}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white text-base py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/15 transition active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  Save Game & Calculate Scores
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
