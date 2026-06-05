import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Aldo', life: 40, commanderName: '', commanderImage: '', active: true, color: '#ef4444', commanderDamage: {} },
  { id: 'p2', name: 'Fabrizio', life: 40, commanderName: '', commanderImage: '', active: true, color: '#3b82f6', commanderDamage: {} },
  { id: 'p3', name: 'Arturo', life: 40, commanderName: '', commanderImage: '', active: true, color: '#10b981', commanderDamage: {} },
  { id: 'p4', name: 'Jose', life: 40, commanderName: '', commanderImage: '', active: true, color: '#f59e0b', commanderDamage: {} },
];

export const useLifeStore = create(
  persist(
    (set, get) => ({
      players: DEFAULT_PLAYERS,
      layoutOrder: ['p1', 'p2', 'p3', 'p4'],

      addLifePlayer: (name, color = '#3b82f6') => {
        const id = Math.random().toString(36).substring(2, 9);
        const newPlayer = {
          id,
          name: name.trim() || `Player ${get().players.length + 1}`,
          life: 40,
          commanderName: '',
          commanderImage: '',
          active: true,
          color,
          commanderDamage: {},
        };

        set((state) => ({
          players: [...state.players, newPlayer],
          layoutOrder: [...state.layoutOrder, id],
        }));
      },

      removeLifePlayer: (id) => {
        set((state) => ({
          players: state.players.filter(p => p.id !== id),
          layoutOrder: state.layoutOrder.filter(x => x !== id),
        }));
      },

      toggleLifePlayerActive: (id) => {
        set((state) => ({
          players: state.players.map(p => p.id === id ? { ...p, active: !p.active } : p)
        }));
      },

      updateLifePlayer: (id, fields) => {
        set((state) => ({
          players: state.players.map(p => p.id === id ? { ...p, ...fields } : p)
        }));
      },

      adjustLife: (id, amount) => {
        set((state) => ({
          players: state.players.map(p => p.id === id ? { ...p, life: p.life + amount } : p)
        }));
      },

      adjustCommanderDamage: (targetId, attackerId, amount) => {
        set((state) => ({
          players: state.players.map((p) => {
            if (p.id !== targetId) return p;
            
            const currentDamage = p.commanderDamage[attackerId] || 0;
            const nextDamage = Math.max(0, currentDamage + amount);
            const actualDifference = nextDamage - currentDamage;
            
            return {
              ...p,
              life: p.life - actualDifference, // Combat damage reduces player's life total
              commanderDamage: {
                ...p.commanderDamage,
                [attackerId]: nextDamage
              }
            };
          })
        }));
      },

      reorderLifePlayers: (newOrder) => {
        set({ layoutOrder: newOrder });
      },

      resetLifeTotals: () => {
        set((state) => ({
          players: state.players.map(p => p.active ? { ...p, life: 40 } : p)
        }));
      },

      resetCommanderDamage: () => {
        set((state) => ({
          players: state.players.map(p => ({ ...p, commanderDamage: {} }))
        }));
      }
    }),
    {
      name: 'mtg-commander-life-storage',
    }
  )
);
