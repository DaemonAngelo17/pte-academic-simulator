import React, { useState, useEffect, useRef } from 'react';
import AudioPlayerWidget from './AudioPlayerWidget';
import AudioRecorderWidget from './AudioRecorderWidget';
import {
  PTE_TASK_TYPES,
  countWords,
  formatTimeMMSS
} from '../../config/pteRules';
import { speakText, stopSpeaking, playShortBeep } from '../../utils/audioUtils';
import {
  Clock,
  ChevronRight,
  Mic,
  Volume2,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  Scissors,
  Copy,
  ClipboardPaste,
  User,
  Headphones,
  LogOut
} from 'lucide-react';

/**
 * Helper to count terminal sentences (., !, ? boundaries) for Google Sheet auto-validation
 */
export function countTerminalSentences(text = '') {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?]+(?=\s|$|["')\]])/g);
  return matches ? matches.length : 0;
}

export default function Part1SpeakingWriting({
  items = [],
  totalExamItemsCount = 65,
  itemOffset = 0,
  studentInfo = { name: 'Alex Morgan', studentId: 'PTE-2025-8842', sessionCode: 'PTE-2026-A' },
  responses = {},
  onUpdateResponse,
  onPart1Complete,
  onExit,
  skipPreExamCheck = false,
  sectionDurationSeconds = 80 * 60,
  initialStage,
  initialIndex = 0,
  initialSectionSeconds,
  onProgressUpdate
}) {
  // Separate Personal Introduction (PI-01) from scored Part 1 items
  const personalIntroItem = items.find((it) => it.taskType === 'PI') || {
    id: 'PI-01',
    taskType: 'PI',
    part: 'PART_1',
    title: 'Personal Introduction',
    prompt:
      'Please give a brief personal introduction. State your full name, educational background, career goals, and why you are taking the PTE Academic exam.',
    prepSeconds: 25,
    recordSeconds: 30
  };

  const scoredPart1Items = items.filter((it) => it.taskType !== 'PI');

  // Stage: 'equipment_check' -> 'personal_intro' -> 'scored_items'
  const [stage, setStage] = useState(() => {
    if (initialStage) return initialStage;
    return skipPreExamCheck ? 'scored_items' : 'equipment_check';
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = Number(initialIndex);
    if (!isNaN(idx) && idx >= 0 && idx < scoredPart1Items.length) return idx;
    return 0;
  });

  // Synchronize stage if restored from checkpoint
  useEffect(() => {
    if (initialStage && initialStage !== stage) {
      setStage(initialStage);
    }
  }, [initialStage]);

  // Synchronize currentIndex if restored from checkpoint
  useEffect(() => {
    const idx = Number(initialIndex);
    if (!isNaN(idx) && idx >= 0 && idx < scoredPart1Items.length && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [initialIndex, scoredPart1Items.length]);

  // Audio Prompt Playback Tracking (for RS, RL, SGD, RTS, ASQ)
  const [completedAudioItemIds, setCompletedAudioItemIds] = useState(() => new Set());

  const markAudioCompleted = (itemId) => {
    if (!itemId) return;
    setCompletedAudioItemIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  // Timers
  // Overall Part 1 section timer (custom duration or 80 mins default)
  const [part1SectionSeconds, setPart1SectionSeconds] = useState(() => {
    return initialSectionSeconds !== undefined && initialSectionSeconds !== null
      ? Number(initialSectionSeconds)
      : sectionDurationSeconds;
  });

  // Dedicated Item Timer for SWT, WE, or custom timed tasks
  const [dedicatedItemSeconds, setDedicatedItemSeconds] = useState(null);

  // Notify parent of progress state for atomic checkpointing (immediate on stage/index change, throttled for timer)
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate({
        stage,
        currentIndex,
        remainingSeconds: part1SectionSeconds
      });
    }
  }, [stage, currentIndex, Math.floor(part1SectionSeconds / 10)]);

  // One-Way Navigation Confirmation Modal state
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);

  // ==========================================
  // PRE-EXAM HEADSET & MICROPHONE CHECK STATE
  // ==========================================
  const [speakerVolume, setSpeakerVolume] = useState(0.9);
  const [speakerTested, setSpeakerTested] = useState(false);
  const [isPlayingSpeakerTest, setIsPlayingSpeakerTest] = useState(false);

  const [micCheckPhase, setMicCheckPhase] = useState('idle'); // 'idle' | 'recording' | 'ready'
  const [micCheckUrl, setMicCheckUrl] = useState(null);
  const [micCheckBars, setMicCheckBars] = useState(() => new Array(16).fill(10));
  const micStreamRef = useRef(null);
  const micRecorderRef = useRef(null);
  const micChunksRef = useRef([]);
  const micRafRef = useRef(null);

  // ==========================================
  // WRITING EDITOR CLIPBOARD & SELECTION REFS
  // ==========================================
  const writingTextareaRef = useRef(null);
  const [internalClipboard, setInternalClipboard] = useState('');

  const currentItem =
    stage === 'personal_intro' ? personalIntroItem : scoredPart1Items[currentIndex];
  const currentTaskMeta = currentItem ? PTE_TASK_TYPES[currentItem.taskType] : null;
  const currentResponse = currentItem ? responses[currentItem.id] || {} : {};

  // Determine if current item has an audio prompt that must finish before recording starts
  // Note: Only RS, RL, SGD, RTS, and ASQ play spoken audio prompts. PI, RA, DI are visually read and do NOT play audio prompts.
  const hasSpokenPrompt = Boolean(
    currentItem &&
    ['RS', 'RL', 'SGD', 'RTS', 'ASQ'].includes(currentItem.taskType) &&
    (currentItem.audioText || currentItem.audioUrl || currentItem.prompt)
  );

  // Synchronously derived: Audio is playing until this specific item ID finishes playing
  const isAudioPromptPlaying = Boolean(
    hasSpokenPrompt && currentItem?.id && !completedAudioItemIds.has(currentItem.id)
  );

  // Reset per-item states when advancing to a new item
  useEffect(() => {
    if (stage === 'equipment_check') return;
    setShowUnansweredModal(false);

    const itemTimerSeconds =
      currentItem?.timingOverrides?.timerSeconds ??
      currentItem?.timerSeconds ??
      currentTaskMeta?.dedicatedTimerSeconds;

    if (itemTimerSeconds) {
      setDedicatedItemSeconds(itemTimerSeconds);
    } else if (currentItem?.taskType === 'SWT') {
      setDedicatedItemSeconds(10 * 60); // 10-min dedicated timer
    } else if (currentItem?.taskType === 'WE') {
      setDedicatedItemSeconds(20 * 60); // 20-min dedicated timer
    } else {
      setDedicatedItemSeconds(null);
    }
  }, [stage, currentIndex, currentItem?.id]);

  // Overall Part 1 Countdown Timer
  useEffect(() => {
    if (stage === 'equipment_check') return;
    const interval = setInterval(() => {
      setPart1SectionSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  // Dedicated Writing Item Timer (SWT 10m / WE 20m) — Auto-advances when time expires
  useEffect(() => {
    if (stage !== 'scored_items' || dedicatedItemSeconds === null) return;
    const interval = setInterval(() => {
      setDedicatedItemSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          proceedToNextItem();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, currentIndex, dedicatedItemSeconds !== null]);

  // Cleanup Microphone Check resources on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ==========================================
  // PRE-EXAM MICROPHONE & SPEAKER CHECK LOGIC
  // ==========================================
  const handleSpeakerTest = () => {
    setIsPlayingSpeakerTest(true);
    setSpeakerTested(true);
    playShortBeep(660, 0.25);
    speakText(
      'This is the Pearson PTE Academic headset check. Adjust the volume slider so you can hear this voice clearly and comfortably.',
      () => setIsPlayingSpeakerTest(false),
      { accent: 'en-GB', rate: 0.95, volume: speakerVolume }
    );
  };

  const handleStartMicCheck = async () => {
    setMicCheckPhase('recording');
    setMicCheckUrl(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        micRecorderRef.current = recorder;
        micChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) micChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(micChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setMicCheckUrl(url);
          stream.getTracks().forEach((t) => t.stop());
        };

        recorder.start();

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        const freq = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteFrequencyData(freq);
          const bars = Array.from({ length: 16 }, (_, i) =>
            Math.max(10, Math.min(100, Math.round(((freq[i] || 0) / 255) * 100)))
          );
          setMicCheckBars(bars);
          micRafRef.current = requestAnimationFrame(updateMeter);
        };
        micRafRef.current = requestAnimationFrame(updateMeter);
        return;
      }
    } catch {
      // Fallback simulated check if mic permission denied
    }

    const simInterval = setInterval(() => {
      setMicCheckBars(Array.from({ length: 16 }, () => Math.floor(20 + Math.random() * 65)));
    }, 120);
    micRafRef.current = simInterval;
  };

  const handleStopMicCheck = () => {
    if (micRafRef.current) {
      cancelAnimationFrame(micRafRef.current);
      clearInterval(micRafRef.current);
    }
    setMicCheckBars(new Array(16).fill(8));
    setMicCheckPhase('ready');

    if (micRecorderRef.current && micRecorderRef.current.state === 'recording') {
      micRecorderRef.current.stop();
    }
  };

  // ==========================================
  // WRITING CUT / COPY / PASTE & AUTO-METRICS
  // ==========================================
  const handleWritingTextChange = (newText) => {
    if (!currentItem) return;
    const calculatedWords = countWords(newText);
    const calculatedSentences = countTerminalSentences(newText);

    onUpdateResponse(currentItem.id, {
      ...currentResponse,
      text: newText,
      // Hidden metrics stored automatically for Google Sheet validation
      wordCount: calculatedWords,
      sentenceCount: calculatedSentences
    });
  };

  const handleCutText = () => {
    const el = writingTextareaRef.current;
    const currentText = currentResponse.text || '';
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) return;

    const selectedSlice = currentText.slice(start, end);
    setInternalClipboard(selectedSlice);
    navigator.clipboard?.writeText(selectedSlice).catch(() => {});

    const nextText = currentText.slice(0, start) + currentText.slice(end);
    handleWritingTextChange(nextText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start);
    }, 0);
  };

  const handleCopyText = () => {
    const el = writingTextareaRef.current;
    const currentText = currentResponse.text || '';
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) return;

    const selectedSlice = currentText.slice(start, end);
    setInternalClipboard(selectedSlice);
    navigator.clipboard?.writeText(selectedSlice).catch(() => {});
    el.focus();
  };

  const handlePasteText = async () => {
    const el = writingTextareaRef.current;
    const currentText = currentResponse.text || '';
    let pasteStr = internalClipboard;

    try {
      const sysClip = await navigator.clipboard.readText();
      if (sysClip) pasteStr = sysClip;
    } catch {
      // use internalClipboard fallback
    }

    if (!pasteStr) return;

    const start = el ? el.selectionStart ?? currentText.length : currentText.length;
    const end = el ? el.selectionEnd ?? currentText.length : currentText.length;

    const nextText = currentText.slice(0, start) + pasteStr + currentText.slice(end);
    handleWritingTextChange(nextText);

    if (el) {
      const nextCursor = start + pasteStr.length;
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(nextCursor, nextCursor);
      }, 0);
    }
  };

  // ==========================================
  // ONE-WAY NAVIGATION & COMPLETION CHECK
  // ==========================================
  const hasCandidateResponded = () => {
    if (!currentItem) return true;
    if (['SWT', 'WE'].includes(currentItem.taskType)) {
      return Boolean((currentResponse.text || '').trim().length > 0);
    }
    return Boolean(currentResponse.recordedAudio || currentResponse.textAnswer);
  };

  const handleClickNext = () => {
    if (!hasCandidateResponded()) {
      setShowUnansweredModal(true);
      return;
    }
    proceedToNextItem();
  };

  const proceedToNextItem = () => {
    stopSpeaking();
    setShowUnansweredModal(false);

    if (stage === 'personal_intro') {
      setStage('scored_items');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < scoredPart1Items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (onPart1Complete) onPart1Complete();
    }
  };

  // ==========================================
  // RENDER STAGE 1: HEADSET & MICROPHONE CHECK
  // ==========================================
  if (stage === 'equipment_check') {
    return (
      <div className="min-h-screen flex flex-col bg-[#edeef0] text-slate-800 select-none">
        {/* Authentic Pearson Blue Header */}
        <header className="bg-[#003865] text-white px-6 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-white text-[#003865] font-black flex items-center justify-center text-xs">
              P
            </div>
            <span className="font-bold text-sm tracking-wide">
              Pearson VUE — PTE Academic™ Equipment Check
            </span>
          </div>

          <div className="flex items-center space-x-5 text-xs">
            <div className="flex items-center space-x-1.5 text-blue-100">
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold">{studentInfo.name}</span>
              <span className="text-blue-300 font-mono">({studentInfo.studentId})</span>
            </div>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="flex items-center space-x-1 text-blue-200 hover:text-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </header>

        <div className="bg-[#e2e5e8] border-b border-slate-300 px-6 py-2 flex items-center justify-between text-xs text-slate-700">
          <span className="font-bold text-slate-900">
            Pre-Exam Headset &amp; Microphone Verification
          </span>
          <span className="text-slate-600 font-medium">Mandatory Pre-Test Check</span>
        </div>

        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-[#fff9db] border border-[#f59f00]/40 rounded p-3.5 text-xs text-slate-800">
            <strong className="text-amber-900 block mb-1">Equipment Check Instructions:</strong>
            Before beginning Part 1: Speaking &amp; Writing, verify your headset volume and microphone recording clarity below. Position the microphone two finger-widths from the corner of your mouth.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Headset Volume Test Card */}
            <div className="bg-white rounded border border-slate-300 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Headphones className="w-5 h-5 text-[#003865]" />
                  <h3 className="font-bold text-sm text-slate-900">1. Speaker &amp; Headset Check</h3>
                </div>
                {speakerTested && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Put on your headphones and click <strong>Play Sample Sound</strong>. Use the volume slider to set a comfortable listening level.
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={handleSpeakerTest}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#003865] hover:bg-[#002644] text-white text-xs font-bold rounded shadow-xs transition"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlayingSpeakerTest ? 'Playing Sample...' : 'Play Sample Sound'}</span>
                </button>

                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-[11px] font-semibold text-slate-500">Volume:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={speakerVolume}
                    onChange={(e) => setSpeakerVolume(parseFloat(e.target.value))}
                    className="w-full accent-[#003865] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. Microphone Recording & Playback Check Card */}
            <div className="bg-white rounded border border-slate-300 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-[#003865]" />
                  <h3 className="font-bold text-sm text-slate-900">
                    2. Microphone Recording &amp; Playback
                  </h3>
                </div>
                {micCheckPhase === 'ready' && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Recorded
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>Record</strong> and say:{' '}
                <em className="text-slate-900 font-semibold">
                  &ldquo;Testing one, two, three, testing my microphone.&rdquo;
                </em>{' '}
                Then click <strong>Stop</strong> and listen to your playback.
              </p>

              {/* Live Mic Level Visualizer */}
              <div className="bg-slate-900 rounded p-2 flex items-end justify-between h-11 space-x-1">
                {micCheckBars.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-75 ${
                      micCheckPhase === 'recording' ? 'bg-blue-400' : 'bg-slate-700'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                {micCheckPhase !== 'recording' ? (
                  <button
                    type="button"
                    onClick={handleStartMicCheck}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#003865] hover:bg-[#002644] text-white text-xs font-bold rounded shadow-xs transition"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopMicCheck}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-xs transition animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                )}

                {micCheckUrl && (
                  <audio controls src={micCheckUrl} className="h-8 flex-1" />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Bottom One-Way Action Bar */}
        <footer className="bg-[#e2e5e8] border-t border-slate-300 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Next Step: Personal Introduction (Unscored, 25s Prep / 30s Recording)
          </span>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setStage('personal_intro');
            }}
            className="flex items-center space-x-1 px-6 py-2 bg-[#003865] hover:bg-[#002644] text-white text-xs font-bold rounded shadow-xs uppercase tracking-wider transition"
          >
            <span>Next: Personal Introduction</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================
  // RENDER STAGE 2 & 3: PERSONAL INTRO & SCORED PART 1
  // ==========================================
  const displayedItemNumber =
    stage === 'personal_intro' ? 'Intro' : itemOffset + currentIndex + 1;
  const displayedTotalNumber = totalExamItemsCount || scoredPart1Items.length;

  const isWritingTask = ['SWT', 'WE'].includes(currentItem?.taskType);
  const writingText = currentResponse.text || '';
  const liveWordCount = countWords(writingText);
  const liveSentenceCount = countTerminalSentences(writingText);

  return (
    <div className="min-h-screen flex flex-col bg-[#edeef0] text-slate-800 select-none">
      {/* 1. Authentic Pearson PTE Header */}
      <header className="bg-[#003865] text-white px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-white text-[#003865] font-black flex items-center justify-center text-xs shadow-xs">
            P
          </div>
          <span className="font-bold text-sm tracking-wide">
            Pearson VUE — PTE Academic™
          </span>
          <span className="text-blue-300 text-xs">|</span>
          <span className="text-xs text-blue-100 font-medium">
            Part 1: Speaking &amp; Writing
          </span>
        </div>

        {/* Candidate Name, Candidate ID, Question Progress, and Active Countdown Timer */}
        <div className="flex items-center space-x-5 text-xs">
          <div className="flex items-center space-x-1.5 text-blue-100">
            <User className="w-3.5 h-3.5" />
            <span className="font-semibold">{studentInfo.name}</span>
            <span className="text-blue-300 font-mono">({studentInfo.studentId})</span>
          </div>

          <div className="bg-blue-950/70 px-3 py-1 rounded border border-blue-400/30 font-semibold text-blue-100">
            {stage === 'personal_intro' ? (
              <span>Personal Introduction (Unscored)</span>
            ) : (
              <span>
                Item <strong className="text-white">{displayedItemNumber}</strong> of{' '}
                <strong className="text-white">{displayedTotalNumber}</strong>
              </span>
            )}
          </div>

          {/* Active Countdown Timer in Top-Right Corner */}
          <div className="flex items-center space-x-1.5 bg-blue-900/90 px-3 py-1 rounded border border-blue-400/40">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-slate-200 uppercase text-[10px]">
              {dedicatedItemSeconds !== null ? 'Item Timer:' : 'Time Remaining:'}
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {formatTimeMMSS(
                dedicatedItemSeconds !== null ? dedicatedItemSeconds : part1SectionSeconds
              )}
            </span>
          </div>

          {onExit && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Exit the exam terminal?')) onExit();
              }}
              className="flex items-center space-x-1 text-blue-200 hover:text-white"
              title="Exit Exam Terminal"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Sub-Header with Item ID & Task Name */}
      <div className="bg-[#e2e5e8] border-b border-slate-300 px-6 py-2 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2 font-bold text-slate-900">
          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-blue-900 font-mono">
            {currentItem?.id}
          </span>
          <span className="text-sm font-semibold">{currentTaskMeta?.name}</span>
          {currentItem?.taskType === 'PI' && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[11px]">
              Unscored • 25s Prep / 30s Rec
            </span>
          )}
        </div>

        <div className="text-slate-600 font-mono text-[11px]">
          One-Way Navigation Enforced (No Back Button)
        </div>
      </div>

      {/* 3. Official Pearson Task Instructions Banner */}
      <div className="px-6 pt-4">
        <div className="bg-[#fff9db] border border-[#f59f00]/40 rounded p-3.5 text-xs text-slate-800 shadow-2xs max-w-4xl mx-auto">
          <strong className="text-amber-900 block mb-0.5">Instructions:</strong>
          <p className="leading-relaxed">{currentTaskMeta?.instructions}</p>
        </div>
      </div>

      {/* 4. Main Task Workspace */}
      <main className="flex-1 px-6 py-5 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* ===================================================== */}
          {/* A. SPEAKING TASKS (PI, RA, RS, DI, RL, SGD, RTS, ASQ) */}
          {/* ===================================================== */}
          {!isWritingTask && currentItem && (
            <div className="space-y-5">
              {/* Personal Introduction Prompt */}
              {currentItem.taskType === 'PI' && (
                <div className="bg-white p-6 rounded border border-slate-300 shadow-xs space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Personal Introduction Prompt
                  </h4>
                  <p className="text-base text-slate-800 leading-relaxed">{currentItem.prompt}</p>
                </div>
              )}

              {/* Read Aloud (RA) Passage */}
              {currentItem.taskType === 'RA' && (
                <div className="bg-white p-6 rounded border border-slate-300 shadow-xs">
                  <p className="text-lg leading-relaxed text-slate-900 font-serif select-text">
                    {currentItem.prompt}
                  </p>
                </div>
              )}

              {/* Describe Image (DI) */}
              {currentItem.taskType === 'DI' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 bg-white p-4 rounded border border-slate-300 shadow-xs flex justify-center">
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.title}
                      className="max-h-[340px] w-auto object-contain rounded"
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <AudioRecorderWidget
                      key={currentItem.id}
                      taskType={currentItem.taskType}
                      itemId={currentItem.id}
                      candidateId={studentInfo.studentId}
                      prepSeconds={currentItem.timingOverrides?.prepSeconds ?? 10}
                      recordSeconds={currentItem.timingOverrides?.recordSeconds ?? currentItem.recordSeconds ?? 40}
                      waitForAudioPrompt={false}
                      onRecordingComplete={(recData) =>
                        onUpdateResponse(currentItem.id, {
                          ...currentResponse,
                          recordedAudio: recData,
                          transcript: recData?.transcript || currentResponse?.transcript || '',
                          text: recData?.transcript || currentResponse?.text || ''
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Respond to a Situation (RTS) */}
              {currentItem.taskType === 'RTS' && (
                <div className="space-y-4">
                  {(currentItem.audioText || currentItem.audioUrl || currentItem.prompt) && (
                    <AudioPlayerWidget
                      key={`audio_${currentItem.id}`}
                      audioText={currentItem.audioText || currentItem.prompt}
                      audioUrl={currentItem.audioUrl}
                      voiceAccent={currentItem.voiceAccent}
                      speechRate={currentItem.speechRate}
                      audioDuration={currentItem.audioDurationSeconds || 12}
                      autoPlay={true}
                      onAudioComplete={() => markAudioCompleted(currentItem.id)}
                    />
                  )}
                  <div className="bg-white border border-slate-300 p-6 rounded shadow-xs space-y-2">
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      Situation Description:
                    </h4>
                    <p className="text-base text-slate-900 leading-relaxed">{currentItem.prompt}</p>
                  </div>
                </div>
              )}

              {/* Spoken Audio Tasks: RS, RL, SGD, ASQ */}
              {['RS', 'RL', 'SGD', 'ASQ'].includes(currentItem.taskType) && (
                <div className="space-y-4">
                  <AudioPlayerWidget
                    key={`audio_${currentItem.id}`}
                    audioText={currentItem.audioText || currentItem.prompt}
                    audioUrl={currentItem.audioUrl}
                    voiceAccent={currentItem.voiceAccent}
                    speechRate={currentItem.speechRate}
                    audioDuration={
                      currentItem.audioDurationSeconds ||
                      (currentItem.taskType === 'RS' || currentItem.taskType === 'ASQ' ? 5 : 25)
                    }
                    autoPlay={true}
                    onAudioComplete={() => markAudioCompleted(currentItem.id)}
                  />
                </div>
              )}

              {/* Audio Recorder for non-DI Speaking items (DI renders recorder side-by-side above) */}
              {currentItem.taskType !== 'DI' && (
                <AudioRecorderWidget
                  key={currentItem.id}
                  taskType={currentItem.taskType}
                  itemId={currentItem.id}
                  candidateId={studentInfo.studentId}
                  prepSeconds={
                    currentItem.taskType === 'PI'
                      ? 3
                      : currentItem.taskType === 'RA'
                      ? (currentItem.timingOverrides?.prepSeconds ?? 10)
                      : (currentItem.timingOverrides?.prepSeconds ??
                         (hasSpokenPrompt ? 3 : (currentItem.prepSeconds || 10)))
                  }
                  recordSeconds={
                    currentItem.timingOverrides?.recordSeconds ??
                    currentItem.recordSeconds ??
                    (currentItem.taskType === 'RS'
                      ? 15
                      : currentItem.taskType === 'ASQ'
                      ? 10
                      : currentItem.taskType === 'PI'
                      ? 30
                      : currentItem.taskType === 'SGD'
                      ? 120
                      : 40)
                  }
                  waitForAudioPrompt={isAudioPromptPlaying}
                  onRecordingComplete={(recData) =>
                    onUpdateResponse(currentItem.id, {
                      ...currentResponse,
                      recordedAudio: recData,
                      transcript: recData?.transcript || currentResponse?.transcript || '',
                      text: recData?.transcript || currentResponse?.text || ''
                    })
                  }
                />
              )}

              {/* Optional fallback text box for ASQ */}
              {currentItem.taskType === 'ASQ' && (
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Optional Spoken Transcript Backup (For Offline Verification):
                  </label>
                  <input
                    type="text"
                    value={currentResponse.textAnswer || ''}
                    onChange={(e) =>
                      onUpdateResponse(currentItem.id, {
                        ...currentResponse,
                        textAnswer: e.target.value
                      })
                    }
                    placeholder="Speak into microphone (or type short answer backup here)..."
                    className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* B. WRITING TASKS (SWT & WE) WITH GOOGLE SHEET METRICS */}
          {/* ===================================================== */}
          {isWritingTask && currentItem && (
            <div className="space-y-4">
              {/* Reading Passage / Essay Topic */}
              <div className="bg-white p-6 rounded border border-slate-300 shadow-xs max-h-[260px] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {currentItem.taskType === 'SWT'
                    ? 'Reading Passage (Summarize in 1 Sentence, 5–75 Words)'
                    : 'Essay Topic (Write 200–300 Words)'}
                </h4>
                <p className="text-base text-slate-900 leading-relaxed font-serif select-text">
                  {currentItem.prompt}
                </p>
              </div>

              {/* Authentic Pearson Editor Box with Cut, Copy, Paste & Word/Sentence Metrics */}
              <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
                {/* Editor Toolbar */}
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleCutText}
                      className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition"
                    >
                      <Scissors className="w-3.5 h-3.5 text-slate-600" />
                      <span>Cut</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePasteText}
                      className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
                      <span>Paste</span>
                    </button>
                  </div>

                  {/* Form Constraint Indicator */}
                  <div className="text-[11px] text-slate-500 font-medium">
                    {currentItem.taskType === 'SWT'
                      ? 'Form Rule: Strictly 1 single sentence (5–75 words)'
                      : 'Form Rule: 200–300 words'}
                  </div>
                </div>

                {/* Writing Textarea */}
                <textarea
                  ref={writingTextareaRef}
                  rows={currentItem.taskType === 'WE' ? 12 : 6}
                  value={writingText}
                  onChange={(e) => handleWritingTextChange(e.target.value)}
                  placeholder={
                    currentItem.taskType === 'SWT'
                      ? 'Type your one-sentence summary here...'
                      : 'Type your academic essay here...'
                  }
                  spellCheck={false}
                  className="w-full p-4 font-sans text-sm text-slate-900 leading-relaxed focus:outline-hidden resize-y select-text"
                />

                {/* Bottom Status Bar with Live Total Word Count */}
                <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-300 flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800">
                    Total Word Count: <span className="font-mono text-sm">{liveWordCount}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
                    <span>
                      Auto-Metric [wordCount: {liveWordCount} | sentenceCount: {liveSentenceCount}]
                    </span>
                    {currentItem.taskType === 'SWT' &&
                      writingText.trim().length > 0 &&
                      liveSentenceCount !== 1 && (
                        <span className="text-amber-700 font-sans font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Detected {liveSentenceCount} sentences (Target: 1)</span>
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 5. Authentic Pearson Bottom Bar — ONE-WAY NAVIGATION ONLY (NO BACK BUTTON) */}
      <footer className="bg-[#e2e5e8] border-t border-slate-300 px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-mono">
          {currentItem?.id} • {currentItem?.taskType} • Part 1: Speaking &amp; Writing
        </div>

        {/* Strictly only 'Next' button at bottom-right */}
        <button
          type="button"
          onClick={handleClickNext}
          className="flex items-center space-x-1 px-6 py-2 bg-[#003865] hover:bg-[#002644] text-white text-xs font-bold rounded shadow-xs uppercase tracking-wider transition"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* 6. Authentic Pearson Unanswered Confirmation Modal */}
      {showUnansweredModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl max-w-md w-full overflow-hidden border border-slate-400">
            <div className="bg-[#003865] text-white px-5 py-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Pearson VUE Navigation Confirmation
              </h4>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-800 leading-relaxed">
              <p className="font-bold text-sm text-slate-900">
                You have not completed your response for this item ({currentItem?.id}).
              </p>
              <p>
                In the official PTE Academic examination, navigation is strictly one-way. Once you proceed to the next item, you <strong>cannot return</strong> to previous questions.
              </p>
              <p className="font-semibold">
                Do you want to proceed to the next question without responding?
              </p>
            </div>

            <div className="bg-slate-100 px-5 py-3 border-t border-slate-300 flex justify-end space-x-3 text-xs">
              <button
                type="button"
                onClick={() => setShowUnansweredModal(false)}
                className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded font-bold"
              >
                No, Stay on Item
              </button>
              <button
                type="button"
                onClick={proceedToNextItem}
                className="px-4 py-1.5 bg-[#003865] hover:bg-[#002644] text-white rounded font-bold"
              >
                Yes, Proceed to Next Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

