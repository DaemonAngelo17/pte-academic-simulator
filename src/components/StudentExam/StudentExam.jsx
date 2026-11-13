import React, { useState, useEffect, useMemo, useRef } from 'react';
import Part1SpeakingWriting from './Part1SpeakingWriting';
import Part2Reading from './Part2Reading';
import Part3Listening from './Part3Listening';
import { countWords } from '../../config/pteRules';
import { countTerminalSentences } from './Part1SpeakingWriting';
import {
  buildExamSet,
  randomizeItemPromptsAndChoices
} from '../../utils/examRandomizer';
import {
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  LogOut,
  User,
  Shuffle,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  Download,
  FileArchive,
  FolderDown,
  RefreshCw,
  Play
} from 'lucide-react';
import { downloadExamSubmissionZip } from '../../utils/zipExporter';

export default function StudentExam({
  questionBank,
  onExit,
  initialSessionCode = 'PTE-2026-A'
}) {
  const [studentInfo, setStudentInfo] = useState({
    name: 'Alex Morgan',
    studentId: 'PTE-2025-8842',
    targetScore: 'PTE 79+',
    sessionCode: initialSessionCode,
    scope: 'all', // 'all', 'PART_1', 'PART_2', 'PART_3', or 'PKG:<packageId>'
    randomize: true, // Default to true for authentic unique testing
    shuffleChoices: true // Default to true for shuffled options & blanks
  });

  const [drawSeed, setDrawSeed] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Active section phase: 'PART_1' | 'PART_2' | 'PART_3' | 'COMPLETED'
  const [currentSectionPhase, setCurrentSectionPhase] = useState('PART_1');

  const [examItems, setExamItems] = useState([]);
  const [responses, setResponses] = useState({});
  const [activeBlueprint, setActiveBlueprint] = useState(null);

  // Crash Recovery & Session Persistence State
  const checkpointKey = `pte_checkpoint_${studentInfo.studentId || 'default'}`;
  const [resumeCandidate, setResumeCandidate] = useState(null);
  const [isRestoredFromCheckpoint, setIsRestoredFromCheckpoint] = useState(false);
  const [part1Progress, setPart1Progress] = useState(null);
  const [part2Progress, setPart2Progress] = useState(null);
  const [part3Progress, setPart3Progress] = useState(null);

  const handleDownloadExamZip = async () => {
    setIsExportingZip(true);
    try {
      const submissionPack = {
        id: `SUB-${Date.now()}`,
        studentId: studentInfo.studentId,
        studentName: studentInfo.name,
        targetScore: studentInfo.targetScore,
        sessionCode: studentInfo.sessionCode,
        submittedAt: new Date().toISOString(),
        scope: studentInfo.scope,
        isRandomized: studentInfo.randomize !== false,
        totalItems: examItems.length,
        examItems: examItems,
        responses: responses,
        manualScores: {},
        gradingStatus: 'pending',
        packVersion: '2.0'
      };
      await downloadExamSubmissionZip(submissionPack, examItems);
    } catch (err) {
      alert('Zip download failed: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Filter items based on chosen scope or Test Package
  useEffect(() => {
    // If exam is active or restored from checkpoint, preserve the exact items
    if ((isExamStarted || isRestoredFromCheckpoint) && examItems.length > 0) return;
    if (resumeCandidate && Array.isArray(resumeCandidate.examItems) && resumeCandidate.examItems.length > 0) return;
    if (!questionBank?.items) return;
    let allItems = [...questionBank.items];

    // If teacher customized the active session item selection in QuestionManager
    if (Array.isArray(questionBank.selectedItemIds) && questionBank.selectedItemIds.length > 0) {
      const selectedIdSet = new Set(questionBank.selectedItemIds);
      const selectedItems = allItems.filter((it) => selectedIdSet.has(it.id));
      if (selectedItems.length > 0) {
        allItems = selectedItems;
      }
    }

    if (studentInfo.scope.startsWith('PKG:')) {
      const pkgId = studentInfo.scope.replace('PKG:', '');
      const pkg = (questionBank.testPackages || []).find((p) => p.id === pkgId);
      if (pkg && (Array.isArray(pkg.itemIds) || Array.isArray(pkg.items))) {
        setActiveBlueprint(pkg);
        const itemMap = new Map(allItems.map((it) => [it.id, it]));
        const rawIds = Array.isArray(pkg.itemIds) && pkg.itemIds.length > 0
          ? pkg.itemIds
          : (pkg.items || []).map((x) => (typeof x === 'string' ? x : x.id));

        let orderedPkgItems = rawIds.map((id) => {
          const base = itemMap.get(id);
          if (!base) return null;
          const bpItem = Array.isArray(pkg.items)
            ? pkg.items.find((x) => (typeof x === 'string' ? x === id : x.id === id))
            : null;
          if (bpItem && typeof bpItem === 'object') {
            return {
              ...base,
              timingOverrides: { ...(base.timingOverrides || {}), ...(bpItem.timingOverrides || {}) },
              scoringOverrides: { ...(base.scoringOverrides || {}), ...(bpItem.scoringOverrides || {}) }
            };
          }
          return base;
        }).filter(Boolean);

        if (studentInfo.shuffleChoices) {
          orderedPkgItems = orderedPkgItems.map((it) => randomizeItemPromptsAndChoices(it));
        }
        setExamItems(orderedPkgItems);
        return;
      }
    }

    setActiveBlueprint(null);

    // Build randomized exam set using Pearson official quotas
    const selectedSet = buildExamSet(allItems, {
      scope: studentInfo.scope,
      randomize: studentInfo.randomize !== false,
      shuffleChoices: studentInfo.shuffleChoices !== false
    });
    setExamItems(selectedSet);
  }, [questionBank, studentInfo.scope, studentInfo.randomize, studentInfo.shuffleChoices, drawSeed, isExamStarted, isRestoredFromCheckpoint, examItems.length]);

  // Section items
  const part1Items = examItems.filter((it) => it.part === 'PART_1');
  const part2Items = examItems.filter((it) => it.part === 'PART_2');
  const part3Items = examItems.filter((it) => it.part === 'PART_3');
  const totalScoredCount = examItems.filter((it) => it.taskType !== 'PI').length;

  // Dynamically detect which sections actually contain items for this test
  const availableSections = useMemo(() => {
    const list = [];
    if (part1Items.length > 0) list.push('PART_1');
    if (part2Items.length > 0) list.push('PART_2');
    if (part3Items.length > 0) list.push('PART_3');
    return list;
  }, [part1Items.length, part2Items.length, part3Items.length]);

  // Check for saved incomplete session on mount
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem('pte_active_checkpoint') ||
        localStorage.getItem(checkpointKey) ||
        localStorage.getItem('pte_checkpoint_default');
      if (raw) {
        const parsed = JSON.parse(raw);
        const savedTime = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
        const hoursAgo = (Date.now() - savedTime) / (1000 * 60 * 60);
        // Valid if within 24 hours and exam was started and not completed
        if (parsed.isExamStarted && parsed.currentSectionPhase !== 'COMPLETED' && hoursAgo < 24) {
          setResumeCandidate(parsed);
          if (parsed.studentInfo) {
            setStudentInfo(parsed.studentInfo);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading checkpoint on mount:', e);
    }
  }, []);

  // Browser navigation and accidental tab close protection
  useEffect(() => {
    if (!isExamStarted || currentSectionPhase === 'COMPLETED') return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active PTE exam in progress. Are you sure you want to leave? Your progress is checkpointed.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isExamStarted, currentSectionPhase]);

  // Atomic state checkpointing to LocalStorage on every answer update, section transition, or progress change
  useEffect(() => {
    if (!isExamStarted || currentSectionPhase === 'COMPLETED') return;
    if (examItems.length === 0) return;

    try {
      // Strip heavy base64 dataUrl and expired localBlobUrl to keep checkpoint under 15 KB (preventing QuotaExceededError)
      const sanitizedResponses = {};
      Object.keys(responses || {}).forEach((k) => {
        const resp = responses[k] || {};
        const clean = { ...resp };
        if (clean.recordedAudio) {
          clean.recordedAudio = {
            ...clean.recordedAudio,
            dataUrl: undefined,
            localBlobUrl: undefined
          };
        }
        sanitizedResponses[k] = clean;
      });

      const checkpoint = {
        isExamStarted: true,
        studentInfo,
        currentSectionPhase,
        activeBlueprint,
        examItems, // Exactly preserves the question items
        responses: sanitizedResponses,
        part1Progress,
        part2Progress,
        part3Progress,
        savedAt: new Date().toISOString()
      };
      const key = `pte_checkpoint_${studentInfo.studentId || 'default'}`;
      localStorage.setItem('pte_active_checkpoint', JSON.stringify(checkpoint));
      localStorage.setItem(key, JSON.stringify(checkpoint));
      localStorage.setItem('pte_checkpoint_default', JSON.stringify(checkpoint));
    } catch (err) {
      console.warn('Checkpoint save failed:', err);
    }
  }, [
    responses,
    currentSectionPhase,
    isExamStarted,
    activeBlueprint,
    checkpointKey,
    studentInfo,
    examItems,
    part1Progress?.stage,
    part1Progress?.currentIndex,
    part1Progress?.remainingSeconds ? Math.floor(part1Progress.remainingSeconds / 10) : 0,
    part2Progress?.currentIndex,
    part2Progress?.remainingSeconds ? Math.floor(part2Progress.remainingSeconds / 10) : 0,
    part3Progress?.currentIndex,
    part3Progress?.remainingSeconds ? Math.floor(part3Progress.remainingSeconds / 10) : 0
  ]);

  const handleResumeSavedSession = () => {
    if (!resumeCandidate) return;

    setIsRestoredFromCheckpoint(true);

    if (resumeCandidate.studentInfo) {
      setStudentInfo(resumeCandidate.studentInfo);
    }
    if (Array.isArray(resumeCandidate.examItems) && resumeCandidate.examItems.length > 0) {
      setExamItems(resumeCandidate.examItems);
    }
    if (resumeCandidate.responses) {
      setResponses(resumeCandidate.responses);
    }
    if (resumeCandidate.currentSectionPhase) {
      setCurrentSectionPhase(resumeCandidate.currentSectionPhase);
    }
    if (resumeCandidate.activeBlueprint) {
      setActiveBlueprint(resumeCandidate.activeBlueprint);
    }
    if (resumeCandidate.part1Progress) {
      setPart1Progress(resumeCandidate.part1Progress);
    }
    if (resumeCandidate.part2Progress) {
      setPart2Progress(resumeCandidate.part2Progress);
    }
    if (resumeCandidate.part3Progress) {
      setPart3Progress(resumeCandidate.part3Progress);
    }

    setIsExamStarted(true);
    setResumeCandidate(null);
  };

  const handleDiscardSavedSession = () => {
    try {
      localStorage.removeItem('pte_active_checkpoint');
      localStorage.removeItem(checkpointKey);
      localStorage.removeItem('pte_checkpoint_default');
    } catch {}
    setResumeCandidate(null);
    setIsRestoredFromCheckpoint(false);
    setPart1Progress(null);
    setPart2Progress(null);
    setPart3Progress(null);
    setResponses({});
  };

  const handleUpdateResponse = (itemId, val) => {
    const nextVal = { ...val };
    if (typeof nextVal.text === 'string' && nextVal.wordCount === undefined) {
      nextVal.wordCount = countWords(nextVal.text);
      nextVal.sentenceCount = countTerminalSentences(nextVal.text);
    }
    setResponses((prev) => ({
      ...prev,
      [itemId]: nextVal
    }));
  };

  const handleStartExam = () => {
    if (availableSections.length > 0 && !availableSections.includes(currentSectionPhase)) {
      setCurrentSectionPhase(availableSections[0]);
    } else if (availableSections.length > 0) {
      setCurrentSectionPhase(availableSections[0]);
    }
    setIsExamStarted(true);
  };

  // Dynamic multi-section router: advances strictly through the available sections in sequence
  const advanceToNextSection = (currentPhase) => {
    const currentIndex = availableSections.indexOf(currentPhase);
    if (currentIndex >= 0 && currentIndex < availableSections.length - 1) {
      setCurrentSectionPhase(availableSections[currentIndex + 1]);
    } else {
      finishAndSubmitExam();
    }
  };

  const handlePart1Finished = () => advanceToNextSection('PART_1');
  const handlePart2Finished = () => advanceToNextSection('PART_2');
  const handlePart3Finished = () => advanceToNextSection('PART_3');

  const finishAndSubmitExam = async () => {
    setCurrentSectionPhase('COMPLETED');
    setIsExamFinished(true);
    setIsSubmitting(true);

    // Clean up active checkpoint once exam successfully completes
    try {
      localStorage.removeItem(checkpointKey);
      localStorage.removeItem('pte_checkpoint_default');
      localStorage.removeItem('pte_active_checkpoint');
    } catch {}

    const submissionPayload = {
      id: `SUB-${Date.now()}`,
      studentId: studentInfo.studentId,
      studentName: studentInfo.name,
      targetScore: studentInfo.targetScore || 'PTE 79+',
      sessionCode: studentInfo.sessionCode,
      submittedAt: new Date().toISOString(),
      scope: studentInfo.scope,
      isRandomized: studentInfo.randomize !== false,
      totalItems: examItems.length,
      examItems: examItems,
      responses: responses,
      manualScores: {},
      gradingStatus: 'pending'
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });
      if (!res.ok) {
        throw new Error(`Submission endpoint returned ${res.status}`);
      }
    } catch {
      const existing = JSON.parse(localStorage.getItem('pte_submissions') || '[]');
      existing.unshift(submissionPayload);
      localStorage.setItem('pte_submissions', JSON.stringify(existing));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-Exam Login Screen
  if (!isExamStarted) {
    const testPackages = questionBank?.testPackages || [];

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700">
          <div className="bg-[#003865] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white text-[#003865] font-black flex items-center justify-center text-sm shadow-xs">
                P
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">PTE Academic™ Exam Terminal</h2>
                <p className="text-xs text-blue-200">Pearson Test of English Classroom Simulator</p>
              </div>
            </div>
            <button
              onClick={onExit}
              className="text-xs text-blue-200 hover:text-white underline"
            >
              Back to Portal
            </button>
          </div>

          <div className="p-6 space-y-5">
            {resumeCandidate && (
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg text-slate-800 shadow-md animate-in fade-in duration-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center space-x-2">
                      <span>Unfinished Exam Session Detected</span>
                      <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px]">Active Checkpoint</span>
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      We recovered an active test session for <strong>{resumeCandidate.studentInfo?.name || resumeCandidate.studentName || studentInfo.name}</strong> ({resumeCandidate.studentInfo?.studentId || resumeCandidate.studentId}).
                    </p>
                    <div className="mt-2 text-xs font-semibold text-slate-800 flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-white border border-amber-200 rounded">
                        Section: <strong>{resumeCandidate.currentSectionPhase === 'PART_1' ? 'Part 1 (Speaking & Writing)' : resumeCandidate.currentSectionPhase === 'PART_2' ? 'Part 2 (Reading)' : 'Part 3 (Listening)'}</strong>
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-amber-200 rounded">
                        Location: <strong>{
                          resumeCandidate.currentSectionPhase === 'PART_1'
                            ? (resumeCandidate.part1Progress?.stage === 'equipment_check' ? 'Equipment Check' : resumeCandidate.part1Progress?.stage === 'personal_intro' ? 'Personal Introduction' : `Item ${(resumeCandidate.part1Progress?.currentIndex ?? 0) + 1}`)
                            : resumeCandidate.currentSectionPhase === 'PART_2'
                              ? `Item ${(resumeCandidate.part2Progress?.currentIndex ?? 0) + 1}`
                              : `Item ${(resumeCandidate.part3Progress?.currentIndex ?? 0) + 1}`
                        }</strong>
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-amber-200 rounded">
                        Answered: <strong>{Object.keys(resumeCandidate.responses || {}).length} questions</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-3.5">
                      <button
                        type="button"
                        onClick={handleResumeSavedSession}
                        className="px-4 py-2 bg-[#003865] hover:bg-[#002644] text-white font-bold text-xs rounded transition shadow-md flex items-center space-x-1.5 active:scale-98"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Resume Exam Where You Left Off</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscardSavedSession}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded transition"
                      >
                        <span>Discard &amp; Start Fresh</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Candidate Full Name
              </label>
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm focus:border-[#003865] focus:outline-hidden"
                placeholder="e.g. Alex Morgan"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate ID
                </label>
                <input
                  type="text"
                  value={studentInfo.studentId}
                  onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono focus:border-[#003865] focus:outline-hidden"
                  placeholder="e.g. PTE-2026-001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Score
                </label>
                <select
                  value={studentInfo.targetScore}
                  onChange={(e) => setStudentInfo({ ...studentInfo, targetScore: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded text-sm font-bold text-blue-900 focus:border-[#003865] focus:outline-hidden bg-white"
                >
                  <option value="PTE 79+">PTE 79+ (Superior / 8.0)</option>
                  <option value="PTE 65+">PTE 65+ (Proficient / 7.0)</option>
                  <option value="PTE 50+">PTE 50+ (Competent / 6.0)</option>
                  <option value="PTE 36+">PTE 36+ (Modest / 5.0)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Session Code
                </label>
                <input
                  type="text"
                  value={studentInfo.sessionCode}
                  onChange={(e) => setStudentInfo({ ...studentInfo, sessionCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono focus:border-[#003865] focus:outline-hidden"
                  placeholder="e.g. PTE-2026-A"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Test Package / Exam Scope
                </label>
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {examItems.length} Exam Slots Active
                </span>
              </div>
              <select
                value={studentInfo.scope}
                onChange={(e) => setStudentInfo({ ...studentInfo, scope: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm focus:border-[#003865] focus:outline-hidden bg-white"
              >
                <optgroup label="Standard Section Scopes (Official Item Quotas)">
                  <option value="all">
                    Full Mock Exam (68 Scored Items drawn from {questionBank?.items?.length || 186} in bank)
                  </option>
                  <option value="PART_1">
                    Part 1: Speaking &amp; Writing (37 Items drawn from {questionBank?.items?.filter((i) => i.part === 'PART_1').length || 0})
                  </option>
                  <option value="PART_2">
                    Part 2: Reading (15 Items drawn from {questionBank?.items?.filter((i) => i.part === 'PART_2').length || 0})
                  </option>
                  <option value="PART_3">
                    Part 3: Listening (16 Items drawn from {questionBank?.items?.filter((i) => i.part === 'PART_3').length || 0})
                  </option>
                </optgroup>
                {testPackages.length > 0 && (
                  <optgroup label="Assembled Teacher Test Packages">
                    {testPackages.map((pkg) => (
                      <option key={pkg.id} value={`PKG:${pkg.id}`}>
                        📦 {pkg.name} ({pkg.itemIds?.length || 0} Items)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Randomization Controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Shuffle className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Question &amp; Prompt Randomization
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {questionBank?.items?.length || 186} In Master Bank
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStudentInfo((prev) => ({ ...prev, randomize: true }))}
                  className={`px-3 py-2 rounded text-xs font-bold border transition text-left flex items-center justify-between ${
                    studentInfo.randomize
                      ? 'bg-blue-800 text-white border-blue-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>🎲</span>
                    <span>Randomized Draw</span>
                  </span>
                  {studentInfo.randomize && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStudentInfo((prev) => ({ ...prev, randomize: false }))}
                  className={`px-3 py-2 rounded text-xs font-bold border transition text-left flex items-center justify-between ${
                    !studentInfo.randomize
                      ? 'bg-blue-800 text-white border-blue-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>📋</span>
                    <span>Fixed Order</span>
                  </span>
                  {!studentInfo.randomize && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={studentInfo.shuffleChoices}
                    onChange={(e) => setStudentInfo((prev) => ({ ...prev, shuffleChoices: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Randomize inner options &amp; word pools</span>
                </label>

                {studentInfo.randomize && (
                  <button
                    type="button"
                    onClick={() => setDrawSeed((prev) => prev + 1)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 self-start sm:self-auto"
                    title="Reshuffle question bank draw"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-roll Random Draw</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                {studentInfo.randomize
                  ? `Each student draws a unique, randomized prompt set across official Pearson slot quotas.`
                  : `Questions are sampled sequentially from the first items in the bank.`}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3.5 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Official Pearson Examination Rules Active:</span>
              </div>
              <p>
                One-way navigation only (no Back button). Part 1 includes mic check &amp; 3s silence rule. Part 2 uses a cumulative 27-min timer. Part 3 plays audio once only with dedicated SST &amp; shared timers.
              </p>
            </div>

            <button
              onClick={handleStartExam}
              disabled={examItems.length === 0}
              className="w-full py-3 bg-[#003865] hover:bg-[#002644] disabled:opacity-50 text-white font-bold rounded shadow-md transition text-sm flex items-center justify-center space-x-2"
            >
              <span>Begin Examination ({examItems.length} Items)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (isExamFinished) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8 text-center border border-slate-300 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Examination Completed</h2>
            <p className="text-sm text-slate-600">
              Thank you, <strong className="text-slate-900">{studentInfo.name}</strong>. All responses and deterministic scores across Parts 1, 2, and 3 have been recorded.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-left text-slate-700 space-y-1.5">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Candidate ID:</span>
              <span className="font-mono font-bold">{studentInfo.studentId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Target Score:</span>
              <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                {studentInfo.targetScore}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Session Code:</span>
              <span className="font-mono font-bold">{studentInfo.sessionCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Total Items Attempted:</span>
              <span className="font-bold">
                {Object.keys(responses).length} / {examItems.length}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Grading Status:</span>
              <span className="text-emerald-700 font-bold uppercase">
                {isSubmitting ? 'Syncing...' : 'Auto-Scored & Ready in Teacher Command Center'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary Action: Download Everything as Arranged Zip Archive */}
            <button
              type="button"
              onClick={handleDownloadExamZip}
              disabled={isExportingZip}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center space-x-2 shadow-md active:scale-98 disabled:opacity-50"
            >
              {isExportingZip ? (
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
              ) : (
                <FileArchive className="w-4 h-4 text-indigo-200" />
              )}
              <span>
                {isExportingZip
                  ? 'Packaging Questions, Audio & Transcripts (.zip)...'
                  : 'Download Complete Exam Pack (.zip)'}
              </span>
            </button>
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Arranged in folders by task type with all questions, student answers, speech transcripts, audio clips, and a pre-formatted prompt ready for external AI evaluation.
            </p>

            <button
              type="button"
              onClick={() => {
                const submissionPack = {
                  id: `SUB-${Date.now()}`,
                  studentId: studentInfo.studentId,
                  studentName: studentInfo.name,
                  targetScore: studentInfo.targetScore,
                  sessionCode: studentInfo.sessionCode,
                  submittedAt: new Date().toISOString(),
                  scope: studentInfo.scope,
                  isRandomized: studentInfo.randomize !== false,
                  totalItems: examItems.length,
                  examItems: examItems,
                  responses: responses,
                  manualScores: {},
                  gradingStatus: 'pending',
                  packVersion: '2.0'
                };
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissionPack, null, 2));
                const a = document.createElement('a');
                a.setAttribute('href', dataStr);
                a.setAttribute('download', `PTE_Submission_${studentInfo.studentId}_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition text-xs flex items-center justify-center space-x-1.5 border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Raw Submission JSON (.json)</span>
            </button>

            <button
              onClick={onExit}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition text-xs"
            >
              Return to Portal Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Section Router
  if (currentSectionPhase === 'PART_1' && part1Items.length > 0) {
    const part1Duration = activeBlueprint?.sectionConfig?.PART_1?.sectionSeconds || 80 * 60;
    return (
      <Part1SpeakingWriting
        items={part1Items}
        totalExamItemsCount={totalScoredCount}
        itemOffset={0}
        studentInfo={studentInfo}
        responses={responses}
        onUpdateResponse={handleUpdateResponse}
        onPart1Complete={handlePart1Finished}
        onExit={onExit}
        sectionDurationSeconds={part1Duration}
        initialStage={part1Progress?.stage}
        initialIndex={part1Progress?.currentIndex ?? 0}
        initialSectionSeconds={part1Progress?.remainingSeconds}
        onProgressUpdate={(prog) => setPart1Progress(prog)}
      />
    );
  }

  if (currentSectionPhase === 'PART_2' && part2Items.length > 0) {
    const scoredPart1Count = part1Items.filter((i) => i.taskType !== 'PI').length;
    const part2Duration = activeBlueprint?.sectionConfig?.PART_2?.sectionSeconds || 27 * 60;
    return (
      <Part2Reading
        items={part2Items}
        totalExamItemsCount={totalScoredCount}
        itemOffset={scoredPart1Count}
        studentInfo={studentInfo}
        responses={responses}
        onUpdateResponse={handleUpdateResponse}
        onPart2Complete={handlePart2Finished}
        onExit={onExit}
        sectionDurationSeconds={part2Duration}
        initialIndex={part2Progress?.currentIndex ?? 0}
        initialSectionSeconds={part2Progress?.remainingSeconds}
        onProgressUpdate={(prog) => setPart2Progress(prog)}
      />
    );
  }

  if (currentSectionPhase === 'PART_3' && part3Items.length > 0) {
    const scoredPart1Count = part1Items.filter((i) => i.taskType !== 'PI').length;
    const scoredPart2Count = part2Items.length;
    const part3SharedPoolDuration = activeBlueprint?.sectionConfig?.PART_3?.sharedPoolSeconds || 25 * 60;
    return (
      <Part3Listening
        items={part3Items}
        totalExamItemsCount={totalScoredCount}
        itemOffset={scoredPart1Count + scoredPart2Count}
        studentInfo={studentInfo}
        responses={responses}
        onUpdateResponse={handleUpdateResponse}
        onPart3Complete={handlePart3Finished}
        onExit={onExit}
        sharedPoolDurationSeconds={part3SharedPoolDuration}
        initialIndex={part3Progress?.currentIndex ?? 0}
        initialSharedPoolSeconds={part3Progress?.remainingSeconds}
        onProgressUpdate={(prog) => setPart3Progress(prog)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl max-w-md w-full space-y-4 shadow-xl">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold">No Items Found in Test Scope</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The selected exam scope or blueprint has no active questions. Please return to the Teacher Portal and verify your question assignments or blueprint item list.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
        >
          Return to Portal Dashboard
        </button>
      </div>
    </div>
  );
}
