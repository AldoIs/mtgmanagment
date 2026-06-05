import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLeagueStore = create(
  persist(
    (set, get) => ({
      leaguePlayers: [], // Array of { id, name, previousRank, currentRank }
      games: [], // Array of { id, date, playerRecords: [...] }
      
      // Actions
      addLeaguePlayer: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        
        // Prevent duplicate names
        if (get().leaguePlayers.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) return;
        
        const newPlayer = {
          id: Math.random().toString(36).substring(2, 9),
          name: trimmedName,
          previousRank: 0,
          currentRank: 0,
        };
        
        set((state) => ({
          leaguePlayers: [...state.leaguePlayers, newPlayer]
        }));
        // Update rankings to initialize rank trends
        get().updateRankingsHistory();
      },
      
      removeLeaguePlayer: (id) => {
        set((state) => ({
          leaguePlayers: state.leaguePlayers.filter(p => p.id !== id),
          // Clean up games? Let's keep them but filter out player records to avoid crashes
          games: state.games.map(g => ({
            ...g,
            playerRecords: g.playerRecords.filter(r => r.playerId !== id)
          }))
        }));
        get().updateRankingsHistory();
      },
      
      registerGame: (date, gamePlayers) => {
        // gamePlayers is an array of:
        // { playerId, deckName, commanderName, eliminationOrderIndex (0 for first out, up to N-1 for winner), eliminatedBy (playerId or null), penaltyActive (conceded) }
        
        // 1. Determine who was the top ranked player BEFORE this game started
        const currentStandings = get().getLeagueStandings();
        const topPlayerId = currentStandings.length > 0 ? currentStandings[0].id : null;
        
        const n = gamePlayers.length;
        
        // 2. Map game results and calculate points
        const playerRecords = gamePlayers.map((gp) => {
          // Placement: 1st is the winner (last remaining / highest eliminationOrderIndex), 2nd is next, etc.
          // eliminationOrderIndex goes from 0 (first out) to n-1 (winner)
          const placement = n - gp.eliminationOrderIndex; 
          
          // Base Points
          let basePoints = 1;
          if (placement === 1) basePoints = 5;
          else if (placement === 2) basePoints = 3;
          else if (placement === 3) basePoints = 2;
          
          // Eliminations count: count how many times this player eliminated someone in the game
          const eliminationsCount = gamePlayers.filter(other => other.eliminatedBy === gp.playerId && other.playerId !== gp.playerId).length;
          
          // Variety Bonus: +1 if they used a different commander than their previous game
          const playerPreviousGames = get().games.filter(g => g.playerRecords.some(r => r.playerId === gp.playerId));
          let varietyBonusActive = false;
          if (playerPreviousGames.length > 0) {
            // Get latest game played by this player
            const lastGame = playerPreviousGames[playerPreviousGames.length - 1];
            const lastRecord = lastGame.playerRecords.find(r => r.playerId === gp.playerId);
            if (lastRecord && lastRecord.commanderName.trim().toLowerCase() !== gp.commanderName.trim().toLowerCase()) {
              varietyBonusActive = true;
            }
          } else {
            // First game ever counts as variety bonus
            varietyBonusActive = true;
          }
          
          // Eliminated Top Player Bonus: +1 if they eliminated the current leader
          const eliminatedTopPlayer = topPlayerId && gp.playerId !== topPlayerId && gamePlayers.some(other => other.playerId === topPlayerId && other.eliminatedBy === gp.playerId);
          
          // Penalty: -1 for early concede
          const penaltyActive = gp.penaltyActive || false;
          
          // Points earned in this game
          let pointsEarned = basePoints;
          pointsEarned += eliminationsCount; // +1 per elimination
          if (varietyBonusActive) pointsEarned += 1;
          if (eliminatedTopPlayer) pointsEarned += 1;
          if (penaltyActive) pointsEarned -= 1;
          
          return {
            playerId: gp.playerId,
            deckName: gp.deckName.trim(),
            commanderName: gp.commanderName.trim(),
            placement,
            eliminationsCount,
            eliminatedBy: gp.eliminatedBy,
            varietyBonusActive,
            eliminatedTopPlayer,
            penaltyActive,
            pointsEarned,
          };
        });
        
        const newGame = {
          id: Math.random().toString(36).substring(2, 9),
          date: date || new Date().toLocaleDateString(),
          playerRecords,
        };
        
        // Save game
        set((state) => ({
          games: [...state.games, newGame]
        }));
        
        // Recalculate rank trends after saving
        get().updateRankingsHistory();
      },
      
      updateRankingsHistory: () => {
        // Computes current standings, updates currentRank and previousRank in players array
        const standings = get().getLeagueStandings();
        set((state) => {
          const updatedPlayers = state.leaguePlayers.map((p) => {
            const currentRankIndex = standings.findIndex(s => s.id === p.id);
            const currentRank = currentRankIndex !== -1 ? currentRankIndex + 1 : 0;
            
            // Set previous rank to currentRank if it was 0 (new player), otherwise keep p.currentRank
            const previousRank = p.currentRank === 0 ? currentRank : p.currentRank;
            
            return {
              ...p,
              previousRank,
              currentRank,
            };
          });
          return { leaguePlayers: updatedPlayers };
        });
      },
      
      resetLeague: () => {
        set({
          games: [],
          leaguePlayers: get().leaguePlayers.map(p => ({ ...p, previousRank: 0, currentRank: 0 }))
        });
      },
      
      // Dynamic calculations for Leaderboard & Power Score
      getLeagueStandings: () => {
        const { leaguePlayers, games } = get();
        
        const standings = leaguePlayers.map((p) => {
          const playerGames = games.filter(g => g.playerRecords.some(r => r.playerId === p.id));
          const totalGames = playerGames.length;
          
          let wins = 0;
          let totalEliminations = 0;
          let totalPoints = 0;
          let varietyPoints = 0;
          const uniqueCommanders = new Set();
          const uniqueDecks = new Set();
          
          playerGames.forEach((g) => {
            const rec = g.playerRecords.find(r => r.playerId === p.id);
            if (rec) {
              if (rec.placement === 1) wins++;
              totalEliminations += rec.eliminationsCount;
              totalPoints += rec.pointsEarned;
              if (rec.varietyBonusActive) varietyPoints++;
              uniqueCommanders.add(rec.commanderName.toLowerCase());
              uniqueDecks.add(rec.deckName.toLowerCase());
            }
          });
          
          const winrate = totalGames > 0 ? wins / totalGames : 0;
          
          // Formula: Power Score = (points) + (winrate * 5) + (eliminations * 0.5) + (variety bonus)
          // variety bonus matches varietyPoints count
          const powerScore = totalPoints + (winrate * 5) + (totalEliminations * 0.5) + varietyPoints;
          
          return {
            id: p.id,
            name: p.name,
            totalGames,
            wins,
            winrate,
            totalEliminations,
            totalPoints,
            varietyPoints,
            uniqueCommandersCount: uniqueCommanders.size,
            uniqueDecksCount: uniqueDecks.size,
            powerScore: parseFloat(powerScore.toFixed(2)),
            previousRank: p.previousRank || 0,
            currentRank: p.currentRank || 0,
          };
        });
        
        // Sort by Power Score descending
        return standings.sort((a, b) => b.powerScore - a.powerScore);
      }
    }),
    {
      name: 'mtg-commander-league-storage',
    }
  )
);
