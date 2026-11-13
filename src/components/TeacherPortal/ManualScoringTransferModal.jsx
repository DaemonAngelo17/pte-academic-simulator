import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  CheckCircle,
  ExternalLink,
  X,
  Share2,
  Send,
  Printer,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import {
  buildManualScoringWorkbookData,
  generateDashboardB5C7Tsv,
  generateRangeTsvs
} from '../../utils/manualScoringTransfer';

export default function ManualScoringTransferModal({
  isOpen,
  onClose,
  submission,
  manualScores,
  questionBankItems,
  onOpenReportCard
}) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'clipboard' | 'ranges'
  const [copiedKey, setCopiedKey] = useState(null);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  if (!isOpen || !submission) return null;

  const wbData = buildManualScoringWorkbookData(submission, manualScores, questionBankItems);
  const rangeTsvs = generateRangeTsvs(wbData);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDirectTransfer = async () => {
    setIsPushing(true);
    setPushResult(null);

    try {
      const response = await fetch('/api/google-sheet/transfer-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TRANSFER_MANUAL_SCORING',
          submission,
          workbookData: wbData
        })
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setPushResult({
          type: 'success',
          text: data.message || `Successfully transferred grades for ${wbData.dashboard.candidateName} to Google Sheet!`
        });
      } else {
        setPushResult({
          type: 'error',
          text: data.message || data.error || 'Webhook transfer failed. Please verify your Google Sheet Webhook URL.'
        });
      }
    } catch (err) {
      setPushResult({
        type: 'error',
        text: `Network error: ${err.message}. You can use the 1-Click Clipboard Ranges tab to copy and paste directly into Google Sheets.`
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Transfer Details to Manual Scoring Sheet
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Workbook Bridge
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: Master Dashboard, Part 1 (Spk & Wrt), Part 2 (Reading), Part 3 (Listening) & Report Card
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Bar */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-500">Candidate:</span>{' '}
              <strong className="text-white">{wbData.dashboard.candidateName}</strong>{' '}
              <span className="text-slate-400 font-mono">({wbData.dashboard.candidateId})</span>
            </div>
            <div>
              <span className="text-slate-500">Date:</span>{' '}
              <span className="text-slate-300">{wbData.dashboard.testDate}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded border border-blue-800/60 font-semibold">
              Overall PTE: <span className="text-white font-bold">{wbData.dashboard.overallPte}</span> (IELTS {wbData.dashboard.ieltsBand})
            </div>
            <div className="bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800/60 font-semibold">
              Total Points: <span className="text-white font-bold">{wbData.dashboard.totalEarned}</span> / {wbData.dashboard.totalMax}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800 flex space-x-2 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>⚡ Automated Webhook Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ranges')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'ranges'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>📋 1-Click Clipboard Ranges</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">

          {/* TAB 1: AUTOMATED WEBHOOK TRANSFER */}
          {activeTab === 'direct' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Direct Push to Google Sheets Workbook</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                        Zero Manual Pasting
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Automatically maps and writes all candidate profile details, section summaries, and individual task-by-task rubric scores into the Google Sheet's <strong>Master Dashboard</strong>, <strong>Part 1</strong>, <strong>Part 2</strong>, and <strong>Part 3</strong> tabs in a single transaction.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">1. Master Dashboard</span>
                    <span className="text-emerald-400 font-semibold">Profile & 4 Communicative Skills</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Fills B5:C7 + Sections Summary</p>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">2. Part 1 Spk & Wrt</span>
                    <span className="text-emerald-400 font-semibold">9 Task Types (RA to WE)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">34 Graded Items (398.1 pts)</p>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">3. Parts 2 & 3 (R & L)</span>
                    <span className="text-emerald-400 font-semibold">13 Task Types (Reading + Listening)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">31 Items (119.0 pts)</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDirectTransfer}
                    disabled={isPushing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isPushing ? 'Transmitting to Google Sheet...' : '⚡ Push All Grades to Google Sheet'}</span>
                  </button>

                  {onOpenReportCard && (
                    <button
                      type="button"
                      onClick={onOpenReportCard}
                      className="px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Certified Report Card</span>
                    </button>
                  )}
                </div>

                {pushResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                      pushResult.type === 'success'
                        ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-200 border border-rose-800'
                    }`}
                  >
                    {pushResult.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{pushResult.text}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK CLIPBOARD RANGES */}
          {activeTab === 'ranges' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                If you prefer to copy and paste directly into Google Sheets, click any range below to copy its TSV string to your clipboard. In your Google Sheet, click the designated top-left cell and press <strong>Cmd+V</strong> (Mac) or <strong>Ctrl+V</strong> (Windows).
              </p>

              <div className="space-y-3">
                
                {/* 1. Master Dashboard Profile (B5:C7) */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Master Dashboard: Candidate Profile</span>
                      <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-blue-400 border border-slate-700">
                        Cell B5:C7
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Candidate Name, Candidate ID, Test Date, Target Score, Lead Evaluator, Completed Status
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rangeTsvs.dashboardProfile, 'dash')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all shadow cursor-pointer shrink-0"
                  >
                    {copiedKey === 'dash' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'dash' ? 'Copied (B5:C7)!' : 'Copy Range (B5:C7)'}</span>
                  </button>
                </div>

                {/* 2. Part 1: Spk & Wrt Scores */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Part 1: Speaking & Writing Rubric Scores</span>
                      <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-emerald-400 border border-slate-700">
                        All Tasks (RA, RS, DI, RL, SGD, RTS, ASQ, SWT, WE)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Includes 0–6 Content scales, Fluency, Pronunciation, Form, Grammar, Vocabulary, and Spelling traits
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rangeTsvs.part1SpkScores, 'p1')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all shadow cursor-pointer shrink-0"
                  >
                    {copiedKey === 'p1' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'p1' ? 'Copied Part 1 Scores!' : 'Copy Part 1 Scores'}</span>
                  </button>
                </div>

                {/* 3. Part 2: Reading Scores */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Part 2: Reading Item Scores</span>
                      <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 border border-slate-700">
                        FIB-RW, MCMA-R, RO-R, FIB-R, MCSA-R
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Correct/incorrect blanks, adjacent pairs, and single choice options (57 pts max)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rangeTsvs.part2ReadingScores, 'p2')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all shadow cursor-pointer shrink-0"
                  >
                    {copiedKey === 'p2' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'p2' ? 'Copied Part 2 Scores!' : 'Copy Part 2 Scores'}</span>
                  </button>
                </div>

                {/* 4. Part 3: Listening Scores */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Part 3: Listening Item Scores</span>
                      <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
                        SST, MCMA-L, FIB-L, HCS, MCSA-L, SMW, HIW, WFD
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      SST 12-pt rubric, negative marking floors, sequence WFD words (74 pts max)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rangeTsvs.part3ListeningScores, 'p3')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all shadow cursor-pointer shrink-0"
                  >
                    {copiedKey === 'p3' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'p3' ? 'Copied Part 3 Scores!' : 'Copy Part 3 Scores'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Target Workbook: <span className="text-white font-mono">1cEuVE8dFFbtHfO_unLIDn3SFPE_z05pk8-ZE79HujlM</span>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenReportCard && (
              <button
                type="button"
                onClick={onOpenReportCard}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Printable Report Card</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

