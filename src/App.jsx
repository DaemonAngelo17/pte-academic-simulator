import React, { useState, useEffect } from 'react';
import StudentExam from './components/StudentExam/StudentExam';
import TeacherPortal from './components/TeacherPortal/TeacherPortal';
import SettingsModal from './components/Common/SettingsModal';
import initialQuestionBank from './data/questionBank.json';
import {
  GraduationCap,
  PlayCircle,
  FileSpreadsheet,
  Settings,
  Layers,
  CheckCircle2,
  BookOpen,
  Headphones,
  Award,
  ChevronRight,
  Database,
  Sliders,
  Globe,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-rose-500/50 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <span className="text-xl">⚠️</span>
              <h2 className="text-base font-bold">Simulator Interface Error</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              An unexpected error occurred during rendering. You can reload the page or click below to restore.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-700 font-mono text-xs text-rose-300 max-h-40 overflow-y-auto">
              {this.state.error?.message || String(this.state.error)}
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
            >
              Reload Simulator
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'student' || viewParam === 'candidate') {
        return 'student';
      }
      if (viewParam === 'teacher' || viewParam === 'portal') {
        return 'teacher';
      }
      const savedCp = localStorage.getItem('pte_active_checkpoint');
      if (savedCp) {
        const parsed = JSON.parse(savedCp);
        const savedTime = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
        const hoursAgo = (Date.now() - savedTime) / (1000 * 60 * 60);
        if (parsed.isExamStarted && parsed.currentSectionPhase !== 'COMPLETED' && hoursAgo < 24) {
          return 'student';
        }
      }
    } catch {}
    return 'landing';
  });

  const [activeCheckpoint, setActiveCheckpoint] = useState(() => {
    try {
      const savedCp = localStorage.getItem('pte_active_checkpoint');
      if (savedCp) {
        const parsed = JSON.parse(savedCp);
        const savedTime = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
        const hoursAgo = (Date.now() - savedTime) / (1000 * 60 * 60);
        if (parsed.isExamStarted && parsed.currentSectionPhase !== 'COMPLETED' && hoursAgo < 24) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [activeSessionCode, setActiveSessionCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code') || params.get('session');
      if (codeParam) return codeParam;
      const savedCp = localStorage.getItem('pte_active_checkpoint');
      if (savedCp) {
        const parsed = JSON.parse(savedCp);
        if (parsed.studentInfo?.sessionCode) return parsed.studentInfo.sessionCode;
      }
    } catch {}
    return 'PTE-2026-A';
  });
  const [questionBank, setQuestionBank] = useState(initialQuestionBank);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [copiedCandidateUrl, setCopiedCandidateUrl] = useState(false);

  const candidateLanUrl = networkInfo?.localIp
    ? `http://${networkInfo.localIp}:5173/?view=student`
    : (networkInfo?.candidateUrl ? `${networkInfo.candidateUrl.split('?')[0]}/?view=student` : `${window.location.origin}/?view=student`);

  // Sync with local backend
  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setQuestionBank(data);
        }
      })
      .catch(() => {
        // fallback to initialQuestionBank
      });

    fetch('/api/network-info')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setNetworkInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLaunchStudentExam = (code = 'PTE-2026-A') => {
    setActiveSessionCode(code);
    setCurrentView('student');
  };

  if (currentView === 'student') {
    return (
      <StudentExam
        questionBank={questionBank}
        initialSessionCode={activeSessionCode}
        onExit={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'teacher') {
    return (
      <TeacherPortal
        questionBank={questionBank}
        onUpdateQuestionBank={(updated) => setQuestionBank(updated)}
        onLaunchStudentExam={handleLaunchStudentExam}
        onExit={() => setCurrentView('landing')}
      />
    );
  }

  // ==========================================
  // LANDING PAGE ROUTING
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Navigation Top */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  PTE Academic™ Classroom Simulator
                </span>
                <span className="text-[10px] uppercase font-bold bg-blue-950 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded-full">
                  v1.0 Local Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-Stack Exam Engine & Google Sheet Manual Scoring Bridge
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Live Network Status Pill */}
            {candidateLanUrl && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(candidateLanUrl);
                  setCopiedCandidateUrl(true);
                  setTimeout(() => setCopiedCandidateUrl(false), 2000);
                }}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px] transition shadow-inner"
                title="Click to copy remote testing link for candidate devices on this network"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{candidateLanUrl}</span>
                <span className="text-[10px] text-slate-500 pl-1 border-l border-slate-800">
                  {copiedCandidateUrl ? <span className="text-emerald-400 font-bold">Copied!</span> : 'Copy'}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
              title="Configure AI Models, Local Ollama, TTS, and Google Sheets"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Settings &amp; APIs</span>
            </button>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Authentic Pearson PTE Simulation with Manual Scoring Bridge
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Delivers an authentic exam experience for students across all 22 question types, paired with a teacher portal designed to complement your Google Sheet.
          </p>
        </div>

        {/* Active Exam In-Progress Alert Banner */}
        {activeCheckpoint && (
          <div className="max-w-4xl mx-auto w-full mb-8 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-amber-950/40">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    Unfinished Exam Session Detected
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700">
                    Active Checkpoint
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  Active session for <strong className="text-white">{activeCheckpoint.studentInfo?.name || 'Candidate'}</strong> ({activeCheckpoint.studentInfo?.studentId || 'ID'}) in <strong>{activeCheckpoint.currentSectionPhase === 'PART_1' ? 'Part 1 (Speaking & Writing)' : activeCheckpoint.currentSectionPhase === 'PART_2' ? 'Part 2 (Reading)' : 'Part 3 (Listening)'}</strong> with {Object.keys(activeCheckpoint.responses || {}).length} answered questions.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('student')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <PlayCircle className="w-4 h-4 fill-amber-950" />
                <span>Resume Exam Now</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('pte_active_checkpoint');
                  localStorage.removeItem('pte_checkpoint_default');
                  setActiveCheckpoint(null);
                }}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition border border-slate-700 cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Remote Candidate Access Banner */}
        {candidateLanUrl && (
          <div className="max-w-4xl mx-auto w-full mb-8 bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white">Remote Testing Terminal:</span>
                  <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded">
                    {candidateLanUrl}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    LAN / Wi-Fi Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Students on iPads, phones, or external laptops on this Wi-Fi can open this link to sit the mock exam remotely.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(candidateLanUrl);
                  setCopiedCandidateUrl(true);
                  setTimeout(() => setCopiedCandidateUrl(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition active:scale-95"
              >
                {copiedCandidateUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCandidateUrl ? 'Copied URL!' : 'Copy Candidate Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Portal Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* Card 1: Student Terminal */}
          <div
            onClick={() => handleLaunchStudentExam('PTE-2026-A')}
            className="group cursor-pointer bg-slate-950/70 border border-slate-800 hover:border-blue-500 rounded-2xl p-7 transition duration-200 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition">
                <Headphones className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  Candidate Portal
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-blue-300 transition">
                  Student Exam Terminal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Authentic Pearson test interface with countdowns, microphone voice recording, and timed writing sections.
                </p>
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Part 1: Speaking & Writing (RA, RS, DI, RL, SGD, RTS, ASQ, SWT, WE)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Part 2: Reading (FIB-RW, MCMA-R, RO-R, FIB-R, MCSA-R)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Part 3: Listening (SST, MCMA-L, FIB-L, HCS, MCSA-L, SMW, HIW, WFD)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>Start Candidate Test</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Teacher Command Center */}
          <div
            onClick={() => setCurrentView('teacher')}
            className="group cursor-pointer bg-slate-950/70 border border-slate-800 hover:border-emerald-500 rounded-2xl p-7 transition duration-200 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Instructor Suite
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition">
                  Teacher Command Center
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Manage questions, monitor multi-student sessions, grade submissions, and export rows directly to your Google Sheet.
                </p>
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Question Bank Editor ({questionBank?.items?.length || 68} items with live disk sync)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Student Classroom Sessions & Cohort Codes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>One-Click TSV Copy directly into Google Sheet columns</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Open Instructor Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Feature Specs Matrix */}
        <div className="mt-12 max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-2xl font-black text-blue-400">22</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Question Types</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-2xl font-black text-indigo-400">{questionBank?.items?.length || 68}</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Questions in Bank</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-2xl font-black text-emerald-400">3</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Official Sections</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-2xl font-black text-amber-400">100%</span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Google Sheet Sync</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        PTE Academic Classroom Simulator & Teacher Portal • Built for offline and classroom deployment
      </footer>

      {/* Global Settings & API Configuration Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

