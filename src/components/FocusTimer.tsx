import React, { useState, useEffect, useRef } from 'react';
import { Subject } from '../types';
import { playChimeSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface FocusTimerProps {
  subjects: Subject[];
  onCompleteSession: (subject: Subject, hours: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ subjects, onCompleteSession }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [initialMinutes, setInitialMinutes] = useState<number>(30); // 30 mins = 0.5h
  const [secondsLeft, setSecondsLeft] = useState<number>(30 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerDone();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleTimerDone = () => {
    playChimeSound();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (Notification.permission === 'granted') {
      new Notification('🎉 Focus Session Completed!', {
        body: `Great job! You finished ${initialMinutes} minutes of study. Ready to log?`,
        icon: '/favicon.ico',
      });
    }

    const sub = subjects.find((s) => s.id === selectedSubjectId);
    if (sub) {
      const hours = Number((initialMinutes / 60).toFixed(1));
      onCompleteSession(sub, hours);
    }
  };

  const handleSetDuration = (mins: number) => {
    setIsRunning(false);
    setInitialMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(initialMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPct = ((initialMinutes * 60 - secondsLeft) / (initialMinutes * 60)) * 100;

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <Clock className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Deep Focus Study Timer</h3>
        </div>

        {/* Preset Durations matching 0.5h, 1h, 1.5h */}
        <div className="flex gap-1">
          {[
            { mins: 30, label: '30m (0.5h)' },
            { mins: 60, label: '60m (1h)' },
            { mins: 90, label: '90m (1.5h)' },
          ].map((item) => (
            <button
              key={item.mins}
              onClick={() => handleSetDuration(item.mins)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                initialMinutes === item.mins
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Subject Picker */}
        <div className="w-full sm:w-auto flex-1">
          <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Target Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-amber-500 dark:text-amber-400 tracking-wider">
              {formatTime(secondsLeft)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRun}
              className={`p-3 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950'
              }`}
              title={isRunning ? 'Pause' : 'Start Focus Session'}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
        <div
          className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};
