/**
 * Master templates and cheat sheets for all 22 Pearson PTE Academic task folders.
 * Used for inline cheat sheet previews and downloadable TXT formatting guides.
 */

export const TASK_TEMPLATES = {
  // Part 1: Speaking & Writing
  '01_Read_Aloud': {
    taskType: 'RA',
    folderName: '01_Read_Aloud',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Read Aloud',
    quota: 6,
    sampleFileName: 'RA-07.txt',
    description: 'Plain text passage (30-65 words). The entire file is read aloud by the student.',
    sampleContent: `Robots are typically built with inflexible materials, like metal. This means their adaptability and range of motion is limited. However, engineers have developed a new generation of soft robots based on animal anatomy. Inspired by the soft tissue which gives many creatures flexibility, engineers have designed robots that can move in ways rigid robots cannot.`
  },
  '02_Repeat_Sentence': {
    taskType: 'RS',
    folderName: '02_Repeat_Sentence',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Repeat Sentence',
    quota: 10,
    sampleFileName: 'RS-11.txt',
    description: 'A single academic sentence (7-16 words). Auto-synthesized via Neural TTS if no .mp3 is uploaded.',
    sampleContent: `The university library will remain open twenty-four hours during the examination period.`
  },
  '03_Describe_Image': {
    taskType: 'DI',
    folderName: '03_Describe_Image',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Describe Image',
    quota: 6,
    sampleFileName: 'DI-07.txt',
    description: 'Chart description notes paired with DI-07.png / DI-07.svg, or direct SVG markup in .txt/.svg.',
    sampleContent: `TITLE: Renewable Energy Generation by Source (2015-2025)
CHART_TYPE: Bar Chart
DATA:
- Solar: 64% increase
- Wind: 52% increase
- Hydro: 39% increase
- Biomass: 21% increase
KEY_OBSERVATION: Solar and wind generation demonstrated exponential expansion compared to hydro.`
  },
  '04_Retell_Lecture': {
    taskType: 'RL',
    folderName: '04_Retell_Lecture',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Retell Lecture',
    quota: 2,
    sampleFileName: 'RL-03.txt',
    description: 'Academic lecture transcript (60-90 seconds). Auto-synthesizes British/American audio if no .mp3 is present.',
    sampleContent: `In today's lecture on astrophysics, we examine the lifecycle of massive red supergiant stars. When nuclear fusion exhausts core hydrogen, gravitational pressure induces rapid collapse, culminating in catastrophic core-collapse supernova explosions. These energetic cosmic detonations disperse heavy chemical elements across interstellar clouds, forming the molecular nurseries from which second-generation planetary systems coalesce.`
  },
  '05_Summarize_Group_Discussion': {
    taskType: 'SGD',
    folderName: '05_Summarize_Group_Discussion',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Summarize Group Discussion',
    quota: 2,
    sampleFileName: 'SGD-03.txt',
    description: 'Multi-speaker dialogue. Lines starting with Speaker 1/2/3 are synthesized with different neural voices (UK, US, AU).',
    sampleContent: `Speaker 1 (Student Rep): Higher education should be universally state-funded because tuition fees exacerbate socioeconomic disparity.
Speaker 2 (Economics Professor): While universal subsidies sound equitable, evidence suggests public funding without merit incentives can strain national budgets and lower per-student teaching resources.
Speaker 3 (Policy Advisor): A balanced compromise is income-contingent loans or targeted grants for underprivileged demographics rather than blanket subsidies.`
  },
  '06_Respond_to_Situation': {
    taskType: 'RTS',
    folderName: '06_Respond_to_Situation',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Respond to Situation',
    quota: 2,
    sampleFileName: 'RTS-03.txt',
    description: 'Campus dilemma prompt. The student hears the context and speaks an appropriate conversational response.',
    sampleContent: `You are collaborating on a group economics project due in twenty-four hours. Your teammate calls to tell you they lost their research files due to a hard drive crash. In twenty seconds, explain how you will divide the remaining work to meet the deadline.`
  },
  '07_Answer_Short_Question': {
    taskType: 'ASQ',
    folderName: '07_Answer_Short_Question',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Answer Short Question',
    quota: 5,
    sampleFileName: 'ASQ-06.txt',
    description: 'Direct question followed by accepted one-word/short answers.',
    sampleContent: `QUESTION: What instrument is used to observe distant celestial bodies in the night sky?
ANSWER: telescope`
  },
  '08_Summarize_Written_Text': {
    taskType: 'SWT',
    folderName: '08_Summarize_Written_Text',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Summarize Written Text',
    quota: 2,
    sampleFileName: 'SWT-03.txt',
    description: 'Academic reading passage (150-300 words). The student must summarize it into a single sentence of 5-75 words.',
    sampleContent: `Microplastics—synthetic polymer particles smaller than five millimeters—have infiltrated marine ecosystems globally. Marine filter feeders, including mussels and zooplankton, ingest microplastics, mistaking them for food particles. This ingestion can cause false satiation, physical intestinal blockage, and chemical toxicity as plastic additives leach into tissue. The bioaccumulation of plastics through the food chain represents a growing threat to marine biodiversity and human consumers of seafood.`
  },
  '09_Write_Essay': {
    taskType: 'WE',
    folderName: '09_Write_Essay',
    parentKey: 'Part1_Speaking_Writing',
    title: 'Write Essay',
    quota: 1,
    sampleFileName: 'WE-02.txt',
    description: 'Essay topic prompt (200-300 words in 20 minutes).',
    sampleContent: `Artificial intelligence and autonomous automation technologies are rapidly transforming industrial workplaces. Some economists argue that automation destroys employment opportunities, while others assert it creates higher-value technical professions. Discuss both viewpoints and state your opinion with relevant examples.`
  },

  // Part 2: Reading
  '01_FIB_Dropdown': {
    taskType: 'FIB-RW',
    folderName: '01_FIB_Dropdown',
    parentKey: 'Part2_Reading',
    title: 'Reading & Writing: Fill in the Blanks',
    quota: 5,
    sampleFileName: 'FIB-RW-06.txt',
    description: 'Passage containing bracketed dropdowns: [correctAnswer|wrongChoice1|wrongChoice2|wrongChoice3].',
    sampleContent: `City planners have long [recognized|ignored|dismissed|delayed] that urban green spaces promote community well-being. Recent empirical studies provide a firmer scientific [foundation|hypothesis|doubt|barrier] for this belief. Residents living near parks report lower [stress|wealth|traffic|oxygen] levels and engage in more frequent physical recreation.`
  },
  '02_MC_Multiple_Answers_R': {
    taskType: 'MCMA-R',
    folderName: '02_MC_Multiple_Answers',
    parentKey: 'Part2_Reading',
    title: 'Multiple Choice, Multiple Answers (Reading)',
    quota: 2,
    sampleFileName: 'MCMA-R-03.txt',
    description: 'Reading passage, question, choices (A-E), and comma-separated correct letters.',
    sampleContent: `PASSAGE:
Archeological excavations in the Indus Valley revealed sophisticated urban planning unparalleled in the ancient Bronze Age world. Cities featured grid-pattern street layouts, multi-story brick dwellings, and intricate covered drainage channels running beneath paved streets. Standardized weights and measures indicate centralized administrative coordination and active trade networks with Mesopotamia.

QUESTION:
Which of the following statements about Indus Valley settlements are supported by the passage?

OPTIONS:
A) Urban streets were arranged according to systematic grid configurations.
B) Excavations revealed extensive underground covered sewage drainage systems.
C) Mesopotamian merchants held complete imperial sovereignty over the Indus cities.
D) Standardized measurement apparatus suggests centralized administrative control.
E) The majority of city dwellings were built exclusively from unbaked straw mud.

ANSWER: A, B, D`
  },
  '03_Reorder_Paragraphs': {
    taskType: 'RO-R',
    folderName: '03_Reorder_Paragraphs',
    parentKey: 'Part2_Reading',
    title: 'Reorder Paragraphs',
    quota: 2,
    sampleFileName: 'RO-R-03.txt',
    description: 'Each non-empty line is one paragraph box in its correct order. The simulator shuffles them for students.',
    sampleContent: `In the mid-fifteenth century, Johannes Gutenberg perfected the movable metal-type printing press in Mainz, Germany.
Prior to this mechanical breakthrough, European manuscripts were laboriously copied by hand in monastic scriptoria.
This technological innovation exponentially reduced the labor and cost required to reproduce texts.
Consequently, scientific ideas and literacy spread across the continent at an unprecedented speed, accelerating the Renaissance.`
  },
  '04_FIB_Drag_and_Drop': {
    taskType: 'FIB-R',
    folderName: '04_FIB_Drag_and_Drop',
    parentKey: 'Part2_Reading',
    title: 'Reading: Fill in the Blanks (Drag & Drop)',
    quota: 4,
    sampleFileName: 'FIB-R-05.txt',
    description: 'Passage with [correctAnswer] blanks, followed by a bottom line: DISTRACTORS: word1, word2, word3.',
    sampleContent: `The Earth's ozone layer resides within the [stratosphere], approximately fifteen to thirty-five kilometers above ground level. This gaseous shield absorbs harmful solar ultraviolet [radiation] that would otherwise trigger cellular mutations in terrestrial organisms. Anthropogenic emissions of chlorofluorocarbons historically [depleted] this protective layer, prompting international regulatory treaties.

DISTRACTORS: troposphere, illumination, amplified, accelerated`
  },
  '05_MC_Single_Answer_R': {
    taskType: 'MCSA-R',
    folderName: '05_MC_Single_Answer',
    parentKey: 'Part2_Reading',
    title: 'Multiple Choice, Single Answer (Reading)',
    quota: 2,
    sampleFileName: 'MCSA-R-03.txt',
    description: 'Reading passage, question, choices (A-D), and single correct letter.',
    sampleContent: `PASSAGE:
Glaciologists measuring ice core samples extracted from deep ice sheets in Antarctica have constructed atmospheric carbon dioxide records spanning 800,000 years. Trapped air bubbles in successive snowfall layers preserve ambient atmospheric gas concentrations at the exact epoch the ice compacted. These records reveal that contemporary CO2 levels exceed any threshold documented over the last eight hundred millennia.

QUESTION:
What is the primary scientific value of ice core air bubbles discussed in the passage?

OPTIONS:
A) They provide direct physical archives of historical atmospheric gas compositions.
B) They demonstrate that ancient carbon levels were consistently higher than today.
C) They prevent Antarctic ice sheets from cracking under geothermal pressures.
D) They indicate the exact speed of ocean currents during ancient ice ages.

ANSWER: A`
  },

  // Part 3: Listening
  '01_Summarize_Spoken_Text': {
    taskType: 'SST',
    folderName: '01_Summarize_Spoken_Text',
    parentKey: 'Part3_Listening',
    title: 'Summarize Spoken Text',
    quota: 1,
    sampleFileName: 'SST-02.txt',
    description: 'Spoken lecture transcript (60-90s). The student writes a 50-70 word summary in 10 minutes.',
    sampleContent: `In quantum computing, traditional binary bits are replaced by quantum bits, or qubits, capable of existing in superposition states of zero and one simultaneously. By leveraging quantum entanglement, quantum processors perform parallel matrix calculations at speeds exponentially exceeding conventional silicon supercomputers. However, qubits remain extremely susceptible to environmental thermal noise, requiring near absolute-zero refrigeration to prevent decoherence errors.`
  },
  '02_MC_Multiple_Answers_L': {
    taskType: 'MCMA-L',
    folderName: '02_MC_Multiple_Answers',
    parentKey: 'Part3_Listening',
    title: 'Multiple Choice, Multiple Answers (Listening)',
    quota: 2,
    sampleFileName: 'MCMA-L-03.txt',
    description: 'AUDIO: transcript (or paired with .mp3), QUESTION:, OPTIONS:, and comma-separated ANSWER: letters.',
    sampleContent: `AUDIO:
In our engineering lab today, we tested a new carbon-fiber composite material designed for aerospace structural frames. The composite demonstrated a forty percent reduction in overall weight compared to conventional aerospace-grade aluminum alloys. Additionally, its fatigue resistance under sustained cyclic loading was markedly superior, although manufacturing costs remain substantially elevated.

QUESTION:
Which of the following attributes characterized the new carbon-fiber composite tested in the lab?

OPTIONS:
A) It achieved a 40% reduction in weight compared to standard aluminum.
B) It exhibited superior fatigue resistance under cyclic structural stresses.
C) It was immediately cheaper to fabricate than existing metallic alloys.
D) Its chemical recycling procedures are not yet fully matured.
E) It melted quickly when exposed to normal room temperatures.

ANSWER: A, B, D`
  },
  '03_FIB_Type_In': {
    taskType: 'FIB-L',
    folderName: '03_FIB_Type_In',
    parentKey: 'Part3_Listening',
    title: 'Listening: Fill in the Blanks',
    quota: 2,
    sampleFileName: 'FIB-L-03.txt',
    description: 'Passage with [bracketedWords]. The audio speaks the full text (brackets stripped); student types the words into blank inputs.',
    sampleContent: `To construct an effective scientific methodology, researchers must define their [variables] clearly before initiating laboratory experiments. Uncontrolled [factors] can introduce confounding noise into datasets, distorting the empirical [evidence] and leading to invalid statistical conclusions.`
  },
  '04_Highlight_Correct_Summary': {
    taskType: 'HCS',
    folderName: '04_Highlight_Correct_Summary',
    parentKey: 'Part3_Listening',
    title: 'Highlight Correct Summary',
    quota: 2,
    sampleFileName: 'HCS-03.txt',
    description: 'AUDIO: transcript followed by 4 summary options (A-D) and the single correct ANSWER:.',
    sampleContent: `AUDIO:
Agriculturalists in arid zones are increasingly adopting drip irrigation technology rather than traditional flood irrigation. Flood methods result in substantial water loss due to surface evaporation and runoff, and they exacerbate soil salinization. By delivering precise moisture volumes directly to crop roots, drip irrigation conserves up to sixty percent more water and enhances crop productivity.

OPTIONS:
A) Drip irrigation delivers targeted water to crop roots, drastically reducing evaporation and salinization while conserving significant water resources compared to flood irrigation.
B) Flood irrigation is universally superior because water runoff dissolves vital soil minerals and enriches nearby rivers with beneficial nutrients.
C) Arid agriculture must abandon all forms of irrigation because artificial watering invariably causes unrecoverable root rot across all crop species.
D) Drip irrigation technology consumes double the water of flood irrigation but is mandated by environmental regulations to protect salinized soils.

ANSWER: A`
  },
  '05_MC_Single_Answer_L': {
    taskType: 'MCSA-L',
    folderName: '05_MC_Single_Answer',
    parentKey: 'Part3_Listening',
    title: 'Multiple Choice, Single Answer (Listening)',
    quota: 2,
    sampleFileName: 'MCSA-L-03.txt',
    description: 'AUDIO: transcript, QUESTION:, 4 OPTIONS: (A-D), and single correct ANSWER:.',
    sampleContent: `AUDIO:
In our lecture on urban acoustics, we noted that architectural noise barriers along expressways are most effective when positioned immediately adjacent to the noise source rather than midway between the highway and residential communities. Proximity to traffic prevents acoustic wave diffraction over the barrier crest.

QUESTION:
Where should highway acoustic barriers be placed to maximize sound reduction?

OPTIONS:
A) Directly adjacent to the highway traffic source.
B) Midway between the highway and residential houses.
C) Only on the rooftops of distant homes.
D) Underground beneath stormwater drainage tunnels.

ANSWER: A`
  },
  '06_Select_Missing_Word': {
    taskType: 'SMW',
    folderName: '06_Select_Missing_Word',
    parentKey: 'Part3_Listening',
    title: 'Select Missing Word',
    quota: 2,
    sampleFileName: 'SMW-03.txt',
    description: 'AUDIO: transcript concluding with [BEEP], QUESTION:, OPTIONS: (A-D), and ANSWER:.',
    sampleContent: `AUDIO:
Modern architectural engineering prioritizes building envelope integrity. By installing high-performance double glazing and airtight vapor barriers, structures minimize passive heat dissipation, leading to substantial reductions in energy [BEEP].

QUESTION:
Select the option that most appropriately completes the recording ending with [BEEP].

OPTIONS:
A) consumption
B) evaporation
C) fertilization
D) reproduction

ANSWER: A`
  },
  '07_Highlight_Incorrect_Words': {
    taskType: 'HIW',
    folderName: '07_Highlight_Incorrect_Words',
    parentKey: 'Part3_Listening',
    title: 'Highlight Incorrect Words',
    quota: 2,
    sampleFileName: 'HIW-03.txt',
    description: 'Transcript with [spokenWord|writtenWord]. The speech engine speaks spokenWord; student clicks writtenWord.',
    sampleContent: `Geological surveys indicate that tectonic [boundary|weather] movements generate substantial [seismic|thermal] energy along active continental fault lines.`
  },
  '08_Write_From_Dictation': {
    taskType: 'WFD',
    folderName: '08_Write_From_Dictation',
    parentKey: 'Part3_Listening',
    title: 'Write From Dictation',
    quota: 3,
    sampleFileName: 'WFD-04.txt',
    description: 'A single spoken sentence (8-14 words). Student listens once and types it verbatim.',
    sampleContent: `The university archive contains historical manuscripts and rare cartographic maps dating from the seventeenth century.`
  }
};

/**
 * Returns a complete Markdown formatting guide that can be downloaded by teachers.
 */
export function generateFormattingGuideMarkdown() {
  let doc = `# PTE Academic Question Bank: Complete .TXT Formatting Guide\n\n`;
  doc += `> **Overview**: Teachers can create and manage exam questions by dropping plain \`.txt\` files directly into the 22 task subfolders inside \`question_bank/\`. The simulator's automatic parser scans these files in real-time, extracts prompts, options, blanks, and answers, and auto-synthesizes studio-quality Neural TTS audio for any transcript without an \`.mp3\`.\n\n`;
  doc += `---\n\n`;
  doc += `## Table of Contents\n\n`;
  doc += `1. **Part 1: Speaking & Writing** (9 Tasks)\n`;
  doc += `2. **Part 2: Reading** (5 Tasks)\n`;
  doc += `3. **Part 3: Listening** (8 Tasks)\n`;
  doc += `4. **Neural Voice & Multi-Speaker Synthesizer Rules**\n\n`;
  doc += `---\n\n`;

  const sections = [
    { title: 'Part 1: Speaking & Writing', prefix: 'Part1_Speaking_Writing' },
    { title: 'Part 2: Reading', prefix: 'Part2_Reading' },
    { title: 'Part 3: Listening', prefix: 'Part3_Listening' }
  ];

  sections.forEach((sec) => {
    doc += `## ${sec.title}\n\n`;
    Object.values(TASK_TEMPLATES)
      .filter((tmpl) => tmpl.parentKey === sec.prefix)
      .forEach((tmpl) => {
        doc += `### ${tmpl.folderName} (${tmpl.taskType})\n`;
        doc += `- **Target Folder**: \`question_bank/${tmpl.parentKey}/${tmpl.folderName}/\`\n`;
        doc += `- **Official Session Quota**: ${tmpl.quota} items\n`;
        doc += `- **Description**: ${tmpl.description}\n`;
        doc += `- **Example File Name**: \`${tmpl.sampleFileName}\`\n\n`;
        doc += `\`\`\`txt\n${tmpl.sampleContent}\n\`\`\`\n\n`;
      });
  });

  doc += `---\n\n`;
  doc += `## Neural Voice & Audio Synthesis Conventions\n\n`;
  doc += `1. **Single Speaker Synthesis**: Any \`.txt\` file in audio folders (\`RS\`, \`RL\`, \`RTS\`, \`SST\`, \`MCMA-L\`, \`FIB-L\`, \`HCS\`, \`MCSA-L\`, \`SMW\`, \`HIW\`, \`WFD\`) will be automatically synthesized using Microsoft Edge Neural TTS with British (\`en-GB-SoniaNeural\`), American (\`en-US-AriaNeural\`), or Australian (\`en-AU-NatashaNeural\`) studio voices.\n`;
  doc += `2. **Multi-Speaker Synthesis**: In \`05_Summarize_Group_Discussion\`, prepend lines with \`Speaker 1:\`, \`Speaker 2:\`, and \`Speaker 3:\`. The engine synthesizes each speaker with a distinct neural voice and concatenates them seamlessly into one audio track.\n`;
  doc += `3. **Cloze Bracket Stripping**: In \`03_FIB_Type_In\`, bracketed words like \`[variables]\` are automatically spoken as \`variables\` in audio, while the student sees an interactive input box.\n`;
  doc += `4. **Highlight Incorrect Words**: In \`07_Highlight_Incorrect_Words\`, syntax \`[spokenWord|writtenWord]\` instructs the speech engine to speak \`spokenWord\` while displaying \`writtenWord\` on screen.\n`;
  doc += `5. **Beep Insertion**: In \`06_Select_Missing_Word\`, appending \`[BEEP]\` plays an authentic tone at the end of the sentence.\n\n`;

  return doc;
}

