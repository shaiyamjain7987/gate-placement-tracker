import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Settings,
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  getGoogleClientId,
  saveGoogleClientId,
  parseJwt,
  createProfileFromGoogleJwt,
  createDemoUserProfile,
} from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  theme,
}) => {
  const [clientIdInput, setClientIdInput] = useState(() => getGoogleClientId());
  const [activeTab, setActiveTab] = useState<'signin' | 'settings'>('signin');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Quick Demo Login form state
  const [customName, setCustomName] = useState('Shaiyam Jain');
  const [customEmail, setCustomEmail] = useState('shaiyamjain7987@gmail.com');
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);

  // Check if GSI is loaded
  useEffect(() => {
    const checkGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setIsGsiLoaded(true);
      }
    };
    checkGsi();
    const timer = setInterval(checkGsi, 500);
    return () => clearInterval(timer);
  }, []);

  // Initialize and render the official Google Identity Services button if Client ID exists
  useEffect(() => {
    if (!isOpen || user || !isGsiLoaded) return;

    const currentClientId = getGoogleClientId();
    if (!currentClientId || !googleButtonContainerRef.current) return;

    try {
      window.google?.accounts.id.initialize({
        client_id: currentClientId,
        callback: (response) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload) {
              const profile = createProfileFromGoogleJwt(payload);
              onLogin(profile);
              onClose();
            }
          }
        },
      });

      // Clear previous button content before rendering
      googleButtonContainerRef.current.innerHTML = '';

      window.google?.accounts.id.renderButton(googleButtonContainerRef.current, {
        type: 'standard',
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 300,
      });
    } catch (err) {
      console.warn('Google Identity Services render error:', err);
    }
  }, [isOpen, user, isGsiLoaded, theme, clientIdInput]);

  if (!isOpen) return null;

  const currentClientId = getGoogleClientId();

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleClientId(clientIdInput);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      setActiveTab('signin');
    }, 1500);
  };

  const handleQuickDemoLogin = () => {
    const demoUser = createDemoUserProfile(customEmail, customName);
    onLogin(demoUser);
    onClose();
  };

  const handleCopyOrigin = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            {/* Google Logo SVG */}
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
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
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {user ? 'Google Account Profile' : 'Google Authentication'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {user ? 'Manage your active study profile' : 'Sign in to sync your study matrix and heatmaps'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!user && (
              <button
                onClick={() => setActiveTab(activeTab === 'signin' ? 'settings' : 'signin')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Google OAuth Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {user ? (
            /* ================= LOGGED IN VIEW ================= */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 flex items-center gap-4">
                <div className="relative">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl ring-2 ring-emerald-500/40 shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {user.provider === 'google' ? 'Google OAuth 2.0' : 'Demo Profile'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {user.email}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Signed in: {new Date(user.signedInAt).toLocaleDateString()} at{' '}
                    {new Date(user.signedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Status & Sync Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Profile Active
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Heatmaps & notes tied to this account
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Personalized Stats
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Streaks and study hours tracked
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setActiveTab('signin');
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            </div>
          ) : activeTab === 'signin' ? (
            /* ================= SIGN IN TAB ================= */
            <div className="space-y-6">
              {/* Feature Highlights */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Why Sign In?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sign in with your Google account to associate your daily LeetCode activity matrix, GATE/Placement subject logs, vitamin checklist, and notes with your identity.
                </p>
              </div>

              {/* Section 1: Official Google Button */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                  Official Google Sign-In
                </div>

                {/* Google Button Container */}
                <div ref={googleButtonContainerRef} className="min-h-[44px] flex items-center justify-center">
                  {!currentClientId && (
                    <div className="text-center p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        No Google OAuth Client ID configured yet.
                      </p>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Configure Client ID in 2 Mins</span>
                      </button>
                    </div>
                  )}
                </div>

                {currentClientId && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                    Using OAuth Client: <span className="font-mono text-emerald-600 dark:text-emerald-400">{currentClientId.slice(0, 15)}...</span>
                  </p>
                )}
              </div>

              {/* Section 2: Quick Demo Sign-In (for instant testing without setup) */}
              <div className="space-y-3 pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Instant Preview Mode
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Test the complete logged-in experience immediately without Google Cloud Console:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Google Email
                      </label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="you@gmail.com"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleQuickDemoLogin}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    {/* Multi-color Google G icon */}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                    <span>Instant Sign-In with Demo Google Account</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= SETTINGS TAB (OAuth Config) ================= */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Google OAuth 2.0 Credentials
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your own Google Cloud Client ID for genuine 1-click Google Sign-In
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('signin')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveClientId} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google Client ID (Web Application)
                  </label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Saved in your browser or set as <code className="text-emerald-600 dark:text-emerald-400">VITE_GOOGLE_CLIENT_ID</code> in <code className="text-emerald-600 dark:text-emerald-400">.env</code>.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save & Apply Client ID</span>
                  </button>

                  {isSavedNotice && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Saved successfully!
                    </span>
                  )}
                </div>
              </form>

              {/* Step-by-step Setup Guide */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <span>How to get a Free Google Client ID (2 Minutes):</span>
                </div>

                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Go to{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console Credentials
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Click <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong>.</li>
                  <li>Application type: select <strong>Web application</strong>.</li>
                  <li>
                    Under <strong>Authorized JavaScript origins</strong>, add:
                    <div className="mt-1.5 space-y-1">
                      {['http://localhost:5173', 'http://localhost'].map((url) => (
                        <div
                          key={url}
                          className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-200/60 dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200"
                        >
                          <span>{url}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrigin(url)}
                            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-2"
                            title="Copy to clipboard"
                          >
                            {copiedUrl === url ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </li>
                  <li>Click <strong>Create</strong> and copy the <strong>Client ID</strong> into the input above!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
