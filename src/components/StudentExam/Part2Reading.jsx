import React, { useState, useEffect } from 'react';
import {
  PTE_TASK_TYPES,
  formatTimeMMSS
} from '../../config/pteRules';
import {
  scoreFibRw,
  scoreMcma,
  scoreReorderParagraphs,
  scoreFibR,
  scoreMcsa
} from '../../utils/autoScoring';
import {
  Clock,
  ChevronRight,
  User,
  LogOut,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';

export default function Part2Reading({
  items = [],
  totalExamItemsCount = 65,
  itemOffset = 0,
  studentInfo = { name: 'Alex Morgan', studentId: 'PTE-2025-8842', sessionCode: 'PTE-2026-A' },
  responses = {},
  onUpdateResponse,
  onPart2Complete,
  onExit,
  sectionDurationSeconds = 27 * 60,
  initialIndex = 0,
  initialSectionSeconds,
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

  // Cumulative section timer (configurable duration, default 27 mins = 1620s)
  const [sectionSecondsRemaining, setSectionSecondsRemaining] = useState(() => {
    return initialSectionSeconds !== undefined && initialSectionSeconds !== null
      ? Number(initialSectionSeconds)
      : sectionDurationSeconds;
  });

  // Notify parent of progress state for atomic checkpointing (immediate on index change, throttled for timer)
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate({
        currentIndex,
        remainingSeconds: sectionSecondsRemaining
      });
    }
  }, [currentIndex, Math.floor(sectionSecondsRemaining / 10)]);

  const [showUnansweredModal, setShowUnansweredModal] = useState(false);

  const currentItem = items[currentIndex];
  const currentTaskMeta = currentItem ? PTE_TASK_TYPES[currentItem.taskType] : null;
  const currentResponse = currentItem ? responses[currentItem.id] || {} : {};

  // Section timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSectionSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onPart2Complete) onPart2Complete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if candidate responded to current question
  const hasResponded = () => {
    if (!currentItem) return true;
    const r = responses[currentItem.id];
    if (!r) return false;
    if (currentItem.taskType === 'FIB-RW') {
      return r.blanks && Object.keys(r.blanks).length > 0;
    }
    if (currentItem.taskType === 'MCMA-R') {
      return Array.isArray(r.selected) && r.selected.length > 0;
    }
    if (currentItem.taskType === 'RO-R') {
      return (
        Array.isArray(r.targetParagraphs) &&
        r.targetParagraphs.length === (currentItem.paragraphs || []).length
      );
    }
    if (currentItem.taskType === 'FIB-R') {
      return r.placedWords && Object.keys(r.placedWords).length > 0;
    }
    if (currentItem.taskType === 'MCSA-R') {
      return Boolean(r.selected);
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
    setShowUnansweredModal(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (onPart2Complete) onPart2Complete();
    }
  };

  // =========================================================
  // TASK 1: FIB-RW (Dropdown) Handlers & Auto-Scoring
  // =========================================================
  const handleFibRwChange = (blankId, value) => {
    const nextBlanks = { ...(currentResponse.blanks || {}), [blankId]: value };
    const tempResponse = { ...currentResponse, blanks: nextBlanks };
    const scoring = scoreFibRw(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      totalBlanks: scoring.totalBlanks,
      correctBlanks: scoring.correctBlanks,
      incorrectBlanks: scoring.incorrectBlanks,
      rawScore: scoring.rawScore
    });
  };

  // =========================================================
  // TASK 2: MCMA-R (Multiple Choice Multiple Answers)
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
  // TASK 3: RO-R (Reorder Paragraphs Two-Panel Interface)
  // =========================================================
  const initialSourceList = currentItem?.taskType === 'RO-R' ? currentItem.paragraphs || [] : [];
  const sourceParagraphs =
    currentResponse.sourceParagraphs !== undefined
      ? currentResponse.sourceParagraphs
      : initialSourceList;
  const targetParagraphs = currentResponse.targetParagraphs || [];

  const updateReorderState = (nextSource, nextTarget) => {
    const scoring = scoreReorderParagraphs(currentItem, nextTarget);
    onUpdateResponse(currentItem.id, {
      ...currentResponse,
      sourceParagraphs: nextSource,
      targetParagraphs: nextTarget,
      orderedParagraphs: nextTarget,
      autoScore: scoring,
      correctAdjacentPairs: scoring.correctAdjacentPairs,
      maxPoints: scoring.maxPoints,
      totalSentences: scoring.totalSentences,
      rawScore: scoring.correctAdjacentPairs
    });
  };

  const moveToTarget = (paragraph) => {
    const nextSource = sourceParagraphs.filter((p) => p.id !== paragraph.id);
    const nextTarget = [...targetParagraphs, paragraph];
    updateReorderState(nextSource, nextTarget);
  };

  const moveToSource = (paragraph) => {
    const nextTarget = targetParagraphs.filter((p) => p.id !== paragraph.id);
    const nextSource = [...sourceParagraphs, paragraph];
    updateReorderState(nextSource, nextTarget);
  };

  const moveTargetUp = (index) => {
    if (index <= 0) return;
    const arr = [...targetParagraphs];
    const temp = arr[index - 1];
    arr[index - 1] = arr[index];
    arr[index] = temp;
    updateReorderState(sourceParagraphs, arr);
  };

  const moveTargetDown = (index) => {
    if (index >= targetParagraphs.length - 1) return;
    const arr = [...targetParagraphs];
    const temp = arr[index + 1];
    arr[index + 1] = arr[index];
    arr[index] = temp;
    updateReorderState(sourceParagraphs, arr);
  };

  // =========================================================
  // TASK 4: FIB-R (Drag & Drop) Handlers & Auto-Scoring
  // =========================================================
  const handleFibRPlaceWord = (blankId, word) => {
    const nextPlaced = { ...(currentResponse.placedWords || {}), [blankId]: word };
    const tempResponse = { ...currentResponse, placedWords: nextPlaced };
    const scoring = scoreFibR(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      autoScore: scoring,
      totalBlanks: scoring.totalBlanks,
      correctBlanks: scoring.correctBlanks,
      incorrectBlanks: scoring.incorrectBlanks,
      rawScore: scoring.rawScore
    });
  };

  const handleFibRRemoveWord = (blankId) => {
    const nextPlaced = { ...(currentResponse.placedWords || {}) };
    delete nextPlaced[blankId];
    const tempResponse = { ...currentResponse, placedWords: nextPlaced };
    const scoring = scoreFibR(currentItem, tempResponse);

    onUpdateResponse(currentItem.id, {
      ...tempResponse,
      placedWords: nextPlaced,
      autoScore: scoring,
      totalBlanks: scoring.totalBlanks,
      correctBlanks: scoring.correctBlanks,
      incorrectBlanks: scoring.incorrectBlanks,
      rawScore: scoring.rawScore
    });
  };

  // =========================================================
  // TASK 5: MCSA-R (Single Answer)
  // =========================================================
  const handleMcsaSelect = (optionId) => {
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

  const displayedItemNumber = itemOffset + currentIndex + 1;

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
          <span className="text-xs text-blue-100 font-medium">Part 2: Reading</span>
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

          {/* Cumulative Section Timer (23-30 mins) */}
          <div className="flex items-center space-x-1.5 bg-blue-900/90 px-3 py-1 rounded border border-blue-400/40">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-slate-200 uppercase text-[10px]">Section Time:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {formatTimeMMSS(sectionSecondsRemaining)}
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
        </div>

        <div className="font-mono text-[11px] text-slate-600">
          Cumulative Section Timer Active • One-Way Navigation Only
        </div>
      </div>

      {/* 3. Instructions Callout */}
      <div className="px-6 pt-4">
        <div className="bg-[#fff9db] border border-[#f59f00]/40 rounded p-3.5 text-xs text-slate-800 shadow-2xs max-w-4xl mx-auto">
          <strong className="text-amber-900 block mb-0.5">Instructions:</strong>
          <p className="leading-relaxed">{currentTaskMeta?.instructions}</p>
        </div>
      </div>

      {/* 4. Task Interactive Workspace */}
      <main className="flex-1 px-6 py-5 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ===================================================== */}
          {/* TASK 1: FIB-RW (Dropdown)                             */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'FIB-RW' && (
            <div className="bg-white p-6 rounded border border-slate-300 shadow-xs space-y-4">
              <div className="text-base leading-loose text-slate-800 font-serif">
                {(currentItem.prompt || '').split(/(\[blank_\d+\])/g).map((token, idx) => {
                  const match = token.match(/\[(blank_\d+)\]/);
                  if (match) {
                    const blankId = match[1];
                    const bIdx = Number(blankId.replace('blank_', ''));
                    const opt = (currentItem.options || []).find((o) => o.id === blankId || o.blankIndex === bIdx);
                    const selectedVal = currentResponse.blanks?.[blankId] || '';
                    return (
                      <span key={idx} className="inline-block mx-1">
                        <select
                          value={selectedVal}
                          onChange={(e) => handleFibRwChange(blankId, e.target.value)}
                          className="border-2 border-blue-500 rounded px-2.5 py-1 bg-blue-50/70 text-slate-900 font-sans font-medium text-sm cursor-pointer focus:bg-white focus:outline-hidden"
                        >
                          <option value="">-- Select --</option>
                          {opt?.choices?.map((choice) => (
                            <option key={choice} value={choice}>
                              {choice}
                            </option>
                          ))}
                        </select>
                      </span>
                    );
                  }
                  return <span key={idx}>{token}</span>;
                })}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 2: MCMA-R (Multiple Choice, Multiple Answers)    */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'MCMA-R' && (
            <div className="space-y-5">
              <div className="bg-white p-6 rounded border border-slate-300 shadow-xs max-h-[260px] overflow-y-auto">
                <p className="text-base text-slate-800 leading-relaxed font-serif">{currentItem.prompt}</p>
              </div>

              <div className="space-y-3">
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
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 3: RO-R (Reorder Paragraphs Two-Panel Interface) */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'RO-R' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Source Panel (Left) */}
                <div className="bg-white rounded border border-slate-300 p-4 shadow-xs space-y-3 min-h-[360px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Source Panel (Available Paragraphs)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {sourceParagraphs.length} remaining
                    </span>
                  </div>

                  {sourceParagraphs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 italic">
                      All paragraphs moved to target panel.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {sourceParagraphs.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded hover:border-blue-400 transition flex items-start justify-between space-x-2"
                        >
                          <p className="text-xs text-slate-800 font-serif leading-relaxed flex-1">
                            {p.text}
                          </p>
                          <button
                            type="button"
                            onClick={() => moveToTarget(p)}
                            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-xs font-bold transition flex items-center space-x-0.5"
                            title="Move to target panel"
                          >
                            <span>Move</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Panel (Right) with Up/Down Controls */}
                <div className="bg-white rounded border-2 border-blue-400 p-4 shadow-xs space-y-3 min-h-[360px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Target Panel (Reordered Sequence)
                    </span>
                    <span className="text-[11px] font-mono text-blue-800 font-bold">
                      {targetParagraphs.length} / {(currentItem.paragraphs || []).length} Placed
                    </span>
                  </div>

                  {targetParagraphs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 italic">
                      Click &ldquo;Move&rdquo; on any paragraph in the left panel to begin assembling your sequence here.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {targetParagraphs.map((p, idx) => (
                        <div
                          key={p.id}
                          className="p-3 bg-blue-50/60 border border-blue-200 rounded flex items-start space-x-2.5 shadow-2xs"
                        >
                          <div className="flex flex-col items-center space-y-1 pt-0.5">
                            <span className="px-1.5 py-0.5 bg-blue-600 text-white font-mono font-bold text-[10px] rounded">
                              #{idx + 1}
                            </span>
                            <div className="flex flex-col space-y-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveTargetUp(idx)}
                                className="p-0.5 hover:bg-white rounded disabled:opacity-20 text-slate-700"
                                title="Move up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === targetParagraphs.length - 1}
                                onClick={() => moveTargetDown(idx)}
                                className="p-0.5 hover:bg-white rounded disabled:opacity-20 text-slate-700"
                                title="Move down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-900 font-serif leading-relaxed flex-1 pt-0.5">
                            {p.text}
                          </p>

                          <button
                            type="button"
                            onClick={() => moveToSource(p)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="Return to source panel"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 4: FIB-R (Drag & Drop)                           */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'FIB-R' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded border border-slate-300 shadow-xs leading-loose text-base text-slate-800 font-serif">
                {(currentItem.prompt || '').split(/(\[blank_\d+\])/g).map((token, idx) => {
                  const match = token.match(/\[(blank_\d+)\]/);
                  if (match) {
                    const blankId = match[1];
                    const filledWord = currentResponse.placedWords?.[blankId];
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => filledWord && handleFibRRemoveWord(blankId)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const w = e.dataTransfer.getData('text/plain');
                          if (w) handleFibRPlaceWord(blankId, w);
                        }}
                        className={`inline-flex items-center min-w-[100px] h-8 px-3 mx-1 text-sm font-sans font-medium rounded border-2 transition ${
                          filledWord
                            ? 'border-blue-600 bg-blue-100 text-blue-900 shadow-2xs hover:bg-red-50 hover:border-red-400'
                            : 'border-dashed border-slate-400 bg-slate-50 text-slate-400'
                        }`}
                        title={filledWord ? 'Click to remove word' : 'Drop word tile here'}
                      >
                        {filledWord || '[ Blank ]'}
                      </button>
                    );
                  }
                  return <span key={idx}>{token}</span>;
                })}
              </div>

              {/* Draggable Word Pool at Bottom */}
              <div className="p-4 bg-slate-100 border border-slate-300 rounded space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Available Word Bank (Drag tile into blank or click word to fill next empty blank)
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentItem.wordPool || []).map((word, wIdx) => {
                    const isUsed = Object.values(currentResponse.placedWords || {}).includes(word);
                    return (
                      <button
                        type="button"
                        key={wIdx}
                        draggable={!isUsed}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', word);
                        }}
                        disabled={isUsed}
                        onClick={() => {
                          // Find next empty blank
                          const total = currentItem.blanks?.length || 0;
                          for (let i = 0; i < total; i++) {
                            const bKey = `blank_${i}`;
                            if (!currentResponse.placedWords?.[bKey]) {
                              handleFibRPlaceWord(bKey, word);
                              break;
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-medium border transition ${
                          isUsed
                            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed line-through'
                            : 'bg-white border-slate-300 text-slate-800 hover:bg-blue-50 hover:border-blue-400 shadow-xs cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 5: MCSA-R (Single Answer Radio Buttons)          */}
          {/* ===================================================== */}
          {currentItem?.taskType === 'MCSA-R' && (
            <div className="space-y-5">
              <div className="bg-white p-6 rounded border border-slate-300 shadow-xs max-h-[260px] overflow-y-auto">
                <p className="text-base text-slate-800 leading-relaxed font-serif">{currentItem.prompt}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">{currentItem.question}</h4>
                <div className="space-y-2">
                  {(currentItem.options || []).map((opt) => {
                    const isSelected = currentResponse.selected === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleMcsaSelect(opt.id)}
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
            </div>
          )}
        </div>
      </main>

      {/* 5. Bottom Navigation Bar */}
      <footer className="bg-[#e2e5e8] border-t border-slate-300 px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-mono">
          {currentItem?.id} • {currentItem?.taskType} • Part 2: Reading
        </div>

        <button
          type="button"
          onClick={handleClickNext}
          className="flex items-center space-x-1 px-6 py-2 bg-[#003865] hover:bg-[#002644] text-white text-xs font-bold rounded shadow-xs uppercase tracking-wider transition"
        >
          <span>{currentIndex < items.length - 1 ? 'Next' : 'Next: Part 3 Listening'}</span>
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

