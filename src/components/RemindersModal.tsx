import React, { useState } from 'react';
import { StudyReminder } from '../types';
import { playChimeSound } from '../utils/audio';
import {
  Bell,
  X,
  Plus,
  Volume2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: StudyReminder[];
  onUpdateReminders: (reminders: StudyReminder[]) => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onUpdateReminders,
}) => {
  const [newTime, setNewTime] = useState('09:00');
  const [newLabel, setNewLabel] = useState('');
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        new Notification('🔔 Study Reminders Active', {
          body: 'Antigravity Study Tracker will alert you during scheduled prep times!',
          icon: '/favicon.ico',
        });
        playChimeSound();
      }
    }
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onUpdateReminders(updated);
  };

  const deleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newRem: StudyReminder = {
      id: `rem-${Date.now()}`,
      time: newTime,
      label: newLabel.trim(),
      enabled: true,
      days: [0, 1, 2, 3, 4, 5, 6],
    };

    onUpdateReminders([...reminders, newRem]);
    setNewLabel('');
    setNewTime('09:00');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Study Prep Reminders</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Box */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              {permission === 'granted' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Desktop Notifications Enabled</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Notifications Not Enabled</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
              Receive alerts even when working on other tabs
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => playChimeSound()}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Test audio chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            {permission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-2 mb-5 max-h-56 overflow-y-auto pr-1">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                r.enabled
                  ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700'
                  : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={() => toggleReminder(r.id)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <div>
                  <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 mr-2">
                    {r.time}
                  </span>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{r.label}</span>
                </div>
              </div>

              <button
                onClick={() => deleteReminder(r.id)}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                title="Remove reminder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Reminder Form */}
        <form onSubmit={handleAddReminder} className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Add New Reminder
          </div>
          <div className="flex gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              required
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Solve 2 LeetCode Mediums"
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
