import React, { useState, useEffect, useRef } from 'react';
import {
  PTE_TASK_TYPES,
  countWords,
  formatTimeMMSS
} from '../../config/pteRules';
import {
  scoreMcma,
  scoreFibL,
  scoreMcsa,
  scoreHiw,
  scoreWfd
} from '../../utils/autoScoring';
import { speakText, stopSpeaking, playShortBeep, getNeuralVoice } from '../../utils/audioUtils';
import {
  Clock,
  ChevronRight,
  User,
  LogOut,
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Headphones,
  Play
} from 'lucide-react';

/**
 * Authentic Pearson PTE Listening Single-Play Audio Widget
 * Rules:
 * - Pre-listening countdown (7 seconds)
 * - Plays ONCE ONLY with NO pause or replay button
 * - Progress bar tracking playback
 * - Automatic terminal beep if task is SMW (Select Missing Word)
 */
function SinglePlayAudioWidget({
  audioText,
  audioUrl,
  voiceAccent = 'en-US',
  speechRate = 0.95,
  isSmwTask = false,
  onAudioStart,
  onAudioComplete
}) {
  // Phases: 'countdown' (7s) -> 'playing' -> 'completed'
  const [phase, setPhase] = useState('countdown');
  const [countdownRemaining, setCountdownRemaining] = useState(7);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioElementRef = useRef(null);
  const timerRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Determine exact audio URL (uploaded media or Studio Neural TTS endpoint)
  const chosenVoice = getNeuralVoice(voiceAccent);
  const cleanText = (audioText || '').replace(/\[BEEP\]/gi, '').trim();
  const effectiveUrl = audioUrl || (cleanText ? `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(chosenVoice)}` : null);

  // 7-second pre-listening countdown with audio pre-buffering
  useEffect(() => {
    setPhase('countdown');
    setCountdownRemaining(7);
    setProgress(0);
    setAutoplayBlocked(false);
    hasStartedRef.current = false;

    // Pre-warm audio stream during the 7-second countdown
    if (effectiveUrl) {
      const pre = new Audio();
      pre.preload = 'auto';
      pre.src = effectiveUrl;
      pre.load();
    }

    timerRef.current = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          startPlayingOnce();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeaking();
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        } catch {}
        audioElementRef.current = null;
      }
    };
  }, [audioText, audioUrl, voiceAccent]);

  const startPlayingOnce = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setPhase('playing');
    setAutoplayBlocked(false);
    if (onAudioStart) onAudioStart();

    if (!effectiveUrl) {
      setPhase('completed');
      if (onAudioComplete) onAudioComplete();
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = effectiveUrl;
    audio.volume = isMuted ? 0 : volume;
    audioElementRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      if (isSmwTask) playShortBeep(920, 0.5);
      setProgress(100);
      setPhase('completed');
      if (onAudioComplete) onAudioComplete();
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error on Part 3 URL:', effectiveUrl, e);
      setPhase('completed');
      if (onAudioComplete) onAudioComplete();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.name === 'NotAllowedError') {
          console.warn('Browser autoplay blocked audio; showing user play button');
          setAutoplayBlocked(true);
          return;
        }
        console.warn('Audio playback error in Part 3:', err);
      });
    }
  };

  return (
    <div className="border border-slate-300 rounded bg-slate-50 p-4 max-w-md w-full shadow-xs mb-5 select-none">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
        <span className="flex items-center space-x-1.5">
          <Headphones className="w-4 h-4 text-[#003865]" />
          <span>Audio Playback (Plays Once Only)</span>
        </span>
        <span>
          {phase === 'countdown' && (
            <span className="text-amber-700 font-bold">Playing in {countdownRemaining}s...</span>
          )}
          {phase === 'playing' && (
            <span className="text-blue-700 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Playing</span>
            </span>
          )}
          {phase === 'completed' && (
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          )}
        </span>
      </div>

      {/* Autoplay blocked banner / button */}
      {autoplayBlocked && phase !== 'completed' && (
        <button
          type="button"
          onClick={() => {
            setAutoplayBlocked(false);
            if (audioElementRef.current) {
              audioElementRef.current.play().catch(console.error);
            } else {
              startPlayingOnce();
            }
          }}
          className="w-full mb-2.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm animate-pulse transition"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Click to Play Audio Prompt</span>
        </button>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden border border-slate-300 relative mb-2">
        <div
          className={`h-full transition-all duration-100 ease-linear rounded-full ${
            phase === 'countdown' ? 'bg-amber-400' : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Volume Controls Only (NO pause, NO replay, matching official PTE rules) */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs text-slate-500">
        <span className="text-[11px] italic">
          {phase === 'countdown'
            ? 'Adjust volume before audio begins'
            : phase === 'playing'
            ? 'Recording is playing once'
            : 'Audio finished'}
        </span>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (audioElementRef.current) {
                audioElementRef.current.volume = nextMute ? 0 : volume;
              }
            }}
            className="text-slate-500 hover:text-slate-800"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (isMuted) setIsMuted(false);
              if (audioElementRef.current) {
                audioElementRef.current.volume = v;
              }
            }}
            className="w-16 h-1.5 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default function Part3Listening({
  items = [],
  totalExamItemsCount = 65,
  itemOffset = 0,
  studentInfo = { name: 'Alex Morgan', studentId: 'PTE-2025-8842', sessionCode: 'PTE-2026-A' },
  responses = {},
  onUpdateResponse,
  onPart3Complete,
  onExit,
  sharedPoolDurationSeconds = 25 * 60,
  initialIndex = 0,
  initialSharedPoolSeconds,
  onProgressUpdate
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = Number(initialIndex);
    if (!isNaN(idx) && idx >= 0 && idx < items.length) return idx;
    return 0;
  });

  // Synchronize currentIndex if restored from checkpoint
  useEffect(() => {
    const idx = Number(initialIndex);
    if (!isNaN(idx) && idx >= 0 && idx < items.length && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [initialIndex, items.length]);

  // Shared cumulative listening pool timer (configurable duration, default 25 mins = 1500s)
  const [sharedListeningSeconds, setSharedListeningSeconds] = useState(() => {
    return initialSharedPoolSeconds !== undefined && initialSharedPoolSeconds !== null
      ? Number(initialSharedPoolSeconds)
      : sharedPoolDurationSeconds;
  });

  // Notify parent of progress state for atomic checkpointing (immediate on index change, throttled for timer)
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate({
        currentIndex,
        remainingSeconds: sharedListeningSeconds
      });
    }
  }, [currentIndex, Math.floor(sharedListeningSeconds / 10)]);

  // Dedicated timer for SST or custom dedicated listening tasks
  const [dedicatedSstSeconds, setDedicatedSstSeconds] = useState(null);

  const [showUnansweredModal, setShowUnansweredModal] = useState(false);

  const currentItem = items[currentIndex];
  const currentTaskMeta = currentItem ? PTE_TASK_TYPES[currentItem.taskType] : null;
  const currentResponse = currentItem ? responses[currentItem.id] || {} : {};

  // Initialize or reset dedicated SST timer vs shared pool timer
  useEffect(() => {
    if (!currentItem) return;
    setShowUnansweredModal(false);

    const itemTimer =
      currentItem.timingOverrides?.timerSeconds ??
      currentItem.timerSeconds ??
      (currentItem.taskType === 'SST' ? 10 * 60 : null);

    if (itemTimer) {
      setDedicatedSstSeconds(itemTimer);
    } else {
      setDedicatedSstSeconds(null);
    }
  }, [currentIndex, currentItem?.id]);

  // Dedicated SST Timer Countdown
  useEffect(() => {
    if (dedicatedSstSeconds === null) return;
    const timer = setInterval(() => {
      setDedicatedSstSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          proceedToNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [dedicatedSstSeconds !== null, currentIndex]);

  // Shared Cumulative Pool Countdown (for non-SST items)
  useEffect(() => {
    if (dedicatedSstSeconds !== null) return;
    const timer = setInterval(() => {
      setSharedListeningSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onPart3Complete) onPart3Complete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [dedicatedSstSeconds === null]);

  // Response check for unanswered warning
  const hasResponded = () => {
    if (!currentItem) return true;
    const r = responses[currentItem.id];
    if (!r) return false;
    if (currentItem.taskType === 'SST' || currentItem.taskType === 'WFD') {
      return Boolean(r.text && r.text.trim().length > 0);
    }
    if (currentItem.taskType === 'MCMA-L') {
      return Array.isArray(r.selected) && r.selected.length > 0;
    }
    if (currentItem.taskType === 'FIB-L') {
      return r.answers && Object.keys(r.answers).length > 0;
    }
    if (['HCS', 'MCSA-L', 'SMW'].includes(currentItem.taskType)) {
      return Boolean(r.selected);
    }
    if (currentItem.taskType === 'HIW') {
      return Array.isArray(r.selectedIndices) && r.selectedIndices.length > 0;
    }
    return false;
  };

  const handleClickNext = () => {
    if (!hasResponded()) {
      setShowUnansweredModal(true);
      return;
    }
    proceedToNext();
  };

  const proceedToNext = () => {
    stopSpeaking();
    setShowUnansweredModal(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (onPart3Complete) onPart3Complete();
    }
  };

  // =========================================================
  // TASK 1: SST (Summarize Spoken Text) Handlers
  // =========================================================
  const handleSstChange = (text) => {
    const words = countWords(text);
    onUpdateResponse(currentItem.id, {
      ...currentResponse,
      text,
      wordCount: words,
      targetMet: words >= 50 && words <= 70
    });
  };

  // =========================================================
  // TASK 2: MCMA-L (Multiple Choice Multiple Answers)
  // =========================================================
  const handleMcmaToggle = (optionId) => {
    const curSelected = currentResponse.selected || [];
    const nextSelected = curSelected.includes(optionId)
      ? curSelected.filter((id) => id !== optionId)
      : [...curSelected, optionId];

    const tempResponse = { ...currentResponse, selected: nextSelected };
    const scoring = scoreMcma(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      correctChosen: scoring.correctChosen,
      incorrectChosen: scoring.incorrectChosen,
      finalScore: scoring.finalScore,
      rawScore: scoring.finalScore
    });
  };

  // =========================================================
  // TASK 3: FIB-L (Type-In Missing Words)
  // =========================================================
  const handleFibLChange = (blankId, value) => {
    const nextAnswers = { ...(currentResponse.answers || {}), [blankId]: value };
    const tempResponse = { ...currentResponse, answers: nextAnswers };
    const scoring = scoreFibL(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      totalBlanks: scoring.totalBlanks,
      correctlySpelledWords: scoring.correctlySpelledWords,
      incorrectWords: scoring.incorrectWords,
      rawScore: scoring.rawScore
    });
  };

  // =========================================================
  // TASKS 4, 5, 6: HCS, MCSA-L, SMW (Radio Buttons)
  // =========================================================
  const handleRadioSelect = (optionId) => {
    const tempResponse = { ...currentResponse, selected: optionId };
    const scoring = scoreMcsa(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      candidateSelected: scoring.candidateSelected,
      correctAnswerKey: scoring.correctAnswerKey,
      isCorrect: scoring.isCorrect,
      rawScore: scoring.rawScore
    });
  };

  // =========================================================
  // TASK 7: HIW (Highlight Incorrect Words)
  // =========================================================
  const handleHiwToggleWord = (wordIndex) => {
    const curIndices = currentResponse.selectedIndices || [];
    const nextIndices = curIndices.includes(wordIndex)
      ? curIndices.filter((i) => i !== wordIndex)
      : [...curIndices, wordIndex];

    const tempResponse = { ...currentResponse, selectedIndices: nextIndices };
    const scoring = scoreHiw(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      totalIncorrectWords: scoring.totalIncorrectWords,
      correctClicks: scoring.correctClicks,
      incorrectClicks: scoring.incorrectClicks,
      finalScore: scoring.finalScore,
      rawScore: scoring.finalScore
    });
  };

  // =========================================================
  // TASK 8: WFD (Write from Dictation Word-Alignment Grader)
  // =========================================================
  const handleWfdChange = (text) => {
    const tempResponse = { ...currentResponse, text };
    const scoring = scoreWfd(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      totalWords: scoring.totalWords,
      correctWords: scoring.correctWords,
      incorrectWords: scoring.incorrectWords,
      rawScore: scoring.rawScore
    });
  };

  const displayedItemNumber = itemOffset + currentIndex + 1;
  const isSmw = currentItem?.taskType === 'SMW';

  return (
    <div className="min-h-screen flex flex-col bg-[#edeef0] text-slate-800 select-none">
      {/* 1. Pearson Header */}
      <header className="bg-[#003865] text-white px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-white text-[#003865] font-black flex items-center justify-center text-xs shadow-xs">
            P
          </div>
          <span className="font-bold text-sm tracking-wide">
            Pearson VUE — PTE Academic™
          </span>
          <span className="text-blue-300 text-xs">|</span>
          <span className="text-xs text-blue-100 font-medium">Part 3: Listening</span>
        </div>

        <div className="flex items-center space-x-5 text-xs">
          <div className="flex items-center space-x-1.5 text-blue-100">
            <User className="w-3.5 h-3.5" />
            <span className="font-semibold">{studentInfo.name}</span>
            <span className="text-blue-300 font-mono">({studentInfo.studentId})</span>
          </div>

          <div className="bg-blue-950/70 px-3 py-1 rounded border border-blue-400/30 font-semibold text-blue-100">
            Item <strong className="text-white">{displayedItemNumber}</strong> of{' '}
            <strong className="text-white">{totalExamItemsCount}</strong>
          </div>

          {/* Dedicated SST Timer vs Shared Listening Pool Timer */}
          <div className="flex items-center space-x-1.5 bg-blue-900/90 px-3 py-1 rounded border border-blue-400/40">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-slate-200 uppercase text-[10px]">
              {dedicatedSstSeconds !== null ? 'Item Timer (SST):' : 'Shared Section Time:'}
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {formatTimeMMSS(
                dedicatedSstSeconds !== null ? dedicatedSstSeconds : sharedListeningSeconds
              )}
            </span>
          </div>

          {onExit && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Exit exam terminal?')) onExit();
              }}
              className="flex items-center space-x-1 text-blue-200 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Sub-Header */}
      <div className="bg-[#e2e5e8] border-b border-slate-300 px-6 py-2 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2 font-bold text-slate-900">
          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-blue-900 font-mono">
            {currentItem?.id}
          </span>
          <span className="text-sm font-semibold">{currentTaskMeta?.name}</span>
          {currentItem?.taskType === 'SST' && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[11px] font-bold">
              Dedicated 10-Minute Timer
            </span>
          )}
        </div>

        <div className="font-mono text-[11px] text-slate-600">
          Plays Once Only • One-Way Navigation Enforced
        </div>
      </div>

      {/* 3. Instructions Callout */}
      <div className="px-6 pt-4">
        <div className="bg-[#fff9db] border border-[#f59f00]/40 rounded p-3.5 text-xs text-slate-800 shadow-2xs max-w-4xl mx-auto">
          <strong className="text-amber-900 block mb-0.5">Instructions:</strong>
          <p className="leading-relaxed">{currentTaskMeta?.instructions}</p>
        </div>
      </div>

      {/* 4. Main Listening Workspace */}
      <main className="flex-1 px-6 py-5 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Authentic PTE Single-Play Audio Box (7s pre-listening countdown, plays once only) */}
          <SinglePlayAudioWidget
            key={`audio_${currentItem?.id}`}
            audioText={currentItem?.audioText || currentItem?.prompt}
            audioUrl={currentItem?.audioUrl}
            voiceAccent={currentItem?.voiceAccent}
            speechRate={currentItem?.speechRate}
            isSmwTask={isSmw}
          />

          {/* ===================================================== */}
          {/* TASK 1: SST (Summarize Spoken Text)                   */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'SST' && (
            <div className="bg-white rounded border border-slate-300 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Summary of the Spoken Lecture:</span>
                <span className="font-mono text-xs">
                  Target Length: <strong>50–70 words</strong>
                </span>
              </div>

              <textarea
                rows={7}
                value={currentResponse.text || ''}
                onChange={(e) => handleSstChange(e.target.value)}
                placeholder="Type your summary here (50–70 words)..."
                className="w-full p-4 border border-slate-300 rounded font-sans text-sm focus:outline-hidden focus:border-blue-600 leading-relaxed resize-y select-text"
              />

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <div className="font-bold">
                  Total Word Count:{' '}
                  <span
                    className={`font-mono text-sm ${
                      (currentResponse.wordCount || 0) < 50 || (currentResponse.wordCount || 0) > 70
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {currentResponse.wordCount || 0}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Google Sheet Column [wordCount: {currentResponse.wordCount || 0}]
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 2: MCMA-L (Multiple Choice Multiple Answers)     */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'MCMA-L' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">{currentItem.question}</h4>
              <div className="space-y-2">
                {(currentItem.options || []).map((opt) => {
                  const isChecked = (currentResponse.selected || []).includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleMcmaToggle(opt.id)}
                      className={`flex items-start space-x-3 p-3.5 rounded border transition cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-800 leading-relaxed font-medium">
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 3: FIB-L (Type-In Missing Words)                 */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'FIB-L' && (
            <div className="bg-white p-6 rounded border border-slate-300 shadow-xs text-base leading-loose text-slate-800 font-serif">
              {(currentItem.prompt || '').split(/(\[blank_\d+\])/g).map((token, idx) => {
                const match = token.match(/\[(blank_\d+)\]/);
                if (match) {
                  const blankId = match[1];
                  const currentVal = currentResponse.answers?.[blankId] || '';
                  return (
                    <input
                      key={idx}
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleFibLChange(blankId, e.target.value)}
                      placeholder="type word"
                      className="mx-1.5 px-2.5 py-1 border-b-2 border-blue-500 font-sans text-sm bg-blue-50/50 focus:bg-white focus:outline-hidden rounded-t w-32 font-bold text-slate-900"
                    />
                  );
                }
                return <span key={idx}>{token}</span>;
              })}
            </div>
          )}

          {/* ===================================================== */}
          {/* TASKS 4, 5, 6: HCS, MCSA-L, SMW (Radio Buttons)       */}
          {/* ===================================================== */}
          {['HCS', 'MCSA-L', 'SMW'].includes(currentItem?.taskType) && (
            <div className="space-y-4">
              {currentItem.question && (
                <h4 className="font-bold text-slate-900 text-sm">{currentItem.question}</h4>
              )}
              <div className="space-y-2">
                {(currentItem.options || []).map((opt) => {
                  const isSelected = currentResponse.selected === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleRadioSelect(opt.id)}
                      className={`flex items-start space-x-3 p-3.5 rounded border transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`radio_${currentItem.id}`}
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-800 leading-relaxed font-medium">
                        <strong className="mr-1.5">{opt.id}.</strong>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 7: HIW (Highlight Incorrect Words)               */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'HIW' && (
            <div className="space-y-3">
              <div className="bg-white p-6 rounded border border-slate-300 shadow-xs text-base leading-loose text-slate-900 font-serif selection:bg-transparent">
                {(currentItem.displayedText || '').split(/\s+/).map((word, idx) => {
                  const isHighlighted = (currentResponse.selectedIndices || []).includes(idx);
                  return (
                    <span
                      key={idx}
                      onClick={() => handleHiwToggleWord(idx)}
                      className={`cursor-pointer px-1 py-0.5 rounded transition ${
                        isHighlighted
                          ? 'bg-yellow-300 text-slate-950 font-bold shadow-2xs'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 italic">
                Click on the words in the text that differ from what the speaker said. Click again to unselect.
              </p>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 8: WFD (Write from Dictation)                    */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'WFD' && (
            <div className="bg-white rounded border border-slate-300 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Type the Sentence:</span>
                <span className="font-mono text-slate-500">
                  Words Typed: {countWords(currentResponse.text || '')}
                </span>
              </div>

              <textarea
                rows={4}
                value={currentResponse.text || ''}
                onChange={(e) => handleWfdChange(e.target.value)}
                placeholder="Type the sentence exactly as you hear it..."
                className="w-full p-4 border border-slate-300 rounded font-sans text-sm focus:outline-hidden focus:border-blue-600 leading-relaxed resize-y select-text"
              />
            </div>
          )}
        </div>
      </main>

      {/* 5. Bottom Navigation Bar */}
      <footer className="bg-[#e2e5e8] border-t border-slate-300 px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-mono">
          {currentItem?.id} • {currentItem?.taskType} • Part 3: Listening
        </div>

        <button
          type="button"
          onClick={handleClickNext}
          className="flex items-center space-x-1 px-6 py-2 bg-[#003865] hover:bg-[#002644] text-white text-xs font-bold rounded shadow-xs uppercase tracking-wider transition"
        >
          <span>{currentIndex < items.length - 1 ? 'Next' : 'Submit Examination'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* 6. Unanswered Confirmation Modal */}
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
                In the official PTE Academic examination, navigation is strictly one-way. Once you proceed, you <strong>cannot return</strong> to this question.
              </p>
              <p className="font-semibold">
                Do you want to proceed without answering?
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
                onClick={proceedToNext}
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

