import React from 'react';
import { useStackStore } from '../store/stackStore';
import StackItem from './StackItem';
import { Layers, Trash2, CheckCircle, Info } from 'lucide-react';

export default function StackView() {
  const {
    stack,
    filterPlayerId,
    setFilterPlayerId,
    players,
    resolveTop,
    clearStack,
    reorderStack
  } = useStackStore();

  // Helper to reorder (swap positions)
  const handleMoveUp = (index) => {
    if (index >= stack.length - 1) return;
    const newStack = [...stack];
    const temp = newStack[index];
    newStack[index] = newStack[index + 1];
    newStack[index + 1] = temp;
    reorderStack(newStack);
  };

  const handleMoveDown = (index) => {
    if (index <= 0) return;
    const newStack = [...stack];
    const temp = newStack[index];
    newStack[index] = newStack[index - 1];
    newStack[index - 1] = temp;
    reorderStack(newStack);
  };

  const handleDelete = (id) => {
    const newStack = stack.filter(item => item.id !== id);
    reorderStack(newStack);
  };

  // Apply player filter
  const filteredStack = filterPlayerId === 'all'
    ? stack
    : stack.filter(item => item.playerId === filterPlayerId);

  // Render top at the top (reversed stack array)
  const renderedItems = [...filteredStack].reverse();

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 p-5 backdrop-blur-xl">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white tracking-wide">The Stack</h2>
            <p className="text-xs text-slate-400">Multiplayer LIFO queue</p>
          </div>
        </div>

        {/* Global Stack Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearStack}
            disabled={stack.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg disabled:opacity-40 disabled:hover:bg-rose-500/10 transition"
            title="Remove all items from stack"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={resolveTop}
            disabled={stack.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 rounded-lg disabled:opacity-40 disabled:hover:bg-blue-600 transition duration-150 transform active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            Resolve Top
          </button>
        </div>
      </div>

      {/* Filter by player */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto select-none border-b border-slate-800/50">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-1">Filter:</span>
        <button
          onClick={() => setFilterPlayerId('all')}
          className={`px-3 py-1 text-xs font-bold rounded-full transition whitespace-nowrap border ${
            filterPlayerId === 'all'
              ? 'bg-slate-700 text-white border-slate-600'
              : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All Players
        </button>
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => setFilterPlayerId(player.id)}
            className={`px-3 py-1 text-xs font-bold rounded-full transition whitespace-nowrap border flex items-center gap-1.5 ${
              filterPlayerId === player.id
                ? 'text-white'
                : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            style={{
              borderColor: filterPlayerId === player.id ? player.color : 'transparent',
              backgroundColor: filterPlayerId === player.id ? `${player.color}25` : undefined
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}
          </button>
        ))}
      </div>

      {/* Stack Items list */}
      <div className="flex-1 overflow-y-auto mt-4 pt-4 pb-4 px-3 -mx-3 space-y-4 min-h-[300px] max-h-[600px]">
        {renderedItems.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800/60 rounded-xl">
            <div className="p-4 bg-slate-900/60 text-slate-500 rounded-full mb-3">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-300 mb-1">The Stack is empty</h3>
            <p className="text-xs text-slate-500 max-w-[240px]">
              Spells, activated abilities, or triggers will appear here in reverse-chronological order.
            </p>
          </div>
        ) : (
          renderedItems.map((item, reverseIndex) => {
            // Find absolute index in state array (not reversed list)
            const absoluteIndex = stack.findIndex(x => x.id === item.id);
            const isTop = absoluteIndex === stack.length - 1;

            return (
              <StackItem
                key={item.id}
                item={item}
                index={absoluteIndex}
                isTop={isTop}
                totalItems={stack.length}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDelete={handleDelete}
              />
            );
          })
        )}
      </div>

      {/* Info indicator */}
      {stack.length > 0 && (
        <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-[11px] text-slate-400">
            Clicking <b>Resolve Top</b> will pop the top spell/ability. Reorder items using the arrows if necessary.
          </span>
        </div>
      )}
    </div>
  );
}
