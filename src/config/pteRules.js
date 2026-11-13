/**
 * Official Pearson PTE Academic Exam Rules & Section Constants
 * Aligned with the Google Sheet Manual Scoring Bridge & 22 Task Types (including SGD & RTS).
 */

export const PTE_PARTS = {
  PART_1: {
    id: 'PART_1',
    name: 'Part 1: Speaking & Writing',
    durationRangeMins: [76, 84],
    defaultSectionSeconds: 80 * 60, // 80 mins reference
    timerStrategy: 'per_item', // Speaking & Writing items use individual preparation/recording or dedicated item timers
    description: 'Speaking and Writing tasks with item-specific preparation, audio playback, recording windows, and dedicated writing timers.'
  },
  PART_2: {
    id: 'PART_2',
    name: 'Part 2: Reading',
    durationRangeMins: [23, 30],
    defaultSectionSeconds: 27 * 60, // 27 mins cumulative section timer (within 23-30 mins)
    timerStrategy: 'cumulative_section',
    description: 'Reading tasks governed by a single cumulative 23–30 minute section timer.'
  },
  PART_3: {
    id: 'PART_3',
    name: 'Part 3: Listening',
    durationRangeMins: [31, 39],
    defaultSectionSeconds: 35 * 60, // 35 mins total reference
    sharedListeningPoolSeconds: 25 * 60, // Cumulative shared timer after SST (which has its own dedicated 10-min timer)
    timerStrategy: 'hybrid_sst_plus_shared',
    description: 'Starts with Summarize Spoken Text (dedicated 10-min timer per item), followed by a cumulative shared section timer for all remaining Listening tasks.'
  }
};

export const PTE_TASK_TYPES = {
  // ==========================================
  // PART 1: SPEAKING & WRITING (10 Task Types)
  // ==========================================
  PI: {
    code: 'PI',
    name: 'Personal Introduction',
    part: 'PART_1',
    category: 'Speaking',
    scored: false,
    prepSeconds: 25,
    recordSeconds: 30,
    expectedItemIds: ['PI-01'],
    instructions: 'Read the prompt below and give a brief personal introduction. You have 25 seconds to prepare and 30 seconds to record your response. Your response is not scored, but will be sent to institutions alongside your score report.',
    scoringCriteria: 'Unscored (Institutional profile reference only)'
  },
  RA: {
    code: 'RA',
    name: 'Read Aloud',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    prepSeconds: 35,
    recordSeconds: 40,
    expectedItemIds: ['RA-01', 'RA-02', 'RA-03', 'RA-04', 'RA-05', 'RA-06'],
    instructions: 'Look at the text below. In 35 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.',
    scoringCriteria: 'Content (word accuracy 0–5), Oral Fluency (0–5), Pronunciation (0–5)',
    skillsContributed: ['Speaking']
  },
  RS: {
    code: 'RS',
    name: 'Repeat Sentence',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    audioRangeSeconds: [3, 9],
    prepSeconds: 0,
    recordSeconds: 15,
    expectedItemIds: [
      'RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05',
      'RS-06', 'RS-07', 'RS-08', 'RS-09', 'RS-10'
    ],
    instructions: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once. You have 15 seconds to record.',
    scoringCriteria: 'Content (0–3), Oral Fluency (0–5), Pronunciation (0–5)',
    skillsContributed: ['Speaking', 'Listening']
  },
  DI: {
    code: 'DI',
    name: 'Describe Image',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    prepSeconds: 25,
    recordSeconds: 40,
    expectedItemIds: ['DI-01', 'DI-02', 'DI-03', 'DI-04', 'DI-05', 'DI-06'],
    instructions: 'Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.',
    scoringCriteria: 'Content (0–6), Oral Fluency (0–5), Pronunciation (0–5)',
    skillsContributed: ['Speaking']
  },
  RL: {
    code: 'RL',
    name: 'Retell Lecture',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    audioRangeSeconds: [60, 90],
    prepSeconds: 10,
    recordSeconds: 40,
    expectedItemIds: ['RL-01', 'RL-02'],
    instructions: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.',
    scoringCriteria: 'Content (0–6), Oral Fluency (0–5), Pronunciation (0–5)',
    skillsContributed: ['Speaking', 'Listening']
  },
  SGD: {
    code: 'SGD',
    name: 'Summarize Group Discussion',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    audioRangeSeconds: [60, 180],
    prepSeconds: 10,
    recordSeconds: 120,
    expectedItemIds: ['SGD-01', 'SGD-02'],
    instructions: 'You will hear a group discussion on an academic topic (up to 180 seconds). After the audio finishes, you have 10 seconds to prepare and 120 seconds to summarize the main points and perspectives raised by the participants.',
    scoringCriteria: 'Content (0–6), Oral Fluency (0–5), Pronunciation (0–5)',
    skillsContributed: ['Speaking', 'Listening']
  },
  RTS: {
    code: 'RTS',
    name: 'Respond to a Situation',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    prepSeconds: 10,
    recordSeconds: 40,
    expectedItemIds: ['RTS-01', 'RTS-02'],
    instructions: 'Read and listen to the academic or campus situation described below. You have 10 seconds to prepare and 40 seconds to record an appropriate spoken response addressing the situation.',
    scoringCriteria: 'Appropriateness/Content (0–6), Oral Fluency (0–5), Pronunciation (0–5)',
    skillsContributed: ['Speaking']
  },
  ASQ: {
    code: 'ASQ',
    name: 'Answer Short Question',
    part: 'PART_1',
    category: 'Speaking',
    scored: true,
    audioRangeSeconds: [3, 9],
    prepSeconds: 0,
    recordSeconds: 10,
    expectedItemIds: ['ASQ-01', 'ASQ-02', 'ASQ-03', 'ASQ-04', 'ASQ-05'],
    instructions: 'You will hear a question. Please give a simple and short answer. Often just one or a few words is enough. You have 10 seconds to answer.',
    scoringCriteria: '1 for correct answer, 0 for incorrect',
    skillsContributed: ['Listening']
  },
  SWT: {
    code: 'SWT',
    name: 'Summarize Written Text',
    part: 'PART_1',
    category: 'Writing',
    scored: true,
    dedicatedTimerSeconds: 10 * 60, // 10 minutes per item
    minWords: 5,
    maxWords: 75,
    expectedItemIds: ['SWT-01', 'SWT-02'],
    instructions: 'Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.',
    scoringCriteria: 'Content (0–4), Form (0–1, single sentence 5–75 words), Grammar (0–2), Vocabulary (0–2)',
    skillsContributed: ['Writing', 'Reading']
  },
  WE: {
    code: 'WE',
    name: 'Write Essay',
    part: 'PART_1',
    category: 'Writing',
    scored: true,
    dedicatedTimerSeconds: 20 * 60, // 20 minutes per item
    minWords: 200,
    maxWords: 300,
    expectedItemIds: ['WE-01'],
    instructions: 'You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200–300 words.',
    scoringCriteria: 'Content (0–6), Form (0–2, 200–300 words), Development/Structure/Coherence (0–6), Grammar (0–2), General Linguistic Range (0–6), Vocabulary (0–2), Spelling (0–2)',
    skillsContributed: ['Writing']
  },

  // ==========================================
  // PART 2: READING (5 Task Types)
  // ==========================================
  'FIB-RW': {
    code: 'FIB-RW',
    name: 'Reading & Writing: Fill in the Blanks',
    part: 'PART_2',
    category: 'Reading',
    scored: true,
    expectedItemIds: ['FIB-RW-01', 'FIB-RW-02', 'FIB-RW-03', 'FIB-RW-04', 'FIB-RW-05'],
    instructions: 'Below is a text with blanks. Click on each blank, a list of choices will appear. Select the appropriate answer choice for each blank.',
    scoringCriteria: '1 point for each correctly completed blank',
    skillsContributed: ['Reading', 'Writing']
  },
  'MCMA-R': {
    code: 'MCMA-R',
    name: 'Multiple Choice, Multiple Answers (Reading)',
    part: 'PART_2',
    category: 'Reading',
    scored: true,
    negativeMarking: true,
    expectedItemIds: ['MCMA-R-01', 'MCMA-R-02'],
    instructions: 'Read the text and answer the question by selecting all the correct responses. More than one response is correct.',
    scoringCriteria: '+1 for each correct option, -1 for each incorrect option (minimum score 0)',
    skillsContributed: ['Reading']
  },
  'RO-R': {
    code: 'RO-R',
    name: 'Reorder Paragraphs',
    part: 'PART_2',
    category: 'Reading',
    scored: true,
    expectedItemIds: ['RO-R-01', 'RO-R-02'],
    instructions: 'The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.',
    scoringCriteria: '1 point for each adjacent pair of paragraphs in the correct order',
    skillsContributed: ['Reading']
  },
  'FIB-R': {
    code: 'FIB-R',
    name: 'Reading: Fill in the Blanks',
    part: 'PART_2',
    category: 'Reading',
    scored: true,
    expectedItemIds: ['FIB-R-01', 'FIB-R-02', 'FIB-R-03', 'FIB-R-04'],
    instructions: 'In the text below some words are missing. Drag words from the box below to the appropriate place in the text. To undo an answer choice, drag the word back to the box below the text.',
    scoringCriteria: '1 point for each correctly completed blank',
    skillsContributed: ['Reading']
  },
  'MCSA-R': {
    code: 'MCSA-R',
    name: 'Multiple Choice, Single Answer (Reading)',
    part: 'PART_2',
    category: 'Reading',
    scored: true,
    expectedItemIds: ['MCSA-R-01', 'MCSA-R-02'],
    instructions: 'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    scoringCriteria: '1 for correct answer, 0 for incorrect',
    skillsContributed: ['Reading']
  },

  // ==========================================
  // PART 3: LISTENING (8 Task Types)
  // ==========================================
  SST: {
    code: 'SST',
    name: 'Summarize Spoken Text',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    audioRangeSeconds: [60, 90],
    dedicatedTimerSeconds: 10 * 60, // Dedicated 10-minute timer (includes audio playback)
    minWords: 50,
    maxWords: 70,
    expectedItemIds: ['SST-01'],
    instructions: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.',
    scoringCriteria: 'Content (0–4), Form (0–2, 50–70 words), Grammar (0–2), Vocabulary (0–2), Spelling (0–2)',
    skillsContributed: ['Listening', 'Writing']
  },
  'MCMA-L': {
    code: 'MCMA-L',
    name: 'Multiple Choice, Multiple Answers (Listening)',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    negativeMarking: true,
    expectedItemIds: ['MCMA-L-01', 'MCMA-L-02'],
    instructions: 'Listen to the recording and answer the question by selecting all the correct responses. You will need to select more than one response.',
    scoringCriteria: '+1 for each correct option, -1 for each incorrect option (minimum score 0)',
    skillsContributed: ['Listening']
  },
  'FIB-L': {
    code: 'FIB-L',
    name: 'Fill in the Blanks (Listening)',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    expectedItemIds: ['FIB-L-01', 'FIB-L-02'],
    instructions: 'You will hear a recording. Type the missing words in each blank.',
    scoringCriteria: '1 point for each correctly typed and spelled word',
    skillsContributed: ['Listening', 'Writing']
  },
  HCS: {
    code: 'HCS',
    name: 'Highlight Correct Summary',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    expectedItemIds: ['HCS-01', 'HCS-02'],
    instructions: 'You will hear a recording. Click on the paragraph that best relates to the recording.',
    scoringCriteria: '1 for correct summary, 0 for incorrect',
    skillsContributed: ['Listening', 'Reading']
  },
  'MCSA-L': {
    code: 'MCSA-L',
    name: 'Multiple Choice, Single Answer (Listening)',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    expectedItemIds: ['MCSA-L-01', 'MCSA-L-02'],
    instructions: 'Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    scoringCriteria: '1 for correct answer, 0 for incorrect',
    skillsContributed: ['Listening']
  },
  SMW: {
    code: 'SMW',
    name: 'Select Missing Word',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    expectedItemIds: ['SMW-01', 'SMW-02'],
    instructions: 'You will hear a recording about an academic topic. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.',
    scoringCriteria: '1 for correct option, 0 for incorrect',
    skillsContributed: ['Listening']
  },
  HIW: {
    code: 'HIW',
    name: 'Highlight Incorrect Words',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    negativeMarking: true,
    expectedItemIds: ['HIW-01', 'HIW-02'],
    instructions: 'You will hear a recording. Below is a transcription of the recording. Some words in the transcription differ from what the speaker(s) said. Please click on the words that are different.',
    scoringCriteria: '+1 for each correct word highlighted, -1 for each incorrect word highlighted (minimum score 0)',
    skillsContributed: ['Listening', 'Reading']
  },
  WFD: {
    code: 'WFD',
    name: 'Write from Dictation',
    part: 'PART_3',
    category: 'Listening',
    scored: true,
    audioRangeSeconds: [3, 9],
    expectedItemIds: ['WFD-01', 'WFD-02', 'WFD-03'],
    instructions: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    scoringCriteria: '1 point for each correct word spelled accurately',
    skillsContributed: ['Listening', 'Writing']
  }
};

export const OFFICIAL_ITEM_ID_SEQUENCE = [
  'PI-01',
  // Part 1: Speaking & Writing
  'RA-01', 'RA-02', 'RA-03', 'RA-04', 'RA-05', 'RA-06',
  'RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05', 'RS-06', 'RS-07', 'RS-08', 'RS-09', 'RS-10',
  'DI-01', 'DI-02', 'DI-03', 'DI-04', 'DI-05', 'DI-06',
  'RL-01', 'RL-02',
  'SGD-01', 'SGD-02',
  'RTS-01', 'RTS-02',
  'ASQ-01', 'ASQ-02', 'ASQ-03', 'ASQ-04', 'ASQ-05',
  'SWT-01', 'SWT-02',
  'WE-01',
  // Part 2: Reading
  'FIB-RW-01', 'FIB-RW-02', 'FIB-RW-03', 'FIB-RW-04', 'FIB-RW-05',
  'MCMA-R-01', 'MCMA-R-02',
  'RO-R-01', 'RO-R-02',
  'FIB-R-01', 'FIB-R-02', 'FIB-R-03', 'FIB-R-04',
  'MCSA-R-01', 'MCSA-R-02',
  // Part 3: Listening
  'SST-01',
  'MCMA-L-01', 'MCMA-L-02',
  'FIB-L-01', 'FIB-L-02',
  'HCS-01', 'HCS-02',
  'MCSA-L-01', 'MCSA-L-02',
  'SMW-01', 'SMW-02',
  'HIW-01', 'HIW-02',
  'WFD-01', 'WFD-02', 'WFD-03'
];

export function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function formatTimeMMSS(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

