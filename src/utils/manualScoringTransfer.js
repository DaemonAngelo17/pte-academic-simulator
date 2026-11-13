/**
 * PTE Academic Manual Scoring Sheet & Printable Report Card Data Bridge
 * Aligned with Pearson PTE Academic Manual Scoring System Workbook:
 * - Master Dashboard (gid=0)
 * - Part 1: Spk & Wrt (gid=1)
 * - Part 2: Reading (gid=2)
 * - Part 3: Listening (gid=3)
 * - Candidate Report Card (gid=709428871)
 */

import { computeSubmissionSummary, calculateItemMetrics, getIeltsConcordance } from './scoringEngine.js';

/**
 * Standardizes submission data and extracts item-by-item manual scoring matrices.
 */
export function buildManualScoringWorkbookData(submission, manualScores = {}, questionBankItems = []) {
  const s = submission || {};
  const effManualScores = manualScores || s.manualScores || {};
  const summary = s.computedScores || computeSubmissionSummary(s, effManualScores, questionBankItems) || {};

  const items = s.examItems && s.examItems.length > 0 ? s.examItems : questionBankItems;
  const itemMetrics = summary.itemMetrics || {};

  // Group items by taskType
  const byType = {};
  items.forEach((item) => {
    if (!byType[item.taskType]) byType[item.taskType] = [];
    const resp = s.responses?.[item.id] || {};
    const sc = effManualScores[item.id] || {};
    const metrics = itemMetrics[item.id] || calculateItemMetrics(item, resp, sc);
    byType[item.taskType].push({
      item,
      response: resp,
      manualScore: sc,
      metrics
    });
  });

  // Candidate metadata
  const candidateName = s.studentName || 'Elena Rostova';
  const candidateId = s.studentId || 'PTE-2026-9042';
  const testDate = s.testDate || (s.submittedAt ? s.submittedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const leadEvaluator = s.evaluatorName || (s.ratedBy ? s.ratedBy : 'Dr. Evelyn Vance');
  const targetScore = s.targetScore || 'Target: PTE 79+ / IELTS 8.0';
  const sessionCode = s.sessionCode || `PTE-LIVE-${testDate.replace(/-/g, '')}-9042`;
  const gradingStatus = s.gradingStatus === 'graded' ? '✅ Completed' : 'Completed';

  // Overall & Section scores
  const overallPte = Math.round(Number(summary.overallPte || 80));
  const ieltsInfo = getIeltsConcordance(overallPte);
  const ieltsBand = summary.ielts?.band || ieltsInfo.band || '8.0';
  const cefrLevel = summary.cefrLevel || 'C1-C2';
  const classification = summary.classification || 'Very Good User (Superior)';

  const part1Earned = Number(summary.part1Raw ?? 398.1);
  const part1Max = Number(summary.part1Max ?? 461.0);
  const part2Earned = Number(summary.part2Raw ?? 51.0);
  const part2Max = Number(summary.part2Max ?? 57.0);
  const part3Earned = Number(summary.part3Raw ?? 68.0);
  const part3Max = Number(summary.part3Max ?? 74.0);

  const totalEarned = Math.round((part1Earned + part2Earned + part3Earned) * 10) / 10;
  const totalMax = Math.round((part1Max + part2Max + part3Max) * 10) / 10;
  const masteryPct = totalMax > 0 ? (totalEarned / totalMax) * 100 : 87.3;

  const spkRaw = Number(summary.speakingRaw ?? 353.1);
  const wrtRaw = Number(summary.writingRaw ?? 114.0);
  const rdRaw = Number(summary.readingRaw ?? 68.0);
  const lstRaw = Number(summary.listeningRaw ?? 111.0);

  const spkPte = Number(summary.speakingPte ?? 79);
  const wrtPte = Number(summary.writingPte ?? 85);
  const rdPte = Number(summary.readingPte ?? 81);
  const lstPte = Number(summary.listeningPte ?? 81);

  // ==========================================
  // PART 1: SPEAKING & WRITING (Rows 6 to 73)
  // ==========================================
  // RA: rows 6–11 (6 items)
  const raRows = [];
  const raList = byType['RA'] || [];
  for (let i = 0; i < 6; i++) {
    const entry = raList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const promptWords = item.promptWords || (item.text ? item.text.trim().split(/\s+/).filter(Boolean).length : 50);
    const readingErrors = sc.readingErrors !== undefined ? Number(sc.readingErrors) : (resp.autoMetrics?.readingErrors ?? 2);
    const rawContent = Math.max(0, promptWords - readingErrors);
    const scaledContent = Math.max(0, Math.round(((promptWords - readingErrors) / promptWords) * 50) / 10);
    const pron = sc.pronunciation !== undefined ? Number(sc.pronunciation) : (resp.autoScore?.pronunciationScore ?? 4.5);
    const fluency = sc.fluency !== undefined ? Number(sc.fluency) : (resp.autoScore?.fluencyScore ?? 4.5);
    const note = sc.note || resp.note || (i === 2 ? 'Exemplary' : 'Standard');
    const itemTotal = Math.round((scaledContent + pron + fluency) * 10) / 10;
    raRows.push({
      id: item.id || `RA-0${i + 1}`,
      title: item.title || `Text 0${i + 1}: ${item.prompt?.slice(0, 35) || 'Read Aloud Passage'}`,
      promptWords,
      readingErrors,
      rawContent,
      scaledContent,
      pron,
      fluency,
      note,
      validation: scaledContent > 0 ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // RS: rows 16–25 (10 items)
  const rsRows = [];
  const rsList = byType['RS'] || [];
  for (let i = 0; i < 10; i++) {
    const entry = rsList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const content = sc.content !== undefined ? Number(sc.content) : (resp.autoScore?.contentScore ?? (i % 3 === 0 ? 3 : 2));
    const pron = sc.pronunciation !== undefined ? Number(sc.pronunciation) : (resp.autoScore?.pronunciationScore ?? 4.5);
    const fluency = sc.fluency !== undefined ? Number(sc.fluency) : (resp.autoScore?.fluencyScore ?? 4.0);
    const note = sc.note || resp.note || (content === 3 ? '100% sequence' : '>=50% sequence');
    const isKo = content === 0;
    const itemTotal = isKo ? 0 : Math.round((content + pron + fluency) * 10) / 10;
    rsRows.push({
      id: item.id || `RS-${String(i + 1).padStart(2, '0')}`,
      prompt: item.audioText || item.prompt || 'Sentence prompt transcript',
      content,
      pron,
      fluency,
      note,
      validation: !isKo ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // DI: rows 30–35 (6 items)
  const diRows = [];
  const diList = byType['DI'] || [];
  for (let i = 0; i < 6; i++) {
    const entry = diList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const content = sc.content !== undefined ? Number(sc.content) : (resp.autoScore?.contentScore ?? 5);
    const pron = sc.pronunciation !== undefined ? Number(sc.pronunciation) : (resp.autoScore?.pronunciationScore ?? 4.5);
    const fluency = sc.fluency !== undefined ? Number(sc.fluency) : (resp.autoScore?.fluencyScore ?? 4.5);
    const note = sc.note || resp.note || 'Main trend + key data points';
    const isKo = content === 0;
    const itemTotal = isKo ? 0 : Math.round((content + pron + fluency) * 10) / 10;
    diRows.push({
      id: item.id || `DI-0${i + 1}`,
      title: item.title || `Graphic 0${i + 1}: ${item.type || 'Chart/Graph'}`,
      content,
      pron,
      fluency,
      note,
      validation: !isKo ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // RL: rows 40–41 (2 items)
  const rlRows = [];
  const rlList = byType['RL'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = rlList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const content = sc.content !== undefined ? Number(sc.content) : (resp.autoScore?.contentScore ?? 5);
    const pron = sc.pronunciation !== undefined ? Number(sc.pronunciation) : (resp.autoScore?.pronunciationScore ?? 4.5);
    const fluency = sc.fluency !== undefined ? Number(sc.fluency) : (resp.autoScore?.fluencyScore ?? 4.5);
    const note = sc.note || resp.note || 'Synthesized lecture concepts';
    const isKo = content === 0;
    const itemTotal = isKo ? 0 : Math.round((content + pron + fluency) * 10) / 10;
    rlRows.push({
      id: item.id || `RL-0${i + 1}`,
      title: item.title || `Lecture 0${i + 1}: ${item.topic || 'Academic Topic'}`,
      content,
      pron,
      fluency,
      note,
      validation: !isKo ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // SGD: rows 46–47 (2 items)
  const sgdRows = [];
  const sgdList = byType['SGD'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = sgdList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const content = sc.content !== undefined ? Number(sc.content) : (resp.autoScore?.contentScore ?? (i === 0 ? 5 : 4));
    const pron = sc.pronunciation !== undefined ? Number(sc.pronunciation) : (resp.autoScore?.pronunciationScore ?? (i === 0 ? 4.5 : 4.0));
    const fluency = sc.fluency !== undefined ? Number(sc.fluency) : (resp.autoScore?.fluencyScore ?? 4.0);
    const note = sc.note || resp.note || "All speakers' viewpoints covered";
    const isKo = content === 0;
    const itemTotal = isKo ? 0 : Math.round((content + pron + fluency) * 10) / 10;
    sgdRows.push({
      id: item.id || `SGD-0${i + 1}`,
      title: item.title || `Discussion: ${item.scenario || 'Topic'}`,
      content,
      pron,
      fluency,
      note,
      validation: !isKo ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // RTS: rows 52–53 (2 items)
  const rtsRows = [];
  const rtsList = byType['RTS'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = rtsList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const content = sc.content !== undefined ? Number(sc.content) : (resp.autoScore?.contentScore ?? 5);
    const pron = sc.pronunciation !== undefined ? Number(sc.pronunciation) : (resp.autoScore?.pronunciationScore ?? 4.5);
    const fluency = sc.fluency !== undefined ? Number(sc.fluency) : (resp.autoScore?.fluencyScore ?? (i === 0 ? 4.5 : 4.0));
    const note = sc.note || resp.note || 'Polite & situationally appropriate';
    const isKo = content === 0;
    const itemTotal = isKo ? 0 : Math.round((content + pron + fluency) * 10) / 10;
    rtsRows.push({
      id: item.id || `RTS-0${i + 1}`,
      title: item.title || `Situation: ${item.scenario || 'Social/Academic'}`,
      content,
      pron,
      fluency,
      note,
      validation: !isKo ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // ASQ: rows 58–62 (5 items)
  const asqRows = [];
  const asqList = byType['ASQ'] || [];
  for (let i = 0; i < 5; i++) {
    const entry = asqList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const prompt = item.prompt || 'General knowledge prompt question';
    const spoken = resp.transcription || resp.text || (item.answers?.[0] || 'Term');
    const accuracy = sc.total !== undefined ? Number(sc.total) : (resp.autoScore?.score ?? 1);
    const note = sc.note || (accuracy === 1 ? 'Correct terminology' : 'Incorrect term');
    asqRows.push({
      id: item.id || `ASQ-0${i + 1}`,
      prompt,
      spoken,
      accuracy,
      note,
      status: accuracy === 1 ? '✅ CORRECT' : '❌ INCORRECT',
      itemTotal: accuracy
    });
  }

  // SWT: rows 67–68 (2 items)
  const swtRows = [];
  const swtList = byType['SWT'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = swtList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const text = resp.text || '';
    const wordCount = resp.wordCount || (text ? text.trim().split(/\s+/).filter(Boolean).length : (i === 0 ? 44 : 52));
    const sentenceCount = resp.sentenceCount ?? 1;
    const form = (wordCount >= 5 && wordCount <= 75 && sentenceCount === 1) ? 1 : 0;
    const content = sc.content !== undefined ? Number(sc.content) : (resp.autoScore?.contentScore ?? (i === 0 ? 4 : 3));
    const grammar = sc.grammar !== undefined ? Number(sc.grammar) : (resp.autoScore?.grammarScore ?? 2);
    const vocabulary = sc.vocabulary !== undefined ? Number(sc.vocabulary) : (resp.autoScore?.vocabularyScore ?? 2);
    const isKo = (form === 0 || content === 0);
    const itemTotal = isKo ? 0 : (form + content + grammar + vocabulary);
    const note = sc.note || (isKo ? 'Knockout: Form or Content 0' : 'Single valid compound sentence');
    swtRows.push({
      id: item.id || `SWT-0${i + 1}`,
      title: item.title || `Text: ${item.prompt?.slice(0, 30) || 'Summary Topic'}`,
      wordCount,
      sentenceCount,
      form,
      content,
      grammar,
      vocabulary,
      note,
      validation: !isKo ? '✅ VALID' : '⚠️ KNOCKOUT',
      itemTotal
    });
  }

  // WE: row 73 (1 item)
  const weRows = [];
  const weList = byType['WE'] || [];
  const weEntry = weList[0];
  const weItem = weEntry?.item || {};
  const weResp = weEntry?.response || {};
  const weSc = weEntry?.manualScore || {};
  const weText = weResp.text || '';
  const weWordCount = weResp.wordCount || (weText ? weText.trim().split(/\s+/).filter(Boolean).length : 258);
  let weForm = 2;
  if (weWordCount < 120 || weWordCount > 380) weForm = 0;
  else if (weWordCount < 200 || weWordCount > 300) weForm = 1;

  const weContent = weSc.content !== undefined ? Number(weSc.content) : (weResp.autoScore?.contentScore ?? 5);
  const weDev = weSc.development !== undefined ? Number(weSc.development) : (weSc.devCoherence ?? 5);
  const weLing = weSc.linguistic !== undefined ? Number(weSc.linguistic) : (weSc.linguisticRange ?? 5);
  const weGrammar = weSc.grammar !== undefined ? Number(weSc.grammar) : (weResp.autoScore?.grammarScore ?? 2);
  const weVocab = weSc.vocabulary !== undefined ? Number(weSc.vocabulary) : (weResp.autoScore?.vocabularyScore ?? 2);
  const weSpelling = weSc.spelling !== undefined ? Number(weSc.spelling) : (weResp.autoScore?.spellingScore ?? 2);
  const weKo = (weForm === 0 || weContent === 0);
  const weTotal = weKo ? 0 : (weForm + weContent + weDev + weLing + weGrammar + weVocab + weSpelling);

  weRows.push({
    id: weItem.id || 'WE-01',
    topic: weItem.prompt?.slice(0, 50) || 'Academic Essay Topic',
    wordCount: weWordCount,
    form: weForm,
    content: weContent,
    development: weDev,
    linguistic: weLing,
    grammar: weGrammar,
    vocabulary: weVocab,
    spelling: weSpelling,
    validation: !weKo ? '✅ VALID' : '⚠️ KNOCKOUT',
    itemTotal: weTotal
  });

  // ==========================================
  // PART 2: READING (Rows 5 to 38)
  // ==========================================
  // FIB-RW: rows 5–9 (5 items, 5 blanks each = 25 pts)
  const fibRwRows = [];
  const fibRwList = byType['FIB-RW'] || [];
  for (let i = 0; i < 5; i++) {
    const entry = fibRwList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalBlanks = item.options?.length || 5;
    const correct = sc.total !== undefined ? Number(sc.total) : (resp.autoScore?.correctBlanks ?? (i === 1 || i === 3 ? 4 : 5));
    const incorrect = totalBlanks - correct;
    fibRwRows.push({
      id: item.id || `FIB-RW-0${i + 1}`,
      title: item.title || `Text: Context ${i + 1}`,
      totalBlanks,
      correct,
      incorrect,
      itemTotal: correct
    });
  }

  // MCMA-R: rows 15–16 (2 items, 2+3 = 5 pts)
  const mcmaRRows = [];
  const mcmaRList = byType['MCMA-R'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = mcmaRList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalOptions = item.options?.length || (i === 0 ? 5 : 6);
    const maxPoints = i === 0 ? 2 : 3;
    const correct = sc.correctChosen !== undefined ? Number(sc.correctChosen) : (resp.autoScore?.correctChosen ?? 2);
    const incorrect = sc.incorrectChosen !== undefined ? Number(sc.incorrectChosen) : (resp.autoScore?.incorrectChosen ?? (i === 0 ? 0 : 1));
    const net = Math.max(0, correct - incorrect);
    mcmaRRows.push({
      id: item.id || `MCMA-R-0${i + 1}`,
      title: item.title || `Text: Topic ${i + 1}`,
      totalOptions,
      correct,
      incorrect,
      net,
      maxPoints,
      floorApplied: (correct - incorrect < 0) ? '⚠️ FLOOR' : '✅ NORMAL',
      itemTotal: net
    });
  }

  // RO-R: rows 22–23 (2 items, 4 pairs each = 8 pts)
  const roRRows = [];
  const roRList = byType['RO-R'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = roRList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalSentences = item.paragraphs?.length || 5;
    const maxPoints = totalSentences - 1;
    const correctPairs = sc.total !== undefined ? Number(sc.total) : (resp.autoScore?.correctAdjacentPairs ?? (i === 0 ? 4 : 3));
    roRRows.push({
      id: item.id || `RO-R-0${i + 1}`,
      title: item.title || `Narrative: Narrative ${i + 1}`,
      totalSentences,
      correctPairs,
      maxPoints,
      itemTotal: correctPairs
    });
  }

  // FIB-R: rows 29–32 (4 items, 4+4+5+4 = 17 pts)
  const fibRRows = [];
  const fibRList = byType['FIB-R'] || [];
  const fibRCounts = [4, 4, 5, 4];
  for (let i = 0; i < 4; i++) {
    const entry = fibRList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalBlanks = fibRCounts[i] || 4;
    const correct = sc.total !== undefined ? Number(sc.total) : (resp.autoScore?.correctBlanks ?? (i === 1 ? 3 : (i === 2 ? 5 : 4)));
    const incorrect = totalBlanks - correct;
    fibRRows.push({
      id: item.id || `FIB-R-0${i + 1}`,
      title: item.title || `Text: Drag & Drop Context ${i + 1}`,
      totalBlanks,
      correct,
      incorrect,
      itemTotal: correct
    });
  }

  // MCSA-R: rows 37–38 (2 items, 1 pt each = 2 pts)
  const mcsaRRows = [];
  const mcsaRList = byType['MCSA-R'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = mcsaRList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const selected = resp.selectedOption || (i === 0 ? 'B' : 'C');
    const key = item.correctAnswer || item.options?.find(o => !!o.correct)?.id || (i === 0 ? 'B' : 'C');
    const score = sc.total !== undefined ? Number(sc.total) : (selected === key ? 1 : 0);
    mcsaRRows.push({
      id: item.id || `MCSA-R-0${i + 1}`,
      title: item.title || `Text: Reading Passage ${i + 1}`,
      totalOptions: item.options?.length || 4,
      selected,
      key,
      itemTotal: score
    });
  }

  // ==========================================
  // PART 3: LISTENING (Rows 6 to 56)
  // ==========================================
  // SST: row 6 (1 item, max 12 pts)
  const sstRows = [];
  const sstList = byType['SST'] || [];
  const sstEntry = sstList[0];
  const sstItem = sstEntry?.item || {};
  const sstResp = sstEntry?.response || {};
  const sstSc = sstEntry?.manualScore || {};
  const sstText = sstResp.text || '';
  const sstWordCount = sstResp.wordCount || (sstText ? sstText.trim().split(/\s+/).filter(Boolean).length : 62);
  let sstForm = 2;
  if (sstWordCount < 40 || sstWordCount > 100) sstForm = 0;
  else if (sstWordCount < 50 || sstWordCount > 70) sstForm = 1;

  const sstContent = sstSc.content !== undefined ? Number(sstSc.content) : (sstResp.autoScore?.contentScore ?? 4);
  const sstGrammar = sstSc.grammar !== undefined ? Number(sstSc.grammar) : (sstResp.autoScore?.grammarScore ?? 2);
  const sstVocab = sstSc.vocabulary !== undefined ? Number(sstSc.vocabulary) : (sstResp.autoScore?.vocabularyScore ?? 2);
  const sstSpelling = sstSc.spelling !== undefined ? Number(sstSc.spelling) : (sstResp.autoScore?.spellingScore ?? 2);
  const sstKo = (sstForm === 0 || sstContent === 0);
  const sstTotal = sstKo ? 0 : (sstForm + sstContent + sstGrammar + sstVocab + sstSpelling);
  sstRows.push({
    id: sstItem.id || 'SST-01',
    title: sstItem.title || 'Audio Lecture Topic',
    wordCount: sstWordCount,
    form: sstForm,
    content: sstContent,
    grammar: sstGrammar,
    vocabulary: sstVocab,
    spelling: sstSpelling,
    validation: !sstKo ? '✅ VALID' : '⚠️ KNOCKOUT',
    itemTotal: sstTotal
  });

  // MCMA-L: rows 12–13 (2 items, 2+3 = 5 pts)
  const mcmaLRows = [];
  const mcmaLList = byType['MCMA-L'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = mcmaLList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const maxPoints = i === 0 ? 2 : 3;
    const correct = sc.correctChosen !== undefined ? Number(sc.correctChosen) : (resp.autoScore?.correctChosen ?? 2);
    const incorrect = sc.incorrectChosen !== undefined ? Number(sc.incorrectChosen) : (resp.autoScore?.incorrectChosen ?? (i === 0 ? 0 : 1));
    const net = Math.max(0, correct - incorrect);
    mcmaLRows.push({
      id: item.id || `MCMA-L-0${i + 1}`,
      title: item.title || `Audio: Lecture ${i + 1}`,
      totalOptions: item.options?.length || 5,
      correct,
      incorrect,
      net,
      maxPoints,
      floorApplied: (correct - incorrect < 0) ? '⚠️ FLOOR' : '✅ NORMAL',
      itemTotal: net
    });
  }

  // FIB-L: rows 19–20 (2 items, 5 blanks each = 10 pts)
  const fibLRows = [];
  const fibLList = byType['FIB-L'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = fibLList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalBlanks = 5;
    const correct = sc.total !== undefined ? Number(sc.total) : (resp.autoScore?.correctBlanks ?? (i === 0 ? 5 : 4));
    const incorrect = totalBlanks - correct;
    fibLRows.push({
      id: item.id || `FIB-L-0${i + 1}`,
      title: item.title || `Transcript: Lecture ${i + 1}`,
      totalBlanks,
      correct,
      incorrect,
      itemTotal: correct
    });
  }

  // HCS: rows 26–27 (2 items, 1 pt each = 2 pts)
  const hcsRows = [];
  const hcsList = byType['HCS'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = hcsList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const selected = resp.selectedOption || (i === 0 ? 'C' : 'A');
    const key = item.correctAnswer || item.options?.find(o => !!o.correct)?.id || (i === 0 ? 'C' : 'A');
    const score = sc.total !== undefined ? Number(sc.total) : (selected === key ? 1 : 0);
    hcsRows.push({
      id: item.id || `HCS-0${i + 1}`,
      title: item.title || `Audio: Summary ${i + 1}`,
      totalOptions: 4,
      selected,
      key,
      itemTotal: score
    });
  }

  // MCSA-L: rows 33–34 (2 items, 1 pt each = 2 pts)
  const mcsaLRows = [];
  const mcsaLList = byType['MCSA-L'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = mcsaLList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const selected = resp.selectedOption || (i === 0 ? 'B' : 'D');
    const key = item.correctAnswer || item.options?.find(o => !!o.correct)?.id || (i === 0 ? 'B' : 'D');
    const score = sc.total !== undefined ? Number(sc.total) : (selected === key ? 1 : 0);
    mcsaLRows.push({
      id: item.id || `MCSA-L-0${i + 1}`,
      title: item.title || `Dialogue: Audio ${i + 1}`,
      totalOptions: 4,
      selected,
      key,
      itemTotal: score
    });
  }

  // SMW: rows 40–41 (2 items, 1 pt each = 2 pts)
  const smwRows = [];
  const smwList = byType['SMW'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = smwList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const selected = resp.selectedOption || (i === 0 ? 'B' : 'C');
    const key = item.correctAnswer || item.options?.find(o => !!o.correct)?.id || (i === 0 ? 'B' : 'C');
    const score = sc.total !== undefined ? Number(sc.total) : (selected === key ? 1 : 0);
    smwRows.push({
      id: item.id || `SMW-0${i + 1}`,
      title: item.title || `Excerpt: Audio ${i + 1}`,
      totalOptions: 4,
      selected,
      key,
      itemTotal: score
    });
  }

  // HIW: rows 47–48 (2 items, 5 words each = 10 pts)
  const hiwRows = [];
  const hiwList = byType['HIW'] || [];
  for (let i = 0; i < 2; i++) {
    const entry = hiwList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalWords = 5;
    const correct = sc.correctClicks !== undefined ? Number(sc.correctClicks) : (resp.autoScore?.correctClicks ?? (i === 0 ? 5 : 4));
    const incorrect = sc.incorrectClicks !== undefined ? Number(sc.incorrectClicks) : (resp.autoScore?.incorrectClicks ?? (i === 0 ? 0 : 1));
    const net = Math.max(0, correct - incorrect);
    hiwRows.push({
      id: item.id || `HIW-0${i + 1}`,
      title: item.title || `Transcript: Text ${i + 1}`,
      totalWords,
      correct,
      incorrect,
      net,
      floorApplied: (correct - incorrect < 0) ? '⚠️ FLOOR' : '✅ NORMAL',
      itemTotal: net
    });
  }

  // WFD: rows 54–56 (3 items, 10+11+10 = 31 pts)
  const wfdRows = [];
  const wfdList = byType['WFD'] || [];
  const wfdLengths = [10, 11, 10];
  for (let i = 0; i < 3; i++) {
    const entry = wfdList[i];
    const item = entry?.item || {};
    const resp = entry?.response || {};
    const sc = entry?.manualScore || {};
    const totalWords = wfdLengths[i];
    const correct = sc.total !== undefined ? Number(sc.total) : (resp.autoScore?.correctWords ?? 10);
    const incorrect = totalWords - correct;
    wfdRows.push({
      id: item.id || `WFD-0${i + 1}`,
      sentence: item.audioText || item.prompt || 'Sentence dictation prompt text',
      totalWords,
      correct,
      incorrect,
      itemTotal: correct
    });
  }

  return {
    dashboard: {
      candidateName,
      candidateId,
      testDate,
      targetScore,
      leadEvaluator,
      gradingStatus,
      overallPte,
      ieltsBand,
      cefrLevel,
      classification,
      masteryPct: Math.round(masteryPct * 10) / 10,
      totalEarned,
      totalMax,
      part1Earned,
      part1Max,
      part2Earned,
      part2Max,
      part3Earned,
      part3Max,
      spkRaw,
      wrtRaw,
      rdRaw,
      lstRaw,
      spkPte,
      wrtPte,
      rdPte,
      lstPte
    },
    part1: {
      ra: raRows,
      rs: rsRows,
      di: diRows,
      rl: rlRows,
      sgd: sgdRows,
      rts: rtsRows,
      asq: asqRows,
      swt: swtRows,
      we: weRows,
      totalEarned: part1Earned,
      maxAvailable: part1Max
    },
    part2: {
      fibRw: fibRwRows,
      mcmaR: mcmaRRows,
      roR: roRRows,
      fibR: fibRRows,
      mcsaR: mcsaRRows,
      totalEarned: part2Earned,
      maxAvailable: part2Max
    },
    part3: {
      sst: sstRows,
      mcmaL: mcmaLRows,
      fibL: fibLRows,
      hcs: hcsRows,
      mcsaL: mcsaLRows,
      smw: smwRows,
      hiw: hiwRows,
      wfd: wfdRows,
      totalEarned: part3Earned,
      maxAvailable: part3Max
    }
  };
}

/**
 * Generates exact TSV string for Master Dashboard!B5:C7
 */
export function generateDashboardB5C7Tsv(wbData) {
  const d = wbData.dashboard;
  return [
    `${d.candidateName}\tCandidate ID: ${d.candidateId}`,
    `${d.testDate}\t${d.targetScore}`,
    `${d.leadEvaluator}\t${d.gradingStatus}`
  ].join('\n');
}

/**
 * Generates TSV for Part 1: Speaking & Writing
 */
export function generatePart1Tsv(wbData) {
  const p1 = wbData.part1;
  const sections = [];

  // RA: rows 6-11 (PromptWords, Errors, RawContent, ScaledContent, Pron, Fluency)
  p1.ra.forEach((r) => {
    sections.push(`${r.id}\t${r.title}\t${r.promptWords}\t${r.readingErrors}\t${r.rawContent}\t${r.scaledContent}\t${r.pron}\t${r.fluency}\t${r.note}\t${r.validation}\t${r.itemTotal}`);
  });

  return sections.join('\n');
}

/**
 * Generates clean formatted TSVs for quick clipboard copying
 */
export function generateRangeTsvs(wbData) {
  const d = wbData.dashboard;
  const p1 = wbData.part1;
  const p2 = wbData.part2;
  const p3 = wbData.part3;

  return {
    dashboardProfile: [
      `${d.candidateName}\tCandidate ID: ${d.candidateId}`,
      `${d.testDate}\t${d.targetScore}`,
      `${d.leadEvaluator}\t${d.gradingStatus}`
    ].join('\n'),

    part1SpkScores: [
      ...p1.ra.map(r => `${r.promptWords}\t${r.readingErrors}\t${r.rawContent}\t${r.scaledContent}\t${r.pron}\t${r.fluency}`),
      ...p1.rs.map(r => `${r.content}\t${r.pron}\t${r.fluency}`),
      ...p1.di.map(r => `${r.content}\t${r.pron}\t${r.fluency}`),
      ...p1.rl.map(r => `${r.content}\t${r.pron}\t${r.fluency}`),
      ...p1.sgd.map(r => `${r.content}\t${r.pron}\t${r.fluency}`),
      ...p1.rts.map(r => `${r.content}\t${r.pron}\t${r.fluency}`),
      ...p1.asq.map(r => `${r.accuracy}`),
      ...p1.swt.map(r => `${r.wordCount}\t${r.sentenceCount}\t${r.form}\t${r.content}\t${r.grammar}\t${r.vocabulary}`),
      ...p1.we.map(r => `${r.wordCount}\t${r.form}\t${r.content}\t${r.development}\t${r.linguistic}\t${r.grammar}\t${r.vocabulary}\t${r.spelling}`)
    ].join('\n'),

    part2ReadingScores: [
      ...p2.fibRw.map(r => `${r.correct}\t${r.incorrect}`),
      ...p2.mcmaR.map(r => `${r.correct}\t${r.incorrect}`),
      ...p2.roR.map(r => `${r.correctPairs}`),
      ...p2.fibR.map(r => `${r.correct}\t${r.incorrect}`),
      ...p2.mcsaR.map(r => `${r.selected}\t${r.key}`)
    ].join('\n'),

    part3ListeningScores: [
      ...p3.sst.map(r => `${r.wordCount}\t${r.form}\t${r.content}\t${r.grammar}\t${r.vocabulary}\t${r.spelling}`),
      ...p3.mcmaL.map(r => `${r.correct}\t${r.incorrect}`),
      ...p3.fibL.map(r => `${r.correct}\t${r.incorrect}`),
      ...p3.hcs.map(r => `${r.selected}\t${r.key}`),
      ...p3.mcsaL.map(r => `${r.selected}\t${r.key}`),
      ...p3.smw.map(r => `${r.selected}\t${r.key}`),
      ...p3.hiw.map(r => `${r.correct}\t${r.incorrect}`),
      ...p3.wfd.map(r => `${r.correct}\t${r.incorrect}`)
    ].join('\n')
  };
}

