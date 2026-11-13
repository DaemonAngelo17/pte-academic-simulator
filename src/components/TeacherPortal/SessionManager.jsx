import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  PlayCircle,
  Trash2,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  FolderOpen
} from 'lucide-react';

export default function SessionManager({ onLaunchStudentExam }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: 'PTE Academic Mock Session - Batch B',
    sessionCode: `PTE-${Math.floor(1000 + Math.random() * 9000)}`,
    mode: 'full',
    randomizeQuestions: true
  });
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data?.sessions) {
        setSessions(data.sessions);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      const data = await res.json();
      if (data?.sessions) {
        setSessions(data.sessions);
      }
      setShowCreateModal(false);
      setNewSession({
        title: 'New Classroom Mock Session',
        sessionCode: `PTE-${Math.floor(1000 + Math.random() * 9000)}`,
        mode: 'full'
      });
    } catch {
      // fallback
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data?.sessions) {
        setSessions(data.sessions);
      }
    } catch {
      // fallback
    }
  };

  const copySessionCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Multi-Student Classroom Session Manager
          </h3>
          <p className="text-xs text-slate-500">
            Provision access codes for classroom cohorts. Multiple students can take the exam simultaneously.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Session</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((ses) => (
          <div
            key={ses.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-blue-400 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-mono text-xs font-bold rounded border border-blue-200">
                  {ses.sessionCode}
                </span>
                <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{ses.status || 'Active'}</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{ses.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Created {new Date(ses.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Exam Scope:</span>
                  <span className="font-semibold uppercase">{ses.mode === 'full' ? 'Full Mock Exam (68 Items)' : ses.mode}</span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-slate-400">Question Pool:</span>
                  <span className="font-bold text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    🎲 Randomized Draw Active
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => copySessionCode(ses.sessionCode)}
                className="flex items-center space-x-1 text-xs text-slate-600 hover:text-blue-700 font-medium"
                title="Copy student invite code"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode === ses.sessionCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteSession(ses.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition rounded"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onLaunchStudentExam(ses.sessionCode)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Launch Exam</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-300">
            <h4 className="text-base font-bold text-slate-900">Create Classroom Exam Session</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Session Title</label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:border-blue-600 focus:outline-hidden"
                  placeholder="e.g. Saturday Batch A - Mock 01"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Session Code</label>
                <input
                  type="text"
                  value={newSession.sessionCode}
                  onChange={(e) => setNewSession({ ...newSession, sessionCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono font-bold focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Exam Mode</label>
                <select
                  value={newSession.mode}
                  onChange={(e) => setNewSession({ ...newSession, mode: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:border-blue-600 focus:outline-hidden bg-white"
                >
                  <option value="full">Full PTE Academic Exam (Official 68-Item Quota from Bank)</option>
                  <option value="PART_1">Part 1 Only (Speaking &amp; Writing - 37 Items)</option>
                  <option value="PART_2">Part 2 Only (Reading - 15 Items)</option>
                  <option value="PART_3">Part 3 Only (Listening - 16 Items)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newSession.randomizeQuestions !== false}
                    onChange={(e) => setNewSession({ ...newSession, randomizeQuestions: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold">🎲 Randomize questions and prompts from 186-item bank</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 border rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold shadow-xs"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

