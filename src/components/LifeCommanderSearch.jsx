import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function LifeCommanderSearch({ onSelect, onCancel }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.data || []);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error("Scryfall autocomplete error", e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectCard = async (cardName) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
      if (res.ok) {
        const data = await res.json();
        let imageUrl = null;
        if (data.image_uris && data.image_uris.art_crop) {
          imageUrl = data.image_uris.art_crop; // Using art_crop for background is perfect!
        } else if (data.card_faces && data.card_faces[0] && data.card_faces[0].image_uris) {
          imageUrl = data.card_faces[0].image_uris.art_crop;
        }
        onSelect(cardName, imageUrl || '');
      }
    } catch (e) {
      console.error("Scryfall card named error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      <div className="flex gap-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Commander..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          {loading && <Loader2 className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-2.5 animate-spin" />}
        </div>
        <button
          onClick={onCancel}
          className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-900 text-left">
          {suggestions.map((s, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelectCard(s)}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
