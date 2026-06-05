import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../store/draftStore';
import MatchCard from './MatchCard';
import { Play, Pause, RotateCcw, Timer, AlertCircle } from 'lucide-react';

export default function RoundView() {
  const { rounds, currentRoundIndex, setCurrentRoundIndex, recordMatchResult } = useDraftStore();
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(3000); // 50 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Play sound
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
      } catch (e) {
        console.warn("Timer alert audio error", e);
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(3000); // 50 mins
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (rounds.length === 0) return null;

  const currentRoundMatches = rounds[currentRoundIndex] || [];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
      {/* Header controls & Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="font-extrabold text-xl text-white tracking-wide">Match Pairings</h2>
          <p className="text-xs text-slate-400">Record results for current round matches</p>
        </div>

        {/* Round Timer component */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-850 px-4 py-2 rounded-xl w-fit">
          <Timer className={`w-5 h-5 ${timerRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-mono text-lg font-bold text-slate-200">{formatTime(timeLeft)}</span>
          <div className="flex items-center gap-1.5 border-l border-slate-850 pl-3 ml-1">
            <button
              onClick={toggleTimer}
              className={`p-1 rounded-lg transition ${
                timerRunning ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-emerald-400/20" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Timer to 50:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rounds Nav Tab Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-900">
        {rounds.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentRoundIndex(idx)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition shrink-0 ${
              currentRoundIndex === idx
                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Round {idx + 1}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentRoundMatches.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-600">
            No matches scheduled for this round.
          </div>
        ) : (
          currentRoundMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              roundIndex={currentRoundIndex}
              onRecordResult={recordMatchResult}
            />
          ))
        )}
      </div>

      {/* Completed Round Info Warning */}
      {currentRoundMatches.every(m => m.isCompleted) && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>All matches for Round {currentRoundIndex + 1} have been completed! Proceed to next round or check standings.</span>
        </div>
      )}
    </div>
  );
}
