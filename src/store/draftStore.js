import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Circle Method Round Robin Pairings Generator
const generatePairings = (playersList) => {
  let list = [...playersList];
  const isOdd = list.length % 2 !== 0;
  
  if (isOdd) {
    list.push({ id: 'bye', name: 'BYE', isBye: true });
  }
  
  const n = list.length;
  const numRounds = n - 1;
  const rounds = [];
  
  for (let round = 0; round < numRounds; round++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const playerA = list[i];
      const playerB = list[n - 1 - i];
      
      const isBye = playerA.isBye || playerB.isBye;
      const byeWinnerId = playerA.isBye ? playerB.id : (playerB.isBye ? playerA.id : null);
      
      matches.push({
        id: `r${round}-m${i}`,
        playerAId: playerA.id,
        playerBId: playerB.id,
        playerAName: playerA.name,
        playerBName: playerB.name,
        isBye,
        winnerId: isBye ? byeWinnerId : null,
        scoreA: isBye && playerB.id === byeWinnerId ? 0 : (isBye ? 2 : 0),
        scoreB: isBye && playerA.id === byeWinnerId ? 0 : (isBye ? 2 : 0),
        isCompleted: isBye,
      });
    }
    rounds.push(matches);
    
    // Rotate players clockwise, keeping index 0 fixed
    const nextList = [
      list[0],
      list[n - 1],
      ...list.slice(1, n - 1)
    ];
    list = nextList;
  }
  
  return rounds;
};

export const useDraftStore = create(
  persist(
    (set, get) => ({
      players: [], // Array of { id, name }
      rounds: [], // Array of Array of matches
      isTournamentStarted: false,
      currentRoundIndex: 0,
      
      // Actions
      addPlayer: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        
        // Max 8 players
        if (get().players.length >= 8) return;
        
        // Prevent duplicate names
        if (get().players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) return;
        
        const newPlayer = {
          id: Math.random().toString(36).substring(2, 9),
          name: trimmedName,
        };
        
        set((state) => ({
          players: [...state.players, newPlayer]
        }));
      },
      
      removePlayer: (id) => {
        set((state) => ({
          players: state.players.filter(p => p.id !== id)
        }));
      },
      
      startTournament: () => {
        const { players } = get();
        if (players.length < 4) return; // Need at least 4 players
        
        const generatedRounds = generatePairings(players);
        set({
          rounds: generatedRounds,
          isTournamentStarted: true,
          currentRoundIndex: 0,
        });
      },
      
      recordMatchResult: (roundIdx, matchId, winnerId, scoreA, scoreB) => {
        set((state) => {
          const nextRounds = state.rounds.map((round, rIdx) => {
            if (rIdx !== roundIdx) return round;
            return round.map((match) => {
              if (match.id !== matchId) return match;
              return {
                ...match,
                winnerId,
                scoreA: parseInt(scoreA) || 0,
                scoreB: parseInt(scoreB) || 0,
                isCompleted: true,
              };
            });
          });
          return { rounds: nextRounds };
        });
      },
      
      setCurrentRoundIndex: (idx) => {
        set({ currentRoundIndex: idx });
      },
      
      resetTournament: () => {
        set({
          rounds: [],
          isTournamentStarted: false,
          currentRoundIndex: 0,
        });
      },
      
      // Custom selector to compute standings dynamically from matches
      getStandings: () => {
        const { players, rounds } = get();
        
        // Initialize stats
        const stats = {};
        players.forEach(p => {
          stats[p.id] = {
            id: p.id,
            name: p.name,
            wins: 0,
            losses: 0,
            ties: 0,
            matchesPlayed: 0,
            gameWins: 0,
            gameLosses: 0,
          };
        });
        
        // Traverse all rounds and matches to compile stats
        rounds.forEach((round) => {
          round.forEach((match) => {
            if (!match.isCompleted) return;
            
            // Skip update for virtual BYE player stats but award win to real player
            const isPlayerABye = match.playerAId === 'bye';
            const isPlayerBBye = match.playerBId === 'bye';
            
            if (!isPlayerABye && stats[match.playerAId]) {
              const s = stats[match.playerAId];
              s.matchesPlayed += 1;
              s.gameWins += match.scoreA;
              s.gameLosses += match.scoreB;
              
              if (match.winnerId === match.playerAId) {
                s.wins += 1;
              } else if (match.winnerId === match.playerBId) {
                s.losses += 1;
              } else {
                s.ties += 1;
              }
            }
            
            if (!isPlayerBBye && stats[match.playerBId]) {
              const s = stats[match.playerBId];
              s.matchesPlayed += 1;
              s.gameWins += match.scoreB;
              s.gameLosses += match.scoreA;
              
              if (match.winnerId === match.playerBId) {
                s.wins += 1;
              } else if (match.winnerId === match.playerAId) {
                s.losses += 1;
              } else {
                s.ties += 1;
              }
            }
          });
        });
        
        // Sort standings
        return Object.values(stats).sort((a, b) => {
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }
          if (a.losses !== b.losses) {
            return a.losses - b.losses;
          }
          const diffA = a.gameWins - a.gameLosses;
          const diffB = b.gameWins - b.gameLosses;
          return diffB - diffA;
        });
      }
    }),
    {
      name: 'mtg-draft-organizer-storage',
    }
  )
);
