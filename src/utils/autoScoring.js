/**
 * Deterministic Auto-Scoring Engine for PTE Academic Part 2 (Reading) & Part 3 (Listening)
 * Aligned with official Pearson scoring criteria and Google Sheet raw column metrics.
 */

import { countWords } from '../config/pteRules.js';
import { scoreRaContentWithConfig } from '../config/scoringEquations.js';

// Pearson-accepted UK / Australian vs US spelling normalization dictionary
export const SPELLING_NORMALIZATION = {
  colour: 'color', colours: 'colors',
  flavour: 'flavor', flavours: 'flavors',
  honour: 'honor', honours: 'honors',
  humour: 'humor', humours: 'humors',
  labour: 'labor', labours: 'labors',
  neighbour: 'neighbor', neighbours: 'neighbors',
  theatre: 'theater', theatres: 'theaters',
  centre: 'center', centres: 'centers',
  metre: 'meter', metres: 'meters',
  fibre: 'fiber', fibres: 'fibers',
  organise: 'organize', organised: 'organized', organises: 'organizes', organising: 'organizing', organisation: 'organization', organisations: 'organizations',
  recognise: 'recognize', recognised: 'recognized', recognises: 'recognizes', recognising: 'recognizing',
  analyse: 'analyze', analysed: 'analyzed', analyses: 'analyzes', analysing: 'analyzing',
  travelled: 'traveled', travelling: 'traveling', traveller: 'traveler', travellers: 'travelers',
  programme: 'program', programmes: 'programs',
  defence: 'defense', defences: 'defenses', offence: 'offense', offences: 'offenses',
  licence: 'license', licences: 'licenses',
  practise: 'practice', practises: 'practices',
  catalogue: 'catalog', catalogues: 'catalogs',
  dialogue: 'dialog', dialogues: 'dialogs',
  judgment: 'judgement', judgments: 'judgements',
  aging: 'ageing',
  fulfill: 'fulfil', fulfillment: 'fulfilment'
};

// Normalization helper for punctuation & casing where applicable
export function cleanToken(str = '') {
  return str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '');
}

export function normalizeSpelling(str = '') {
  const token = cleanToken(str);
  return SPELLING_NORMALIZATION[token] || token;
}

/**
 * Read Aloud (RA) Content Scaling Formula:
 * Converts raw word errors into a 0–5 Scaled Content score rounded to 1 decimal place.
 * Formula matches Google Sheet: ROUND(((PromptWords - ReadingErrors) / PromptWords) * 5, 1)
 */
export function scoreRaContent(promptWords, readingErrors = 0, config = null) {
  return scoreRaContentWithConfig(promptWords, readingErrors, config);
}

/**
 * 1. FIB-RW: Reading & Writing Fill in the Blanks (Dropdown)
 * Returns: { totalBlanks, correctBlanks, incorrectBlanks, breakdown }
 */
export function scoreFibRw(item, studentResponse = {}) {
  const options = item.options || [];
  const studentBlanks = studentResponse.blanks || {};
  const totalBlanks = options.length;
  const pointsPerCorrect = item.scoringOverrides?.pointsPerCorrect ?? item.pointsPerCorrect ?? 1;

  let correctBlanks = 0;
  const breakdown = [];

  options.forEach((opt) => {
    const studentChoice = studentBlanks[opt.id] || '';
    const answer = opt.answer || opt.choices?.[0] || '';
    const isCorrect = studentChoice.trim().toLowerCase() === answer.trim().toLowerCase();
    if (isCorrect) correctBlanks++;

    breakdown.push({
      blankId: opt.id,
      studentChoice,
      correctAnswer: answer,
      isCorrect
    });
  });

  const incorrectBlanks = Math.max(0, totalBlanks - correctBlanks);
  const rawScore = correctBlanks * pointsPerCorrect;

  return {
    totalBlanks,
    correctBlanks,
    incorrectBlanks,
    rawScore,
    breakdown
  };
}

/**
 * 2. MCMA-R / MCMA-L: Multiple Choice, Multiple Answers
 * Negative Marking: +1 per correct option chosen, -1 per incorrect option chosen.
 * Floor rule: MAX(0, correctChosen - incorrectChosen).
 * Returns: { correctChosen, incorrectChosen, finalScore, maxPoints, correctKeys, selectedKeys }
 */
export function scoreMcma(item, studentResponse = {}) {
  const options = item.options || [];
  const selected = studentResponse.selected || [];
  const correctOptions = options.filter((o) => !!o.correct);
  const correctKeys = correctOptions.map((o) => o.id);
  const pointsPerCorrect = item.scoringOverrides?.pointsPerCorrect ?? item.pointsPerCorrect ?? 1;
  const penaltyPerIncorrect = item.scoringOverrides?.penaltyPerIncorrect ?? item.penaltyPerIncorrect ?? 1;
  const scoreFloor = item.scoringOverrides?.scoreFloor ?? item.scoreFloor ?? 0;

  let correctChosen = 0;
  let incorrectChosen = 0;

  selected.forEach((selId) => {
    if (correctKeys.includes(selId)) {
      correctChosen++;
    } else {
      incorrectChosen++;
    }
  });

  const netScore = (correctChosen * pointsPerCorrect) - (incorrectChosen * penaltyPerIncorrect);
  const finalScore = Math.max(scoreFloor, netScore);

  return {
    correctChosen,
    incorrectChosen,
    finalScore,
    maxPoints: correctKeys.length * pointsPerCorrect,
    correctKeys,
    selectedKeys: selected
  };
}

/**
 * 3. RO-R: Reorder Paragraphs (Adjacent Pairs Algorithm)
 * Awards +1 point for each adjacent pair in the correct sequence.
 * Max Points = Total Sentences - 1.
 * Returns: { correctAdjacentPairs, maxPoints, totalSentences, pairMatches }
 */
export function scoreReorderParagraphs(item, studentOrderedParagraphs = []) {
  const correctSorted = [...(item.paragraphs || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const totalSentences = correctSorted.length;
  const maxPoints = Math.max(0, totalSentences - 1);

  if (!studentOrderedParagraphs || studentOrderedParagraphs.length < 2 || maxPoints === 0) {
    return {
      correctAdjacentPairs: 0,
      maxPoints,
      totalSentences,
      pairMatches: []
    };
  }

  // Set of correct consecutive pairs: "idA->idB"
  const correctPairsSet = new Set();
  for (let i = 0; i < correctSorted.length - 1; i++) {
    correctPairsSet.add(`${correctSorted[i].id}->${correctSorted[i + 1].id}`);
  }

  let correctAdjacentPairs = 0;
  const pairMatches = [];

  for (let i = 0; i < studentOrderedParagraphs.length - 1; i++) {
    const fromId = studentOrderedParagraphs[i].id;
    const toId = studentOrderedParagraphs[i + 1].id;
    const pairKey = `${fromId}->${toId}`;
    const isMatch = correctPairsSet.has(pairKey);
    if (isMatch) correctAdjacentPairs++;

    pairMatches.push({
      pairIndex: i + 1,
      fromId,
      toId,
      isMatch
    });
  }

  return {
    correctAdjacentPairs,
    maxPoints,
    totalSentences,
    pairMatches
  };
}

/**
 * 4. FIB-R: Reading Fill in the Blanks (Drag & Drop)
 * Returns: { totalBlanks, correctBlanks, incorrectBlanks, breakdown }
 */
export function scoreFibR(item, studentResponse = {}) {
  const blanks = item.blanks || [];
  const placedWords = studentResponse.placedWords || {};
  const totalBlanks = blanks.length;

  let correctBlanks = 0;
  const breakdown = [];

  blanks.forEach((targetWord, idx) => {
    const blankId = `blank_${idx}`;
    const studentWord = placedWords[blankId] || '';
    const answer = typeof targetWord === 'string' ? targetWord : (targetWord?.answer || targetWord?.text || '');
    const isCorrect = studentWord.trim().toLowerCase() === answer.trim().toLowerCase();
    if (isCorrect) correctBlanks++;

    breakdown.push({
      blankId,
      studentWord,
      targetWord: answer,
      isCorrect
    });
  });

  const incorrectBlanks = Math.max(0, totalBlanks - correctBlanks);

  return {
    totalBlanks,
    correctBlanks,
    incorrectBlanks,
    rawScore: correctBlanks,
    breakdown
  };
}

/**
 * 5. MCSA-R / MCSA-L / HCS / SMW: Multiple Choice, Single Answer
 * Returns: { candidateSelected, correctAnswerKey, isCorrect, rawScore }
 */
export function scoreMcsa(item, studentResponse = {}) {
  const candidateSelected = studentResponse.selected || '';
  const correctOption = (item.options || []).find((o) => !!o.correct);
  const correctAnswerKey = correctOption ? correctOption.id : '';

  const isCorrect =
    Boolean(candidateSelected) &&
    Boolean(correctAnswerKey) &&
    candidateSelected.trim().toUpperCase() === correctAnswerKey.trim().toUpperCase();

  return {
    candidateSelected,
    correctAnswerKey,
    isCorrect,
    rawScore: isCorrect ? 1 : 0
  };
}

/**
 * 6. FIB-L: Listening Fill in the Blanks (Type-In)
 * Exact spelling check against answer key with UK/US variant normalization.
 * Returns: { totalBlanks, correctlySpelledWords, incorrectWords, breakdown }
 */
export function scoreFibL(item, studentResponse = {}) {
  const answers = item.answers || [];
  const studentAnswers = studentResponse.answers || {};
  const totalBlanks = answers.length;

  let correctlySpelledWords = 0;
  const breakdown = [];

  answers.forEach((expectedWord, idx) => {
    const blankId = `blank_${idx}`;
    const candidateWord = (studentAnswers[blankId] || '').trim();
    // PTE spelling: matches exact word or standard UK/US equivalent (e.g. colour/color)
    const isExact = candidateWord.toLowerCase() === expectedWord.trim().toLowerCase();
    const isNormalized = normalizeSpelling(candidateWord) === normalizeSpelling(expectedWord);
    const isCorrect = isExact || isNormalized;
    if (isCorrect) correctlySpelledWords++;

    breakdown.push({
      blankId,
      candidateWord,
      expectedWord,
      isCorrect,
      matchedViaVariant: !isExact && isNormalized
    });
  });

  const incorrectWords = Math.max(0, totalBlanks - correctlySpelledWords);

  return {
    totalBlanks,
    correctlySpelledWords,
    incorrectWords,
    rawScore: correctlySpelledWords,
    breakdown
  };
}

/**
 * 7. HIW: Highlight Incorrect Words
 * Negative marking: +1 for clicking a word that differed from audio,
 * -1 for clicking a normal/correct word.
 * Floor rule: MAX(0, correctClicks - incorrectClicks).
 * Returns: { totalIncorrectWords, correctClicks, incorrectClicks, finalScore, breakdown }
 */
export function scoreHiw(item, studentResponse = {}) {
  const incorrectWordIndices = item.incorrectWordIndices || [];
  const selectedIndices = studentResponse.selectedIndices || [];
  const totalIncorrectWords = incorrectWordIndices.length;

  let correctClicks = 0;
  let incorrectClicks = 0;

  selectedIndices.forEach((idx) => {
    if (incorrectWordIndices.includes(idx)) {
      correctClicks++;
    } else {
      incorrectClicks++;
    }
  });

  const net = correctClicks - incorrectClicks;
  const finalScore = Math.max(0, net);

  return {
    totalIncorrectWords,
    correctClicks,
    incorrectClicks,
    finalScore,
    selectedIndices,
    incorrectWordIndices
  };
}

/**
 * 8. WFD: Write from Dictation Sequence Alignment Grader (LCS)
 * Evaluates student typed sentence against dictated sentence using order-dependent
 * sequence alignment (Longest Common Subsequence / LCS).
 * Words must be spelled accurately in the correct sequence to earn +1 point each,
 * honoring official Pearson guidelines accepting both UK and US standard variants (e.g., colour/color).
 * Returns: { totalWords, correctWords, incorrectWords, rawScore, referenceWords, studentWords, matchedWords, extraWords }
 */
export function scoreWfd(item, studentResponse = {}) {
  const referenceText = item.audioText || item.referenceSentence || item.prompt || '';
  const studentText = studentResponse.text || '';

  // Tokenize reference sentence
  const refTokens = referenceText
    .trim()
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  const studentTokens = studentText
    .trim()
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  const totalWords = refTokens.length;
  const m = refTokens.length;
  const n = studentTokens.length;

  if (m === 0 || n === 0) {
    return {
      totalWords,
      correctWords: 0,
      incorrectWords: totalWords,
      rawScore: 0,
      referenceWords: refTokens,
      studentWords: studentTokens,
      matchedWords: [],
      extraWords: studentTokens
    };
  }

  // Token match predicate with Pearson UK/US normalization
  function tokensMatch(t1, t2) {
    if (!t1 || !t2) return false;
    return t1 === t2 || normalizeSpelling(t1) === normalizeSpelling(t2);
  }

  // DP table for Longest Common Subsequence (order-dependent sequence alignment)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensMatch(refTokens[i - 1], studentTokens[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const correctWords = dp[m][n];

  // Backtrack to extract the ordered matched sequence and extra words
  let i = m;
  let j = n;
  const matchedTokens = [];
  const matchedStudentIndices = new Set();

  while (i > 0 && j > 0) {
    if (tokensMatch(refTokens[i - 1], studentTokens[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + 1) {
      matchedTokens.unshift(studentTokens[j - 1]);
      matchedStudentIndices.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const extraWords = studentTokens.filter((_, idx) => !matchedStudentIndices.has(idx));
  const incorrectWords = Math.max(0, totalWords - correctWords);

  return {
    totalWords,
    correctWords,
    incorrectWords,
    rawScore: correctWords,
    referenceWords: refTokens,
    studentWords: studentTokens,
    matchedWords: matchedTokens,
    extraWords
  };
}

/**
 * Unified Auto-Scoring Dispatcher for any Item
 */
export function autoScoreItem(item, studentResponse = {}) {
  if (!item) return { rawScore: 0 };

  // 1. Direct taskType mapping
  switch (item.taskType) {
    case 'FIB-RW':
      return scoreFibRw(item, studentResponse);
    case 'MCMA-R':
    case 'MCMA-L':
      return scoreMcma(item, studentResponse);
    case 'RO-R': {
      const order = studentResponse.orderedParagraphs || item.paragraphs || [];
      return scoreReorderParagraphs(item, order);
    }
    case 'FIB-R':
      return scoreFibR(item, studentResponse);
    case 'MCSA-R':
    case 'MCSA-L':
    case 'HCS':
    case 'SMW':
      return scoreMcsa(item, studentResponse);
    case 'FIB-L':
      return scoreFibL(item, studentResponse);
    case 'HIW':
      return scoreHiw(item, studentResponse);
    case 'WFD':
      return scoreWfd(item, studentResponse);
    default:
      break;
  }

  // 2. Archetype-based scoring fallback for custom question types
  const archetype = item.archetype || '';
  const scoringMode = item.scoringOverrides?.scoringMode ?? item.scoringMode ?? '';

  if (archetype === 'multiple_choice' || scoringMode === 'negative_marking') {
    return Array.isArray(studentResponse.selected)
      ? scoreMcma(item, studentResponse)
      : scoreMcsa(item, studentResponse);
  }

  if (archetype === 'inline_blanks' || scoringMode === 'points_per_blank') {
    return scoreFibRw(item, studentResponse);
  }

  if (archetype === 'reorder' || scoringMode === 'adjacent_pairs') {
    const order = studentResponse.orderedParagraphs || item.paragraphs || [];
    return scoreReorderParagraphs(item, order);
  }

  if (archetype === 'audio_cloze') {
    if (studentResponse.selectedIndices) return scoreHiw(item, studentResponse);
    if (studentResponse.answers) return scoreFibL(item, studentResponse);
    return scoreWfd(item, studentResponse);
  }

  return { rawScore: 0 };
}
