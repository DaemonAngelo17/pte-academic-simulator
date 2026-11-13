/**
 * Official Scoring Equations & Configurable Engine Module
 * Supports Pearson Post-August 7, 2025 standard rubric, legacy averages, and custom formulas.
 */

export const DEFAULT_SCORING_EQUATIONS = {
  version: '2.0',
  lastUpdated: '2026-11-12T00:00:00.000Z',
  profileName: 'Pearson Official (Post-August 7, 2025)',
  description: 'Official post-August 7, 2025 Pearson PTE Academic scoring engine with direct exam point ratio scaling and 1-decimal RA content rounding.',
  
  // 1. GSE Score Scaling & Overall PTE Calculation
  gseScale: {
    minGse: 10,
    maxGse: 90,
    scaleRange: 80,
    overallMethod: 'points_ratio', // 'points_ratio' | 'skills_mean' | 'custom_weighted'
    weights: {
      speaking: 0.25,
      writing: 0.25,
      reading: 0.25,
      listening: 0.25
    },
    targetMaxPoints: {
      part1: 461.0,
      part2: 57.0,
      part3: 74.0,
      total: 592.0,
      speaking: 412.0,
      writing: 122.0,
      reading: 77.0,
      listening: 125.0
    }
  },

  // 2. Read Aloud (RA) Content Scaling
  readAloud: {
    scaleMax: 5.0,
    roundingDecimals: 1, // 1 decimal place (Google Sheets ROUND) vs 0 (integer)
    floorAtZero: true
  },

  // 3. Write from Dictation (WFD) Sequence Alignment
  writeFromDictation: {
    alignmentMethod: 'lcs', // 'lcs' (Order-dependent sequence alignment) | 'bag_of_words'
    ukUsNormalization: true
  },

  // 4. Negative Marking (MCMA-R, MCMA-L, HIW)
  negativeMarking: {
    penaltyMultiplier: 1.0,
    floorAtZero: true
  },

  // 5. Hard Zero Knockouts
  knockouts: {
    speakingZeroContentKnockout: true, // Content 0 knocks out Fluency, Pronunciation & Item Total
    writingZeroFormOrContentKnockout: true // Form 0 or Content 0 knocks out all traits & Item Total
  },

  // 6. CEFR Levels & Performance Classification Thresholds
  cefrThresholds: [
    { minScore: 86, cefr: 'C2', classification: 'Expert User (Superior)' },
    { minScore: 79, cefr: 'C1-C2', classification: 'Very Good User (Superior)' },
    { minScore: 65, cefr: 'B2-C1', classification: 'Good User (Proficient)' },
    { minScore: 58, cefr: 'B2', classification: 'Competent User (Proficient)' },
    { minScore: 47, cefr: 'B2', classification: 'Competent User' },
    { minScore: 31, cefr: 'B1', classification: 'Modest User' },
    { minScore: 0, cefr: 'A1-A2', classification: 'Developing User' }
  ],

  // 7. Official Concordant IELTS Band Table
  ieltsConcordance: [
    { minPte: 90, band: '9.0', label: 'Expert User' },
    { minPte: 86, band: '8.5', label: 'Very Good User' },
    { minPte: 79, band: '8.0', label: 'Very Good User' },
    { minPte: 71, band: '7.5', label: 'Good User' },
    { minPte: 63, band: '7.0', label: 'Good User' },
    { minPte: 55, band: '6.5', label: 'Competent User' },
    { minPte: 47, band: '6.0', label: 'Competent User' },
    { minPte: 39, band: '5.5', label: 'Modest User' },
    { minPte: 31, band: '5.0', label: 'Modest User' },
    { minPte: 24, band: '4.5', label: 'Limited User' },
    { minPte: 0, band: '< 4.5', label: 'Intermittent User' }
  ]
};

const STORAGE_KEY = 'pte_custom_scoring_equations';

/**
 * Loads current scoring equations from localStorage or returns official defaults.
 */
export function loadScoringEquations() {
  if (typeof window === 'undefined') {
    return DEFAULT_SCORING_EQUATIONS;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_SCORING_EQUATIONS,
          ...parsed,
          gseScale: { ...DEFAULT_SCORING_EQUATIONS.gseScale, ...(parsed.gseScale || {}) },
          targetMaxPoints: {
            ...DEFAULT_SCORING_EQUATIONS.gseScale.targetMaxPoints,
            ...((parsed.gseScale && parsed.gseScale.targetMaxPoints) || {})
          },
          readAloud: { ...DEFAULT_SCORING_EQUATIONS.readAloud, ...(parsed.readAloud || {}) },
          writeFromDictation: { ...DEFAULT_SCORING_EQUATIONS.writeFromDictation, ...(parsed.writeFromDictation || {}) },
          negativeMarking: { ...DEFAULT_SCORING_EQUATIONS.negativeMarking, ...(parsed.negativeMarking || {}) },
          knockouts: { ...DEFAULT_SCORING_EQUATIONS.knockouts, ...(parsed.knockouts || {}) },
          cefrThresholds: Array.isArray(parsed.cefrThresholds) ? parsed.cefrThresholds : DEFAULT_SCORING_EQUATIONS.cefrThresholds,
          ieltsConcordance: Array.isArray(parsed.ieltsConcordance) ? parsed.ieltsConcordance : DEFAULT_SCORING_EQUATIONS.ieltsConcordance
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load custom scoring equations from localStorage:', err);
  }
  return DEFAULT_SCORING_EQUATIONS;
}

/**
 * Saves scoring equations to localStorage and triggers backend synchronization.
 */
export async function saveScoringEquations(newEquations) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEquations));
    } catch (err) {
      console.warn('Failed to save equations to localStorage:', err);
    }
  }

  // Attempt backend save
  try {
    const res = await fetch('/api/scoring-equations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEquations)
    });
    return await res.json();
  } catch {
    // offline or static mode
    return { ok: true, offline: true };
  }
}

/**
 * Resets scoring equations to official Pearson post-August 7, 2025 standard.
 */
export async function resetScoringEquations() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  try {
    await fetch('/api/scoring-equations/reset', { method: 'POST' });
  } catch {}
  return DEFAULT_SCORING_EQUATIONS;
}

/**
 * Scales a raw communicative point score into the 10–90 GSE scale using configured equation parameters.
 */
export function scalePteWithConfig(raw, max, config = null) {
  const cfg = config || loadScoringEquations();
  const gse = cfg.gseScale || DEFAULT_SCORING_EQUATIONS.gseScale;
  const minGse = Number(gse.minGse ?? 10);
  const maxGse = Number(gse.maxGse ?? 90);
  const scaleRange = Number(gse.scaleRange ?? (maxGse - minGse));

  if (max <= 0) return minGse;
  const ratio = Math.min(1, Math.max(0, raw / max));
  return Math.min(maxGse, Math.max(minGse, Math.round(minGse + scaleRange * ratio)));
}

/**
 * Calculates the Overall PTE Score using the configured calculation method.
 */
export function calculateOverallPteWithConfig(totalPointsEarned, skillScores = {}, config = null) {
  const cfg = config || loadScoringEquations();
  const gse = cfg.gseScale || DEFAULT_SCORING_EQUATIONS.gseScale;
  const method = gse.overallMethod || 'points_ratio';
  const minGse = Number(gse.minGse ?? 10);
  const maxGse = Number(gse.maxGse ?? 90);

  if (method === 'skills_mean') {
    const { speakingPte = 80, writingPte = 80, readingPte = 80, listeningPte = 80 } = skillScores;
    const mean = Math.round((speakingPte + writingPte + readingPte + listeningPte) / 4);
    return Math.min(maxGse, Math.max(minGse, mean));
  }

  if (method === 'custom_weighted') {
    const w = gse.weights || { speaking: 0.25, writing: 0.25, reading: 0.25, listening: 0.25 };
    const { speakingPte = 80, writingPte = 80, readingPte = 80, listeningPte = 80 } = skillScores;
    const weighted = Math.round(
      (w.speaking * speakingPte) +
      (w.writing * writingPte) +
      (w.reading * readingPte) +
      (w.listening * listeningPte)
    );
    return Math.min(maxGse, Math.max(minGse, weighted));
  }

  // Official default: points_ratio
  const totalMax = Number(gse.targetMaxPoints?.total || 592.0);
  return scalePteWithConfig(totalPointsEarned, totalMax > 0 ? totalMax : 592.0, cfg);
}

/**
 * Computes Read Aloud (RA) Content score from word errors using configured equation parameters.
 */
export function scoreRaContentWithConfig(promptWords, readingErrors = 0, config = null) {
  const cfg = config || loadScoringEquations();
  const ra = cfg.readAloud || DEFAULT_SCORING_EQUATIONS.readAloud;
  const words = Math.max(1, Number(promptWords) || 1);
  const errs = Math.max(0, Number(readingErrors) || 0);
  const scaleMax = Number(ra.scaleMax ?? 5.0);
  const decimals = Number(ra.roundingDecimals ?? 1);

  const errorRatio = Math.min(1, errs / words);
  const factor = Math.pow(10, decimals);
  const calculated = Math.round((1 - errorRatio) * scaleMax * factor) / factor;
  return ra.floorAtZero !== false ? Math.max(0, calculated) : calculated;
}

/**
 * Resolves CEFR Level and Performance Classification from Overall PTE Score using configured thresholds.
 */
export function getCefrWithConfig(overallScore, config = null) {
  const cfg = config || loadScoringEquations();
  const thresholds = cfg.cefrThresholds || DEFAULT_SCORING_EQUATIONS.cefrThresholds;
  const score = Math.round(Number(overallScore) || 10);

  // Sorted descending by minScore
  const sorted = [...thresholds].sort((a, b) => b.minScore - a.minScore);
  for (const t of sorted) {
    if (score >= t.minScore) {
      return { cefrLevel: t.cefr, classification: t.classification };
    }
  }
  return { cefrLevel: 'A1-A2', classification: 'Developing User' };
}

/**
 * Resolves Concordant IELTS Band and Label from Overall PTE Score using configured lookup table.
 */
export function getIeltsWithConfig(overallScore, config = null) {
  const cfg = config || loadScoringEquations();
  const tables = cfg.ieltsConcordance || DEFAULT_SCORING_EQUATIONS.ieltsConcordance;
  const score = Math.round(Number(overallScore) || 10);

  const sorted = [...tables].sort((a, b) => b.minPte - a.minPte);
  for (const row of sorted) {
    if (score >= row.minPte) {
      return { band: row.band, label: row.label };
    }
  }
  return { band: '< 4.5', label: 'Intermittent User' };
}

