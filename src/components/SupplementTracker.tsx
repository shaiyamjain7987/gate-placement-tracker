import React, { useState } from 'react';
import { Supplement, DailySupplementLog } from '../types';
import { getTodayStr, formatDisplayDate } from '../utils/dateUtils';
import { playPingSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Pill,
  Droplets,
  Moon,
  Plus,
  CheckCircle,
  Circle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { SupplementHeatmap } from './SupplementHeatmap';

interface SupplementTrackerProps {
  supplements: Supplement[];
  supplementLogs: Record<string, DailySupplementLog>;
  onUpdateDailyLog: (date: string, updated: DailySupplementLog) => void;
  onAddSupplement: (newSup: Omit<Supplement, 'id'>) => void;
  onDeleteSupplement: (id: string) => void;
}

export const SupplementTracker: React.FC<SupplementTrackerProps> = ({
  supplements,
  supplementLogs,
  onUpdateDailyLog,
  onAddSupplement,
  onDeleteSupplement,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newSupName, setNewSupName] = useState<string>('');
  const [newSupDosage, setNewSupDosage] = useState<string>('');
  const [newSupTiming, setNewSupTiming] = useState<Supplement['timing']>('Morning');
  const [newSupCategory, setNewSupCategory] = useState<Supplement['category']>('Vitamins');
  const [newSupIcon, setNewSupIcon] = useState<string>('💊');

  const todayStr = getTodayStr();
  const currentLog: DailySupplementLog = supplementLogs[selectedDate] || {
    date: selectedDate,
    takenSupplementIds: [],
    waterGlasses: 0,
    sleepHours: 7.0,
    energyLevel: 4,
  };

  const handleToggleSupplement = (supId: string) => {
    const alreadyTaken = currentLog.takenSupplementIds.includes(supId);
    let updatedIds: string[];

    if (alreadyTaken) {
      updatedIds = currentLog.takenSupplementIds.filter((id) => id !== supId);
    } else {
      updatedIds = [...currentLog.takenSupplementIds, supId];
      playPingSound();
      if (updatedIds.length === supplements.length) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    }

    onUpdateDailyLog(selectedDate, {
      ...currentLog,
      takenSupplementIds: updatedIds,
    });
  };

  const handleWaterChange = (delta: number) => {
    const newVal = Math.max(0, Math.min(15, currentLog.waterGlasses + delta));
    onUpdateDailyLog(selectedDate, {
      ...currentLog,
      waterGlasses: newVal,
    });
  };

  const handleSleepChange = (hours: number) => {
    onUpdateDailyLog(selectedDate, {
      ...currentLog,
      sleepHours: hours,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    onAddSupplement({
      name: newSupName.trim(),
      dosage: newSupDosage.trim() || '1 Dose',
      timing: newSupTiming,
      category: newSupCategory,
      icon: newSupIcon || '💊',
    });

    setNewSupName('');
    setNewSupDosage('');
    setIsAddModalOpen(false);
  };

  // Change selected date
  const changeDateBy = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const yStr = dateObj.getFullYear();
    const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  // Calculate compliance percentage
  const totalCount = supplements.length;
  const takenCount = currentLog.takenSupplementIds.length;
  const compliancePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Vitamin & Supplement Activity Heatmap */}
      <SupplementHeatmap
        supplementLogs={supplementLogs}
        supplements={supplements}
        title="Vitamin & Supplement Intake Heatmap"
      />

      {/* Daily Checklist & Log Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
                <Pill className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Daily Vitamin Routine
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Check off your daily vitamins & track cognitive endurance for GATE & LeetCode sessions
            </p>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 px-2 min-w-[110px] text-center">
              {selectedDate === todayStr ? 'Today' : formatDisplayDate(selectedDate)}
            </span>
            <button
              onClick={() => changeDateBy(1)}
              disabled={selectedDate >= todayStr}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[10px] px-2 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Daily Progress & Wellness Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Supplement Adherence Card */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Supplement Intake</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                  {takenCount}/{totalCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({compliancePct}%)</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-teal-500/30 transition-all duration-300"
                style={{ height: `${compliancePct}%` }}
              />
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 relative z-10">{compliancePct}%</span>
            </div>
          </div>

          {/* Water Hydration Counter */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Hydration (250ml / glass)</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
                  {currentLog.waterGlasses}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / 8 glasses (~{(currentLog.waterGlasses * 0.25).toFixed(1)}L)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleWaterChange(-1)}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm cursor-pointer"
                title="Minus 1 glass"
              >
                -
              </button>
              <button
                onClick={() => handleWaterChange(1)}
                className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center text-sm shadow-md cursor-pointer"
                title="Add 1 glass"
              >
                +
              </button>
            </div>
          </div>

          {/* Sleep Tracker */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Sleep & Recovery</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {currentLog.sleepHours}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">hours</span>
              </div>
            </div>

            <div className="w-24">
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={currentLog.sleepHours}
                onChange={(e) => handleSleepChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                <span>4h</span>
                <span>7h</span>
                <span>10h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplements Checklist Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Daily Supplement Routine
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supplements.map((sup) => {
            const isTaken = currentLog.takenSupplementIds.includes(sup.id);

            return (
              <div
                key={sup.id}
                onClick={() => handleToggleSupplement(sup.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between select-none ${
                  isTaken
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700/80 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{sup.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm ${
                          isTaken ? 'text-teal-800 dark:text-teal-200 line-through opacity-80' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {sup.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {sup.dosage}
                      </span>
                    </div>

                    {sup.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{sup.description}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">🕒 {sup.timing}</span>
                      <span>•</span>
                      <span className="text-teal-600 dark:text-teal-400">{sup.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!['sup-b12', 'sup-d3', 'sup-calcium', 'sup-magnesium', 'sup-zinc', 'sup-bplex', 'sup-iron'].includes(sup.id) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${sup.name}?`)) {
                          onDeleteSupplement(sup.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-500 opacity-60 hover:opacity-100 cursor-pointer"
                      title="Delete supplement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    className={`p-1.5 rounded-lg transition-transform ${
                      isTaken ? 'text-teal-600 dark:text-teal-400 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                    }`}
                  >
                    {isTaken ? <CheckCircle className="w-6 h-6 fill-teal-100 dark:fill-teal-950" /> : <Circle className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Supplement Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Add Custom Brain Supplement / Habit
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Supplement / Vitamin Name *
                  </label>
                  <input
                    type="text"
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    placeholder="e.g. Ashwagandha, Creatine, Multivitamin"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Dosage</label>
                    <input
                      type="text"
                      value={newSupDosage}
                      onChange={(e) => setNewSupDosage(e.target.value)}
                      placeholder="e.g. 500mg, 1 Capsule"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Timing</label>
                    <select
                      value={newSupTiming}
                      onChange={(e) => setNewSupTiming(e.target.value as Supplement['timing'])}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                      <option value="Anytime">Anytime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                    <select
                      value={newSupCategory}
                      onChange={(e) => setNewSupCategory(e.target.value as Supplement['category'])}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Vitamins">Vitamins</option>
                      <option value="Cognitive">Cognitive Focus</option>
                      <option value="Hydration">Hydration</option>
                      <option value="Recovery">Recovery & Sleep</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Icon Emoji</label>
                    <div className="flex gap-1.5 items-center">
                      {['💊', '⚡', '🧠', '🌿', '💧', '☀️'].map((em) => (
                        <button
                          type="button"
                          key={em}
                          onClick={() => setNewSupIcon(em)}
                          className={`text-lg p-1 rounded-lg ${
                            newSupIcon === em ? 'bg-teal-100 dark:bg-teal-900 border border-teal-500' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Save Supplement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
