import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build48ColumnRow } from './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUBMISSIONS_FILE = path.resolve(__dirname, 'submissions/submissions.json');
const QB_FILE = path.resolve(__dirname, 'src/data/questionBank.json');

const qb = JSON.parse(fs.readFileSync(QB_FILE, 'utf8') || '{"items":[]}');
const items = qb.items || [];

const CANDIDATES_DEF = [
  { id: "PTE-2026-1001", name: "Alexander Wright", target: "Target: PTE 79+ / IELTS 8.0", tier: 82, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1002", name: "Emma Watson", target: "Target: PTE 79+ / IELTS 8.0", tier: 85, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1003", name: "Carlos Mendoza", target: "Target: PTE 65+ / IELTS 7.0", tier: 68, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1004", name: "Priya Sharma", target: "Target: PTE 79+ / IELTS 8.0", tier: 87, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1005", name: "Liam O'Connor", target: "Target: PTE 65+ / IELTS 7.0", tier: 71, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1006", name: "Mei-Ling Zhou", target: "Target: PTE 79+ / IELTS 8.0", tier: 81, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1007", name: "Tariq Al-Mansoor", target: "Target: PTE 58+ / IELTS 6.5", tier: 62, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1008", name: "Sophia Martinez", target: "Target: PTE 79+ / IELTS 8.0", tier: 79, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1009", name: "Daniel Kim", target: "Target: PTE 90 / IELTS 9.0", tier: 90, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1010", name: "Ananya Patel", target: "Target: PTE 79+ / IELTS 8.0", tier: 83, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1011", name: "Lucas Silva", target: "Target: PTE 65+ / IELTS 7.0", tier: 67, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1012", name: "Fatima Zahra", target: "Target: PTE 79+ / IELTS 8.0", tier: 86, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1013", name: "Benjamin Hayes", target: "Target: PTE 65+ / IELTS 7.0", tier: 73, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1014", name: "Chloe Dubois", target: "Target: PTE 79+ / IELTS 8.0", tier: 80, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1015", name: "Kenji Tanaka", target: "Target: PTE 58+ / IELTS 6.5", tier: 59, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1016", name: "Aisha Bello", target: "Target: PTE 79+ / IELTS 8.0", tier: 78, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1017", name: "Matteo Rossi", target: "Target: PTE 65+ / IELTS 7.0", tier: 69, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1018", name: "Svetlana Ivanova", target: "Target: PTE 79+ / IELTS 8.0", tier: 82, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1019", name: "Arjun Nair", target: "Target: PTE 90 / IELTS 9.0", tier: 89, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1020", name: "Isabella Santos", target: "Target: PTE 65+ / IELTS 7.0", tier: 72, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1021", name: "Henrik Lindqvist", target: "Target: PTE 79+ / IELTS 8.0", tier: 84, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1022", name: "Grace Adebayo", target: "Target: PTE 79+ / IELTS 8.0", tier: 81, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1023", name: "Nathan Chen", target: "Target: PTE 65+ / IELTS 7.0", tier: 66, evaluator: "Prof. Marcus Thorne" },
  { id: "PTE-2026-1024", name: "Olivia Taylor", target: "Target: PTE 79+ / IELTS 8.0", tier: 88, evaluator: "Dr. Evelyn Vance" },
  { id: "PTE-2026-1025", name: "Rahul Verma", target: "Target: PTE 58+ / IELTS 6.5", tier: 64, evaluator: "Prof. Marcus Thorne" }
];

function getIeltsBand(score) {
  if (score >= 90) return 9.0;
  if (score >= 86) return 8.5;
  if (score >= 79) return 8.0;
  if (score >= 71) return 7.5;
  if (score >= 63) return 7.0;
  if (score >= 55) return 6.5;
  if (score >= 47) return 6.0;
  if (score >= 39) return 5.5;
  if (score >= 31) return 5.0;
  if (score >= 24) return 4.5;
  return 4.0;
}

const sampleSubmissions = CANDIDATES_DEF.map((cand, idx) => {
  const overall = cand.tier;
  const ieltsBand = getIeltsBand(overall);
  
  // Varied communicative skill scores around overall
  const spk = Math.min(90, Math.max(10, overall + ((idx % 3) - 1) * 2));
  const wrt = Math.min(90, Math.max(10, overall + (((idx + 1) % 3) - 1) * 3));
  const rd = Math.min(90, Math.max(10, overall + (((idx + 2) % 3) - 1) * 2));
  const lst = Math.min(90, Math.max(10, overall + ((idx % 2 === 0 ? 1 : -1))));

  const scaleRatio = (overall - 10) / 80;

  // Raw point subtotals
  const spkRaw = Math.round((280 + scaleRatio * (370 - 280)) * 10) / 10;
  const wrtRaw = Math.round((80 + scaleRatio * (120 - 80)) * 10) / 10;
  const rdRaw = Math.round((45 + scaleRatio * (72 - 45)) * 10) / 10;
  const lstRaw = Math.round((75 + scaleRatio * (115 - 75)) * 10) / 10;

  const part1Raw = Math.round((spkRaw * 0.75 + wrtRaw * 0.8) * 10) / 10;
  const part2Raw = Math.round(rdRaw * 0.75 * 10) / 10;
  const part3Raw = Math.round(lstRaw * 0.65 * 10) / 10;

  const totalPoints = Math.round((part1Raw + part2Raw + part3Raw) * 10) / 10;
  const totalMax = 592.0;

  // Task subtotals
  const p1_ra = Math.round((60 + scaleRatio * 25) * 10) / 10;
  const p1_rs = Math.round((80 + scaleRatio * 35) * 10) / 10;
  const p1_di = Math.round((60 + scaleRatio * 25) * 10) / 10;
  const p1_rl = Math.round((20 + scaleRatio * 9) * 10) / 10;
  const p1_sgd = Math.round((19 + scaleRatio * 9) * 10) / 10;
  const p1_rts = Math.round((20 + scaleRatio * 8.5) * 10) / 10;
  const p1_asq = Math.round(4.0 + scaleRatio * 1.0);
  const p1_swt = Math.round((13 + scaleRatio * 4) * 10) / 10;
  const p1_we = Math.round((17 + scaleRatio * 6) * 10) / 10;
  const p2_read = part2Raw;
  const p3_list = part3Raw;

  // Generate item responses and manualScores for each QB item
  const responses = {};
  const manualScores = {};

  items.forEach((item) => {
    const t = item.taskType;
    if (['RA', 'RS', 'DI', 'RL', 'SGD', 'RTS'].includes(t)) {
      const maxC = t === 'RS' ? 3 : (['DI', 'RL', 'SGD', 'RTS'].includes(t) ? 6 : 5);
      const c = Math.max(1, Math.min(maxC, Math.round(maxC * scaleRatio * 2) / 2));
      const f = Math.max(1, Math.min(5, Math.round(5 * scaleRatio * 2) / 2));
      const p = Math.max(1, Math.min(5, Math.round(5 * scaleRatio * 2) / 2));
      responses[item.id] = {
        transcript: item.prompt || item.passage || "Fluently spoken candidate response.",
        recordedAudio: { durationRecorded: 28 },
        wordCount: 35,
        autoScore: { contentScore: c, fluencyScore: f, pronunciationScore: p }
      };
      manualScores[item.id] = {
        content: c,
        fluency: f,
        pronunciation: p,
        total: c + f + p,
        comments: `Solid phrasing and phoneme rhythm corresponding to ${overall} PTE level.`,
        ratedBy: cand.evaluator
      };
    } else if (t === 'ASQ') {
      const sc = scaleRatio > 0.6 ? 1 : 0;
      responses[item.id] = { transcript: item.answer || "Correct response", autoScore: { score: sc } };
      manualScores[item.id] = { content: sc, fluency: 0, pronunciation: 0, total: sc, comments: sc === 1 ? "Accurate lexical recall." : "Missed target term.", ratedBy: cand.evaluator };
    } else if (t === 'SWT') {
      const form = 1;
      const content = scaleRatio > 0.5 ? 2 : 1;
      const grammar = scaleRatio > 0.6 ? 2 : 1;
      const vocab = scaleRatio > 0.6 ? 2 : 1;
      responses[item.id] = {
        text: "The synthesized passage clearly articulates that systematic technological transformation requires disciplined infrastructure investments across enterprise organizations.",
        wordCount: 18,
        sentenceCount: 1,
        autoMetrics: { formScore: form }
      };
      manualScores[item.id] = {
        content, form, grammar, vocabulary: vocab, total: content + form + grammar + vocab,
        comments: "Single-sentence constraints fully observed. Academic tone maintained.",
        ratedBy: cand.evaluator
      };
    } else if (t === 'WE') {
      responses[item.id] = {
        text: "In contemporary society, the relentless advancement of digital innovation has transformed traditional industrial frameworks... [Complete 254-word analytical essay discussing balanced socioeconomic trade-offs].",
        wordCount: 254
      };
      manualScores[item.id] = {
        content: 3, form: 2, devCoherence: 2, linguisticRange: 2, grammar: 2, vocabulary: 2, spelling: 2,
        total: 15,
        comments: "Logical paragraph progression, cohesive transitions, and broad lexical repertoire.",
        ratedBy: cand.evaluator
      };
    } else if (t === 'SST') {
      responses[item.id] = {
        text: "The lecture emphasized that sustainable economic progress hinges on the seamless integration of technical research with public policy initiatives.",
        wordCount: 21
      };
      manualScores[item.id] = {
        content: 2, form: 2, grammar: 2, vocabulary: 2, spelling: 2, total: 10,
        comments: "Succinct synopsis capturing the core speaker thesis.",
        ratedBy: cand.evaluator
      };
    } else if (t === 'FIB-RW' || t === 'FIB-R' || t === 'FIB-L') {
      const totalB = item.blanks?.length || item.answers?.length || 4;
      const correctB = Math.max(1, Math.round(totalB * scaleRatio));
      responses[item.id] = { autoScore: { correctBlanks: correctB, totalBlanks: totalB } };
    } else if (t === 'MCMA-R' || t === 'MCMA-L') {
      const corr = scaleRatio > 0.6 ? 2 : 1;
      responses[item.id] = { autoScore: { correctChosen: corr, incorrectChosen: 0, maxPoints: 2 } };
    } else if (t === 'RO-R') {
      responses[item.id] = { autoScore: { correctAdjacentPairs: scaleRatio > 0.6 ? 3 : 2, maxPoints: 3 } };
    } else if (t === 'MCSA-R' || t === 'MCSA-L' || t === 'HCS' || t === 'SMW') {
      responses[item.id] = { autoScore: { score: scaleRatio > 0.5 ? 1 : 0 } };
    } else if (t === 'HIW') {
      responses[item.id] = { autoScore: { correctClicks: 3, incorrectClicks: 0, totalIncorrectWords: 3 } };
    } else if (t === 'WFD') {
      const totalWords = item.audioText ? item.audioText.trim().split(/\s+/).length : 9;
      const corrWords = Math.max(4, Math.round(totalWords * scaleRatio));
      responses[item.id] = { autoScore: { correctWords: corrWords, totalWords } };
    }
  });

  const daysAgo = 25 - idx;
  const dateObj = new Date(Date.now() - daysAgo * 86400000);
  const dateStr = dateObj.toISOString().slice(0, 10);
  const timeStr = dateObj.toISOString().replace('T', ' ').slice(0, 19);

  const sub = {
    id: `SUB-2026-${String(idx + 1).padStart(3, '0')}`,
    studentId: cand.id,
    studentName: cand.name,
    targetScore: cand.target,
    sessionCode: `PTE-LIVE-${dateStr.replace(/-/g, '')}-${cand.id.slice(-4)}`,
    submittedAt: dateObj.toISOString(),
    testDate: dateStr,
    evaluatorName: cand.evaluator,
    gradingStatus: 'graded',
    scope: 'all',
    totalItems: items.length,
    responses,
    manualScores,
    computedScores: {
      overallPte: overall,
      ieltsBand: ieltsBand,
      ielts: { band: ieltsBand },
      speakingPte: spk,
      speakingRaw: spkRaw,
      writingPte: wrt,
      writingRaw: wrtRaw,
      readingPte: rd,
      readingRaw: rdRaw,
      listeningPte: lst,
      listeningRaw: lstRaw,
      part1Raw,
      part1Max: 461.0,
      part1ZeroKnockouts: 0,
      part2Raw,
      part2Max: 57.0,
      part2NegativeFloors: 0,
      part3Raw,
      part3Max: 74.0,
      part3FloorsApplied: 0,
      totalPointsEarned: totalPoints,
      totalMaxPoints: totalMax,
      taskTotals: {
        p1_readAloud: p1_ra,
        p1_repeatSentence: p1_rs,
        p1_describeImage: p1_di,
        p1_retellLecture: p1_rl,
        p1_groupDiscussion: p1_sgd,
        p1_situation: p1_rts,
        p1_shortQuestion: p1_asq,
        p1_swt: p1_swt,
        p1_essay: p1_we,
        p2_readingTotal: p2_read,
        p3_listeningTotal: p3_list
      }
    }
  };

  // Build the exact 48-column database row
  sub.row = build48ColumnRow(sub, sub.computedScores);
  return sub;
});

fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(sampleSubmissions, null, 2), 'utf8');
console.log(`Generated and saved ${sampleSubmissions.length} complete candidate submissions to ${SUBMISSIONS_FILE}`);

