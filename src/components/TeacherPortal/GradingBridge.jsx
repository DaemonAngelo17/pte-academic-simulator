import React, { useState, useEffect } from 'react';
import { PTE_TASK_TYPES } from '../../config/pteRules';
import {
  FileSpreadsheet,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Check,
  UserCheck,
  FileText,
  FileArchive
} from 'lucide-react';
import { downloadExamSubmissionZip } from '../../utils/zipExporter';

export default function GradingBridge({ questionBank }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState('RA-01');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleExportZip = async () => {
    if (!activeSubmission) return;
    setIsExportingZip(true);
    try {
      await downloadExamSubmissionZip(activeSubmission, questionBank?.items || []);
    } catch (err) {
      alert('Failed to export exam pack: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Local state for grading inputs
  const [scores, setScores] = useState({});

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        if (data?.submissions && data.submissions.length > 0) {
          setSubmissions(data.submissions);
          if (!selectedSubId) {
            setSelectedSubId(data.submissions[0].id);
          }
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // fallback
    }
    const local = JSON.parse(localStorage.getItem('pte_submissions') || '[]');
    if (local.length > 0) {
      setSubmissions(local);
      if (!selectedSubId) {
        setSelectedSubId(local[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const activeSubmission = submissions.find((s) => s.id === selectedSubId);

  // Sync scores from active submission
  useEffect(() => {
    if (activeSubmission?.manualScores) {
      setScores(activeSubmission.manualScores);
    } else {
      setScores({});
    }
  }, [selectedSubId]);

  // Seed sample mock submission for initial teacher experience
  const handleSeedSampleSubmission = async () => {
    const sample = {
      id: `SUB-DEMO-${Date.now()}`,
      studentId: 'STD-1001',
      studentName: 'Emma Watson',
      sessionCode: 'PTE-2026-A',
      submittedAt: new Date().toISOString(),
      scope: 'all',
      totalItems: questionBank?.items?.length || 68,
      responses: {
        'RA-01': { recordedAudio: { durationRecorded: 28, simulated: true } },
        'RS-01': { recordedAudio: { durationRecorded: 6, simulated: true } },
        'DI-01': { recordedAudio: { durationRecorded: 34, simulated: true } },
        'RL-01': { recordedAudio: { durationRecorded: 38, simulated: true } },
        'SGD-01': { recordedAudio: { durationRecorded: 85, simulated: true } },
        'RTS-01': { recordedAudio: { durationRecorded: 32, simulated: true } },
        'ASQ-01': { textAnswer: 'Stethoscope' },
        'SWT-01': {
          text: 'The accelerated melting of polar ice shelves caused by greenhouse gas emissions poses severe coastal flooding risks, necessitating immediate multilateral decarbonization efforts.'
        },
        'WE-01': {
          text: 'While artificial intelligence systems provide personalized pacing and instant feedback, the human educator remains indispensable for emotional empathy, ethical discussion, and intellectual inspiration in modern educational institutions.'
        },
        'FIB-RW-01': {
          blanks: { blank_0: 'critical', blank_1: 'trigger', blank_2: 'sources', blank_3: 'mortality' }
        },
        'WFD-01': {
          text: 'Strict safety protocols must be followed during chemistry laboratory experiments.'
        }
      },
      manualScores: {
        'RA-01': { content: 5, fluency: 4, pronunciation: 4, total: 13, comments: 'Clear cadence, minor pause at paragraph midpoint.' },
        'SWT-01': { content: 2, form: 1, grammar: 2, vocabulary: 2, total: 7, comments: 'Flawless single sentence, captured core causal relationship.' }
      },
      gradingStatus: 'graded'
    };

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
      fetchSubmissions();
    } catch {
      // fallback
    }
  };

  const handleScoreChange = (itemId, field, val) => {
    const num = isNaN(parseFloat(val)) ? 0 : parseFloat(val);
    const itemScores = scores[itemId] || { content: 0, fluency: 0, pronunciation: 0, total: 0 };
    const updated = { ...itemScores, [field]: num };

    // Auto-calculate total
    const total =
      (updated.content || 0) +
      (updated.fluency || 0) +
      (updated.pronunciation || 0) +
      (updated.form || 0) +
      (updated.grammar || 0) +
      (updated.vocabulary || 0) +
      (updated.spelling || 0);

    updated.total = total;

    setScores({
      ...scores,
      [itemId]: updated
    });
  };

  const handleCommentChange = (itemId, text) => {
    const itemScores = scores[itemId] || { total: 0 };
    setScores({
      ...scores,
      [itemId]: { ...itemScores, comments: text }
    });
  };

  const handleSaveGrades = async () => {
    if (!activeSubmission) return;

    const updatedSubmission = {
      ...activeSubmission,
      manualScores: scores,
      gradingStatus: 'graded',
      updatedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubmission)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchSubmissions();
    } catch {
      // fallback
    }
  };

  // Google Sheet TSV Copy Generator (Formatted exactly for direct paste into Sheet columns)
  const handleCopyGoogleSheetTSV = () => {
    if (!activeSubmission) return;

    // Header row matching Google Sheet structure
    const headers = [
      'Student ID',
      'Student Name',
      'Session Code',
      'Item ID',
      'Task Type',
      'Content Score',
      'Fluency / Form Score',
      'Pronunciation / Grammar Score',
      'Total Item Score',
      'Word Count',
      'Sentence Count',
      'Teacher Notes / Rubric Comments'
    ];

    const rows = (questionBank?.items || []).map((item) => {
      const sc = scores[item.id] || {};
      const resp = activeSubmission.responses?.[item.id] || {};
      const fluOrForm = sc.fluency ?? sc.form ?? 0;
      const pronOrGrammar = sc.pronunciation ?? sc.grammar ?? 0;
      const wordCount = resp.wordCount ?? (resp.text ? resp.text.trim().split(/\s+/).filter(Boolean).length : '');
      const sentenceCount = resp.sentenceCount ?? '';

      return [
        activeSubmission.studentId,
        activeSubmission.studentName,
        activeSubmission.sessionCode,
        item.id,
        item.taskType,
        sc.content ?? 0,
        fluOrForm,
        pronOrGrammar,
        sc.total ?? 0,
        wordCount,
        sentenceCount,
        `"${(sc.comments || '').replace(/"/g, '""')}"`
      ].join('\t');
    });

    const fullTsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(fullTsv);
    setCopiedTSV(true);
    setTimeout(() => setCopiedTSV(false), 3000);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (!activeSubmission) return;

    const headers = [
      'Student ID',
      'Student Name',
      'Session Code',
      'Item ID',
      'Task Type',
      'Content Score',
      'Fluency/Form Score',
      'Pronunciation/Grammar Score',
      'Total Item Score',
      'Word Count',
      'Sentence Count',
      'Teacher Notes'
    ];

    const rows = (questionBank?.items || []).map((item) => {
      const sc = scores[item.id] || {};
      const resp = activeSubmission.responses?.[item.id] || {};
      const fluOrForm = sc.fluency ?? sc.form ?? 0;
      const pronOrGrammar = sc.pronunciation ?? sc.grammar ?? 0;
      const wordCount = resp.wordCount ?? (resp.text ? resp.text.trim().split(/\s+/).filter(Boolean).length : '');
      const sentenceCount = resp.sentenceCount ?? '';

      return [
        `"${activeSubmission.studentId}"`,
        `"${activeSubmission.studentName}"`,
        `"${activeSubmission.sessionCode}"`,
        `"${item.id}"`,
        `"${item.taskType}"`,
        sc.content ?? 0,
        fluOrForm,
        pronOrGrammar,
        sc.total ?? 0,
        wordCount,
        sentenceCount,
        `"${(sc.comments || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `pte-grading-${activeSubmission.studentId}-${activeSubmission.sessionCode}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const selectedItem = (questionBank?.items || []).find((it) => it.id === selectedItemId);
  const studentResponse = activeSubmission?.responses?.[selectedItemId];
  const itemScore = scores[selectedItemId] || { content: 0, fluency: 0, pronunciation: 0, total: 0, comments: '' };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              Manual Scoring Google Sheet Grading Bridge
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate student responses side-by-side with rubrics and copy directly into your Google Sheet with a single click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {submissions.length === 0 && (
            <button
              onClick={handleSeedSampleSubmission}
              className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-semibold rounded border border-blue-200 transition"
            >
              + Seed Sample Student Submission
            </button>
          )}

          {activeSubmission && (
            <>
              <button
                onClick={handleCopyGoogleSheetTSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-xs transition"
                title="Copies tab-separated values ready for direct Ctrl+V into your Google Sheet"
              >
                {copiedTSV ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTSV ? 'Copied to Clipboard!' : 'Copy to Google Sheet (TSV)'}</span>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportZip}
                disabled={isExportingZip}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-xs transition"
                title="Download complete exam pack with arranged folders and audio clips (.zip)"
              >
                <FileArchive className="w-3.5 h-3.5 text-indigo-200" />
                <span>{isExportingZip ? 'Exporting...' : '📦 Export Exam Pack (.zip)'}</span>
              </button>

              <button
                onClick={handleSaveGrades}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Grades</span>
              </button>
            </>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Grades saved and persisted to local database successfully!</span>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Student Submissions Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Candidates who finish their exam via the Student Terminal will automatically appear here. You can also seed a sample student submission right now to explore the grading workflow.
          </p>
          <button
            onClick={handleSeedSampleSubmission}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs"
          >
            Create Sample Student Mock Submission
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Submissions & Item Navigator */}
          <div className="lg:col-span-4 space-y-4">
            {/* Candidate Selector */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Candidate Submission
              </label>
              <select
                value={selectedSubId || ''}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600 bg-white"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.studentName} ({sub.studentId}) — {sub.sessionCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Item List */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-3 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2 pt-1 flex justify-between">
                <span>Task Items</span>
                <span>{questionBank?.items?.length || 0} Total</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1">
                {(questionBank?.items || []).map((it) => {
                  const isSelected = it.id === selectedItemId;
                  const hasResp = !!activeSubmission?.responses?.[it.id];
                  const hasGrade = !!scores[it.id]?.total;

                  return (
                    <button
                      key={it.id}
                      onClick={() => setSelectedItemId(it.id)}
                      className={`w-full flex items-center justify-between p-2 rounded text-xs transition text-left ${
                        isSelected
                          ? 'bg-blue-700 text-white font-bold shadow-2xs'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className={`font-mono text-[11px] ${isSelected ? 'text-white' : 'text-blue-900 font-bold'}`}>
                          {it.id}
                        </span>
                        <span className="truncate">{it.taskType}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        {hasGrade ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-emerald-400 text-blue-950' : 'bg-emerald-100 text-emerald-800'}`}>
                            {scores[it.id].total} pts
                          </span>
                        ) : hasResp ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'}`}>
                            Submitted
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Empty</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Grading Workspace for Selected Item */}
          <div className="lg:col-span-8 space-y-4">
            {selectedItem ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
                {/* Item Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-mono font-bold text-xs rounded">
                        {selectedItem.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{selectedItem.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{selectedItem.part}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block uppercase font-semibold">Rubric Criteria</span>
                    <span className="text-xs text-blue-800 font-medium">
                      {PTE_TASK_TYPES[selectedItem.taskType]?.scoringCriteria || 'Standard Pearson Scale'}
                    </span>
                  </div>
                </div>

                {/* Candidate Response vs Prompt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prompt / Reference */}
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Official Prompt / Reference Text
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-serif">
                      {selectedItem.prompt || selectedItem.audioText || selectedItem.referenceSentence || 'No prompt text'}
                    </p>
                    {selectedItem.imageUrl && (
                      <img src={selectedItem.imageUrl} alt="Diagram" className="max-h-40 rounded mt-2 border" />
                    )}
                  </div>

                  {/* Student Submission */}
                  <div className="bg-blue-50/50 p-4 rounded border border-blue-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                      Candidate's Response ({activeSubmission.studentName})
                    </span>

                    {studentResponse ? (
                      <div className="text-xs text-slate-800 leading-relaxed space-y-2">
                        {studentResponse.text && (
                          <div className="space-y-1.5">
                            <div className="p-3 bg-white rounded border border-blue-200 font-serif leading-relaxed select-text">
                              {studentResponse.text}
                            </div>
                            {(studentResponse.wordCount !== undefined || studentResponse.sentenceCount !== undefined) && (
                              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                                <span className="font-bold text-blue-900">
                                  Word Count: {studentResponse.wordCount ?? 0}
                                </span>
                                <span>•</span>
                                <span className="font-bold text-indigo-900">
                                  Sentence Count: {studentResponse.sentenceCount ?? 0}
                                </span>
                                {selectedItem.taskType === 'SWT' && (
                                  <span
                                    className={`font-sans font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                      studentResponse.sentenceCount === 1 &&
                                      studentResponse.wordCount >= 5 &&
                                      studentResponse.wordCount <= 75
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {studentResponse.sentenceCount === 1 &&
                                    studentResponse.wordCount >= 5 &&
                                    studentResponse.wordCount <= 75
                                      ? '✓ Valid 1-Sentence Summary (5–75 words)'
                                      : '⚠️ Check Form: Must be 1 sentence, 5–75 words'}
                                  </span>
                                )}
                                {selectedItem.taskType === 'WE' && (
                                  <span
                                    className={`font-sans font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                      studentResponse.wordCount >= 200 && studentResponse.wordCount <= 300
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {studentResponse.wordCount >= 200 && studentResponse.wordCount <= 300
                                      ? '✓ Valid Essay Length (200–300 words)'
                                      : '⚠️ Target Length: 200–300 words'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {studentResponse.textAnswer && (
                          <div className="p-2 bg-white rounded border border-blue-200 font-mono font-bold">
                            {studentResponse.textAnswer}
                          </div>
                        )}
                        {studentResponse.recordedAudio && (
                          <div className="p-3 bg-white rounded border border-blue-200 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-700 flex items-center space-x-1">
                                <span>🎙️ Spoken Recording</span>
                                {studentResponse.recordedAudio.closedDueToSilence && (
                                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                                    Cut off after &gt;3s silence
                                  </span>
                                )}
                              </span>
                              <span className="text-slate-500 font-mono">
                                {studentResponse.recordedAudio.durationRecorded}s spoken
                              </span>
                            </div>

                            {/* Candidate Audio Player */}
                            {(studentResponse.recordedAudio.audioUrl ||
                              studentResponse.recordedAudio.localBlobUrl ||
                              studentResponse.recordedAudio.dataUrl) ? (
                              <div className="space-y-1">
                                <audio
                                  controls
                                  src={
                                    studentResponse.recordedAudio.audioUrl ||
                                    studentResponse.recordedAudio.localBlobUrl ||
                                    studentResponse.recordedAudio.dataUrl
                                  }
                                  className="w-full h-8"
                                />
                                {studentResponse.recordedAudio.fileName && (
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-0.5">
                                    <span>File: {studentResponse.recordedAudio.fileName}</span>
                                    <a
                                      href={
                                        studentResponse.recordedAudio.audioUrl ||
                                        studentResponse.recordedAudio.localBlobUrl ||
                                        studentResponse.recordedAudio.dataUrl
                                      }
                                      download={studentResponse.recordedAudio.fileName}
                                      className="text-blue-700 hover:underline font-semibold"
                                    >
                                      Download Clip
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 italic">
                                Audio recorded and tagged ({studentResponse.recordedAudio.fileName || 'clip.webm'})
                              </div>
                            )}

                            {/* Spoken Speech-to-Text Transcript */}
                            {(studentResponse.transcript || studentResponse.recordedAudio?.transcript) && (
                              <div className="pt-2 border-t border-slate-100 text-xs">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                  <span className="text-indigo-900 font-bold">🎙️ Spoken Transcript:</span>
                                  <span>{((studentResponse.transcript || studentResponse.recordedAudio?.transcript).trim().split(/\s+/).filter(Boolean).length)} words</span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded border border-slate-200 font-serif text-slate-800 leading-relaxed italic select-text">
                                  "{studentResponse.transcript || studentResponse.recordedAudio?.transcript}"
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {studentResponse.blanks && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 space-y-1">
                            <div className="font-semibold text-slate-700 pb-1 border-b border-slate-100 flex justify-between">
                              <span>Blanks Selected:</span>
                              {studentResponse.totalBlanks !== undefined && (
                                <span className="font-mono text-emerald-700">
                                  {studentResponse.correctBlanks} / {studentResponse.totalBlanks} Correct
                                </span>
                              )}
                            </div>
                            {Object.entries(studentResponse.blanks).map(([bId, val]) => (
                              <div key={bId} className="flex justify-between">
                                <span className="font-mono text-slate-500">{bId}:</span>
                                <span className="font-bold text-slate-900">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {studentResponse.placedWords && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 space-y-1">
                            <div className="font-semibold text-slate-700 pb-1 border-b border-slate-100 flex justify-between">
                              <span>Placed Drag &amp; Drop Words:</span>
                              {studentResponse.totalBlanks !== undefined && (
                                <span className="font-mono text-emerald-700">
                                  {studentResponse.correctBlanks} / {studentResponse.totalBlanks} Correct
                                </span>
                              )}
                            </div>
                            {Object.entries(studentResponse.placedWords).map(([bId, val]) => (
                              <div key={bId} className="flex justify-between">
                                <span className="font-mono text-slate-500">{bId}:</span>
                                <span className="font-bold text-slate-900">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {studentResponse.answers && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 space-y-1">
                            <div className="font-semibold text-slate-700 pb-1 border-b border-slate-100 flex justify-between">
                              <span>Typed Blanks (Listening):</span>
                              {studentResponse.totalBlanks !== undefined && (
                                <span className="font-mono text-emerald-700">
                                  {studentResponse.correctlySpelledWords} / {studentResponse.totalBlanks} Correct
                                </span>
                              )}
                            </div>
                            {Object.entries(studentResponse.answers).map(([bId, val]) => (
                              <div key={bId} className="flex justify-between">
                                <span className="font-mono text-slate-500">{bId}:</span>
                                <span className="font-bold text-slate-900">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {studentResponse.targetParagraphs && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 space-y-1">
                            <div className="font-semibold text-slate-700 pb-1 border-b border-slate-100 flex justify-between">
                              <span>Reordered Paragraphs Sequence:</span>
                              {studentResponse.correctAdjacentPairs !== undefined && (
                                <span className="font-mono text-emerald-700 font-bold">
                                  {studentResponse.correctAdjacentPairs} / {studentResponse.maxPoints} Adjacent Pairs Correct
                                </span>
                              )}
                            </div>
                            {studentResponse.targetParagraphs.map((p, pIdx) => (
                              <div key={p.id} className="text-[11px] text-slate-800">
                                <span className="font-mono font-bold text-blue-700 mr-1.5">#{pIdx + 1}</span>
                                {p.text}
                              </div>
                            ))}
                          </div>
                        )}
                        {studentResponse.selected && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 space-y-1">
                            <div className="flex justify-between">
                              <span>Selected Option(s):</span>
                              <strong className="text-blue-900">
                                {Array.isArray(studentResponse.selected)
                                  ? studentResponse.selected.join(', ')
                                  : studentResponse.selected}
                              </strong>
                            </div>
                            {studentResponse.correctChosen !== undefined && (
                              <div className="text-[11px] font-mono text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                                <span>Correct (+1): {studentResponse.correctChosen} | Incorrect (-1): {studentResponse.incorrectChosen}</span>
                                <span className="font-bold text-emerald-700">Score: {studentResponse.finalScore}</span>
                              </div>
                            )}
                            {studentResponse.correctAnswerKey !== undefined && (
                              <div className="text-[11px] font-mono text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                                <span>Key: {studentResponse.correctAnswerKey}</span>
                                <span className={studentResponse.isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                                  {studentResponse.isCorrect ? '✓ Correct (1 pt)' : '✗ Incorrect (0 pt)'}
                                </span>
                              </div>
                            )}

                            {/* Spoken Speech-to-Text Transcript */}
                            {(studentResponse.transcript || studentResponse.recordedAudio?.transcript) && (
                              <div className="pt-2 border-t border-slate-100 text-xs">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                  <span className="text-indigo-900 font-bold">🎙️ Spoken Transcript:</span>
                                  <span>{((studentResponse.transcript || studentResponse.recordedAudio?.transcript).trim().split(/\s+/).filter(Boolean).length)} words</span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded border border-slate-200 font-serif text-slate-800 leading-relaxed italic select-text">
                                  "{studentResponse.transcript || studentResponse.recordedAudio?.transcript}"
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {studentResponse.selectedIndices && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>Words Highlighted (HIW):</span>
                              <span className="font-mono text-blue-900">
                                {studentResponse.selectedIndices.length} clicked
                              </span>
                            </div>
                            {studentResponse.correctClicks !== undefined && (
                              <div className="text-[11px] font-mono text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                                <span>Correct (+1): {studentResponse.correctClicks} | Incorrect (-1): {studentResponse.incorrectClicks}</span>
                                <span className="font-bold text-emerald-700">Score: {studentResponse.finalScore} pts</span>
                              </div>
                            )}

                            {/* Spoken Speech-to-Text Transcript */}
                            {(studentResponse.transcript || studentResponse.recordedAudio?.transcript) && (
                              <div className="pt-2 border-t border-slate-100 text-xs">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                  <span className="text-indigo-900 font-bold">🎙️ Spoken Transcript:</span>
                                  <span>{((studentResponse.transcript || studentResponse.recordedAudio?.transcript).trim().split(/\s+/).filter(Boolean).length)} words</span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded border border-slate-200 font-serif text-slate-800 leading-relaxed italic select-text">
                                  "{studentResponse.transcript || studentResponse.recordedAudio?.transcript}"
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedItem.taskType === 'WFD' && studentResponse.totalWords !== undefined && (
                          <div className="p-2.5 bg-white rounded border border-blue-200 text-[11px] font-mono space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Word-Alignment Scoring:</span>
                              <span className="text-emerald-700">
                                {studentResponse.correctWords} / {studentResponse.totalWords} Correct (+1 each)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No response submitted for this question.</p>
                    )}
                  </div>
                </div>

                {/* Auto-Score Quick Fill Banner */}
                {studentResponse && studentResponse.rawScore !== undefined && (
                  <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-950">
                        ⚡ Deterministic Auto-Score Calculated: {studentResponse.rawScore} pts
                      </span>
                      <p className="text-emerald-800 text-[11px]">
                        Exact Pearson scoring math computed automatically from the candidate&apos;s response.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleScoreChange(selectedItem.id, 'content', studentResponse.rawScore);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-2xs transition"
                    >
                      Fill Score ({studentResponse.rawScore} pts)
                    </button>
                  </div>
                )}

                {/* Manual Score Inputs matching Google Sheet columns */}
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Scoring Sheet Breakdown ({selectedItem.id})
                  </h5>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {/* Content Score */}
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Content Score</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={itemScore.content ?? 0}
                        onChange={(e) => handleScoreChange(selectedItem.id, 'content', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>

                    {/* Fluency / Form Score */}
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">
                        {['SWT', 'WE', 'SST'].includes(selectedItem.taskType) ? 'Form Score' : 'Oral Fluency'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={itemScore.fluency ?? itemScore.form ?? 0}
                        onChange={(e) =>
                          handleScoreChange(
                            selectedItem.id,
                            ['SWT', 'WE', 'SST'].includes(selectedItem.taskType) ? 'form' : 'fluency',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>

                    {/* Pronunciation / Grammar Score */}
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">
                        {['SWT', 'WE', 'SST'].includes(selectedItem.taskType) ? 'Grammar Score' : 'Pronunciation'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={itemScore.pronunciation ?? itemScore.grammar ?? 0}
                        onChange={(e) =>
                          handleScoreChange(
                            selectedItem.id,
                            ['SWT', 'WE', 'SST'].includes(selectedItem.taskType) ? 'grammar' : 'pronunciation',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>

                    {/* Total Item Score */}
                    <div>
                      <label className="block font-semibold text-emerald-800 mb-1">Total Item Points</label>
                      <div className="px-3 py-2 bg-emerald-100 border border-emerald-300 rounded font-mono font-black text-emerald-900 text-sm">
                        {itemScore.total ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Comments / Rubric feedback */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Teacher Comments / Feedback
                    </label>
                    <input
                      type="text"
                      value={itemScore.comments || ''}
                      onChange={(e) => handleCommentChange(selectedItem.id, e.target.value)}
                      placeholder="e.g. Minor hesitations on syllables, good lexical density..."
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center text-slate-400 border rounded">
                Select an item from the left panel to begin grading.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

