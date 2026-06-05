import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Predefined default player configurations
const DEFAULT_PLAYERS = [
  { id: '1', name: 'Player 1', color: '#ef4444', class: 'player1' },
  { id: '2', name: 'Player 2', color: '#3b82f6', class: 'player2' },
  { id: '3', name: 'Player 3', color: '#10b981', class: 'player3' },
  { id: '4', name: 'Player 4', color: '#f59e0b', class: 'player4' },
  { id: '5', name: 'Player 5', color: '#8b5cf6', class: 'player5' },
  { id: '6', name: 'Player 6', color: '#f97316', class: 'player6' },
  { id: '7', name: 'Player 7', color: '#ec4899', class: 'player7' },
  { id: '8', name: 'Player 8', color: '#06b6d4', class: 'player8' },
];

export const useStackStore = create(
  persist(
    (set, get) => ({
      stack: [], // LIFO array: bottom is index 0, top is index stack.length - 1
      history: [], // List of resolved items: first resolved is at index 0, latest resolved at the end
      players: DEFAULT_PLAYERS,
      filterPlayerId: 'all',
      
      // Sound configuration
      soundEnabled: true,
      
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setFilterPlayerId: (id) => set({ filterPlayerId: id }),

      // Plays a standard browser synth sound for feedback
      playSound: (type) => {
        if (!get().soundEnabled) return;
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          if (type === 'add') {
            osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } else if (type === 'resolve') {
            osc.frequency.setValueAtTime(660, ctx.currentTime); // E5
            osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.15); // E4
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          } else if (type === 'clear') {
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }
        } catch (e) {
          console.warn("AudioContext block/error", e);
        }
      },

      // Actions
      addToStack: (name, type, playerId, customColor = null, cardImage = null, notes = '') => {
        const player = get().players.find(p => p.id === playerId) || DEFAULT_PLAYERS[0];
        const newItem = {
          id: Math.random().toString(36).substring(2, 9),
          name: name.trim() || 'Unnamed Effect',
          type, // 'spell' | 'trigger' | 'ability'
          playerId,
          playerName: player.name,
          color: customColor || player.color,
          cardImage,
          notes: notes.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        set((state) => ({
          stack: [...state.stack, newItem]
        }));
        get().playSound('add');
      },

      resolveTop: () => {
        const { stack } = get();
        if (stack.length === 0) return null;

        const newStack = [...stack];
        const resolvedItem = newStack.pop(); // Pop top item

        const resolutionOrder = get().history.length + 1;
        const historyItem = {
          ...resolvedItem,
          resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          resolutionOrder,
        };

        set((state) => ({
          stack: newStack,
          history: [...state.history, historyItem]
        }));

        get().playSound('resolve');
        return resolvedItem;
      },

      undoLastResolve: () => {
        const { history } = get();
        if (history.length === 0) return;

        const newHistory = [...history];
        const undoneItem = newHistory.pop();

        // Remove history specific fields when pushing back to stack
        const { resolvedAt, resolutionOrder, ...stackItem } = undoneItem;

        set((state) => ({
          stack: [...state.stack, stackItem],
          history: newHistory
        }));
        get().playSound('add');
      },

      clearStack: () => {
        set({ stack: [] });
        get().playSound('clear');
      },

      clearHistory: () => {
        set({ history: [] });
      },

      updatePlayer: (id, name, color) => {
        set((state) => ({
          players: state.players.map(p => p.id === id ? { ...p, name, color } : p),
          // Sync names/colors on the current stack & history for simplicity
          stack: state.stack.map(item => item.playerId === id ? { ...item, playerName: name, color } : item),
          history: state.history.map(item => item.playerId === id ? { ...item, playerName: name, color } : item)
        }));
      },

      reorderStack: (newStack) => {
        set({ stack: newStack });
      }
    }),
    {
      name: 'mtg-stack-tracker-storage',
    }
  )
);
