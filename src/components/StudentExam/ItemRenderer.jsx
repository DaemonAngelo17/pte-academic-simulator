import React from 'react';
import AudioPlayerWidget from './AudioPlayerWidget';
import AudioRecorderWidget from './AudioRecorderWidget';
import { countWords } from '../../config/pteRules';
import {
  shuffleParagraphsForStudent,
  gradeReorderAdjacentPairs
} from '../../utils/questionParser';
import { AlertTriangle } from 'lucide-react';

export default function ItemRenderer({
  item,
  responseValue,
  onResponseChange,
  isLocked = false
}) {
  if (!item) return null;

  // ==========================================
  // PART 1: SPEAKING
  // ==========================================
  if (['PI', 'RA', 'RS', 'DI', 'RL', 'SGD', 'RTS', 'ASQ'].includes(item.taskType) || item.archetype === 'spoken' || item.category === 'Speaking') {
    return (
      <div className="space-y-6">
        {/* Prompt / Passage display */}
        {item.taskType === 'RA' && (
          <div className="bg-white p-6 rounded border border-slate-300 shadow-xs">
            <p className="text-lg leading-relaxed text-slate-800 font-serif selection:bg-blue-100">
              {item.prompt}
            </p>
          </div>
        )}

        {item.taskType === 'RS' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 italic">{item.prompt}</p>
            <AudioPlayerWidget
              audioText={item.audioText}
              audioUrl={item.audioUrl}
              voiceAccent={item.voiceAccent}
              speechRate={item.speechRate}
              audioDuration={item.audioDurationSeconds || 5}
              autoPlay={true}
            />
          </div>
        )}

        {item.taskType === 'DI' && (
          <div className="space-y-4">
            <div className="flex justify-center bg-white p-4 rounded border border-slate-300 shadow-xs">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-h-[340px] w-auto object-contain rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-sm text-slate-600">{item.prompt}</p>
          </div>
        )}

        {['RL', 'SGD'].includes(item.taskType) && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-900">
              <strong>Audio Presentation:</strong> Listen carefully to the academic lecture/discussion. You will speak into the microphone after the countdown.
            </div>
            <AudioPlayerWidget
              audioText={item.audioText}
              audioUrl={item.audioUrl}
              voiceAccent={item.voiceAccent}
              speechRate={item.speechRate}
              audioDuration={item.audioDurationSeconds || 25}
              autoPlay={true}
            />
          </div>
        )}

        {item.taskType === 'RTS' && (
          <div className="space-y-4">
            {(item.audioText || item.audioUrl) && (
              <AudioPlayerWidget
                audioText={item.audioText || item.prompt}
                audioUrl={item.audioUrl}
                voiceAccent={item.voiceAccent}
                speechRate={item.speechRate}
                audioDuration={item.audioDurationSeconds || 12}
                autoPlay={true}
              />
            )}
            <div className="bg-amber-50/70 border border-amber-200 p-6 rounded shadow-xs space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Campus Scenario:</h4>
              <p className="text-base text-slate-800 leading-relaxed">{item.prompt}</p>
            </div>
          </div>
        )}

        {item.taskType === 'ASQ' && (
          <div className="space-y-4">
            <AudioPlayerWidget
              audioText={item.audioText}
              audioUrl={item.audioUrl}
              voiceAccent={item.voiceAccent}
              speechRate={item.speechRate}
              audioDuration={item.audioDurationSeconds || 4}
              autoPlay={true}
            />
            {/* Optional text input fallback for testing */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
                Typed Answer (Optional / Fallback)
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={responseValue?.textAnswer || ''}
                onChange={(e) =>
                  onResponseChange({
                    ...responseValue,
                    textAnswer: e.target.value
                  })
                }
                placeholder="Type your short answer here..."
                className="w-full max-w-md px-3 py-2 border border-slate-300 rounded text-sm focus:outline-hidden focus:border-blue-600 bg-white"
              />
            </div>
          </div>
        )}

        {item.taskType === 'PI' && (
          <div className="bg-slate-100 p-4 rounded text-sm text-slate-700 leading-relaxed border border-slate-200">
            {item.prompt}
          </div>
        )}

        {/* Dynamic / Custom Spoken Task Type renderer */}
        {!['PI', 'RA', 'RS', 'DI', 'RL', 'SGD', 'RTS', 'ASQ'].includes(item.taskType) && (
          <div className="space-y-4">
            {item.imageUrl && (
              <div className="flex justify-center bg-white p-4 rounded border border-slate-300 shadow-xs">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="max-h-[340px] w-auto object-contain rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            {(item.audioText || item.audioUrl) && (
              <AudioPlayerWidget
                audioText={item.audioText}
                audioUrl={item.audioUrl}
                voiceAccent={item.voiceAccent}
                speechRate={item.speechRate}
                audioDuration={item.audioDurationSeconds || 15}
                autoPlay={true}
              />
            )}
            {item.prompt && (
              <div className="bg-white p-6 rounded border border-slate-300 shadow-xs">
                <p className="text-base leading-relaxed text-slate-800">{item.prompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Audio Recording Component with custom timing overrides */}
        <AudioRecorderWidget
          prepSeconds={item.taskType === 'PI' ? 3 : (item.timingOverrides?.prepSeconds ?? 10)}
          recordSeconds={item.timingOverrides?.recordSeconds ?? item.recordSeconds ?? 40}
          onRecordingComplete={(recData) => {
            onResponseChange({
              ...responseValue,
              recordedAudio: recData,
              transcript: recData?.transcript || responseValue?.transcript || '',
              text: recData?.transcript || responseValue?.text || ''
            });
          }}
        />
      </div>
    );
  }

  // ==========================================
  // PART 1: WRITING (SWT, WE, or custom extended_text)
  // ==========================================
  if (['SWT', 'WE'].includes(item.taskType) || item.archetype === 'extended_text' || item.category === 'Writing') {
    const textVal = responseValue?.text || '';
    const wordCnt = countWords(textVal);
    const minWords = item.timingOverrides?.minWords ?? item.minWords ?? (item.taskType === 'WE' ? 200 : item.taskType === 'SWT' ? 5 : 0);
    const maxWords = item.timingOverrides?.maxWords ?? item.maxWords ?? (item.taskType === 'WE' ? 300 : item.taskType === 'SWT' ? 75 : 0);
    const isSingleSentenceOnly = item.taskType === 'SWT';
    const sentenceCount = (textVal.match(/[.!?]+/g) || []).length;
    const isSingleSentence = sentenceCount === 1;

    return (
      <div className="space-y-6">
        {/* Passage / Essay Topic */}
        <div className="bg-white p-5 rounded border border-slate-300 shadow-xs max-h-[300px] overflow-y-auto">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {item.taskType === 'WE' ? 'Essay Topic' : 'Reading Passage / Prompt'}
          </h4>
          <p className="text-base text-slate-800 leading-relaxed font-serif">{item.prompt}</p>
        </div>

        {/* Writing Response Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-100 p-2 border border-slate-300 rounded-t">
            <div className="flex items-center space-x-2">
              <span className="font-semibold uppercase tracking-wider text-slate-700">Your Response</span>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`font-mono font-bold ${
                  (minWords && wordCnt < minWords) || (maxWords && wordCnt > maxWords)
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                Word Count: {wordCnt} {minWords && maxWords ? `(Target: ${minWords}–${maxWords})` : ''}
              </span>
              {isSingleSentenceOnly && textVal.trim() && !isSingleSentence && (
                <span className="text-red-500 flex items-center space-x-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Must be exactly ONE single sentence</span>
                </span>
              )}
            </div>
          </div>

          <textarea
            rows={item.taskType === 'WE' ? 12 : 6}
            disabled={isLocked}
            value={textVal}
            onChange={(e) => onResponseChange({ ...responseValue, text: e.target.value })}
            placeholder="Type your response here..."
            className="w-full p-4 border border-t-0 border-slate-300 rounded-b font-sans text-sm focus:outline-hidden focus:border-blue-600 bg-white leading-relaxed resize-y shadow-2xs"
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // PART 2: READING
  // ==========================================
  if (item.taskType === 'FIB-RW') {
    const userSelections = responseValue?.blanks || {};
    const tokens = (item.prompt || '').split(/(\[blank_\d+\])/g);

    return (
      <div className="bg-white p-6 rounded border border-slate-300 shadow-xs space-y-4">
        <div className="text-base leading-loose text-slate-800 font-serif">
          {tokens.map((token, idx) => {
            const match = token.match(/\[(blank_\d+)\]/);
            if (match) {
              const blankId = match[1];
              const opt = (item.options || []).find((o) => o.id === blankId);
              return (
                <span key={idx} className="inline-block mx-1">
                  <select
                    disabled={isLocked}
                    value={userSelections[blankId] || ''}
                    onChange={(e) =>
                      onResponseChange({
                        ...responseValue,
                        blanks: { ...userSelections, [blankId]: e.target.value }
                      })
                    }
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
    );
  }

  if (item.taskType === 'MCMA-R' || item.taskType === 'MCMA-L') {
    const selected = responseValue?.selected || [];

    const toggleOption = (id) => {
      if (isLocked) return;
      const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
      onResponseChange({ ...responseValue, selected: next });
    };

    return (
      <div className="space-y-6">
        {item.taskType === 'MCMA-L' && (
          <AudioPlayerWidget
            audioText={item.audioText}
            audioUrl={item.audioUrl}
            voiceAccent={item.voiceAccent}
            speechRate={item.speechRate}
            audioDuration={item.audioDurationSeconds || 20}
            autoPlay={true}
          />
        )}

        {item.prompt && item.taskType === 'MCMA-R' && (
          <div className="bg-white p-5 rounded border border-slate-300 shadow-xs max-h-[260px] overflow-y-auto">
            <p className="text-base text-slate-800 leading-relaxed font-serif">{item.prompt}</p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 text-sm">{item.question}</h4>
          <div className="space-y-2">
            {item.options?.map((opt) => {
              const isChecked = selected.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`flex items-start space-x-3 p-3 rounded border transition cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isLocked}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">{opt.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (item.taskType === 'MCSA-R' || item.taskType === 'MCSA-L' || item.taskType === 'SMW' || item.taskType === 'HCS') {
    const selected = responseValue?.selected || '';

    return (
      <div className="space-y-6">
        {['MCSA-L', 'SMW', 'HCS'].includes(item.taskType) && (
          <AudioPlayerWidget
            audioText={item.audioText}
            audioUrl={item.audioUrl}
            voiceAccent={item.voiceAccent}
            speechRate={item.speechRate}
            audioDuration={item.audioDurationSeconds || 20}
            autoPlay={true}
          />
        )}

        {item.prompt && item.taskType === 'MCSA-R' && (
          <div className="bg-white p-5 rounded border border-slate-300 shadow-xs max-h-[260px] overflow-y-auto">
            <p className="text-base text-slate-800 leading-relaxed font-serif">{item.prompt}</p>
          </div>
        )}

        <div className="space-y-3">
          {item.question && <h4 className="font-semibold text-slate-900 text-sm">{item.question}</h4>}
          <div className="space-y-2">
            {item.options?.map((opt) => {
              const isChecked = selected === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => !isLocked && onResponseChange({ ...responseValue, selected: opt.id })}
                  className={`flex items-start space-x-3 p-3.5 rounded border transition cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`radio_${item.id}`}
                    checked={isChecked}
                    disabled={isLocked}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">{opt.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (item.taskType === 'RO-R') {
    // Reorder Paragraphs: Shuffle initially for the student, and auto-grade adjacent pairs!
    const initialShuffled = shuffleParagraphsForStudent(item.paragraphs || [], item.id);
    const currentOrder = responseValue?.orderedParagraphs || initialShuffled;

    const updateOrder = (nextOrder) => {
      const autoGrade = gradeReorderAdjacentPairs(nextOrder, item.paragraphs || []);
      onResponseChange({
        ...responseValue,
        orderedParagraphs: nextOrder,
        autoGradeAdjacentPairs: autoGrade
      });
    };

    const moveUp = (index) => {
      if (isLocked || index <= 0) return;
      const next = [...currentOrder];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      updateOrder(next);
    };

    const moveDown = (index) => {
      if (isLocked || index >= currentOrder.length - 1) return;
      const next = [...currentOrder];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      updateOrder(next);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="italic">
            The paragraphs below have been placed in random order. Restore the original order using the up/down controls.
          </span>
          <span className="font-mono text-slate-600">
            Max Adjacent Pairs: {Math.max(0, (item.paragraphs?.length || 0) - 1)}
          </span>
        </div>

        <div className="space-y-3">
          {currentOrder.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-start space-x-3 p-4 bg-white rounded border border-slate-300 shadow-xs hover:border-blue-400 transition"
            >
              <div className="flex flex-col space-y-1 pt-1">
                <button
                  type="button"
                  disabled={isLocked || idx === 0}
                  onClick={() => moveUp(idx)}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                  title="Move paragraph up"
                >
                  ▲
                </button>
                <span className="text-xs font-mono font-bold text-center text-blue-600">{idx + 1}</span>
                <button
                  type="button"
                  disabled={isLocked || idx === currentOrder.length - 1}
                  onClick={() => moveDown(idx)}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                  title="Move paragraph down"
                >
                  ▼
                </button>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-serif flex-1 pt-0.5">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.taskType === 'FIB-R') {
    const placedWords = responseValue?.placedWords || {};
    const pool = item.wordPool || [];

    const handleWordClick = (word) => {
      if (isLocked) return;
      const blanksCount = item.blanks?.length || 0;
      for (let i = 0; i < blanksCount; i++) {
        const key = `blank_${i}`;
        if (!placedWords[key]) {
          onResponseChange({
            ...responseValue,
            placedWords: { ...placedWords, [key]: word }
          });
          break;
        }
      }
    };

    const removeWord = (blankKey) => {
      if (isLocked) return;
      const next = { ...placedWords };
      delete next[blankKey];
      onResponseChange({ ...responseValue, placedWords: next });
    };

    const tokens = (item.prompt || '').split(/(\[blank_\d+\])/g);

    return (
      <div className="space-y-6">
        {/* Text with drop boxes */}
        <div className="bg-white p-6 rounded border border-slate-300 shadow-xs leading-loose text-base text-slate-800 font-serif">
          {tokens.map((token, idx) => {
            const match = token.match(/\[(blank_\d+)\]/);
            if (match) {
              const blankId = match[1];
              const filled = placedWords[blankId];
              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isLocked}
                  onClick={() => filled && removeWord(blankId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (isLocked) return;
                    const droppedWord = e.dataTransfer.getData('text/plain');
                    if (droppedWord) {
                      onResponseChange({
                        ...responseValue,
                        placedWords: { ...placedWords, [blankId]: droppedWord }
                      });
                    }
                  }}
                  className={`inline-flex items-center min-w-[100px] h-8 px-3 mx-1 text-sm font-sans font-medium rounded border-2 transition ${
                    filled
                      ? 'border-blue-600 bg-blue-100 text-blue-900 shadow-2xs hover:bg-red-50 hover:border-red-400'
                      : 'border-dashed border-slate-400 bg-slate-50 text-slate-400'
                  }`}
                  title={filled ? 'Click to remove' : 'Drag or click word to fill'}
                >
                  {filled || '[ Blank ]'}
                </button>
              );
            }
            return <span key={idx}>{token}</span>;
          })}
        </div>

        {/* Word Pool Box */}
        <div className="p-4 bg-slate-100 border border-slate-300 rounded space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Available Word Pool (Drag into blank or click to place)
          </div>
          <div className="flex flex-wrap gap-2">
            {pool.map((word, wIdx) => {
              const isUsed = Object.values(placedWords).includes(word);
              return (
                <button
                  type="button"
                  key={wIdx}
                  draggable={!isLocked && !isUsed}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', word);
                  }}
                  disabled={isLocked || isUsed}
                  onClick={() => handleWordClick(word)}
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
    );
  }

  // ==========================================
  // PART 3: LISTENING
  // ==========================================
  if (item.taskType === 'SST') {
    const textVal = responseValue?.text || '';
    const wordCnt = countWords(textVal);

    return (
      <div className="space-y-6">
        <AudioPlayerWidget
          audioText={item.audioText}
          audioUrl={item.audioUrl}
          voiceAccent={item.voiceAccent}
          speechRate={item.speechRate}
          audioDuration={item.audioDurationSeconds || 30}
          autoPlay={true}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold uppercase tracking-wider">Summary of Spoken Lecture</span>
            <div className="font-mono text-xs font-bold">
              <span className={wordCnt < 50 || wordCnt > 70 ? 'text-amber-600' : 'text-emerald-700'}>
                Word Count: {wordCnt}
              </span>
              <span className="text-slate-400 font-normal ml-1">(Strict requirement: 50–70 words)</span>
            </div>
          </div>

          <textarea
            rows={7}
            disabled={isLocked}
            value={textVal}
            onChange={(e) => onResponseChange({ ...responseValue, text: e.target.value })}
            placeholder="Type your summary here (50–70 words)..."
            className="w-full p-4 border border-slate-300 rounded font-sans text-sm focus:outline-hidden focus:border-blue-600 bg-white leading-relaxed resize-y shadow-2xs"
          />
        </div>
      </div>
    );
  }

  if (item.taskType === 'FIB-L') {
    const answers = responseValue?.answers || {};
    const tokens = (item.prompt || '').split(/(\[blank_\d+\])/g);

    return (
      <div className="space-y-6">
        <AudioPlayerWidget
          audioText={item.audioText}
          audioUrl={item.audioUrl}
          voiceAccent={item.voiceAccent}
          speechRate={item.speechRate}
          audioDuration={item.audioDurationSeconds || 15}
          autoPlay={true}
        />

        <div className="bg-white p-6 rounded border border-slate-300 shadow-xs text-base leading-loose text-slate-800 font-serif">
          {tokens.map((token, idx) => {
            const match = token.match(/\[(blank_\d+)\]/);
            if (match) {
              const blankId = match[1];
              return (
                <input
                  key={idx}
                  type="text"
                  disabled={isLocked}
                  value={answers[blankId] || ''}
                  onChange={(e) =>
                    onResponseChange({
                      ...responseValue,
                      answers: { ...answers, [blankId]: e.target.value }
                    })
                  }
                  className="mx-1.5 px-2.5 py-1 border-b-2 border-blue-500 font-sans text-sm bg-blue-50/50 focus:bg-white focus:outline-hidden rounded-t w-32 font-semibold text-slate-900"
                  placeholder="Type word"
                />
              );
            }
            return <span key={idx}>{token}</span>;
          })}
        </div>
      </div>
    );
  }

  if (item.taskType === 'HIW') {
    const selectedWords = responseValue?.selectedIndices || [];
    const words = item.displayedText?.split(/\s+/) || [];

    const toggleWord = (index) => {
      if (isLocked) return;
      const next = selectedWords.includes(index)
        ? selectedWords.filter((i) => i !== index)
        : [...selectedWords, index];
      onResponseChange({ ...responseValue, selectedIndices: next });
    };

    return (
      <div className="space-y-6">
        <AudioPlayerWidget
          audioText={item.audioText}
          audioUrl={item.audioUrl}
          voiceAccent={item.voiceAccent}
          speechRate={item.speechRate}
          audioDuration={item.audioDurationSeconds || 12}
          autoPlay={true}
        />

        <div className="bg-white p-6 rounded border border-slate-300 shadow-xs text-base leading-loose text-slate-800 font-serif selection:bg-transparent">
          {words.map((w, idx) => {
            const isHighlighted = selectedWords.includes(idx);
            return (
              <span
                key={idx}
                onClick={() => toggleWord(idx)}
                className={`cursor-pointer px-1 py-0.5 rounded transition ${
                  isHighlighted
                    ? 'bg-yellow-300 text-slate-900 font-semibold shadow-2xs'
                    : 'hover:bg-slate-100'
                }`}
              >
                {w}{' '}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (item.taskType === 'WFD') {
    const textVal = responseValue?.text || '';
    const wordCnt = countWords(textVal);

    return (
      <div className="space-y-6">
        <AudioPlayerWidget
          audioText={item.audioText}
          audioUrl={item.audioUrl}
          voiceAccent={item.voiceAccent}
          speechRate={item.speechRate}
          audioDuration={item.audioDurationSeconds || 5}
          autoPlay={true}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold uppercase tracking-wider">Type the Sentence</span>
            <span className="font-mono text-xs text-slate-500 font-bold">Words: {wordCnt}</span>
          </div>

          <textarea
            rows={4}
            disabled={isLocked}
            value={textVal}
            onChange={(e) => onResponseChange({ ...responseValue, text: e.target.value })}
            placeholder="Type the sentence exactly as you hear it..."
            className="w-full p-4 border border-slate-300 rounded font-sans text-sm focus:outline-hidden focus:border-blue-600 bg-white leading-relaxed resize-y shadow-2xs"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 border rounded text-slate-600">
      Unsupported item renderer for type: {item.taskType}
    </div>
  );
}
