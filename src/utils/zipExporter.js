/**
 * Pure JavaScript PKZIP 2.0 Archiver & Exam Submission Packager
 * No external dependencies or binary requirements. Runs in both browser and Node.js.
 * Packages:
 * - 00_EXAM_SUMMARY.md
 * - 00_AI_EVALUATOR_PROMPT.md
 * - 00_COMPLETE_DATA.json
 * - 01_Part1_Speaking/ (with prompt.txt, candidate_transcript.txt, recording.webm)
 * - 02_Part1_Writing/ (with essay/summary prompt, student response, word counts)
 * - 03_Part2_Reading/ (with passages, blanks, ordering, multiple choice)
 * - 04_Part3_Listening/ (with audio scripts, summaries, blanks, dictation)
 */

// CRC-32 Lookup Table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function computeCrc32(uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < uint8Array.length; i++) {
    crc = CRC_TABLE[(crc ^ uint8Array[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Lightweight in-memory ZipBuilder for browsers
 */
export class ZipBuilder {
  constructor() {
    this.entries = [];
  }

  addTextFile(path, textContent) {
    const encoder = new TextEncoder();
    const data = encoder.encode(String(textContent || ''));
    this.addBinaryFile(path, data);
  }

  addBinaryFile(path, uint8Array) {
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    const encoder = new TextEncoder();
    const nameBytes = encoder.encode(cleanPath);
    const crc = computeCrc32(uint8Array);
    this.entries.push({
      path: cleanPath,
      nameBytes,
      dataBytes: uint8Array,
      crc,
      size: uint8Array.length
    });
  }

  buildUint8Array() {
    const parts = [];
    const cdEntries = [];
    let offset = 0;

    for (const entry of this.entries) {
      const { nameBytes, dataBytes, crc, size } = entry;
      const header = new Uint8Array(30);
      const view = new DataView(header.buffer);

      view.setUint32(0, 0x04034b50, true); // Local header signature
      view.setUint16(4, 20, true);         // Version needed: 2.0
      view.setUint16(6, 0, true);          // General flag
      view.setUint16(8, 0, true);          // Compression: 0 (Store)
      view.setUint16(10, 0, true);         // Mod time
      view.setUint16(12, 0, true);         // Mod date
      view.setUint32(14, crc, true);       // CRC32
      view.setUint32(18, size, true);      // Compressed size
      view.setUint32(22, size, true);      // Uncompressed size
      view.setUint16(26, nameBytes.length, true); // Filename length
      view.setUint16(28, 0, true);         // Extra field length

      parts.push(header, nameBytes, dataBytes);
      cdEntries.push({ nameBytes, crc, size, offset });
      offset += 30 + nameBytes.length + size;
    }

    const cdStart = offset;
    let cdSize = 0;

    for (const entry of cdEntries) {
      const { nameBytes, crc, size, offset: localOffset } = entry;
      const cdHeader = new Uint8Array(46);
      const view = new DataView(cdHeader.buffer);

      view.setUint32(0, 0x02014b50, true); // Central directory signature
      view.setUint16(4, 20, true);         // Version made by: 2.0
      view.setUint16(6, 20, true);         // Version needed: 2.0
      view.setUint16(8, 0, true);          // Flags
      view.setUint16(10, 0, true);         // Compression: 0 (Store)
      view.setUint16(12, 0, true);         // Mod time
      view.setUint16(14, 0, true);         // Mod date
      view.setUint32(16, crc, true);       // CRC32
      view.setUint32(20, size, true);      // Compressed size
      view.setUint32(24, size, true);      // Uncompressed size
      view.setUint16(28, nameBytes.length, true); // Filename length
      view.setUint16(30, 0, true);         // Extra length
      view.setUint16(32, 0, true);         // Comment length
      view.setUint16(34, 0, true);         // Disk number
      view.setUint16(36, 0, true);         // Internal attributes
      view.setUint32(38, 0, true);         // External attributes
      view.setUint32(42, localOffset, true); // Offset of local header

      parts.push(cdHeader, nameBytes);
      cdSize += 46 + nameBytes.length;
    }

    // End of central directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);     // EOCD signature
    eocdView.setUint16(4, 0, true);              // Disk number
    eocdView.setUint16(6, 0, true);              // Disk with CD
    eocdView.setUint16(8, this.entries.length, true);  // Number of entries on disk
    eocdView.setUint16(10, this.entries.length, true); // Total entries
    eocdView.setUint32(12, cdSize, true);        // Central directory size
    eocdView.setUint32(16, cdStart, true);       // Central directory offset
    eocdView.setUint16(20, 0, true);             // Comment length
    parts.push(eocd);

    // Calculate total buffer size
    const totalBytes = parts.reduce((acc, p) => acc + p.length, 0);
    const result = new Uint8Array(totalBytes);
    let cur = 0;
    for (const part of parts) {
      result.set(part, cur);
      cur += part.length;
    }
    return result;
  }

  generateZipBlob() {
    const bytes = this.buildUint8Array();
    return new Blob([bytes], { type: 'application/zip' });
  }
}

/**
 * Task category folder mapping
 */
export const TASK_FOLDER_MAP = {
  // Part 1: Speaking
  RA: '01_Part1_Speaking/Read_Aloud',
  RS: '01_Part1_Speaking/Repeat_Sentence',
  DI: '01_Part1_Speaking/Describe_Image',
  RL: '01_Part1_Speaking/Retell_Lecture',
  SGD: '01_Part1_Speaking/Summarize_Group_Discussion',
  RTS: '01_Part1_Speaking/Respond_to_Situation',
  ASQ: '01_Part1_Speaking/Answer_Short_Question',
  PI: '01_Part1_Speaking/Personal_Introduction',

  // Part 1: Writing
  SWT: '02_Part1_Writing/Summarize_Written_Text',
  WE: '02_Part1_Writing/Write_Essay',

  // Part 2: Reading
  FIBRW: '03_Part2_Reading/Fill_in_the_Blanks_RW',
  MCMA_R: '03_Part2_Reading/Multiple_Choice_Multiple',
  RO: '03_Part2_Reading/Reorder_Paragraphs',
  FIB_R: '03_Part2_Reading/Fill_in_the_Blanks_Reading',
  MCSA_R: '03_Part2_Reading/Multiple_Choice_Single',

  // Part 3: Listening
  SST: '04_Part3_Listening/Summarize_Spoken_Text',
  MCMA_L: '04_Part3_Listening/Multiple_Choice_Multiple',
  FIB_L: '04_Part3_Listening/Fill_in_the_Blanks_Listening',
  HCS: '04_Part3_Listening/Highlight_Correct_Summary',
  MCSA_L: '04_Part3_Listening/Multiple_Choice_Single',
  SMW: '04_Part3_Listening/Select_Missing_Word',
  HIW: '04_Part3_Listening/Highlight_Incorrect_Words',
  WFD: '04_Part3_Listening/Write_From_Dictation'
};

/**
 * Generates structured files inside a ZipBuilder instance
 */
export function populateExamZip(zip, submissionData, questionBankItems = []) {
  const studentId = submissionData.studentId || 'STUDENT';
  const studentName = submissionData.studentName || 'Candidate';
  const targetScore = submissionData.targetScore || 'Target: PTE 79+ / IELTS 8.0';
  const sessionCode = submissionData.sessionCode || 'PTE-SESSION';
  const submittedAt = submissionData.submittedAt || new Date().toISOString();

  // Combine items map
  const itemMap = new Map();
  if (Array.isArray(questionBankItems)) {
    questionBankItems.forEach((it) => itemMap.set(it.id, it));
  }
  if (Array.isArray(submissionData.examItems)) {
    submissionData.examItems.forEach((it) => itemMap.set(it.id, it));
  }

  const responses = submissionData.responses || {};
  const responseEntries = Object.entries(responses);

  // 1. Root File: 00_COMPLETE_DATA.json
  zip.addTextFile('00_COMPLETE_DATA.json', JSON.stringify(submissionData, null, 2));

  // 2. Root File: 00_EXAM_SUMMARY.md
  let summaryMd = `# Pearson PTE Academic Examination Pack\n\n`;
  summaryMd += `| Field | Details |\n| :--- | :--- |\n`;
  summaryMd += `| **Candidate Name** | ${studentName} |\n`;
  summaryMd += `| **Candidate ID** | \`${studentId}\` |\n`;
  summaryMd += `| **Target Score** | ${targetScore} |\n`;
  summaryMd += `| **Session Code** | \`${sessionCode}\` |\n`;
  summaryMd += `| **Submitted At** | ${submittedAt} |\n`;
  summaryMd += `| **Total Items Attempted** | ${responseEntries.length} items |\n\n`;
  summaryMd += `## Section Overview\n\n`;
  summaryMd += `- **01_Part1_Speaking**: Spoken audio answers, speech-to-text transcripts, and pronunciation criteria\n`;
  summaryMd += `- **02_Part1_Writing**: Summarize Written Text (SWT) and Write Essay (WE) with word count checks\n`;
  summaryMd += `- **03_Part2_Reading**: Reading Fill-in-the-Blanks, Reorder Paragraphs, and Multiple Choice\n`;
  summaryMd += `- **04_Part3_Listening**: Summarize Spoken Text, Write From Dictation, and Listening blanks\n\n`;
  summaryMd += `## Response Manifest\n\n`;
  summaryMd += `| Item ID | Task Type | Response Status | Word/Spoken Count |\n| :--- | :--- | :--- | :--- |\n`;

  // 3. Root File: 00_AI_EVALUATOR_PROMPT.md
  let aiPromptMd = `# Senior Pearson PTE Academic Examiner Evaluation Request\n\n`;
  aiPromptMd += `You are a certified Pearson Test of English (PTE) Senior Lead Examiner. Evaluate the following complete candidate examination submission across all attempted tasks according to official Pearson scoring rubrics.\n\n`;
  aiPromptMd += `### Candidate Profile:\n`;
  aiPromptMd += `- **Name**: ${studentName}\n`;
  aiPromptMd += `- **ID**: ${studentId}\n`;
  aiPromptMd += `- **Target Goal**: ${targetScore}\n`;
  aiPromptMd += `- **Session**: ${sessionCode}\n\n`;
  aiPromptMd += `---\n\n`;

  // Process Each Item
  responseEntries.forEach(([itemId, resp]) => {
    const item = itemMap.get(itemId) || {
      id: itemId,
      taskType: itemId.split('-')[0],
      part: itemId.startsWith('R-') || itemId.startsWith('FIB') || itemId.startsWith('RO') ? 'PART_2' : 'PART_1',
      title: itemId,
      prompt: ''
    };

    const taskType = item.taskType || itemId.split('-')[0];
    const folderBase = TASK_FOLDER_MAP[taskType] || `Other_Tasks/${taskType}`;
    const itemFolder = `${folderBase}/${itemId}`;

    let statusText = 'Completed';
    let lengthText = '';

    // A. Question Material (Prompt / Passage / Situation)
    let promptText = `=== TASK: ${item.taskType} (${itemId}) ===\n`;
    promptText += `Title: ${item.title || itemId}\n\n`;
    if (item.prompt) promptText += `PROMPT / INSTRUCTIONS:\n${item.prompt}\n\n`;
    if (item.audioText) promptText += `AUDIO SPOKEN SCRIPT:\n${item.audioText}\n\n`;
    if (item.referenceText) promptText += `REFERENCE / TARGET TEXT:\n${item.referenceText}\n\n`;
    if (item.options) promptText += `OPTIONS:\n${JSON.stringify(item.options, null, 2)}\n\n`;
    const officialAnswer = item.correctAnswer || item.correctAnswers || item.options?.filter(o => o.correct).map(o => o.id);
    if (officialAnswer && (!Array.isArray(officialAnswer) || officialAnswer.length > 0)) {
      promptText += `OFFICIAL CORRECT ANSWER:\n${JSON.stringify(officialAnswer, null, 2)}\n\n`;
    }

    zip.addTextFile(`${itemFolder}/question_prompt.txt`, promptText);

    // B. Student Response
    let responseText = '';
    const spokenTranscript = (resp.transcript || resp.text || resp.recordedAudio?.transcript || '').trim();

    if (spokenTranscript) {
      responseText += `SPOKEN TRANSCRIPT (Speech-to-Text):\n${spokenTranscript}\n\n`;
      lengthText = `${spokenTranscript.split(/\s+/).filter(Boolean).length} words spoken`;
      zip.addTextFile(`${itemFolder}/candidate_transcript.txt`, spokenTranscript);
    }

    if (resp.text && !spokenTranscript) {
      responseText += `WRITTEN RESPONSE:\n${resp.text}\n\n`;
      lengthText = `${resp.wordCount ?? resp.text.split(/\s+/).filter(Boolean).length} words`;
      if (taskType === 'WE') {
        zip.addTextFile(`${itemFolder}/student_essay.txt`, resp.text);
      } else if (taskType === 'SWT') {
        zip.addTextFile(`${itemFolder}/student_summary.txt`, resp.text);
      }
    }

    if (resp.blanks) {
      responseText += `SELECTED BLANKS:\n${JSON.stringify(resp.blanks, null, 2)}\n\n`;
      lengthText = `${Object.keys(resp.blanks).length} blanks`;
    }

    if (resp.placedWords) {
      responseText += `PLACED WORDS:\n${JSON.stringify(resp.placedWords, null, 2)}\n\n`;
    }

    if (resp.selectedOptions) {
      responseText += `SELECTED OPTIONS:\n${JSON.stringify(resp.selectedOptions, null, 2)}\n\n`;
    }

    if (resp.recordedAudio) {
      responseText += `RECORDING METADATA:\n`;
      responseText += `- Duration Spoken: ${resp.recordedAudio.durationRecorded || 0} seconds\n`;
      responseText += `- File Tag: ${resp.recordedAudio.fileName || 'candidate_audio.webm'}\n`;
      if (resp.recordedAudio.closedDueToSilence) {
        responseText += `- Closed by >3s silence cutoff rule: Yes\n`;
      }
      responseText += `\n`;

      // If dataUrl exists, decode to webm binary file
      if (resp.recordedAudio.dataUrl && typeof resp.recordedAudio.dataUrl === 'string') {
        try {
          const base64Data = resp.recordedAudio.dataUrl.includes(',')
            ? resp.recordedAudio.dataUrl.split(',')[1]
            : resp.recordedAudio.dataUrl;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          zip.addBinaryFile(`${itemFolder}/candidate_recording.webm`, bytes);
        } catch {
          // ignore binary conversion error
        }
      }
    }

    zip.addTextFile(`${itemFolder}/student_response.txt`, responseText || '(No response recorded)');

    // C. Item Metadata & Grading Info
    const itemData = {
      itemId,
      taskType: item.taskType,
      title: item.title,
      prompt: item.prompt,
      referenceText: item.referenceText,
      studentResponse: resp,
      autoScore: resp.autoScore,
      manualScore: submissionData.manualScores?.[itemId]
    };
    zip.addTextFile(`${itemFolder}/item_info.json`, JSON.stringify(itemData, null, 2));

    // Update Summary Table
    summaryMd += `| \`${itemId}\` | **${taskType}** | ${statusText} | ${lengthText || 'Recorded'} |\n`;

    // Append to AI Evaluator Prompt
    aiPromptMd += `### Task: ${taskType} (\`${itemId}\`)\n`;
    aiPromptMd += `**Prompt / Instructions**:\n> ${item.prompt || item.title || 'N/A'}\n\n`;
    if (item.referenceText) {
      aiPromptMd += `**Reference / Stimulus Text**:\n\`\`\`\n${item.referenceText}\n\`\`\`\n\n`;
    }
    if (spokenTranscript) {
      aiPromptMd += `**Candidate Spoken Transcript**:\n> "${spokenTranscript}"\n\n`;
      aiPromptMd += `*(Evaluate: Content, Oral Fluency, Pronunciation)*\n\n`;
    } else if (resp.text) {
      aiPromptMd += `**Candidate Written Text**:\n\`\`\`\n${resp.text}\n\`\`\`\n\n`;
      aiPromptMd += `*(Evaluate: Content, Form [5-75w single sentence for SWT / 200-300w for Essay], Grammar, Vocabulary, Spelling)*\n\n`;
    } else if (resp.blanks) {
      aiPromptMd += `**Candidate Blank Answers**:\n\`\`\`json\n${JSON.stringify(resp.blanks, null, 2)}\n\`\`\`\n\n`;
    }
    aiPromptMd += `---\n\n`;
  });

  zip.addTextFile('00_EXAM_SUMMARY.md', summaryMd);
  zip.addTextFile('00_AI_EVALUATOR_PROMPT.md', aiPromptMd);
}

/**
 * Initiates zip download directly in the browser
 */
export async function downloadExamSubmissionZip(submissionData, questionBankItems = []) {
  const studentId = (submissionData.studentId || 'STUDENT').replace(/[^a-zA-Z0-9_-]/g, '-');
  const studentName = (submissionData.studentName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = (submissionData.submittedAt || new Date().toISOString()).slice(0, 10);
  const zipFileName = `PTE_Exam_Pack_${studentId}_${studentName}_${dateStr}.zip`;

  // 1. First attempt server-side export (can package disk-recorded .webm audio files)
  try {
    const res = await fetch('/api/export-exam-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionData })
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, zipFileName);
      return { ok: true, source: 'server', fileName: zipFileName };
    }
  } catch {
    // server export failed, fallback to client-side builder
  }

  // 2. Client-side pure JS fallback: 100% offline, zero-latency
  const zip = new ZipBuilder();
  populateExamZip(zip, submissionData, questionBankItems);
  const zipBlob = zip.generateZipBlob();
  triggerBlobDownload(zipBlob, zipFileName);

  return { ok: true, source: 'client', fileName: zipFileName };
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

