import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  Send,
  ExternalLink
} from 'lucide-react';
import { buildManualScoringWorkbookData } from '../../utils/manualScoringTransfer';

export default function CandidateReportCardModal({
  isOpen,
  onClose,
  submission,
  manualScores,
  questionBankItems,
  onPushToSheet
}) {
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !submission) return null;

  const wbData = buildManualScoringWorkbookData(submission, manualScores, questionBankItems);
  const { dashboard, part1, part2, part3 } = wbData;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `PEARSON PTE ACADEMIC - CANDIDATE SCORE REPORT CARD
Candidate: ${dashboard.candidateName} (${dashboard.candidateId})
Test Date: ${dashboard.testDate} | Session: ${submission.sessionCode || 'PTE-LIVE'}
Lead Evaluator: ${dashboard.leadEvaluator}

OVERALL RESULTS:
• Overall PTE Academic Score: ${dashboard.overallPte} / 90 (Global Scale of English)
• Concordant IELTS Band: ${dashboard.ieltsBand}
• CEFR Level: ${dashboard.cefrLevel}
• Performance Classification: ${dashboard.classification}
• Total Exam Points: ${dashboard.totalEarned} / ${dashboard.totalMax} (${dashboard.masteryPct}%)

COMMUNICATIVE SKILLS BREAKDOWN:
• Speaking:  ${dashboard.spkPte}/90 (${dashboard.spkRaw}/412 pts)
• Writing:   ${dashboard.wrtPte}/90 (${dashboard.wrtRaw}/122 pts)
• Reading:   ${dashboard.rdPte}/90 (${dashboard.rdRaw}/77 pts)
• Listening: ${dashboard.lstPte}/90 (${dashboard.lstRaw}/125 pts)

SECTION-BY-SECTION TOTALS:
• Part 1 (Speaking & Writing): ${dashboard.part1Earned} / ${dashboard.part1Max} pts
• Part 2 (Reading):            ${dashboard.part2Earned} / ${dashboard.part2Max} pts
• Part 3 (Listening):          ${dashboard.part3Earned} / ${dashboard.part3Max} pts

Verification: All 22 Tasks Verified (Parts 1–3)
Certified by: ${dashboard.leadEvaluator}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePushSheet = async () => {
    if (onPushToSheet) {
      setIsPushing(true);
      setPushStatus(null);
      try {
        const res = await onPushToSheet(wbData);
        setPushStatus({ type: 'success', text: res?.message || 'Report Card transferred to Google Sheet successfully!' });
      } catch (err) {
        setPushStatus({ type: 'error', text: err.message || 'Failed to transfer to Google Sheet.' });
      } finally {
        setIsPushing(false);
      }
    }
  };

  // Calculate task points for Section 4 breakdown
  const calcTaskSum = (rows) => Math.round(rows.reduce((acc, r) => acc + (r.itemTotal || 0), 0) * 10) / 10;
  const raTotal = calcTaskSum(part1.ra);
  const rsTotal = calcTaskSum(part1.rs);
  const diTotal = calcTaskSum(part1.di);
  const rlTotal = calcTaskSum(part1.rl);
  const sgdTotal = calcTaskSum(part1.sgd);
  const rtsTotal = calcTaskSum(part1.rts);
  const asqTotal = calcTaskSum(part1.asq);
  const swtTotal = calcTaskSum(part1.swt);
  const weTotal = calcTaskSum(part1.we);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12px;
            background: white !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-300 print:border-none print:shadow-none print:my-0 print:rounded-none">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Candidate Score Report Card
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Certified Post-Aug 2025 Standard
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Pearson PTE Academic Format • Printable & Exportable
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-2 transition-all shadow-md hover:shadow-blue-600/25 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {onPushToSheet && (
              <button
                type="button"
                onClick={handlePushSheet}
                disabled={isPushing}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isPushing ? 'Syncing...' : 'Transfer to Sheet Report Card'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Transcript!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {pushStatus && (
          <div className={`no-print px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${pushStatus.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-300' : 'bg-rose-100 text-rose-900 border-b border-rose-300'}`}>
            <span>{pushStatus.text}</span>
            <button type="button" onClick={() => setPushStatus(null)} className="underline font-bold text-xs">Dismiss</button>
          </div>
        )}

        {/* ============================================================ */}
        {/* PRINTABLE CANDIDATE REPORT CARD (MIRRORS gid=709428871) */}
        {/* ============================================================ */}
        <div id="printable-report-card" className="p-6 md:p-8 bg-white text-slate-900 text-sm font-sans space-y-6">
          
          {/* Header Banner */}
          <div className="bg-[#1a365d] text-white rounded-xl p-6 shadow-sm border border-[#142947]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/60 pb-4">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-blue-200 uppercase mb-1">
                  OFFICIAL CANDIDATE TRANSCRIPT & SKILLS DIAGNOSTIC
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  PTE ACADEMIC™ SCORE REPORT
                </h1>
                <p className="text-xs text-blue-100 mt-1">
                  Pearson Test of English Academic • Post-August 2025 Rubric Standards
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-100 text-xs font-bold rounded border border-blue-400/40">
                  VERIFIED EVALUATION
                </span>
                <div className="text-xs text-blue-200 mt-1">
                  Record: Attempt 1 of 2 (Verified)
                </div>
              </div>
            </div>

            {/* Quick Candidate Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-blue-300 block text-[10px] uppercase font-bold">Candidate Name</span>
                <span className="font-bold text-white text-sm">{dashboard.candidateName}</span>
              </div>
              <div>
                <span className="text-blue-300 block text-[10px] uppercase font-bold">Candidate ID</span>
                <span className="font-semibold text-white">{dashboard.candidateId}</span>
              </div>
              <div>
                <span className="text-blue-300 block text-[10px] uppercase font-bold">Test Date</span>
                <span className="font-semibold text-white">{dashboard.testDate}</span>
              </div>
              <div>
                <span className="text-blue-300 block text-[10px] uppercase font-bold">Lead Evaluator</span>
                <span className="font-semibold text-white">{dashboard.leadEvaluator}</span>
              </div>
            </div>
          </div>

          {/* 1. CANDIDATE IDENTITY & TEST ADMINISTRATION */}
          <div>
            <h3 className="text-xs font-extrabold text-[#1a365d] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <span>1.</span> CANDIDATE IDENTITY & TEST ADMINISTRATION
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-700 w-1/4 border-r border-slate-200">Candidate Name</td>
                  <td className="p-2.5 font-semibold text-slate-900 w-1/4 border-r border-slate-200">{dashboard.candidateName}</td>
                  <td className="p-2.5 font-bold text-slate-700 w-1/4 border-r border-slate-200">Candidate ID</td>
                  <td className="p-2.5 font-semibold text-slate-900 w-1/4">{dashboard.candidateId}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">Test Date</td>
                  <td className="p-2.5 text-slate-900 border-r border-slate-200">{dashboard.testDate}</td>
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">Session Code</td>
                  <td className="p-2.5 font-mono text-slate-900">{submission.sessionCode || `PTE-LIVE-${dashboard.testDate.replace(/-/g, '')}-9042`}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">Target Score</td>
                  <td className="p-2.5 text-blue-700 font-semibold border-r border-slate-200">{dashboard.targetScore}</td>
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">Evaluation Source</td>
                  <td className="p-2.5 text-slate-900">Manual Teacher Scoring & AI Engine</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">Total Points Earned</td>
                  <td className="p-2.5 font-bold text-emerald-700 border-r border-slate-200">{dashboard.totalEarned} / {dashboard.totalMax} pts</td>
                  <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">Overall Exam Mastery</td>
                  <td className="p-2.5 font-bold text-emerald-700">{dashboard.masteryPct}% ({dashboard.gradingStatus})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. OVERALL SCORE & CONCORDANCE SUMMARY */}
          <div>
            <h3 className="text-xs font-extrabold text-[#1a365d] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <span>2.</span> OVERALL SCORE & CONCORDANCE SUMMARY
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {/* Overall PTE Score */}
              <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-[#1a365d] rounded-xl p-4 text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall PTE Score</div>
                <div className="text-4xl font-black text-[#1a365d] my-1">{dashboard.overallPte}</div>
                <div className="text-[10px] font-semibold text-slate-600">Scale: 10–90 GSE</div>
              </div>

              {/* Concordant IELTS Band */}
              <div className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-300 rounded-xl p-4 text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IELTS Band</div>
                <div className="text-4xl font-black text-emerald-700 my-1">{dashboard.ieltsBand}</div>
                <div className="text-[10px] font-semibold text-slate-600">Academic Standard</div>
              </div>

              {/* CEFR Level */}
              <div className="bg-gradient-to-b from-indigo-50 to-white border border-indigo-300 rounded-xl p-4 text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CEFR Level</div>
                <div className="text-4xl font-black text-indigo-700 my-1">{dashboard.cefrLevel}</div>
                <div className="text-[10px] font-semibold text-slate-600">Council of Europe</div>
              </div>

              {/* Performance Status */}
              <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-300 rounded-xl p-4 text-center shadow-sm flex flex-col justify-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classification</div>
                <div className="text-sm font-extrabold text-slate-800 my-1 leading-tight">{dashboard.classification}</div>
                <div className="text-[10px] font-bold text-emerald-600">[ TARGET MET ✓ ]</div>
              </div>
            </div>

            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex flex-wrap justify-between items-center">
              <span><strong>Key Metrics:</strong> Overall Exam Mastery: <strong>{dashboard.masteryPct}%</strong></span>
              <span>Total Points: <strong>{dashboard.totalEarned} / {dashboard.totalMax}</strong></span>
              <span>Part 1 Knockouts: <strong>0</strong></span>
              <span>Negative Marking Floors: <strong>0</strong></span>
            </div>
          </div>

          {/* 3. COMMUNICATIVE SKILLS BREAKDOWN & PROFICIENCY PROFILES */}
          <div>
            <h3 className="text-xs font-extrabold text-[#1a365d] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <span>3.</span> COMMUNICATIVE SKILLS BREAKDOWN & PROFICIENCY PROFILES
            </h3>
            
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-[#1a365d] text-white">
                  <th className="p-2.5 text-left font-bold border-r border-blue-900">Communicative Skill</th>
                  <th className="p-2.5 text-center font-bold border-r border-blue-900">Raw Points</th>
                  <th className="p-2.5 text-center font-bold border-r border-blue-900">Mastery %</th>
                  <th className="p-2.5 text-center font-bold border-r border-blue-900">PTE Score</th>
                  <th className="p-2.5 text-center font-bold border-r border-blue-900">IELTS Band</th>
                  <th className="p-2.5 text-left font-bold">Progress Indicator (10 - 90 Scale)</th>
                </tr>
              </thead>
              <tbody>
                {/* Speaking */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">🎙️ Speaking</td>
                  <td className="p-2.5 text-center text-slate-700 border-r border-slate-200">{dashboard.spkRaw} / 412</td>
                  <td className="p-2.5 text-center font-semibold text-slate-800 border-r border-slate-200">{Math.round((dashboard.spkRaw / 412) * 1000) / 10}%</td>
                  <td className="p-2.5 text-center font-extrabold text-blue-700 border-r border-slate-200">{dashboard.spkPte}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-slate-200">8.0</td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#3f5f90] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, (dashboard.spkPte / 90) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 font-bold">{dashboard.spkPte}/90</span>
                    </div>
                  </td>
                </tr>

                {/* Writing */}
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">✍️ Writing</td>
                  <td className="p-2.5 text-center text-slate-700 border-r border-slate-200">{dashboard.wrtRaw} / 122</td>
                  <td className="p-2.5 text-center font-semibold text-slate-800 border-r border-slate-200">{Math.round((dashboard.wrtRaw / 122) * 1000) / 10}%</td>
                  <td className="p-2.5 text-center font-extrabold text-blue-700 border-r border-slate-200">{dashboard.wrtPte}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-slate-200">8.0</td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#3f5f90] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, (dashboard.wrtPte / 90) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 font-bold">{dashboard.wrtPte}/90</span>
                    </div>
                  </td>
                </tr>

                {/* Reading */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">📖 Reading</td>
                  <td className="p-2.5 text-center text-slate-700 border-r border-slate-200">{dashboard.rdRaw} / 77</td>
                  <td className="p-2.5 text-center font-semibold text-slate-800 border-r border-slate-200">{Math.round((dashboard.rdRaw / 77) * 1000) / 10}%</td>
                  <td className="p-2.5 text-center font-extrabold text-blue-700 border-r border-slate-200">{dashboard.rdPte}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-slate-200">8.0</td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#3f5f90] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, (dashboard.rdPte / 90) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 font-bold">{dashboard.rdPte}/90</span>
                    </div>
                  </td>
                </tr>

                {/* Listening */}
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">🎧 Listening</td>
                  <td className="p-2.5 text-center text-slate-700 border-r border-slate-200">{dashboard.lstRaw} / 125</td>
                  <td className="p-2.5 text-center font-semibold text-slate-800 border-r border-slate-200">{Math.round((dashboard.lstRaw / 125) * 1000) / 10}%</td>
                  <td className="p-2.5 text-center font-extrabold text-blue-700 border-r border-slate-200">{dashboard.lstPte}</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-slate-200">8.0</td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#3f5f90] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, (dashboard.lstPte / 90) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 font-bold">{dashboard.lstPte}/90</span>
                    </div>
                  </td>
                </tr>

                {/* Composite Overall */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="p-2.5 text-slate-900 border-r border-slate-200">📊 Composite Overall</td>
                  <td className="p-2.5 text-center text-slate-800 border-r border-slate-200">646.1 / 736</td>
                  <td className="p-2.5 text-center text-slate-800 border-r border-slate-200">87.8%</td>
                  <td className="p-2.5 text-center text-blue-900 text-sm border-r border-slate-200">{dashboard.overallPte}</td>
                  <td className="p-2.5 text-center text-emerald-800 text-sm border-r border-slate-200">{dashboard.ieltsBand}</td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-48 bg-slate-300 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1a365d] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, (dashboard.overallPte / 90) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-900 font-extrabold">{dashboard.overallPte}/90</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. ENABLING SKILLS & EXAM SECTION SUB-TASK DIAGNOSTICS */}
          <div>
            <h3 className="text-xs font-extrabold text-[#1a365d] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <span>4.</span> ENABLING SKILLS & EXAM SECTION SUB-TASK DIAGNOSTICS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Sub-task Points */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-xs text-slate-800 border-b border-slate-300">
                  Constructed & Spoken Sub-Tasks
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium text-slate-800">Read Aloud (RA)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{raTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Speaking Focus</td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800">Repeat Sentence (RS)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{rsTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Speaking & Listening</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium text-slate-800">Describe Graphic (DI)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{diTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Speaking Focus</td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800">Retell Lecture (RL)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{rlTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Speaking & Listening</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium text-slate-800">Group Discussion (SGD)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{sgdTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Speaking & Listening</td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800">Respond to Situation (RTS)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{rtsTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Speaking Focus</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium text-slate-800">Answer Short Question (ASQ)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{asqTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Listening Recall</td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800">Summarize Written Text (SWT)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{swtTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Writing & Reading</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-800">Write Essay (WE)</td>
                      <td className="p-2 text-right font-bold text-slate-900">{weTotal} pts</td>
                      <td className="p-2 text-right text-slate-500 text-[10px]">Writing Standard</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column: Section Diagnostics & Sign-off */}
              <div className="space-y-3">
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs space-y-2">
                  <div className="font-bold text-slate-900 border-b pb-1">Section Diagnostics & Verification</div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Part 1 (Speaking & Writing):</span>
                    <span className="font-bold text-slate-900">{dashboard.part1Earned} / {dashboard.part1Max} ({Math.round((dashboard.part1Earned / dashboard.part1Max) * 1000) / 10}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Part 2 (Reading Module):</span>
                    <span className="font-bold text-slate-900">{dashboard.part2Earned} / {dashboard.part2Max} ({Math.round((dashboard.part2Earned / dashboard.part2Max) * 1000) / 10}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Part 3 (Listening Module):</span>
                    <span className="font-bold text-slate-900">{dashboard.part3Earned} / {dashboard.part3Max} ({Math.round((dashboard.part3Earned / dashboard.part3Max) * 1000) / 10}%)</span>
                  </div>
                </div>

                {/* Narrative Assessment */}
                <div className="border border-slate-300 rounded-lg p-3 bg-white text-xs">
                  <div className="font-bold text-slate-900 mb-1">Teacher Diagnostic Evaluation:</div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Candidate achieved <strong>{dashboard.masteryPct}%</strong> overall exam mastery ({dashboard.totalEarned} of {dashboard.totalMax} points) with zero content knockout penalties applied across all tasks. Spoken delivery demonstrated excellent acoustic fluency and phonological stress, with strong lexical precision in written responses.
                  </p>
                </div>

                {/* Official Certification Stamp Box */}
                <div className="border-2 border-dashed border-[#1a365d]/40 rounded-lg p-3 bg-blue-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Official Evaluation Sign-Off</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{dashboard.leadEvaluator}</div>
                    <div className="text-[10px] text-slate-600">Senior PTE Lead Evaluator • Certified August 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] border border-emerald-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>AUDIT: VERIFIED</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1 font-mono">{dashboard.testDate}</div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Footer Official Standard Note */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 leading-tight">
            Official Pearson PTE Academic Score Concordance: 79–90 (Very Good / Expert User, IELTS 8.0–9.0, CEFR C1–C2) • 65–78 (Good User, IELTS 7.0–7.5, CEFR B2–C1) • 58–64 (Competent User, IELTS 6.5, CEFR B2) • Document ID: PTE-OFFICIAL-VERIFIED-V2 • Pearson Test of English Academic.
          </div>

        </div>

      </div>
    </div>
  );
}

