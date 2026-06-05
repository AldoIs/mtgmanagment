import React, { useState, useEffect, useRef } from 'react';
import { useStackStore } from '../store/stackStore';
import { Plus, Wand2, Zap, Sparkles, Settings2, Check, Loader2, StickyNote } from 'lucide-react';

export default function ControlsPanel() {
  const { players, addToStack, updatePlayer } = useStackStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('spell'); // 'spell' | 'trigger' | 'ability'
  const [notes, setNotes] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('1');
  const [customColor, setCustomColor] = useState('');
  
  // Scryfall Integration States
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cardImage, setCardImage] = useState(null);
  
  // Player edit states
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const dropdownRef = useRef(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for Scryfall Autocomplete
  useEffect(() => {
    if (name.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Error fetching Scryfall suggestions", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [name]);

  const selectSuggestion = async (cardName) => {
    setName(cardName);
    setShowSuggestions(false);
    setIsLoadingCard(true);
    setCardImage(null);

    try {
      const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
      if (res.ok) {
        const data = await res.json();
        // Handle double-faced or single-faced card images
        let imageUrl = null;
        if (data.image_uris && data.image_uris.normal) {
          imageUrl = data.image_uris.normal;
        } else if (data.card_faces && data.card_faces[0] && data.card_faces[0].image_uris) {
          imageUrl = data.card_faces[0].image_uris.normal;
        }
        setCardImage(imageUrl);
      }
    } catch (err) {
      console.error("Error fetching card details", err);
    } finally {
      setIsLoadingCard(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addToStack(name, type, selectedPlayerId, customColor || null, cardImage, notes);
    
    // Reset fields
    setName('');
    setNotes('');
    setCustomColor('');
    setCardImage(null);
    setSuggestions([]);
  };

  const handleStartEdit = (player) => {
    setEditingPlayerId(player.id);
    setEditName(player.name);
    setEditColor(player.color);
  };

  const handleSavePlayer = () => {
    if (editName.trim()) {
      updatePlayer(editingPlayerId, editName.trim(), editColor);
    }
    setEditingPlayerId(null);
  };

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  return (
    <div className="flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
      <div>
        <h2 className="font-extrabold text-xl text-white tracking-wide">Cast & Activate</h2>
        <p className="text-xs text-slate-400">Add spells, abilities or triggers to the stack</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Spell/Ability Name with Scryfall Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Spell / Ability Name</span>
            {isLoadingCard && (
              <span className="flex items-center gap-1 text-[10px] text-blue-400 font-medium normal-case">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading card details...
              </span>
            )}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => name.length >= 3 && setShowSuggestions(true)}
            placeholder="e.g. Counterspell, Brainstorm..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm sm:text-base"
            required
            autoComplete="off"
            autoFocus
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-900">
              {suggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Custom notes for the effect */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <StickyNote className="w-3.5 h-3.5 text-slate-500" />
            <span>Effect Notes / Details</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Habilidad 1, target: Commander, Copy..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs sm:text-sm"
          />
        </div>

        {/* Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Effect Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('spell')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition ${
                type === 'spell'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Wand2 className="w-5 h-5 mb-1" />
              <span className="text-xs">Spell</span>
            </button>

            <button
              type="button"
              onClick={() => setType('trigger')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition ${
                type === 'trigger'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Zap className="w-5 h-5 mb-1" />
              <span className="text-xs">Trigger</span>
            </button>

            <button
              type="button"
              onClick={() => setType('ability')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition ${
                type === 'ability'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-1" />
              <span className="text-xs">Ability</span>
            </button>
          </div>
        </div>

        {/* Player Selector Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Caster / Controller
          </label>
          <div className="grid grid-cols-4 gap-2">
            {players.slice(0, 8).map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
                className={`relative py-2.5 rounded-xl border transition flex flex-col items-center gap-1 ${
                  selectedPlayerId === player.id
                    ? 'font-bold border-slate-300 bg-slate-900'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                  style={{ backgroundColor: player.color }}
                />
                <span className="text-[11px] max-w-full truncate px-1">
                  {player.name}
                </span>
                {selectedPlayerId === player.id && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-0.5 shadow-sm border border-slate-900">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Override Color (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Custom Color Identity
            </label>
            {customColor && (
              <button
                type="button"
                onClick={() => setCustomColor('')}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor || activePlayer.color}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer p-1"
            />
            <span className="text-xs text-slate-500">
              {customColor ? 'Custom color identity override active' : `Using default identity for ${activePlayer.name}`}
            </span>
          </div>
        </div>

        {/* Card image indicator if card was successfully loaded */}
        {cardImage && (
          <div className="p-2 border border-slate-800 bg-slate-950/40 rounded-xl flex items-center gap-3">
            <img src={cardImage} alt="Card preview" className="w-12 h-16 object-cover rounded-md border border-slate-800" />
            <div className="text-left">
              <div className="text-xs font-bold text-emerald-400">Card artwork matched!</div>
              <div className="text-[10px] text-slate-500">This image will appear on the Stack block.</div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 font-extrabold text-white text-base py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.99] transition"
        >
          <Plus className="w-5 h-5" />
          Add to Stack
        </button>
      </form>

      {/* Player Editor Section */}
      <div className="border-t border-slate-800 pt-5 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Player Settings</h3>
          </div>
          {editingPlayerId && (
            <span className="text-[10px] text-amber-400 font-semibold uppercase animate-pulse">Editing...</span>
          )}
        </div>

        {editingPlayerId ? (
          <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rename Player</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color Identity</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
                />
                <span className="text-xs text-slate-400 font-mono">{editColor}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingPlayerId(null)}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlayer}
                className="px-3 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => handleStartEdit(player)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/30 border border-slate-800/40 hover:border-slate-700/60 transition group text-left"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: player.color }} />
                  <span className="text-xs font-medium text-slate-400 truncate group-hover:text-white transition">
                    {player.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                  Edit
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
