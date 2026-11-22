import React, { useState, useRef } from 'react';
import {
  Plus,
  Bell,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Flame,
  CheckCircle2,
  Database,
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';

interface NavbarProps {
  onOpenAddSubject: () => void;
  onOpenReminders: () => void;
  onToggleTimer: () => void;
  isTimerOpen: boolean;
  streak: number;
  todayHours: number;
  onClearData: () => void;
  onLoadDemoData: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddSubject,
  onOpenReminders,
  onToggleTimer,
  isTimerOpen,
  streak,
  todayHours,
  onClearData,
  onLoadDemoData,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-placement-prep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsBackupMenuOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        alert('Data successfully imported and restored!');
        window.location.reload();
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    setIsBackupMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-200 text-lg">
                GP
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
                GATE & Placement Prep
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hidden sm:inline-block">
                LeetCode Matrix
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block m-0">
              Daily syllabus tracker, 0.5 - 3h rating slider, reminders & supplements
            </p>
          </div>
        </div>

        {/* Live Badges (Streak & Today's Hours) */}
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-bold"
              title={`${streak} consecutive days of study preparation`}
            >
              <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
              <span>{streak}d Streak</span>
            </div>
          )}

          {todayHours > 0 && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono"
              title={`${todayHours} hours studied today`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{todayHours}h Today</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={onToggleTheme}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden xl:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Timer Toggle */}
            <button
              onClick={onToggleTimer}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isTimerOpen
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
              title="Toggle Focus Study Timer"
            >
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Focus Timer</span>
            </button>

            {/* Reminders Modal */}
            <button
              onClick={onOpenReminders}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Study Reminders & Web Notifications"
            >
              <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Reminders</span>
            </button>

            {/* Google Authentication / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  title={`Signed in as ${user.name} (${user.email})`}
                >
                  <div className="relative">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-6 h-6 rounded-lg object-cover ring-1 ring-emerald-500/50"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <span className="hidden md:inline font-medium max-w-[80px] truncate text-slate-700 dark:text-slate-300">
                    {user.givenName || user.name.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {user.provider === 'google' ? 'Google Account' : 'Demo Profile'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>View Profile & Settings</span>
                    </button>

                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-left transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
                title="Sign in with Google"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Add Subject */}
            <button
              onClick={onOpenAddSubject}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Subject</span>
            </button>

            {/* Backup & Restore Menu */}
            <div className="relative">
              <button
                onClick={() => setIsBackupMenuOpen(!isBackupMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                title="Data & Backup Options"
              >
                <Database className="w-4 h-4" />
              </button>

              {isBackupMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Data Management
                  </div>

                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Export Backup (JSON)</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Import Backup (JSON)</span>
                  </button>

                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      if (window.confirm('Clear all study logs and supplement history to start fresh with 0 hours?')) {
                        onClearData();
                        setIsBackupMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-left transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>Clear Logs (Start Fresh)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Load sample demo study data?')) {
                        onLoadDemoData();
                        setIsBackupMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-left transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Load Demo Data (Preview)</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
