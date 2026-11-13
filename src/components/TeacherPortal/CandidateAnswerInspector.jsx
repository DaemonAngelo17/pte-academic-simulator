import React from 'react';
import CandidateAudioPlayer from './CandidateAudioPlayer';
import { countWords } from '../../config/pteRules';
import {
  Volume2,
  FileText,
  Sparkles,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Edit3,
  Layers,
  ArrowRight
} from 'lucide-react';

/**
 * Normalizes words for comparison (lowercased, stripped punctuation)
 */
function cleanWord(str = '') {
  return str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '');
}

export default function CandidateAnswerInspector({
  item,
  response = {},
  submission,
  isTranscribingWhisper,
  onTranscribeWhisper,
  isEditingTranscript,
  tempTranscript,
  setTempTranscript,
  onStartEditTranscript,
  onCancelEditTranscript,
  onSaveTranscript
}) {
  if (!item) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200">
        No question item selected.
      </div>
    );
  }

  const taskType = item.taskType;
  const isSpoken = ['RA', 'RS', 'DI', 'RL', 'SGD', 'RTS', 'ASQ'].includes(taskType);
  const isWritten = ['SWT', 'WE', 'SST'].includes(taskType);

  // Fallbacks for response values
  const studentText = response.text || response.transcript || response.recordedAudio?.transcript || '';
  const studentRecordedAudio = response.recordedAudio || {};
  const studentAutoScore = response.autoScore || {};

  // ==========================================
  // 1. SPOKEN TASKS (RA, RS, DI, RL, SGD, RTS, ASQ)
  // ==========================================
  if (isSpoken) {
    const promptWords = item.promptWords || countWords(item.prompt || item.referenceSentence || '');
    const candidateWords = countWords(studentText);
    const referenceSentence = item.referenceSentence || item.prompt || item.audioText || '';

    // Word Match Analysis for Read Aloud & Repeat Sentence
    const refTokens = referenceSentence.trim().split(/\s+/).filter(Boolean);
    const candTokens = studentText.trim().split(/\s+/).filter(Boolean);
    const candSet = new Set(candTokens.map(cleanWord));

    let matchedWordCount = 0;
    refTokens.forEach((tok) => {
      if (candSet.has(cleanWord(tok))) matchedWordCount++;
    });
    const matchAccuracyPct = refTokens.length > 0 ? Math.round((matchedWordCount / refTokens.length) * 100) : 0;

    return (
      <div className="space-y-4">
        {/* Candidate Voice Player */}
        <CandidateAudioPlayer
          audioUrl={studentRecordedAudio.audioUrl}
          localBlobUrl={studentRecordedAudio.localBlobUrl}
          dataUrl={studentRecordedAudio.dataUrl}
          fileName={studentRecordedAudio.fileName}
          studentId={submission?.studentId}
          itemId={item.id}
          durationRecorded={studentRecordedAudio.durationRecorded}
          closedDueToSilence={studentRecordedAudio.closedDueToSilence}
        />

        {/* Candidate Spoken Transcript Card */}
        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Candidate Spoken Transcript (Speech-to-Text):</span>
            </span>

            <div className="flex items-center space-x-2">
              <span className="font-mono text-indigo-950 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-bold">
                {candidateWords} words spoken
              </span>
              {onTranscribeWhisper && (
                <button
                  type="button"
                  onClick={() => onTranscribeWhisper(item.id)}
                  disabled={isTranscribingWhisper}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded text-[11px] font-semibold transition disabled:opacity-50"
                  title="Run server-side Whisper AI transcription"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isTranscribingWhisper ? 'Transcribing...' : 'Whisper AI Transcribe'}</span>
                </button>
              )}
            </div>
          </div>

          {isEditingTranscript ? (
            <div className="space-y-2">
              <textarea
                value={tempTranscript}
                onChange={(e) => setTempTranscript(e.target.value)}
                rows={4}
                className="w-full p-3 border border-indigo-300 rounded-lg text-xs font-serif leading-relaxed outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Edit or paste candidate transcript..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onCancelEditTranscript}
                  className="px-3 py-1 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSaveTranscript(item.id, tempTranscript)}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Transcript</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 font-serif leading-relaxed select-text text-slate-800 text-xs">
                {studentText.trim() ? (
                  <span>"{studentText.trim()}"</span>
                ) : (
                  <span className="text-slate-400 italic font-sans text-xs">
                    No transcript available for this recording yet. Click "Whisper AI Transcribe" or "Edit Transcript" to input spoken words.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Used by Pearson AI for Pronunciation, Fluency &amp; Content Scoring</span>
                </span>
                <button
                  type="button"
                  onClick={() => onStartEditTranscript(studentText)}
                  className="text-indigo-700 hover:text-indigo-900 font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Transcript</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Word Comparison / Diff for Read Aloud & Repeat Sentence */}
        {['RA', 'RS'].includes(taskType) && refTokens.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Word-by-Word Reference Verification
              </span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                {matchedWordCount} / {refTokens.length} words matched ({matchAccuracyPct}%)
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 leading-relaxed font-serif text-slate-800 select-text flex flex-wrap gap-1">
              {refTokens.map((tok, idx) => {
                const isMatched = candSet.has(cleanWord(tok));
                return (
                  <span
                    key={idx}
                    className={`px-1 rounded text-xs transition ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-900 font-medium'
                        : 'bg-rose-100 text-rose-800 font-bold underline decoration-rose-400'
                    }`}
                    title={isMatched ? 'Matched in candidate transcript' : 'Omitted or mispronounced'}
                  >
                    {tok}
                  </span>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 italic">
              Legend: <span className="bg-emerald-100 text-emerald-900 px-1 rounded font-medium">Green</span> = matched words;{' '}
              <span className="bg-rose-100 text-rose-800 px-1 rounded font-bold">Red</span> = omitted/divergent tokens.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. WRITTEN TASKS (SWT, WE, SST)
  // ==========================================
  if (isWritten) {
    const textVal = response.text || '';
    const wordCnt = response.wordCount ?? countWords(textVal);
    const sentenceCnt = response.sentenceCount ?? (textVal.match(/[.!?]+/g) || []).length;

    let targetRange = '5–75 words';
    let isSingleSentenceReq = false;
    let isWordCountValid = false;

    if (taskType === 'SWT') {
      targetRange = '5–75 words (Strictly ONE single sentence)';
      isSingleSentenceReq = true;
      isWordCountValid = wordCnt >= 5 && wordCnt <= 75;
    } else if (taskType === 'WE') {
      targetRange = '200–300 words';
      isWordCountValid = wordCnt >= 200 && wordCnt <= 300;
    } else if (taskType === 'SST') {
      targetRange = '50–70 words';
      isWordCountValid = wordCnt >= 50 && wordCnt <= 70;
    }

    const isFormValid = isSingleSentenceReq
      ? isWordCountValid && sentenceCnt === 1
      : isWordCountValid;

    return (
      <div className="space-y-4">
        {/* Candidate Typed Text Display */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-blue-100 pb-2">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Candidate Submitted Text ({taskType}):</span>
            </span>

            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Word Count: {wordCnt}
              </span>
              <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Sentences: {sentenceCnt}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200 font-serif leading-relaxed text-sm text-slate-900 select-text whitespace-pre-wrap">
            {textVal.trim() ? textVal : (
              <span className="text-slate-400 italic font-sans text-xs">
                Candidate did not type any text for this written task.
              </span>
            )}
          </div>

          {/* Form Rules Validation Checklist */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold uppercase text-slate-500">Form Checklist:</span>

            {/* Target Words Pill */}
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center space-x-1 ${
                isWordCountValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isWordCountValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{targetRange} ({wordCnt}w)</span>
            </span>

            {/* Single Sentence Rule (for SWT) */}
            {isSingleSentenceReq && (
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center space-x-1 ${
                  sentenceCnt === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {sentenceCnt === 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Strictly 1 sentence ({sentenceCnt} found)</span>
              </span>
            )}

            {/* Form Knockout Indicator */}
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                isFormValid ? 'bg-blue-100 text-blue-900' : 'bg-red-100 text-red-900'
              }`}
            >
              {isFormValid ? '✓ Form Compliant' : '⚠️ Form Knockout Risk (Form = 0)'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. READING & LISTENING OBJECTIVE TASKS
  // ==========================================

  // A. FIB-RW & FIB-R (Fill in the Blanks)
  if (['FIB-RW', 'FIB-R'].includes(taskType)) {
    const options = item.options || [];
    const studentBlanks = response.blanks || {};
    const autoBreakdown = studentAutoScore.breakdown || [];

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Candidate Blank Selections &amp; Key Comparison</span>
          </span>
          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
            Correct Blanks: {studentAutoScore.correctBlanks ?? 0} / {studentAutoScore.totalBlanks ?? options.length}
          </span>
        </div>

        {/* Blanks Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="p-2 border border-slate-200">Blank #</th>
                <th className="p-2 border border-slate-200">Candidate Selected</th>
                <th className="p-2 border border-slate-200">Official Correct Key</th>
                <th className="p-2 border border-slate-200 text-center">Status</th>
                <th className="p-2 border border-slate-200 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt, i) => {
                const studentVal = studentBlanks[opt.id] || '(No selection)';
                const correctVal = opt.answer || opt.choices?.[0] || '';
                const isCorrect = studentVal.trim().toLowerCase() === correctVal.trim().toLowerCase();

                return (
                  <tr key={opt.id || i} className={isCorrect ? 'bg-emerald-50/50' : 'bg-rose-50/50'}>
                    <td className="p-2 border border-slate-200 font-mono font-bold text-slate-700">
                      [{opt.id || `blank_${i + 1}`}]
                    </td>
                    <td className="p-2 border border-slate-200 font-bold font-serif">
                      <span className={isCorrect ? 'text-emerald-800' : 'text-rose-800'}>
                        {studentVal}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-200 font-serif text-slate-700">
                      {correctVal}
                    </td>
                    <td className="p-2 border border-slate-200 text-center">
                      {isCorrect ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          ✓ Correct
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]">
                          ✗ Incorrect
                        </span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold">
                      {isCorrect ? '+1.0' : '0.0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // B. MCMA-R & MCMA-L (Multiple Choice, Multiple Answers)
  if (['MCMA-R', 'MCMA-L'].includes(taskType)) {
    const options = item.options || [];
    const selected = response.selected || [];
    const correctOptions = options.filter((o) => !!o.correct);
    const correctKeys = correctOptions.map((o) => o.id);

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
            Multiple Choice Options &amp; Negative Marking Floor
          </span>
          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Score: MAX(0, Correct - Incorrect) = {studentAutoScore.finalScore ?? 0} pts
          </span>
        </div>

        <div className="space-y-2">
          {options.map((opt) => {
            const isChosen = selected.includes(opt.id);
            const isCorrect = correctKeys.includes(opt.id);

            let rowClass = 'bg-slate-50 border-slate-200 text-slate-700';
            if (isChosen && isCorrect) {
              rowClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium';
            } else if (isChosen && !isCorrect) {
              rowClass = 'bg-rose-50 border-rose-300 text-rose-950';
            } else if (!isChosen && isCorrect) {
              rowClass = 'bg-amber-50/60 border-amber-300 text-amber-950';
            }

            return (
              <div
                key={opt.id}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs transition ${rowClass}`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border ${
                      isChosen ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChosen ? '✓' : ''}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 font-bold">[{opt.id}]</span>
                  <span>{opt.text}</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isCorrect && (
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">
                      Correct Key
                    </span>
                  )}
                  {isChosen && isCorrect && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold font-mono">
                      +1.0
                    </span>
                  )}
                  {isChosen && !isCorrect && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold font-mono">
                      -1.0
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // C. RO-R (Reorder Paragraphs)
  if (taskType === 'RO-R') {
    const paragraphs = item.paragraphs || [];
    const studentOrder = response.order || [];

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
            Candidate Ordering vs Correct Chronological Order
          </span>
          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Correct Adjacent Pairs: {studentAutoScore.correctAdjacentPairs ?? 0} / {paragraphs.length - 1} pts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Candidate's Arranged Sequence */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-900 uppercase">Candidate's Sequence</span>
            <div className="space-y-1.5">
              {(studentOrder.length > 0 ? studentOrder : paragraphs.map((p) => p.id)).map((pId, idx) => {
                const para = paragraphs.find((p) => p.id === pId);
                return (
                  <div key={pId} className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 text-xs">
                    <span className="font-mono font-bold text-blue-800 text-[11px] block mb-1">
                      Position {idx + 1}: [{pId}]
                    </span>
                    <p className="text-slate-800 font-serif leading-relaxed line-clamp-2">{para?.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct Official Sequence */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase">Correct Chronological Order</span>
            <div className="space-y-1.5">
              {paragraphs.map((para, idx) => (
                <div key={para.id} className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-xs">
                  <span className="font-mono font-bold text-emerald-800 text-[11px] block mb-1">
                    Position {idx + 1}: [{para.id}]
                  </span>
                  <p className="text-slate-800 font-serif leading-relaxed line-clamp-2">{para.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // D. WFD (Write From Dictation)
  if (taskType === 'WFD') {
    const candidateSentence = response.text || response.transcript || '';
    const referenceSentence = item.audioText || item.prompt || item.referenceSentence || '';

    const refTokens = referenceSentence.trim().split(/\s+/).filter(Boolean);
    const candTokens = candidateSentence.trim().split(/\s+/).filter(Boolean);
    const candWordsSet = new Set(candTokens.map(cleanWord));

    let correctCount = 0;
    refTokens.forEach((tok) => {
      if (candWordsSet.has(cleanWord(tok))) correctCount++;
    });

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
            Write From Dictation — Word Accuracy
          </span>
          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Dictation Score: {studentAutoScore.correctWords ?? correctCount} / {refTokens.length} pts (+1 per correct word)
          </span>
        </div>

        {/* Candidate Typed Sentence */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">Candidate Typed Sentence:</span>
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 font-serif text-slate-900 text-sm select-text">
            {candidateSentence.trim() ? candidateSentence : <span className="text-slate-400 italic">No sentence typed</span>}
          </div>
        </div>

        {/* Word Diff Highlight against Reference Audio */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">Audio Reference Dictation:</span>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1 font-serif text-sm">
            {refTokens.map((tok, i) => {
              const matched = candWordsSet.has(cleanWord(tok));
              return (
                <span
                  key={i}
                  className={`px-1 rounded transition ${
                    matched ? 'bg-emerald-100 text-emerald-900 font-medium' : 'bg-rose-100 text-rose-800 font-bold'
                  }`}
                  title={matched ? '+1 pt: Word matched correctly' : '0 pt: Word missing or misspelled'}
                >
                  {tok}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // E. HIW (Highlight Incorrect Words)
  if (taskType === 'HIW') {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
            Highlight Incorrect Words Breakdown
          </span>
          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Net Score: {studentAutoScore.finalScore ?? 0} pts (Correct Clicks - Incorrect Clicks)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-[11px] uppercase font-bold text-emerald-800 block">Correct Words Clicked</span>
            <span className="font-mono text-lg font-black text-emerald-700">
              +{studentAutoScore.correctClicks ?? 0}
            </span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-[11px] uppercase font-bold text-rose-800 block">Incorrect Words Clicked</span>
            <span className="font-mono text-lg font-black text-rose-700">
              -{studentAutoScore.incorrectClicks ?? 0}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for single choice items (MCSA-R, MCSA-L, HCS, SMW)
  const options = item.options || [];
  const candidateChoice = response.selected || response.candidateSelected || response.text;
  const correctChoice = options.find((o) => !!o.correct)?.id || options[0]?.id;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
          Candidate Single Choice Response ({taskType})
        </span>
        <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
          Score: {studentAutoScore.score ?? response.rawScore ?? 0} / 1 pt
        </span>
      </div>

      <div className="space-y-1.5">
        {options.map((opt) => {
          const isChosen = opt.id === candidateChoice || opt.text === candidateChoice;
          const isCorrect = !!opt.correct;

          return (
            <div
              key={opt.id}
              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                isChosen && isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                  : isChosen && !isCorrect
                  ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                  : isCorrect
                  ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[11px] font-bold text-slate-500">[{opt.id}]</span>
                <span>{opt.text}</span>
              </div>
              <div>
                {isChosen && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 mr-1.5">
                    Candidate Chose
                  </span>
                )}
                {isCorrect && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Correct Key
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

