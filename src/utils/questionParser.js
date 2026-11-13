/**
 * Utilities for parsing & converting bracket notations, auto-calculating Google Sheet metrics,
 * shuffling/auto-grading Reorder Paragraphs adjacent pairs, and CSV/JSON bulk import/export.
 */

import { countWords } from '../config/pteRules';

/**
 * 1. FIB-RW: Reading & Writing Fill in the Blanks Dropdown
 * Teacher syntax: "Marine biology provides [critical|trivial|remote|fragile] ecosystems..."
 * First choice inside [correct|d1|d2|d3] is the correct answer; choices are presented in deterministic shuffled order for students.
 */
export function parseFibRwBracketText(bracketText = '') {
  const options = [];
  let blankIndex = 0;

  // Match [opt1|opt2|...] but ignore already-converted [blank_0]
  const convertedPrompt = bracketText.replace(/\[([^\]]+)\]/g, (fullMatch, inner) => {
    if (/^blank_\d+$/.test(inner.trim())) {
      return fullMatch;
    }
    const parts = inner
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return fullMatch;

    const correctAnswer = parts[0];
    // Create deterministic alphabetical or rotated list of choices so the first option isn't always first in the dropdown
    const uniqueChoices = Array.from(new Set(parts));
    const sortedChoices = [...uniqueChoices].sort((a, b) => a.localeCompare(b));

    const id = `blank_${blankIndex}`;
    options.push({
      id,
      choices: sortedChoices,
      rawChoices: uniqueChoices,
      answer: correctAnswer
    });
    blankIndex++;
    return `[${id}]`;
  });

  return {
    prompt: convertedPrompt,
    options,
    totalBlanks: options.length
  };
}

/**
 * Convert an existing FIB-RW item back into editable bracket text:
 * "[blank_0]" -> "[correct|distractor1|distractor2|distractor3]"
 */
export function toFibRwBracketText(item) {
  if (!item) return '';
  if (item.rawBracketText) return item.rawBracketText;
  const prompt = item.prompt || '';
  const options = item.options || [];
  return prompt.replace(/\[(blank_\d+)\]/g, (full, blankId) => {
    const opt = options.find((o) => o.id === blankId);
    if (!opt) return full;
    const answer = opt.answer || opt.choices?.[0] || '';
    const distractors = (opt.rawChoices || opt.choices || []).filter((c) => c !== answer);
    return `[${[answer, ...distractors].join('|')}]`;
  });
}

/**
 * 2. FIB-R: Reading Fill in the Blanks (Drag & Drop)
 * Teacher syntax: "Volcanic eruptions inject sulfur dioxide into the [stratosphere], these gases [reflect] solar radiation..."
 * Plus extra distractor words: "absorb, warming, crust"
 */
export function parseFibRBracketText(bracketText = '', extraDistractorsInput = '') {
  const blanks = [];
  let blankIndex = 0;

  const convertedPrompt = bracketText.replace(/\[([^\]]+)\]/g, (fullMatch, inner) => {
    if (/^blank_\d+$/.test(inner.trim())) {
      return fullMatch;
    }
    const answerWord = inner.trim();
    if (!answerWord) return fullMatch;
    const id = `blank_${blankIndex}`;
    blanks.push(answerWord);
    blankIndex++;
    return `[${id}]`;
  });

  const extraDistractors = Array.isArray(extraDistractorsInput)
    ? extraDistractorsInput
    : String(extraDistractorsInput || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const wordPool = Array.from(new Set([...blanks, ...extraDistractors]));

  return {
    prompt: convertedPrompt,
    blanks,
    extraDistractors,
    wordPool,
    totalBlanks: blanks.length
  };
}

/**
 * Convert an existing FIB-R item back into editable bracket text:
 * "[blank_0]" -> "[stratosphere]"
 */
export function toFibRBracketText(item) {
  if (!item) return { bracketText: '', extraDistractors: '' };
  const blanks = item.blanks || [];
  const pool = item.wordPool || [];
  const extra = item.extraDistractors || pool.filter((w) => !blanks.includes(w));

  if (item.rawBracketText) {
    return {
      bracketText: item.rawBracketText,
      extraDistractors: extra.join(', ')
    };
  }

  const prompt = item.prompt || '';
  const bracketText = prompt.replace(/\[blank_(\d+)\]/g, (full, idxStr) => {
    const idx = parseInt(idxStr, 10);
    return blanks[idx] ? `[${blanks[idx]}]` : full;
  });

  return {
    bracketText,
    extraDistractors: extra.join(', ')
  };
}

/**
 * 3. FIB-L: Listening Fill in the Blanks
 * Teacher can either type brackets in transcript: "Researchers must define their [variables] clearly..."
 * which automatically generates both `prompt` (with [blank_0]) and `audioText` (with the spoken word "variables")!
 */
export function parseFibLBracketText(bracketText = '') {
  const answers = [];
  let blankIndex = 0;

  const promptWithBlanks = bracketText.replace(/\[([^\]]+)\]/g, (fullMatch, inner) => {
    if (/^blank_\d+$/.test(inner.trim())) return fullMatch;
    const word = inner.trim();
    if (!word) return fullMatch;
    const id = `blank_${blankIndex}`;
    answers.push(word);
    blankIndex++;
    return `[${id}]`;
  });

  const spokenAudioText = bracketText.replace(/\[([^\]]+)\]/g, (fullMatch, inner) => {
    if (/^blank_\d+$/.test(inner.trim())) return fullMatch;
    return inner.trim();
  });

  return {
    prompt: promptWithBlanks,
    audioText: spokenAudioText,
    answers,
    totalBlanks: answers.length
  };
}

export function toFibLBracketText(item) {
  if (!item) return '';
  if (item.rawBracketText) return item.rawBracketText;
  const answers = item.answers || [];
  const prompt = item.prompt || '';
  return prompt.replace(/\[blank_(\d+)\]/g, (full, idxStr) => {
    const idx = parseInt(idxStr, 10);
    return answers[idx] ? `[${answers[idx]}]` : full;
  });
}

/**
 * 4. RO-R: Reorder Paragraphs
 * Deterministic shuffle for student presentation + Adjacent Pairs auto-grader
 */
export function shuffleParagraphsForStudent(paragraphs = [], seedString = 'RO') {
  if (!Array.isArray(paragraphs) || paragraphs.length <= 1) return paragraphs || [];
  const copy = [...paragraphs];
  // Simple deterministic rotation/swap so it's never in exact 1..N sorted order initially
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (i * 7 + seedString.length) % i;
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  // Ensure not accidentally identical to original order
  const isSame = copy.every((p, idx) => p.id === paragraphs[idx].id);
  if (isSame && copy.length >= 2) {
    const first = copy[0];
    copy[0] = copy[copy.length - 1];
    copy[copy.length - 1] = first;
  }
  return copy;
}

export function gradeReorderAdjacentPairs(studentOrderedParagraphs = [], correctParagraphs = []) {
  const maxPairs = Math.max(0, (correctParagraphs?.length || 0) - 1);
  if (!studentOrderedParagraphs || studentOrderedParagraphs.length < 2 || maxPairs === 0) {
    return { earnedPairs: 0, maxPairs, pairMatches: [] };
  }

  // Build set of correct adjacent ID pairs: "idA->idB"
  const correctSorted = [...correctParagraphs].sort((a, b) => (a.order || 0) - (b.order || 0));
  const correctPairsSet = new Set();
  for (let i = 0; i < correctSorted.length - 1; i++) {
    correctPairsSet.add(`${correctSorted[i].id}->${correctSorted[i + 1].id}`);
  }

  let earnedPairs = 0;
  const pairMatches = [];
  for (let i = 0; i < studentOrderedParagraphs.length - 1; i++) {
    const pairKey = `${studentOrderedParagraphs[i].id}->${studentOrderedParagraphs[i + 1].id}`;
    const isCorrect = correctPairsSet.has(pairKey);
    if (isCorrect) earnedPairs++;
    pairMatches.push({
      fromId: studentOrderedParagraphs[i].id,
      toId: studentOrderedParagraphs[i + 1].id,
      correct: isCorrect
    });
  }

  return { earnedPairs, maxPairs, pairMatches };
}

/**
 * 5. HIW: Highlight Incorrect Words
 * Given original true spoken transcript words and a map of { [wordIndex]: replacementDisplayedWord },
 * constructs audioText (spoken truth), displayedText (with incorrect words shown on screen),
 * incorrectWordIndices, and replacements array.
 */
export function buildHiwDataFromTranscript(spokenTranscript = '', wordReplacementsMap = {}) {
  const tokens = spokenTranscript.trim().split(/\s+/).filter(Boolean);
  const incorrectWordIndices = [];
  const replacements = [];

  const displayedTokens = tokens.map((spokenToken, idx) => {
    const replacement = wordReplacementsMap[idx];
    if (replacement && replacement.trim() && replacement.trim() !== spokenToken) {
      // Preserve trailing punctuation if any
      const punctMatch = spokenToken.match(/([.,!?;:]+)$/);
      const trailingPunct = punctMatch ? punctMatch[1] : '';
      const cleanSpoken = spokenToken.replace(/[.,!?;:]+$/, '');
      const cleanDisplayed = replacement.trim().replace(/[.,!?;:]+$/, '');

      incorrectWordIndices.push(idx);
      replacements.push({
        index: idx,
        word: cleanDisplayed,
        spokenWord: cleanSpoken
      });
      return cleanDisplayed + trailingPunct;
    }
    return spokenToken;
  });

  return {
    audioText: tokens.join(' '),
    displayedText: displayedTokens.join(' '),
    incorrectWordIndices,
    replacements,
    wordReplacementsMap
  };
}

/**
 * Reconstruct HIW wordReplacementsMap from an existing HIW item
 */
export function extractHiwMapFromItem(item) {
  if (!item) return { spokenTranscript: '', wordReplacementsMap: {} };
  if (item.wordReplacementsMap && item.audioText) {
    return {
      spokenTranscript: item.audioText,
      wordReplacementsMap: item.wordReplacementsMap
    };
  }
  const spokenTokens = (item.audioText || '').trim().split(/\s+/).filter(Boolean);
  const displayedTokens = (item.displayedText || '').trim().split(/\s+/).filter(Boolean);
  const map = {};

  (item.incorrectWordIndices || []).forEach((idx) => {
    if (displayedTokens[idx]) {
      map[idx] = displayedTokens[idx].replace(/[.,!?;:]+$/, '');
    }
  });

  return {
    spokenTranscript: spokenTokens.join(' '),
    wordReplacementsMap: map
  };
}

/**
 * Compute Google Sheet Metadata (Column C Prompt Words / Total Blanks / Max Pairs) for any item
 */
export function getGoogleSheetItemMetrics(item) {
  if (!item) return { label: 'N/A', value: 0 };
  switch (item.taskType) {
    case 'RA':
      return {
        label: 'Prompt Words (Col C)',
        value: countWords(item.prompt || item.referenceText || '')
      };
    case 'RS':
    case 'WFD':
      return {
        label: 'Sentence Words (Col C)',
        value: countWords(item.audioText || item.referenceSentence || item.referenceText || '')
      };
    case 'FIB-RW':
      return {
        label: 'Total Blanks',
        value: item.options?.length || 0
      };
    case 'FIB-R':
      return {
        label: 'Total Blanks',
        value: item.blanks?.length || 0
      };
    case 'FIB-L':
      return {
        label: 'Total Blanks',
        value: item.answers?.length || 0
      };
    case 'RO-R':
      return {
        label: 'Max Adjacent Pairs',
        value: Math.max(0, (item.paragraphs?.length || 0) - 1)
      };
    case 'HIW':
      return {
        label: 'Incorrect Words',
        value: item.incorrectWordIndices?.length || 0
      };
    default:
      return {
        label: 'Prompt Words',
        value: countWords(item.prompt || item.audioText || '')
      };
  }
}

/**
 * CSV Bulk Export & Import for Question Bank
 */
export function exportQuestionBankToCSV(items = []) {
  const headers = [
    'id',
    'taskType',
    'part',
    'title',
    'prompt',
    'audioText',
    'voiceAccent',
    'audioUrl',
    'imageUrl',
    'prepSeconds',
    'recordSeconds',
    'googleSheetMetric',
    'extraDataJson'
  ];

  const escapeCsv = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((it) => {
    const metric = getGoogleSheetItemMetrics(it);
    const extra = {
      options: it.options,
      blanks: it.blanks,
      wordPool: it.wordPool,
      paragraphs: it.paragraphs,
      answers: it.answers,
      acceptableAnswers: it.acceptableAnswers,
      displayedText: it.displayedText,
      incorrectWordIndices: it.incorrectWordIndices,
      replacements: it.replacements,
      referenceText: it.referenceText,
      referenceSentence: it.referenceSentence,
      referenceNotes: it.referenceNotes
    };

    return [
      it.id,
      it.taskType,
      it.part,
      it.title || '',
      it.prompt || '',
      it.audioText || '',
      it.voiceAccent || 'en-US',
      it.audioUrl || '',
      it.imageUrl || '',
      it.prepSeconds ?? '',
      it.recordSeconds ?? '',
      `${metric.label}: ${metric.value}`,
      JSON.stringify(extra)
    ]
      .map(escapeCsv)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parse CSV text into Question Bank items
 */
export function parseCSVToQuestionItems(csvText = '') {
  const lines = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        currentRow.push(currentCell);
        if (currentRow.some((c) => c.trim() !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some((c) => c.trim() !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim());
  const parsedItems = [];

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx].trim() : '';
    });

    if (!obj.id || !obj.taskType) continue;

    let extra = {};
    if (obj.extraDataJson) {
      try {
        extra = JSON.parse(obj.extraDataJson);
      } catch {
        extra = {};
      }
    }

    const item = {
      id: obj.id,
      taskType: obj.taskType,
      part: obj.part || 'PART_1',
      title: obj.title || `${obj.taskType} Item ${obj.id}`,
      prompt: obj.prompt || '',
      voiceAccent: obj.voiceAccent || 'en-US',
      ...extra
    };

    if (obj.audioText) item.audioText = obj.audioText;
    if (obj.audioUrl) item.audioUrl = obj.audioUrl;
    if (obj.imageUrl) item.imageUrl = obj.imageUrl;
    if (obj.prepSeconds !== '') item.prepSeconds = Number(obj.prepSeconds);
    if (obj.recordSeconds !== '') item.recordSeconds = Number(obj.recordSeconds);

    // Handle bracket notation if user imported raw FIB-RW or FIB-R in prompt
    if (item.taskType === 'FIB-RW' && !item.options && item.prompt.includes('|')) {
      const parsed = parseFibRwBracketText(item.prompt);
      item.rawBracketText = item.prompt;
      item.prompt = parsed.prompt;
      item.options = parsed.options;
    }
    if (item.taskType === 'FIB-R' && !item.blanks && /\[[^\]]+\]/.test(item.prompt)) {
      const parsed = parseFibRBracketText(item.prompt, obj.extraDistractors || '');
      item.rawBracketText = item.prompt;
      item.prompt = parsed.prompt;
      item.blanks = parsed.blanks;
      item.wordPool = parsed.wordPool;
    }

    parsedItems.push(item);
  }

  return parsedItems;
}

