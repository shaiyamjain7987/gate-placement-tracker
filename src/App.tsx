import React, { useState, useEffect } from 'react';
import {
  Subject,
  StudyLog,
  Supplement,
  DailySupplementLog,
  SubjectNote,
  StudyReminder,
  SubjectCategory,
  LifeField,
  FieldLog,
  UserProfile,
} from './types';
import {
  loadSubjects,
  saveSubjects,
  loadStudyLogs,
  saveStudyLogs,
  loadSupplements,
  saveSupplements,
  loadSupplementLogs,
  saveSupplementLogs,
  loadNotes,
  saveNotes,
  loadReminders,
  saveReminders,
  loadLifeFields,
  saveLifeFields,
  loadFieldLogs,
  saveFieldLogs,
  generateDemoStudyLogs,
} from './utils/storage';
import {
  loadUserProfile,
  saveUserProfile,
  clearUserProfile,
} from './utils/auth';
import { getTodayStr, calculateStudyStats } from './utils/dateUtils';
import { playChimeSound, playPingSound } from './utils/audio';
import confetti from 'canvas-confetti';

import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { LeetCodeHeatmap } from './components/LeetCodeHeatmap';
import { SubjectCard } from './components/SubjectCard';
import { StudyLogModal } from './components/StudyLogModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { SupplementTracker } from './components/SupplementTracker';
import { NotesSection } from './components/NotesSection';
import { FocusTimer } from './components/FocusTimer';
import { RemindersModal } from './components/RemindersModal';
import { LifeFieldsSection } from './components/LifeFieldsSection';
import { AuthModal } from './components/AuthModal';

import {
  LayoutDashboard,
  Pill,
  FileText,
  Bell,
  Compass,
} from 'lucide-react';

export function App() {
  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('gpt_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gpt_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(loadStudyLogs);
  const [supplements, setSupplements] = useState<Supplement[]>(loadSupplements);
  const [supplementLogs, setSupplementLogs] = useState<Record<string, DailySupplementLog>>(
    loadSupplementLogs
  );
  const [notes, setNotes] = useState<SubjectNote[]>(loadNotes);
  const [reminders, setReminders] = useState<StudyReminder[]>(loadReminders);
  const [lifeFields, setLifeFields] = useState<LifeField[]>(loadLifeFields);
  const [fieldLogs, setFieldLogs] = useState<FieldLog[]>(loadFieldLogs);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'supplements' | 'lifefields' | 'notes'>('dashboard');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SubjectCategory>('all');
  const [selectedHeatmapSubjectId, setSelectedHeatmapSubjectId] = useState<string>('');

  // Modals & Panels
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [logModalSubject, setLogModalSubject] = useState<Subject | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User Authentication State
  const [user, setUser] = useState<UserProfile | null>(loadUserProfile);
  const [isAuthBannerDismissed, setIsAuthBannerDismissed] = useState(false);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    saveUserProfile(newUser);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.25 },
    });
    playChimeSound();
    setAlertToast({
      message: `Welcome, ${newUser.givenName || newUser.name}!`,
      subtext: `Signed in with ${newUser.provider === 'google' ? 'Google OAuth' : 'Demo Profile'} (${newUser.email})`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    clearUserProfile();
    playPingSound();
    setAlertToast({
      message: 'Signed out successfully.',
      subtext: 'Your current session has ended.',
    });
  };

  // In-app Alert Toast
  const [alertToast, setAlertToast] = useState<{ message: string; subtext?: string } | null>(null);

  // Stats calculation
  const stats = React.useMemo(() => calculateStudyStats(studyLogs), [studyLogs]);
  const todayStr = getTodayStr();

  // Background reminder scheduler
  useEffect(() => {
    let lastCheckedMinute = '';

    const interval = setInterval(() => {
      const now = new Date();
      const currentMinute = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const currentDay = now.getDay();

      if (currentMinute !== lastCheckedMinute) {
        lastCheckedMinute = currentMinute;

        reminders.forEach((r) => {
          if (r.enabled && r.time === currentMinute && r.days.includes(currentDay)) {
            // Trigger reminder!
            playChimeSound();
            setAlertToast({
              message: r.label,
              subtext: `Scheduled study alert for ${r.time}`,
            });

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(`⏰ ${r.label}`, {
                body: `It's ${r.time}! Time to prepare for GATE and Placement.`,
                icon: '/favicon.ico',
              });
            }
          }
        });
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [reminders]);

  // Handlers for Study Logs
  const handleSaveLog = (newLogData: Omit<StudyLog, 'id' | 'timestamp'>) => {
    const existingIndex = studyLogs.findIndex(
      (l) => l.subjectId === newLogData.subjectId && l.date === newLogData.date
    );

    let updatedLogs: StudyLog[];
    if (existingIndex >= 0) {
      updatedLogs = [...studyLogs];
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        ...newLogData,
        timestamp: Date.now(),
      };
    } else {
      const newEntry: StudyLog = {
        ...newLogData,
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
      };
      updatedLogs = [newEntry, ...studyLogs];
    }

    setStudyLogs(updatedLogs);
    saveStudyLogs(updatedLogs);
  };

  const handleQuickMark = (subject: Subject, hours: number) => {
    handleSaveLog({
      subjectId: subject.id,
      date: todayStr,
      hours,
      notes: `Quick study rating: ${hours}h logged today.`,
    });

    playPingSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#f59e0b'],
    });
  };

  // Handlers for Subjects
  const handleAddSubject = (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      createdAt: getTodayStr(),
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    const updatedSubs = subjects.filter((s) => s.id !== id);
    const updatedLogs = studyLogs.filter((l) => l.subjectId !== id);
    setSubjects(updatedSubs);
    setStudyLogs(updatedLogs);
    saveSubjects(updatedSubs);
    saveStudyLogs(updatedLogs);
  };

  // Handlers for Supplements
  const handleUpdateDailySupplement = (date: string, updated: DailySupplementLog) => {
    const newLogs = { ...supplementLogs, [date]: updated };
    setSupplementLogs(newLogs);
    saveSupplementLogs(newLogs);
  };

  const handleAddSupplement = (newSup: Omit<Supplement, 'id'>) => {
    const fullSup: Supplement = {
      ...newSup,
      id: `sup-${Date.now()}`,
    };
    const updated = [...supplements, fullSup];
    setSupplements(updated);
    saveSupplements(updated);
  };

  const handleDeleteSupplement = (id: string) => {
    const updated = supplements.filter((s) => s.id !== id);
    setSupplements(updated);
    saveSupplements(updated);
  };

  // Handlers for Life Fields
  const handleSaveFieldLog = (newLogData: Omit<FieldLog, 'id' | 'timestamp'>) => {
    const existingIndex = fieldLogs.findIndex(
      (l) => l.fieldId === newLogData.fieldId && l.date === newLogData.date
    );

    let updatedLogs: FieldLog[];
    if (existingIndex >= 0) {
      updatedLogs = [...fieldLogs];
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        ...newLogData,
        timestamp: Date.now(),
      };
    } else {
      const newEntry: FieldLog = {
        ...newLogData,
        id: `flog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
      };
      updatedLogs = [newEntry, ...fieldLogs];
    }

    setFieldLogs(updatedLogs);
    saveFieldLogs(updatedLogs);
  };

  const handleAddField = (fieldData: Omit<LifeField, 'id' | 'createdAt'>) => {
    const newField: LifeField = {
      ...fieldData,
      id: `field-${Date.now()}`,
      createdAt: getTodayStr(),
    };
    const updated = [...lifeFields, newField];
    setLifeFields(updated);
    saveLifeFields(updated);
  };

  const handleDeleteField = (id: string) => {
    const updated = lifeFields.filter((f) => f.id !== id);
    const updatedLogs = fieldLogs.filter((l) => l.fieldId !== id);
    setLifeFields(updated);
    setFieldLogs(updatedLogs);
    saveLifeFields(updated);
    saveFieldLogs(updatedLogs);
  };

  // Handlers for Notes
  const handleSaveNote = (note: SubjectNote) => {
    const exists = notes.some((n) => n.id === note.id);
    let updated: SubjectNote[];
    if (exists) {
      updated = notes.map((n) => (n.id === note.id ? note : n));
    } else {
      updated = [note, ...notes];
    }
    setNotes(updated);
    saveNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  // Handlers for Reminders
  const handleUpdateReminders = (updated: StudyReminder[]) => {
    setReminders(updated);
    saveReminders(updated);
  };

  // Clear all study logs, supplements and field exploration logs
  const handleClearAllData = () => {
    setStudyLogs([]);
    setSupplementLogs({});
    setFieldLogs([]);
    saveStudyLogs([]);
    saveSupplementLogs({});
    saveFieldLogs([]);
  };

  // Explicit opt-in to load demo data preview
  const handleLoadDemoData = () => {
    const demo = generateDemoStudyLogs();
    setStudyLogs(demo);
    saveStudyLogs(demo);
  };

  // Filtering subjects
  const filteredSubjects = subjects.filter((s) => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  // Today's log for currently selected modal subject
  const currentTodayLog = logModalSubject
    ? studyLogs.find((l) => l.subjectId === logModalSubject.id && l.date === todayStr)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white dark:selection:text-slate-950 transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onToggleTimer={() => setIsTimerOpen(!isTimerOpen)}
        isTimerOpen={isTimerOpen}
        streak={stats.currentStreak}
        todayHours={stats.todayHours}
        onClearData={handleClearAllData}
        onLoadDemoData={handleLoadDemoData}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Google Authentication Quick Banner */}
        {!user && !isAuthBannerDismissed && (
          <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 text-xs shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  Google Authentication is available:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  Sign in with your Google account to associate your study matrix, streaks, and vitamin checklist.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthBannerDismissed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer text-xs"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>GATE & Placement</span>
            </button>

            <button
              onClick={() => setActiveTab('supplements')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'supplements'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Vitamins & Health</span>
            </button>

            <button
              onClick={() => setActiveTab('lifefields')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lifefields'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Life & New Fields</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes & Mistakes</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Multidisciplinary Mastery</span>
          </div>
        </div>

        {/* Optional Collapsible Focus Timer */}
        {isTimerOpen && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-200">
            <FocusTimer
              subjects={subjects}
              onCompleteSession={(sub, hours) => {
                handleQuickMark(sub, hours);
              }}
            />
          </div>
        )}

        {/* TAB 1: DASHBOARD (HEATMAP & SUBJECTS) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Stat Summary Cards */}
            <StatsOverview logs={studyLogs} subjects={subjects} />

            {/* Global LeetCode Style Contribution Heatmap */}
            <LeetCodeHeatmap
              logs={studyLogs}
              subjects={subjects}
              selectedSubjectId={selectedHeatmapSubjectId}
              onSelectSubject={setSelectedHeatmapSubjectId}
              title="Prep Matrix & Contribution Heatmap"
            />

            {/* Subjects Header & Category Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Tracked Subjects</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {filteredSubjects.length} subjects
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Use the 0.5 - 3.0 hr rating slider to mark your study sessions today
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {(['all', 'GATE', 'Placement', 'Core CS', 'Aptitude'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Subjects' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Subject Cards */}
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No subjects found for this category.</p>
                <button
                  onClick={() => setIsAddSubjectOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  + Add New Subject
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((sub) => {
                  const todayLog = studyLogs.find(
                    (l) => l.subjectId === sub.id && l.date === todayStr
                  );

                  return (
                    <SubjectCard
                      key={sub.id}
                      subject={sub}
                      logs={studyLogs}
                      todayLog={todayLog}
                      onOpenLogModal={(s) => setLogModalSubject(s)}
                      onQuickMark={handleQuickMark}
                      onDeleteSubject={handleDeleteSubject}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUPPLEMENTS */}
        {activeTab === 'supplements' && (
          <div className="animate-in fade-in duration-150">
            <SupplementTracker
              supplements={supplements}
              supplementLogs={supplementLogs}
              onUpdateDailyLog={handleUpdateDailySupplement}
              onAddSupplement={handleAddSupplement}
              onDeleteSupplement={handleDeleteSupplement}
            />
          </div>
        )}

        {/* TAB 3: LIFE & NEW FIELDS (CURIOSITY & MULTIDISCIPLINARY) */}
        {activeTab === 'lifefields' && (
          <div className="animate-in fade-in duration-150">
            <LifeFieldsSection
              fields={lifeFields}
              fieldLogs={fieldLogs}
              onSaveFieldLog={handleSaveFieldLog}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
            />
          </div>
        )}

        {/* TAB 4: NOTES & MISTAKE LOGS */}
        {activeTab === 'notes' && (
          <div className="animate-in fade-in duration-150">
            <NotesSection
              notes={notes}
              subjects={subjects}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}
      </main>

      {/* Floating In-App Toast Notification */}
      {alertToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-500/80 shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 backdrop-blur-md">
          <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
            <Bell className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{alertToast.message}</h4>
            {alertToast.subtext && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{alertToast.subtext}</p>
            )}
          </div>
          <button
            onClick={() => setAlertToast(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modals */}
      <StudyLogModal
        isOpen={!!logModalSubject}
        onClose={() => setLogModalSubject(null)}
        subject={logModalSubject}
        onSaveLog={handleSaveLog}
        existingTodayLog={currentTodayLog}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={reminders}
        onUpdateReminders={handleUpdateReminders}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        theme={theme}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GATE & Campus Placement Preparation Tracker • LeetCode-style activity matrix</span>
          <span>Target slider: 0.5h to 3.0h • Reminders • Notes • Brain Supplements • Life Knowledge</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
