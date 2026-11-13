/**
 * Extensible Exam Configuration Defaults
 * Provides interaction archetypes, default task type registry, and timing/scoring helpers.
 */

export const INTERACTION_ARCHETYPES = {
  spoken: {
    id: 'spoken',
    label: 'Spoken Response (Mic + Timer)',
    description: 'Displays a media prompt (text/image/audio), gives prep countdown, and records microphone speech.',
    defaultCategory: 'Speaking',
    defaultPrepSeconds: 35,
    defaultRecordSeconds: 40,
    hasAudioInput: true,
    hasTextInput: false
  },
  extended_text: {
    id: 'extended_text',
    label: 'Extended Text / Essay (Timed Textbox)',
    description: 'Displays a prompt/passage with a rich text area, real-time word counter, sentence validator, and dedicated timer.',
    defaultCategory: 'Writing',
    defaultDedicatedTimerSeconds: 600, // 10 mins
    hasAudioInput: false,
    hasTextInput: true
  },
  inline_blanks: {
    id: 'inline_blanks',
    label: 'Inline Blanks (Dropdown or Drag & Drop)',
    description: 'Reading passage with interactive dropdowns or drag-and-drop word chips.',
    defaultCategory: 'Reading',
    hasAudioInput: false,
    hasTextInput: false
  },
  multiple_choice: {
    id: 'multiple_choice',
    label: 'Multiple Choice (Single or Multi-Select)',
    description: 'Prompt with option buttons. Supports single selection or multi-select with negative marking.',
    defaultCategory: 'Reading',
    hasAudioInput: false,
    hasTextInput: false
  },
  reorder: {
    id: 'reorder',
    label: 'Sequence / Paragraph Reordering',
    description: 'Draggable or selectable list of sentences/paragraphs scored on adjacent sequence pairs.',
    defaultCategory: 'Reading',
    hasAudioInput: false,
    hasTextInput: false
  },
  audio_cloze: {
    id: 'audio_cloze',
    label: 'Audio Cloze / Dictation (Single Play Audio + Input)',
    description: 'Single-play audio listening task with text typing, word highlighting, or option selection.',
    defaultCategory: 'Listening',
    hasAudioInput: false,
    hasTextInput: true
  }
};

export const BASE_TASK_TYPES = {
  // Part 1: Speaking & Writing
  PI: {
    code: 'PI',
    name: 'Personal Introduction',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: false,
    prepSeconds: 25,
    recordSeconds: 30,
    instructions: 'Read the prompt below and give a brief personal introduction. You have 25 seconds to prepare and 30 seconds to record your response.',
    scoringCriteria: 'Unscored',
    skillsContributed: ['Speaking']
  },
  RA: {
    code: 'RA',
    name: 'Read Aloud',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 35,
    recordSeconds: 40,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 5 },
      { id: 'fluency', label: 'Oral Fluency', maxScore: 5 },
      { id: 'pronunciation', label: 'Pronunciation', maxScore: 5 }
    ],
    instructions: 'Look at the text below. In 35 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.',
    skillsContributed: ['Speaking']
  },
  RS: {
    code: 'RS',
    name: 'Repeat Sentence',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 0,
    recordSeconds: 15,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 3 },
      { id: 'fluency', label: 'Oral Fluency', maxScore: 5 },
      { id: 'pronunciation', label: 'Pronunciation', maxScore: 5 }
    ],
    instructions: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    skillsContributed: ['Speaking', 'Listening']
  },
  DI: {
    code: 'DI',
    name: 'Describe Image',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 25,
    recordSeconds: 40,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 6 },
      { id: 'fluency', label: 'Oral Fluency', maxScore: 5 },
      { id: 'pronunciation', label: 'Pronunciation', maxScore: 5 }
    ],
    instructions: 'Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You have 40 seconds to record.',
    skillsContributed: ['Speaking']
  },
  RL: {
    code: 'RL',
    name: 'Retell Lecture',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 10,
    recordSeconds: 40,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 6 },
      { id: 'fluency', label: 'Oral Fluency', maxScore: 5 },
      { id: 'pronunciation', label: 'Pronunciation', maxScore: 5 }
    ],
    instructions: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard.',
    skillsContributed: ['Speaking', 'Listening']
  },
  SGD: {
    code: 'SGD',
    name: 'Summarize Group Discussion',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 10,
    recordSeconds: 120,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 6 },
      { id: 'fluency', label: 'Oral Fluency', maxScore: 5 },
      { id: 'pronunciation', label: 'Pronunciation', maxScore: 5 }
    ],
    instructions: 'You will hear a group discussion. In 10 seconds, prepare to summarize the main points and perspectives raised. You have 120 seconds to record.',
    skillsContributed: ['Speaking', 'Listening']
  },
  RTS: {
    code: 'RTS',
    name: 'Respond to Situation',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 10,
    recordSeconds: 40,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'appropriateness', label: 'Appropriateness/Content', maxScore: 6 },
      { id: 'fluency', label: 'Oral Fluency', maxScore: 5 },
      { id: 'pronunciation', label: 'Pronunciation', maxScore: 5 }
    ],
    instructions: 'Read and listen to the campus situation. You have 10 seconds to prepare and 40 seconds to record an appropriate response.',
    skillsContributed: ['Speaking']
  },
  ASQ: {
    code: 'ASQ',
    name: 'Answer Short Question',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 0,
    recordSeconds: 10,
    scoringMode: 'exact_match',
    pointsPerCorrect: 1,
    instructions: 'You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.',
    skillsContributed: ['Listening']
  },
  SWT: {
    code: 'SWT',
    name: 'Summarize Written Text',
    part: 'PART_1',
    category: 'Writing',
    archetype: 'extended_text',
    scored: true,
    dedicatedTimerSeconds: 600, // 10 mins
    minWords: 5,
    maxWords: 75,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 4 },
      { id: 'form', label: 'Form (One Sentence 5-75 words)', maxScore: 1 },
      { id: 'grammar', label: 'Grammar', maxScore: 2 },
      { id: 'vocabulary', label: 'Vocabulary', maxScore: 2 }
    ],
    instructions: 'Read the passage below and summarize it using one sentence. You have 10 minutes to finish this task. Write 5–75 words.',
    skillsContributed: ['Writing', 'Reading']
  },
  WE: {
    code: 'WE',
    name: 'Write Essay',
    part: 'PART_1',
    category: 'Writing',
    archetype: 'extended_text',
    scored: true,
    dedicatedTimerSeconds: 1200, // 20 mins
    minWords: 200,
    maxWords: 300,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 6 },
      { id: 'form', label: 'Form (200-300 words)', maxScore: 2 },
      { id: 'structure', label: 'Development & Coherence', maxScore: 6 },
      { id: 'grammar', label: 'Grammar', maxScore: 2 },
      { id: 'linguisticRange', label: 'General Linguistic Range', maxScore: 6 },
      { id: 'vocabulary', label: 'Vocabulary', maxScore: 2 },
      { id: 'spelling', label: 'Spelling', maxScore: 2 }
    ],
    instructions: 'You have 20 minutes to plan, write, and revise an essay about the topic below. Write 200–300 words.',
    skillsContributed: ['Writing']
  },

  // Part 2: Reading
  'FIB-RW': {
    code: 'FIB-RW',
    name: 'Reading & Writing: Fill in Blanks',
    part: 'PART_2',
    category: 'Reading',
    archetype: 'inline_blanks',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'Below is a text with blanks. Click on each blank and select the appropriate answer choice.',
    skillsContributed: ['Reading', 'Writing']
  },
  'MCMA-R': {
    code: 'MCMA-R',
    name: 'Multiple Choice, Multiple Answers (Reading)',
    part: 'PART_2',
    category: 'Reading',
    archetype: 'multiple_choice',
    scored: true,
    scoringMode: 'negative_marking',
    pointsPerCorrect: 1,
    penaltyPerIncorrect: 1,
    scoreFloor: 0,
    instructions: 'Read the text and answer the question by selecting all the correct responses. More than one response is correct.',
    skillsContributed: ['Reading']
  },
  'RO-R': {
    code: 'RO-R',
    name: 'Reorder Paragraphs',
    part: 'PART_2',
    category: 'Reading',
    archetype: 'reorder',
    scored: true,
    scoringMode: 'adjacent_pairs',
    pointsPerCorrect: 1,
    instructions: 'Restore the original order of paragraphs by dragging them or moving them into sequence.',
    skillsContributed: ['Reading']
  },
  'FIB-R': {
    code: 'FIB-R',
    name: 'Reading: Fill in Blanks (Drag & Drop)',
    part: 'PART_2',
    category: 'Reading',
    archetype: 'inline_blanks',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'Drag words from the word pool below to fill the appropriate blanks in the passage.',
    skillsContributed: ['Reading']
  },
  'MCSA-R': {
    code: 'MCSA-R',
    name: 'Multiple Choice, Single Answer (Reading)',
    part: 'PART_2',
    category: 'Reading',
    archetype: 'multiple_choice',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'Read the text and answer the multiple-choice question by selecting the single correct response.',
    skillsContributed: ['Reading']
  },

  // Part 3: Listening
  SST: {
    code: 'SST',
    name: 'Summarize Spoken Text',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'extended_text',
    scored: true,
    dedicatedTimerSeconds: 600, // 10 mins
    minWords: 50,
    maxWords: 70,
    scoringMode: 'rubric_ai',
    rubricTraits: [
      { id: 'content', label: 'Content', maxScore: 4 },
      { id: 'form', label: 'Form (50-70 words)', maxScore: 2 },
      { id: 'grammar', label: 'Grammar', maxScore: 2 },
      { id: 'vocabulary', label: 'Vocabulary', maxScore: 2 },
      { id: 'spelling', label: 'Spelling', maxScore: 2 }
    ],
    instructions: 'You will hear a short lecture. Write a 50–70 word summary in 10 minutes.',
    skillsContributed: ['Listening', 'Writing']
  },
  'MCMA-L': {
    code: 'MCMA-L',
    name: 'Multiple Choice, Multiple Answers (Listening)',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'multiple_choice',
    scored: true,
    scoringMode: 'negative_marking',
    pointsPerCorrect: 1,
    penaltyPerIncorrect: 1,
    scoreFloor: 0,
    instructions: 'Listen to the recording and answer the question by selecting all the correct responses.',
    skillsContributed: ['Listening']
  },
  'FIB-L': {
    code: 'FIB-L',
    name: 'Fill in the Blanks (Listening)',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'audio_cloze',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'You will hear a recording. Type the missing words in each blank.',
    skillsContributed: ['Listening', 'Writing']
  },
  HCS: {
    code: 'HCS',
    name: 'Highlight Correct Summary',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'multiple_choice',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'You will hear a recording. Click on the paragraph that best relates to the recording.',
    skillsContributed: ['Listening', 'Reading']
  },
  'MCSA-L': {
    code: 'MCSA-L',
    name: 'Multiple Choice, Single Answer (Listening)',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'multiple_choice',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'Listen to the recording and answer the multiple-choice question by selecting the single correct response.',
    skillsContributed: ['Listening']
  },
  SMW: {
    code: 'SMW',
    name: 'Select Missing Word',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'multiple_choice',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'Listen to the recording. The last word or words have been replaced by a beep. Select the option that completes it.',
    skillsContributed: ['Listening']
  },
  HIW: {
    code: 'HIW',
    name: 'Highlight Incorrect Words',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'audio_cloze',
    scored: true,
    scoringMode: 'negative_marking',
    pointsPerCorrect: 1,
    penaltyPerIncorrect: 1,
    scoreFloor: 0,
    instructions: 'Listen to the recording. In the text below, click any words that differ from what the speaker said.',
    skillsContributed: ['Listening', 'Reading']
  },
  WFD: {
    code: 'WFD',
    name: 'Write from Dictation',
    part: 'PART_3',
    category: 'Listening',
    archetype: 'audio_cloze',
    scored: true,
    scoringMode: 'points_per_blank',
    pointsPerCorrect: 1,
    instructions: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it.',
    skillsContributed: ['Listening', 'Writing']
  }
};

/**
 * Returns effective timing configuration for an item
 */
export function getEffectiveTiming(item, taskTypeMeta = null) {
  const meta = taskTypeMeta || BASE_TASK_TYPES[item?.taskType] || {};
  return {
    prepSeconds: item?.timingOverrides?.prepSeconds ?? item?.prepSeconds ?? meta.prepSeconds ?? 35,
    recordSeconds: item?.timingOverrides?.recordSeconds ?? item?.recordSeconds ?? meta.recordSeconds ?? 40,
    dedicatedTimerSeconds:
      item?.timingOverrides?.timerSeconds ??
      item?.timerSeconds ??
      item?.timingOverrides?.dedicatedTimerSeconds ??
      meta.dedicatedTimerSeconds ??
      null,
    audioCountdownSeconds: item?.timingOverrides?.audioCountdownSeconds ?? 7,
    minWords: item?.timingOverrides?.minWords ?? item?.minWords ?? meta.minWords ?? 0,
    maxWords: item?.timingOverrides?.maxWords ?? item?.maxWords ?? meta.maxWords ?? 0
  };
}

/**
 * Returns effective scoring configuration for an item
 */
export function getEffectiveScoring(item, taskTypeMeta = null) {
  const meta = taskTypeMeta || BASE_TASK_TYPES[item?.taskType] || {};
  return {
    scoringMode: item?.scoringOverrides?.scoringMode ?? item?.scoringMode ?? meta.scoringMode ?? 'points_per_blank',
    pointsPerCorrect: item?.scoringOverrides?.pointsPerCorrect ?? item?.pointsPerCorrect ?? meta.pointsPerCorrect ?? 1,
    penaltyPerIncorrect:
      item?.scoringOverrides?.penaltyPerIncorrect ?? item?.penaltyPerIncorrect ?? meta.penaltyPerIncorrect ?? 0,
    scoreFloor: item?.scoringOverrides?.scoreFloor ?? item?.scoreFloor ?? meta.scoreFloor ?? 0,
    maxPoints: item?.scoringOverrides?.maxPoints ?? item?.maxPoints ?? null,
    rubricTraits: item?.scoringOverrides?.rubricTraits ?? item?.rubricTraits ?? meta.rubricTraits ?? []
  };
}

