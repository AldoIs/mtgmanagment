import React, { useState } from 'react';
import ControlsPanel from './components/ControlsPanel';
import StackView from './components/StackView';
import HistoryPanel from './components/HistoryPanel';
import PlayerManager from './components/PlayerManager';
import RoundView from './components/RoundView';
import StandingsBoard from './components/StandingsBoard';
import LeaguePlayerManager from './components/LeaguePlayerManager';
import GameRegister from './components/GameRegister';
import LeagueLeaderboard from './components/LeagueLeaderboard';
import LifePlayerPanel from './components/LifePlayerPanel';
import LifeSettingsPanel from './components/LifeSettingsPanel';

import { useStackStore } from './store/stackStore';
import { useDraftStore } from './store/draftStore';
import { useLeagueStore } from './store/leagueStore';
import { useLifeStore } from './store/lifeStore';

import { Volume2, VolumeX, Sparkles, Layers, Trophy, Swords, Zap, Medal, Heart, Settings2, X } from 'lucide-react';

export default function App() {
  const { soundEnabled, setSoundEnabled } = useStackStore();
  const { isTournamentStarted } = useDraftStore();
  const { players, layoutOrder } = useLifeStore();
  const [activeTab, setActiveTab] = useState('stack'); // 'stack' | 'draft' | 'league' | 'life'
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Calculations for Life Tracker lowest life highlight
  const activeLifePlayers = layoutOrder
    .map(id => players.find(p => p.id === id))
    .filter(p => p && p.active);
    
  const lowestLife = activeLifePlayers.length > 0 
    ? Math.min(...activeLifePlayers.map(p => p.life)) 
    : 40;

  // Dynamic Grid columns helper to accommodate visual tabletop pod setups (e.g. 2x2 grid for 4 players)
  const getGridClass = (count) => {
    if (count === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 gap-4 h-full min-h-0 max-w-4xl mx-auto";
    }
    if (count === 4) {
      return "grid grid-cols-1 sm:grid-cols-2 gap-4 h-full min-h-0 max-w-4xl mx-auto"; // Forces 2x2 layout on tablet/desktop
    }
    // Default layout for 3, 5, 6 players
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full min-h-0";
  };

  return (
    <div className={`bg-[#060913] text-slate-100 flex flex-col selection:bg-blue-500/30 ${activeTab === 'life' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Header Banner */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                MTG Companion
                <span className="text-[10px] tracking-widest uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  Toolbox
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 sm:block hidden">
                Booster draft pairings, league rankings, life counts & stack tracker
              </p>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-950/50 p-1 border border-slate-900 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('stack')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                activeTab === 'stack'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Stack Tracker
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                activeTab === 'draft'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Draft Organizer
            </button>
            <button
              onClick={() => setActiveTab('league')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                activeTab === 'league'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Medal className="w-3.5 h-3.5" />
              Commander League
            </button>
            <button
              onClick={() => {
                setActiveTab('life');
                setShowMobileSettings(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                activeTab === 'life'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Life Tracker
            </button>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Audio Toggle (Only for Stack section) */}
            {activeTab === 'stack' && (
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                  soundEnabled
                    ? 'bg-slate-900 border-slate-800 text-blue-400'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
                title={soundEnabled ? 'Disable Synth Sounds' : 'Enable Synth Sounds'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="sm:inline hidden">{soundEnabled ? 'Sounds On' : 'Sounds Off'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 min-h-0 flex flex-col ${activeTab === 'life' ? 'h-0 overflow-hidden py-3 max-w-none' : 'py-6 sm:py-8 max-w-7xl'}`}>
        {activeTab === 'stack' ? (
          /* STACK TRACKER MODULE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Controls Column */}
            <div className="lg:col-span-4 space-y-6">
              <ControlsPanel />
              <div className="lg:block hidden">
                <HistoryPanel />
              </div>
            </div>

            {/* Active Stack Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <StackView />
              
              {/* History visible below Stack view on mobile/tablet */}
              <div className="lg:hidden block">
                <HistoryPanel />
              </div>
            </div>
          </div>
        ) : activeTab === 'draft' ? (
          /* DRAFT ORGANIZER MODULE */
          <div className="space-y-6">
            {!isTournamentStarted ? (
              /* Pre-tournament: Player Registration page */
              <div className="max-w-2xl mx-auto">
                <PlayerManager />
              </div>
            ) : (
              /* Active tournament page */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* Round pairings layout */}
                <div className="lg:col-span-8">
                  <RoundView />
                </div>
                {/* Standings board */}
                <div className="lg:col-span-4">
                  <StandingsBoard />
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'league' ? (
          /* COMMANDER LEAGUE MODULE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Registration & Players setup on Left */}
            <div className="lg:col-span-5 space-y-6">
              <GameRegister />
              <LeaguePlayerManager />
            </div>
            
            {/* Dynamic Leaderboard on Right */}
            <div className="lg:col-span-7">
              <LeagueLeaderboard />
            </div>
          </div>
        ) : (
          /* COMMANDER LIFE TRACKER MODULE (General Drawer Layout for all screen sizes) */
          <div className="w-full flex-1 h-full min-h-0 flex flex-col justify-stretch">
            {activeLifePlayers.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl max-w-2xl mx-auto my-auto">
                <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-300">No active players on board</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Click the floating settings button on the bottom right to register players and activate them.
                </p>
              </div>
            ) : (
              <div className={getGridClass(activeLifePlayers.length)}>
                {activeLifePlayers.map((player) => (
                  <LifePlayerPanel
                    key={player.id}
                    player={player}
                    isLowest={player.life === lowestLife}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Sticky Settings Button (Always active for all screen sizes) */}
      {activeTab === 'life' && (
        <button
          onClick={() => setShowMobileSettings(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/35 flex items-center justify-center transition border border-blue-500/20 active:scale-90"
          title="Open Tracker Settings"
        >
          <Settings2 className="w-6 h-6 hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Settings Drawer Overlay (Always active for all screen sizes) */}
      {activeTab === 'life' && showMobileSettings && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMobileSettings(false)}
        >
          <div 
            className="w-80 max-w-[90%] h-full bg-[#0a0d16] border-l border-slate-850 p-5 overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracker Settings</span>
              <button 
                onClick={() => setShowMobileSettings(false)}
                className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LifeSettingsPanel />
          </div>
        </div>
      )}

      {/* Footer Info */}
      {activeTab !== 'life' && (
        <footer className="border-t border-slate-950 bg-slate-950/40 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
            <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 mb-4 sm:mb-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {activeTab === 'stack'
                  ? 'Simulating MTG LIFO Stack rules (Rule 405)'
                  : activeTab === 'draft'
                  ? 'Round-Robin Tournament pairings organizer'
                  : 'Multiplayer Commander League leaderboards & stats tracker'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Designed for tabletop play. Keep this open on a tablet or laptop in the middle of the table!
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
