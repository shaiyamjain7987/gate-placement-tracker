import React, { useState, useEffect } from 'react';
import { Subject, StudyLog } from '../types';
import { getTodayStr, formatHours } from '../utils/dateUtils';
import { playPingSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, CheckCircle, Clock, Calendar, Sparkles, BookOpen } from 'lucide-react';

interface StudyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onSaveLog: (log: Omit<StudyLog, 'id' | 'timestamp'>) => void;
  existingTodayLog?: StudyLog | null;
}

export const StudyLogModal: React.FC<StudyLogModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSaveLog,
  existingTodayLog,
}) => {
  const [hours, setHours] = useState<number>(1.5);
  const [date, setDate] = useState<string>(getTodayStr());
  const [notes, setNotes] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  useEffect(() => {
    if (existingTodayLog) {
      setHours(existingTodayLog.hours);
      setDate(existingTodayLog.date);
      setNotes(existingTodayLog.notes || '');
    } else {
      setHours(subject?.targetDailyHours || 1.5);
      setDate(getTodayStr());
      setNotes('');
      setSelectedTopic('');
    }
  }, [existingTodayLog, subject, isOpen]);

  if (!isOpen || !subject) return null;

  const hourOptions = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

  const getSliderRatingDescription = (val: number) => {
    switch (val) {
      case 0.5:
        return { label: 'Quick Revision / Flash Review', emoji: '⚡', color: 'text-amber-600 dark:text-amber-400' };
      case 1.0:
        return { label: 'Solid Core Session', emoji: '🎯', color: 'text-sky-600 dark:text-sky-400' };
      case 1.5:
        return { label: 'Deep Focus Work', emoji: '🚀', color: 'text-emerald-600 dark:text-emerald-400' };
      case 2.0:
        return { label: 'Intense Practice & PYQs', emoji: '🔥', color: 'text-orange-600 dark:text-orange-400' };
      case 2.5:
        return { label: 'Hardcore Problem Solving', emoji: '🏆', color: 'text-purple-600 dark:text-purple-400' };
      case 3.0:
        return { label: 'Master Study Marathon (Max Rating)', emoji: '👑', color: 'text-yellow-600 dark:text-yellow-400' };
      default:
        return { label: 'Study Session', emoji: '📚', color: 'text-slate-600 dark:text-slate-300' };
    }
  };

  const currentRating = getSliderRatingDescription(hours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalNotes = notes.trim();
    if (selectedTopic && !finalNotes.includes(selectedTopic)) {
      finalNotes = selectedTopic + (finalNotes ? ` - ${finalNotes}` : '');
    }

    onSaveLog({
      subjectId: subject.id,
      date,
      hours,
      notes: finalNotes,
    });

    // Celebratory effects
    playPingSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-100 dark:ring-slate-800"
              style={{ backgroundColor: subject.color }}
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Mark Done: {subject.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {subject.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Study Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          {/* Slider for 0.5 to 3.0 Hours Rating */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Study Rating & Duration
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/90 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
                  {formatHours(hours)}
                </span>
              </div>
            </div>

            {/* Visual Rating Tag */}
            <div className="flex items-center gap-2 text-xs font-medium bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-lg">{currentRating.emoji}</span>
              <span className={`${currentRating.color} font-semibold`}>
                {currentRating.label}
              </span>
            </div>

            {/* Continuous / Stepped Range Slider (0.5 to 3.0) */}
            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              {/* Slider Markings */}
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono px-1">
                <span>0.5h</span>
                <span>1.0h</span>
                <span>1.5h</span>
                <span>2.0h</span>
                <span>2.5h</span>
                <span>3.0h (Max)</span>
              </div>
            </div>

            {/* Quick Clickable Rating Pills */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {hourOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setHours(opt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hours === opt
                      ? 'bg-emerald-600 text-white font-bold shadow-md scale-105'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt}h
                </button>
              ))}
            </div>
          </div>

          {/* Quick Syllabus Topics picker (if available) */}
          {subject.syllabus && subject.syllabus.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Select Specific Topic / Concept
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {subject.syllabus.map((topic, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      if (selectedTopic === topic) setSelectedTopic('');
                      else setSelectedTopic(topic);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedTopic === topic
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-medium'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Problems Solved */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Session Notes / LeetCode Problems Solved (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Solved 3 medium problems on Graphs, revised Bellman-Ford & Dijkstra traps"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 active:scale-95 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Done Today ({formatHours(hours)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
