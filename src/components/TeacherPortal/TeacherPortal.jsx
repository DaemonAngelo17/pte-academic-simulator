import React, { useState, useEffect } from 'react';
import QuestionManager from './QuestionManager';
import SessionManager from './SessionManager';
import GradingStation from './GradingStation';
import GoogleSheetBridge from './GoogleSheetBridge';
import ExamBlueprintStudio from './ExamBlueprintStudio';
import EquationStudio from './EquationStudio';
import SettingsModal from '../Common/SettingsModal';
import {
  Layers,
  Users,
  FileSpreadsheet,
  BookOpen,
  ArrowLeft,
  GraduationCap,
  Award,
  Sliders,
  Globe,
  Copy,
  Check,
  Wifi,
  Calculator
} from 'lucide-react';

export default function TeacherPortal({
  questionBank,
  onUpdateQuestionBank,
  onLaunchStudentExam,
  onExit
}) {
  const [activeTab, setActiveTab] = useState('gradingStation'); // 'gradingStation', 'bridge', 'questions', 'sessions'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch('/api/network-info')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok) {
          setNetworkInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const candidateLanUrl = networkInfo?.localIp
    ? `http://${networkInfo.localIp}:5173/?view=student`
    : (networkInfo?.candidateUrl ? `${networkInfo.candidateUrl.split('?')[0]}/?view=student` : `${window.location.origin}/?view=student`);

  const handleCopyCandidateLink = () => {
    navigator.clipboard.writeText(candidateLanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              PTE Academic Teacher Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Exam Administration, Multi-Student Grading & Google Sheet Bridge
            </p>
          </div>
        </div>

        {/* Remote Candidate Connectivity Pill */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-lg text-xs shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 font-medium">Remote Candidate URL:</span>
            <span className="font-mono font-bold text-blue-300">
              {candidateLanUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCandidateLink}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 text-[11px] font-semibold rounded transition flex items-center space-x-1 shadow-xs active:scale-95"
            title="Copy URL to give to students on iPads, phones, or laptops on the same Wi-Fi/LAN"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
            {networkInfo?.online ? '🟢 Online / LAN Ready' : '🟡 Local Mode'}
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg border border-blue-500 transition shadow-xs"
            title="Configure AI Models, Local Ollama, TTS, and Google Sheets"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings &amp; APIs</span>
          </button>
          <button
            onClick={onExit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Portal</span>
          </button>
        </div>
      </header>

      {/* Modern Segmented Navigation Tabs */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto">
          <nav className="p-1 bg-slate-100 rounded-xl inline-flex space-x-1 shrink-0">
            <button
              onClick={() => setActiveTab('gradingStation')}
              className={`py-2 px-3.5 inline-flex items-center space-x-2 rounded-lg text-xs transition duration-150 ${
                activeTab === 'gradingStation'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Grading Station</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-3.5 inline-flex items-center space-x-2 rounded-lg text-xs transition duration-150 ${
                activeTab === 'questions'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Question Bank</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">
                {questionBank?.items?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('blueprints')}
              className={`py-2 px-3.5 inline-flex items-center space-x-2 rounded-lg text-xs transition duration-150 ${
                activeTab === 'blueprints'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Exam Blueprints</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-2 px-3.5 inline-flex items-center space-x-2 rounded-lg text-xs transition duration-150 ${
                activeTab === 'sessions'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Cohorts &amp; Sessions</span>
            </button>

            <button
              onClick={() => setActiveTab('bridge')}
              className={`py-2 px-3.5 inline-flex items-center space-x-2 rounded-lg text-xs transition duration-150 ${
                activeTab === 'bridge'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheet Bridge</span>
            </button>

            <button
              onClick={() => setActiveTab('equations')}
              className={`py-2 px-3.5 inline-flex items-center space-x-2 rounded-lg text-xs transition duration-150 ${
                activeTab === 'equations'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Scoring Equations</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'gradingStation' && (
          <GradingStation
            questionBank={questionBank}
            onLaunchStudentExam={onLaunchStudentExam}
            onNavigateTab={setActiveTab}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionManager
            questionBank={questionBank}
            onUpdateQuestionBank={onUpdateQuestionBank}
          />
        )}

        {activeTab === 'blueprints' && (
          <ExamBlueprintStudio
            questionBank={questionBank}
            onLaunchStudentExam={onLaunchStudentExam}
            onUpdateQuestionBank={onUpdateQuestionBank}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionManager onLaunchStudentExam={onLaunchStudentExam} />
        )}

        {activeTab === 'bridge' && (
          <GoogleSheetBridge
            questionBank={questionBank}
            onNavigateTab={setActiveTab}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
          />
        )}

        {activeTab === 'equations' && (
          <EquationStudio />
        )}
      </main>

      {/* Global Settings & API Configuration Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

