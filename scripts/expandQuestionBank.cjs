const fs = require('fs');
const path = require('path');

const qbPath = path.resolve(__dirname, '../src/data/questionBank.json');
const qb = JSON.parse(fs.readFileSync(qbPath, 'utf8'));

// Fix existing DI-01 to DI-06 to have diverse images
const diImageFixes = {
  'DI-01': '/media/images/di-sample-chart.svg',
  'DI-02': '/media/images/di-sample-process.svg',
  'DI-03': '/media/images/di-sleep-chart.svg',
  'DI-04': '/media/images/di-library-line.svg',
  'DI-05': '/media/images/di-cetacean-bars.svg',
  'DI-06': '/media/images/di-reading-table.svg'
};

qb.items.forEach((it) => {
  if (it.taskType === 'DI' && diImageFixes[it.id]) {
    it.imageUrl = diImageFixes[it.id];
  }
});

const newItems = [
  // ==========================================
  // PI: Personal Introduction (Total: 3)
  // ==========================================
  {
    id: 'PI-02',
    taskType: 'PI',
    part: 'PART_1',
    title: 'Personal Introduction 02: Career Progression & Academic Vision',
    prompt: 'Please introduce yourself. You could talk about your current profession, your motivation for taking the PTE Academic exam, your future career goals, and what you hope to achieve in the next five years.',
    prepSeconds: 25,
    recordSeconds: 30,
    referenceNotes: 'Unscored Pearson introductory prompt. Focus on natural fluency, clear articulation, and cohesive self-introduction.'
  },
  {
    id: 'PI-03',
    taskType: 'PI',
    part: 'PART_1',
    title: 'Personal Introduction 03: Hometown & International Study Ambitions',
    prompt: 'Please introduce yourself. You could talk about your hometown or country of origin, why you chose your field of research or study, an accomplishment you are proud of, and your plans after completing your degree.',
    prepSeconds: 25,
    recordSeconds: 30,
    referenceNotes: 'Unscored Pearson introductory prompt. Focus on consistent pacing and clear vocal projection.'
  },

  // ==========================================
  // RA: Read Aloud (RA-07 to RA-14)
  // ==========================================
  {
    id: 'RA-07',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 07: Marine Bioluminescence & Deep Sea Adaptations',
    prompt: 'Bioluminescence is the biochemical production and emission of light by a living organism, occurring predominantly in deep oceanic environments where sunlight fails to penetrate. Certain species of fish, jellyfish, and cephalopods synthesize light-emitting molecules known as luciferins. These glowing adaptations serve diverse ecological functions, ranging from deterring nocturnal predators and illuminating murky surroundings to attracting potential mates and luring unsuspecting prey.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'Bioluminescence is the biochemical production and emission of light by a living organism, occurring predominantly in deep oceanic environments where sunlight fails to penetrate. Certain species of fish, jellyfish, and cephalopods synthesize light-emitting molecules known as luciferins. These glowing adaptations serve diverse ecological functions, ranging from deterring nocturnal predators and illuminating murky surroundings to attracting potential mates and luring unsuspecting prey.',
    promptWords: 58
  },
  {
    id: 'RA-08',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 08: Urban Architecture & Microclimates',
    prompt: 'Metropolitan developments with dense high-rise concrete structures significantly alter local thermal dynamics, generating what atmospheric scientists designate as urban heat islands. The replacement of vegetative groundcover with dark asphalt surfaces increases solar absorption throughout daytime hours. Consequently, nocturnal heat radiation prevents ambient cooling, exacerbating building energy demands for air conditioning and intensifying respiratory health vulnerabilities during summer heatwaves.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'Metropolitan developments with dense high-rise concrete structures significantly alter local thermal dynamics, generating what atmospheric scientists designate as urban heat islands. The replacement of vegetative groundcover with dark asphalt surfaces increases solar absorption throughout daytime hours. Consequently, nocturnal heat radiation prevents ambient cooling, exacerbating building energy demands for air conditioning and intensifying respiratory health vulnerabilities during summer heatwaves.',
    promptWords: 56
  },
  {
    id: 'RA-09',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 09: Linguistic Anthropology & Endangered Dialects',
    prompt: 'Anthropological linguists estimate that approximately half of the world\'s seven thousand spoken languages face extinction before the end of the century. As indigenous communities migrate into urban industrialized hubs, younger generations increasingly adopt dominant regional vernaculars for social and commercial mobility. When an ancient language vanishes, humanity loses irrecoverable cultural mythologies, indigenous botanical taxonomies, and distinctive perceptual frameworks encoded within its grammatical syntax.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'Anthropological linguists estimate that approximately half of the world\'s seven thousand spoken languages face extinction before the end of the century. As indigenous communities migrate into urban industrialized hubs, younger generations increasingly adopt dominant regional vernaculars for social and commercial mobility. When an ancient language vanishes, humanity loses irrecoverable cultural mythologies, indigenous botanical taxonomies, and distinctive perceptual frameworks encoded within its grammatical syntax.',
    promptWords: 60
  },
  {
    id: 'RA-10',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 10: Astrobiology & Extremophile Microorganisms',
    prompt: 'The discovery of resilient microbial life thriving in terrestrial hydrothermal vents, subsurface subterranean salt caves, and hyper-acidic volcanic springs has fundamentally broadened astrobiological models. Known collectively as extremophiles, these tenacious biochemical organisms demonstrate that metabolic functions can withstand immense hydrostatic pressures, extreme temperatures, and intense ionizing radiation. Such empirical precedents suggest comparable life forms could plausibly survive within subsurface oceans beneath Jupiter\'s icy moon Europa.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'The discovery of resilient microbial life thriving in terrestrial hydrothermal vents, subsurface subterranean salt caves, and hyper-acidic volcanic springs has fundamentally broadened astrobiological models. Known collectively as extremophiles, these tenacious biochemical organisms demonstrate that metabolic functions can withstand immense hydrostatic pressures, extreme temperatures, and intense ionizing radiation. Such empirical precedents suggest comparable life forms could plausibly survive within subsurface oceans beneath Jupiter\'s icy moon Europa.',
    promptWords: 62
  },
  {
    id: 'RA-11',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 11: Cognitive Load & Digital Pedagogy',
    prompt: 'Contemporary instructional design heavily integrates cognitive load theory to optimize educational multimedia presentations. According to cognitive psychologists, working memory possesses strictly constrained bandwidth when simultaneously processing dual sensory channels of visual text and auditory speech. Instructional modules that indiscriminately bombard students with animated graphics, ambient music, and rapid subtitles risk overwhelming mental capacity, thereby hindering long-term knowledge retention and conceptual synthesis.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'Contemporary instructional design heavily integrates cognitive load theory to optimize educational multimedia presentations. According to cognitive psychologists, working memory possesses strictly constrained bandwidth when simultaneously processing dual sensory channels of visual text and auditory speech. Instructional modules that indiscriminately bombard students with animated graphics, ambient music, and rapid subtitles risk overwhelming mental capacity, thereby hindering long-term knowledge retention and conceptual synthesis.',
    promptWords: 57
  },
  {
    id: 'RA-12',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 12: Paleoclimatology & Speleothem Analysis',
    prompt: 'Speleothems, mineral deposits that slowly precipitate as stalagmites and stalactites inside limestone cave chambers, serve as exceptionally preserved paleoclimatic archives. By analyzing the microscopic isotopic ratios of oxygen and carbon trapped within successive carbonate layers, geochemists can reconstruct historical rainfall anomalies and temperature fluctuations spanning hundreds of millennia, offering vital baseline context for contemporary anthropogenic warming trends.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'Speleothems, mineral deposits that slowly precipitate as stalagmites and stalactites inside limestone cave chambers, serve as exceptionally preserved paleoclimatic archives. By analyzing the microscopic isotopic ratios of oxygen and carbon trapped within successive carbonate layers, geochemists can reconstruct historical rainfall anomalies and temperature fluctuations spanning hundreds of millennia, offering vital baseline context for contemporary anthropogenic warming trends.',
    promptWords: 54
  },
  {
    id: 'RA-13',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 13: Biomimetic Engineering in Renewable Materials',
    prompt: 'Modern material science increasingly draws inspiration from structural solutions perfected through millions of years of biological evolution. By scrutinizing the microscopic architecture of lotus leaves, geckos\' adhesive pads, and spider silks, engineers have synthesized self-cleaning solar panels, reversible dry adhesives, and ultra-high-tensile biodegradable composites that dramatically minimize dependence on petroleum-derived polymers.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'Modern material science increasingly draws inspiration from structural solutions perfected through millions of years of biological evolution. By scrutinizing the microscopic architecture of lotus leaves, geckos\' adhesive pads, and spider silks, engineers have synthesized self-cleaning solar panels, reversible dry adhesives, and ultra-high-tensile biodegradable composites that dramatically minimize dependence on petroleum-derived polymers.',
    promptWords: 51
  },
  {
    id: 'RA-14',
    taskType: 'RA',
    part: 'PART_1',
    title: 'Read Aloud 14: Economic History of Maritime Trade Corridors',
    prompt: 'The opening of transoceanic maritime corridors during the fifteenth and sixteenth centuries initiated an unprecedented reconfiguration of worldwide commodity flows. Traditional overland trade routes like the Silk Road were gradually supplanted by armed merchant fleets transporting silver, spices, textiles, and porcelain between disparate continents, establishing the foundational infrastructure for modern integrated global mercantile capitalism.',
    prepSeconds: 35,
    recordSeconds: 40,
    referenceText: 'The opening of transoceanic maritime corridors during the fifteenth and sixteenth centuries initiated an unprecedented reconfiguration of worldwide commodity flows. Traditional overland trade routes like the Silk Road were gradually supplanted by armed merchant fleets transporting silver, spices, textiles, and porcelain between disparate continents, establishing the foundational infrastructure for modern integrated global mercantile capitalism.',
    promptWords: 52
  },

  // ==========================================
  // RS: Repeat Sentence (RS-11 to RS-22)
  // ==========================================
  {
    id: 'RS-11',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 11',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'The university library will remain open twenty-four hours during the final examination period.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'The university library will remain open twenty-four hours during the final examination period.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'RS-12',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 12',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Preliminary findings indicate a significant correlation between sleep hygiene and academic performance.',
    audioDurationSeconds: 6,
    recordSeconds: 15,
    referenceText: 'Preliminary findings indicate a significant correlation between sleep hygiene and academic performance.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'RS-13',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 13',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'All postgraduate candidates must submit their dissertation drafts by Friday afternoon.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'All postgraduate candidates must submit their dissertation drafts by Friday afternoon.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'RS-14',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 14',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'The laboratory technician demonstrated the proper protocol for handling toxic volatile reagents.',
    audioDurationSeconds: 6,
    recordSeconds: 15,
    referenceText: 'The laboratory technician demonstrated the proper protocol for handling toxic volatile reagents.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'RS-15',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 15',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Macroeconomic policy must balance inflation control with sustainable employment growth.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'Macroeconomic policy must balance inflation control with sustainable employment growth.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'RS-16',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 16',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Renewable energy investments have increased substantially across developing nations this year.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'Renewable energy investments have increased substantially across developing nations this year.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'RS-17',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 17',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Participants should register at the student services desk before attending the seminar.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'Participants should register at the student services desk before attending the seminar.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'RS-18',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 18',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Archaeological excavations revealed sophisticated water channels built over two thousand years ago.',
    audioDurationSeconds: 6,
    recordSeconds: 15,
    referenceText: 'Archaeological excavations revealed sophisticated water channels built over two thousand years ago.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'RS-19',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 19',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Statistical modeling confirms that the new compound reduces cellular inflammatory markers.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'Statistical modeling confirms that the new compound reduces cellular inflammatory markers.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'RS-20',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 20',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'The faculty offers travel grants for doctoral students presenting at global conferences.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'The faculty offers travel grants for doctoral students presenting at global conferences.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'RS-21',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 21',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Please ensure your identification cards are clearly visible upon entering the testing room.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'Please ensure your identification cards are clearly visible upon entering the testing room.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'RS-22',
    taskType: 'RS',
    part: 'PART_1',
    title: 'Repeat Sentence 22',
    prompt: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
    audioText: 'Interdisciplinary collaboration is essential for tackling complex planetary climate problems.',
    audioDurationSeconds: 5,
    recordSeconds: 15,
    referenceText: 'Interdisciplinary collaboration is essential for tackling complex planetary climate problems.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },

  // ==========================================
  // DI: Describe Image (DI-07 to DI-13)
  // ==========================================
  {
    id: 'DI-07',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 07: University Study Outcomes & Gender Comparison',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-retention-pies.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Two pie charts comparing completion and attrition rates between male and female students. Females show 65% completion compared to 60% for males; males cite employment as primary departure cause (25%).'
  },
  {
    id: 'DI-08',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 08: Global Solar Photovoltaic Capacity Growth',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-solar-energy.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Bar chart showing cumulative global solar PV capacity surging from 505 GW in 2018 to over 1,610 GW in 2024, demonstrating exponential expansion in renewable energy adoption.'
  },
  {
    id: 'DI-09',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 09: Oceanic Depth Strata & Light Penetration',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-ocean-zones.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Diagram illustrating vertical ocean zones from Epipelagic (0-200m) with sunlight and 90% of marine life down to Hadal zone (>4000m) characterized by darkness and extreme pressure.'
  },
  {
    id: 'DI-10',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 10: Worldwide Mobile Operating System Market Share',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-smartphone-os.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Line graph tracing Android (71%) vs iOS (28%) global market share from 2016 to 2026, showing duopoly market stability over a decade.'
  },
  {
    id: 'DI-11',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 11: Greenhouse Gas Emissions by Economic Sector',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-co2-sectors.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Pie chart breaking down global emissions: Electricity & Heat (25%) and Agriculture (24%) represent nearly half, followed by Industry (21%), Transportation (14%), and Buildings (16%).'
  },
  {
    id: 'DI-12',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 12: Terrestrial Hydrological Cycle Stages',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-water-cycle.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Process flow diagram outlining evaporation from oceans powered by solar radiation, condensation into cloud formations, precipitation over mountains, and surface runoff returning water to reservoirs.'
  },
  {
    id: 'DI-13',
    taskType: 'DI',
    part: 'PART_1',
    title: 'Describe Image 13: Urban Commuter Transport Modal Split in 5 Cities',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageUrl: '/media/images/di-urban-transport.svg',
    prepSeconds: 25,
    recordSeconds: 40,
    referenceNotes: 'Grouped bar chart comparing modal split in Tokyo (51% public transit), London (37%), Amsterdam (45% cycling), New York (35% cars), and Sydney (48% private cars).'
  },

  // ==========================================
  // RL: Re-tell Lecture (RL-03 to RL-06)
  // ==========================================
  {
    id: 'RL-03',
    taskType: 'RL',
    part: 'PART_1',
    title: 'Re-tell Lecture 03: Quantum Computing Principles & Superposition',
    prompt: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.',
    audioText: 'In today\'s lecture on quantum mechanics, we examine how quantum processors diverge from classical binary computers. Classical computing relies on transistors that represent discrete binary bits, strictly evaluated as either zero or one. In stark contrast, quantum computing exploits the subatomic principle of quantum superposition, permitting quantum bits or qubits to exist simultaneously in multi-state configurations. When combined with quantum entanglement, where pairs of particles remain interconnected regardless of physical distance, quantum algorithms can evaluate exponential permutations simultaneously. This exponential computational speedup promises revolutionary breakthroughs in cryptographic decryption, molecular pharmaceutical modeling, and complex climate simulation.',
    audioDurationSeconds: 32,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Key lecture ideas: Contrast between classical binary bits (0 or 1) and qubits utilizing superposition and entanglement. Highlights exponential parallel processing capabilities and practical applications in cryptography, pharmaceutical design, and climate modeling.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'RL-04',
    taskType: 'RL',
    part: 'PART_1',
    title: 'Re-tell Lecture 04: Chemistry & Longevity of Ancient Roman Concrete',
    prompt: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.',
    audioText: 'Archaeologists and civil engineers have long marveled at the astounding durability of ancient Roman maritime structures, which have survived two millennia submerged in turbulent seawater. Modern spectroscopic analysis reveals the secret lies in Roman pozzolanic concrete, a mixture of volcanic ash from the Campi Flegrei, quicklime, and volcanic rock aggregate. When seawater infiltrates microscopic pores within the concrete matrix, it dissolves lime clasts and reacts with volcanic aluminum, triggering the growth of rare aluminous tobermorite and phillipsite crystals. Rather than eroding the material, ongoing chemical interaction with seawater actually reinforces the crystalline framework, causing the concrete to self-heal and grow stronger over time.',
    audioDurationSeconds: 35,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Key lecture ideas: Roman maritime concrete survives 2,000 years due to volcanic ash (pozzolana) and quicklime. Seawater infiltration triggers crystallization of tobermorite and phillipsite, creating a self-healing chemical mechanism that strengthens the structural matrix.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'RL-05',
    taskType: 'RL',
    part: 'PART_1',
    title: 'Re-tell Lecture 05: Ocean Acidification & Marine Calcifying Organisms',
    prompt: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.',
    audioText: 'Since the industrial revolution began, oceanic waters have absorbed approximately thirty percent of anthropogenic carbon dioxide emissions, shielding the atmosphere from even more catastrophic warming. However, this oceanic buffering comes with severe biogeochemical consequences known as ocean acidification. When carbon dioxide dissolves into seawater, it forms carbonic acid, which subsequently dissociates and releases free hydrogen ions. These hydrogen ions bind readily with carbonate ions, reducing the ambient carbonate saturation state. Marine calcifying organisms, including reef-building corals, pteropods, and shellfish, require dissolved carbonate ions to precipitate their calcium carbonate shells and skeletons. As carbonate ions become depleted, marine shells thin and dissolve, threatening the foundational base of marine food webs.',
    audioDurationSeconds: 36,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Key lecture ideas: Oceans absorb 30% of anthropogenic CO2, mitigating atmospheric warming but causing ocean acidification. Dissolved CO2 forms carbonic acid and strips carbonate ions needed by calcifiers (corals, shellfish, pteropods) to build shells, destabilizing marine ecosystems.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'RL-06',
    taskType: 'RL',
    part: 'PART_1',
    title: 'Re-tell Lecture 06: Cognitive Heuristics & Systematic Behavioral Biases',
    prompt: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.',
    audioText: 'Behavioral economics has fundamentally challenged the classical assumption that human actors operate as purely rational economic agents. Pioneering research demonstrated that human cognition relies extensively on mental shortcuts termed heuristics to make rapid decisions under conditions of uncertainty. While heuristics are evolutionary adaptive mechanisms that conserve mental effort, they systematically produce predictable cognitive biases. For instance, the availability heuristic leads individuals to assess the probability of an event based on how easily recent dramatic examples come to mind, such as overestimating airline crashes after sensational media coverage. Similarly, confirmation bias drives decision-makers to selectively seek out evidence validating their preexisting hypotheses while dismissing robust counterarguments.',
    audioDurationSeconds: 37,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Key lecture ideas: Behavioral economics refutes pure rationality in human decision-making. Brain uses heuristics (mental shortcuts) to conserve cognitive effort under uncertainty. Highlights availability heuristic (vivid memory recall bias) and confirmation bias (filtering evidence to match prior beliefs).',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // SGD: Summarize Group Discussion (SGD-03 to SGD-06)
  // ==========================================
  {
    id: 'SGD-03',
    taskType: 'SGD',
    part: 'PART_1',
    title: 'Summarize Group Discussion 03: Remote Work Autonomy vs Collaborative Isolation',
    prompt: 'You will hear three university researchers discussing workplace flexibility. Summarize the key arguments, areas of consensus, and proposed organizational models.',
    audioText: 'Speaker 1: Looking at the corporate data, distributed remote work clearly boosts employee retention and saves hundreds of commuting hours annually. Speaker 2: While autonomy has undeniable benefits, our health surveys highlight rising social isolation and blurred boundaries between professional duties and domestic life. Speaker 3: There is also the crucial question of spontaneous mentorship; junior hires miss informal peer learning when everybody is behind a screen. Speaker 1: That is why the emerging consensus favors structured hybrid arrangements: designated collaborative sprint days on campus, paired with focused asynchronous work completed remotely.',
    audioDurationSeconds: 30,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Discussion points: Speaker 1 highlights retention and commute elimination; Speaker 2 notes isolation and work-life balance deterioration; Speaker 3 raises mentorship deficits for junior staff; unanimous consensus emerges around a balanced structured hybrid model.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'SGD-04',
    taskType: 'SGD',
    part: 'PART_1',
    title: 'Summarize Group Discussion 04: Artificial Intelligence in Medical Diagnosis',
    prompt: 'You will hear medical specialists debating artificial intelligence in clinical oncology. Summarize the main perspectives and ethical recommendations.',
    audioText: 'Dr. Patel: Diagnostic computer vision algorithms are already outperforming senior radiologists in detecting early-stage pulmonary nodules. Prof. Chen: The diagnostic accuracy is impressive, but algorithms trained on historical hospital datasets frequently inherit demographic sampling biases, risking disparate error rates in underserved communities. Dr. Evans: And there is the profound legal and ethical dilemma of algorithm explainability—the black-box problem. If a neural network recommends a radical chemotherapy regimen, oncologists must explain the causal reasoning to patients. Dr. Patel: Exactly. That is why AI must function as an augmented diagnostic tool alongside clinical judgment rather than an autonomous decision-maker.',
    audioDurationSeconds: 32,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Discussion points: Dr. Patel notes AI accuracy in pulmonary imaging; Prof. Chen warns of historical demographic sampling biases; Dr. Evans highlights the black-box explainability dilemma for oncologists; agreement that AI must assist rather than replace physician clinical oversight.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'SGD-05',
    taskType: 'SGD',
    part: 'PART_1',
    title: 'Summarize Group Discussion 05: Cool Pavements vs Vegetated Green Roofs',
    prompt: 'You will hear three urban sustainability planners debating heat island mitigations. Summarize their comparative evaluation and policy conclusion.',
    audioText: 'Planner Davis: If we want to rapidly lower inner-city surface temperatures, white reflective pavements offer the fastest capital payback and highest albedo efficiency. Ecologist Wong: Cool pavements reflect radiation, but they can actually increase thermal discomfort for pedestrians standing directly on streets on sunny afternoons. Vegetated green roofs, by contrast, offer evapotranspirative cooling while retaining up to seventy percent of stormwater runoff. Architect Torres: Structural loading is the obstacle for green roofs; retrofitting older masonry buildings requires costly reinforcements. Ecologist Wong: Which is why municipal zoning ordinances must pair tax abatement incentives for new construction with street-level tree canopy expansion.',
    audioDurationSeconds: 34,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Discussion points: Davis advocates high-albedo cool pavements for rapid payback; Wong critiques pedestrian thermal radiation and promotes green roofs for stormwater management; Torres notes structural load limitations; group concludes zoning incentives and tree canopies provide best synergy.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'SGD-06',
    taskType: 'SGD',
    part: 'PART_1',
    title: 'Summarize Group Discussion 06: Cultivated Meat vs Agroecological Farming',
    prompt: 'You will hear agricultural economists discussing future protein supplies. Summarize the core tensions and concluding consensus.',
    audioText: 'Researcher Adams: Cultivated lab-grown meat can slash greenhouse gas emissions by ninety percent and virtually eliminate agricultural land footprints compared to conventional livestock. Dr. Morales: The bioprocessing bioreactors require immense energy inputs, and scaling sterile cell culture to global commodity volumes remains technologically prohibitive and capital intensive. Farmer Harris: We shouldn\'t rely solely on synthetic biotechnology when regenerative agroecological farming restores soil organic carbon, improves biodiversity, and supports rural farming communities. Researcher Adams: It doesn\'t have to be an either-or scenario; precision fermentation can supply bulk protein while regenerative practices manage soil ecosystems sustainably.',
    audioDurationSeconds: 32,
    prepSeconds: 10,
    recordSeconds: 40,
    referenceNotes: 'Discussion points: Adams argues cultivated meat minimizes land and emissions; Morales highlights high bioreactor energy needs and scaling hurdles; Harris champions regenerative soil carbon sequestration; consensus is an integrated model combining precision fermentation with regenerative agriculture.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // RTS: Respond to a Situation (RTS-03 to RTS-06)
  // ==========================================
  {
    id: 'RTS-03',
    taskType: 'RTS',
    part: 'PART_1',
    title: 'Respond to a Situation 03: Requesting Laboratory Equipment Extension',
    prompt: 'You are completing the final laboratory experiment for your Master\'s thesis. Due to an unexpected power outage yesterday, your cell cultures took twenty-four hours longer to incubate. You need an additional day of access to the high-resolution electron microscope, but another graduate student is scheduled to use the equipment tomorrow morning. Call the laboratory supervisor to explain the circumstance and request rescheduling.',
    prepSeconds: 20,
    recordSeconds: 40,
    referenceNotes: 'Appropriate response elements: Polite greeting, clear explanation of the power outage delay, respectful request for alternative microscope time slots, and offering to negotiate or share time with the fellow student.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'RTS-04',
    taskType: 'RTS',
    part: 'PART_1',
    title: 'Respond to a Situation 04: Addressing an Unresponsive Teammate',
    prompt: 'You are the coordinator of a four-person university marketing research project. One of your teammates has missed two group preparation meetings and failed to submit their assigned section of the market analysis, which is due to your professor in forty-eight hours. Leave a constructive, professional voicemail for your classmate to address the delay, offer support, and establish an immediate deadline.',
    prepSeconds: 20,
    recordSeconds: 40,
    referenceNotes: 'Appropriate response elements: Professional, constructive tone; clear notification of the 48-hour submission deadline; inquiry into their wellbeing or obstacles; establishing an immediate check-in time.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'RTS-05',
    taskType: 'RTS',
    part: 'PART_1',
    title: 'Respond to a Situation 05: Post-Interview Application Status Inquiry',
    prompt: 'Two weeks ago, you attended a promising final interview for an environmental policy internship with a municipal sustainability agency. The interviewer mentioned they would notify candidates by the end of last week. Leave a polite, professional voicemail for the hiring director to reaffirm your enthusiasm for the position and politely ask about their hiring timeline.',
    prepSeconds: 20,
    recordSeconds: 40,
    referenceNotes: 'Appropriate response elements: Professional courtesy, referencing the interview date and specific role, reaffirming strong interest in the agency\'s initiatives, and gently requesting an updated decision timeline.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'RTS-06',
    taskType: 'RTS',
    part: 'PART_1',
    title: 'Respond to a Situation 06: Seminar Presentation Topic Overlap Negotiation',
    prompt: 'In your postgraduate economics seminar, students must deliver an individual presentation on a macroeconomic case study. You discover that another classmate has selected the exact same central bank monetary easing case study you have been researching for three weeks. Speak with your classmate to propose a constructive division of the topic so both of you can present distinct analytical angles without redundancy.',
    prepSeconds: 20,
    recordSeconds: 40,
    referenceNotes: 'Appropriate response elements: Collegial and collaborative tone; acknowledging the shared topic interest; proposing a clear conceptual division (e.g., domestic inflation impacts vs currency exchange rates); agreeing to coordinate presentation scopes.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // ASQ: Answer Short Question (ASQ-06 to ASQ-15)
  // ==========================================
  {
    id: 'ASQ-06',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 06',
    prompt: 'What instrument is used by meteorologists to measure atmospheric air pressure?',
    audioText: 'What instrument is used by meteorologists to measure atmospheric air pressure?',
    audioDurationSeconds: 4,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['barometer', 'a barometer'],
    acceptedAnswers: ['barometer', 'a barometer'],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'ASQ-07',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 07',
    prompt: 'What branch of biology deals with the microscopic study of biological tissues in plants and animals?',
    audioText: 'What branch of biology deals with the microscopic study of biological tissues in plants and animals?',
    audioDurationSeconds: 5,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['histology', 'tissue biology'],
    acceptedAnswers: ['histology', 'tissue biology'],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'ASQ-08',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 08',
    prompt: 'What do we call the brief summary of a research article that appears at the very beginning of an academic paper?',
    audioText: 'What do we call the brief summary of a research article that appears at the very beginning of an academic paper?',
    audioDurationSeconds: 5,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['abstract', 'an abstract', 'executive summary'],
    acceptedAnswers: ['abstract', 'an abstract', 'executive summary'],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'ASQ-09',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 09',
    prompt: 'If an organism consumes both plant vegetation and other animals, is it classified as a carnivore, an herbivore, or an omnivore?',
    audioText: 'If an organism consumes both plant vegetation and other animals, is it classified as a carnivore, an herbivore, or an omnivore?',
    audioDurationSeconds: 6,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['omnivore', 'an omnivore'],
    acceptedAnswers: ['omnivore', 'an omnivore'],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'ASQ-10',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 10',
    prompt: 'What geographical term describes a narrow strip of land connecting two larger land masses, flanked by water on both sides?',
    audioText: 'What geographical term describes a narrow strip of land connecting two larger land masses, flanked by water on both sides?',
    audioDurationSeconds: 6,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['isthmus', 'an isthmus'],
    acceptedAnswers: ['isthmus', 'an isthmus'],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'ASQ-11',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 11',
    prompt: 'What standard scientific unit is used in physics to measure electrical resistance in a circuit?',
    audioText: 'What standard scientific unit is used in physics to measure electrical resistance in a circuit?',
    audioDurationSeconds: 5,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['ohm', 'ohms', 'the ohm'],
    acceptedAnswers: ['ohm', 'ohms', 'the ohm'],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'ASQ-12',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 12',
    prompt: 'Which internal organ in the human body synthesizes insulin to regulate blood glucose concentrations?',
    audioText: 'Which internal organ in the human body synthesizes insulin to regulate blood glucose concentrations?',
    audioDurationSeconds: 5,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['pancreas', 'the pancreas'],
    acceptedAnswers: ['pancreas', 'the pancreas'],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'ASQ-13',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 13',
    prompt: 'What astronomical term describes the gravitationally curved trajectory an object takes in space around a celestial body?',
    audioText: 'What astronomical term describes the gravitationally curved trajectory an object takes in space around a celestial body?',
    audioDurationSeconds: 6,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['orbit', 'an orbit'],
    acceptedAnswers: ['orbit', 'an orbit'],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'ASQ-14',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 14',
    prompt: 'What legal term denotes a formal, binding contract or agreement concluded between sovereign nations?',
    audioText: 'What legal term denotes a formal, binding contract or agreement concluded between sovereign nations?',
    audioDurationSeconds: 5,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['treaty', 'a treaty', 'accord'],
    acceptedAnswers: ['treaty', 'a treaty', 'accord'],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'ASQ-15',
    taskType: 'ASQ',
    part: 'PART_1',
    title: 'Answer Short Question 15',
    prompt: 'What type of optical lens is thicker in the middle than at its edges and causes parallel light rays to converge to a single focal point?',
    audioText: 'What type of optical lens is thicker in the middle than at its edges and causes parallel light rays to converge to a single focal point?',
    audioDurationSeconds: 6,
    prepSeconds: 3,
    recordSeconds: 10,
    acceptableAnswers: ['convex', 'convex lens', 'converging lens', 'a convex lens'],
    acceptedAnswers: ['convex', 'convex lens', 'converging lens', 'a convex lens'],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },

  // ==========================================
  // SWT: Summarize Written Text (SWT-03 to SWT-06)
  // ==========================================
  {
    id: 'SWT-03',
    taskType: 'SWT',
    part: 'PART_1',
    title: 'Summarize Written Text 03: CRISPR Gene Editing in Agricultural Resilience',
    prompt: 'The emergence of CRISPR-Cas9 genome editing technology has precipitated a transformative revolution across contemporary agricultural biotechnology. Unlike conventional genetic modification techniques that rely on introducing foreign transgenic DNA sequences from disparate organisms, CRISPR enables molecular biologists to execute surgical, nucleotide-level alterations directly within a plant\'s indigenous genome. By precisely deactivating genes responsible for susceptibility to fungal blights or enhancing alleles that regulate stomatal conductance during droughts, researchers have engineered staple cereal varieties—including rice, wheat, and sorghum—that exhibit unprecedented climate resilience. Furthermore, because these gene-edited cultivars frequently contain no foreign genetic material, regulatory authorities in multiple jurisdictions have subjected them to expedited biosafety approval frameworks compared to legacy genetically modified organisms. Nevertheless, socio-economic and ethical debates persist regarding patent concentration among multinational agrochemical conglomerates and the long-term ecological consequences of widespread monoculture deployment in changing climatic conditions.',
    timerSeconds: 600,
    minWords: 5,
    maxWords: 75,
    sampleSummary: 'Although debates over corporate patent ownership and monoculture risks continue, CRISPR-Cas9 gene editing has revolutionized agricultural biotechnology by enabling precise native genomic alterations that enhance crop drought and blight resilience with expedited regulatory approvals.'
  },
  {
    id: 'SWT-04',
    taskType: 'SWT',
    part: 'PART_1',
    title: 'Summarize Written Text 04: The Printing Press and the Emergence of the Public Sphere',
    prompt: 'The mid-fifteenth-century invention of the movable metal type printing press by Johannes Gutenberg in Mainz functioned as a monumental catalyst for European intellectual and political transformation. Prior to typography, textual production was monopolized by monastic scriptoria, rendering books exorbitant luxury artifacts accessible almost exclusively to ecclesiastical and aristocratic elites. The mechanization of printing abruptly collapsed the marginal production cost of text, democratizing literacy and accelerating the dissemination of scientific inquiry and theological critiques during the Protestant Reformation. Sociologist Jürgen Habermas famously posited that print capitalism facilitated the genesis of the bourgeois public sphere: an open communicative space where private citizens could assemble in coffeehouses, read periodical gazettes, and engage in critical, rational debate concerning state governance. Consequently, the proliferation of vernacular print dismantled centralized feudal control over information and laid the foundational cornerstone for modern democratic discourse and institutional transparency.',
    timerSeconds: 600,
    minWords: 5,
    maxWords: 75,
    sampleSummary: 'By drastically reducing book production costs and democratizing literacy, the invention of Gutenberg\'s movable type printing press catalyzed the Protestant Reformation and fostered an open public sphere that dismantled feudal information monopolies to establish modern democratic discourse.'
  },
  {
    id: 'SWT-05',
    taskType: 'SWT',
    part: 'PART_1',
    title: 'Summarize Written Text 05: Urban Heat Island Mitigation & Permeable Infrastructure',
    prompt: 'Rapid global urbanization has severely disrupted natural thermodynamic equilibria, establishing pervasive urban heat islands where metropolitan centers register temperatures up to eight degrees Celsius higher than surrounding rural environments. This microclimatic amplification stems from high-thermal-mass impermeable surfaces like concrete pavements and dark bituminous asphalt roofs, which absorb solar radiation throughout the day and reradiate heat into the nocturnal boundary layer. Civil engineers and environmental scientists advocate for systemic investments in permeable urban infrastructure and biophilic architecture. Permeable interlocking concrete pavers allow rainwater to infiltrate underlying soil aquifers rather than discharging immediately into storm sewers, simultaneously recharging groundwater tables and enabling evaporative cooling. When paired with mandated urban forestry canopies and living vegetated green roofs, permeable urban materials reduce ambient building cooling loads by twenty-five percent and mitigate heat-related cardiovascular mortality during summer extremes.',
    timerSeconds: 600,
    minWords: 5,
    maxWords: 75,
    sampleSummary: 'To counteract urban heat islands caused by solar-absorbing impermeable concrete and asphalt surfaces, urban planners advocate integrating permeable pavements and living green roofs, which together replenish groundwater aquifers, promote evaporative cooling, and significantly reduce metropolitan energy consumption.'
  },
  {
    id: 'SWT-06',
    taskType: 'SWT',
    part: 'PART_1',
    title: 'Summarize Written Text 06: Deep-Sea Benthic Mining & International Governance',
    prompt: 'The abyssal plains of the Clarion-Clipperton Zone in the central Pacific Ocean harbor trillions of polymetallic nodules: potato-sized mineral concretions rich in nickel, cobalt, copper, and rare earth elements essential for manufacturing electric vehicle batteries and renewable energy storage systems. Proponents of deep-sea mining argue that extracting these seabed minerals is geographically less destructive than terrestrial strip-mining, which causes severe deforestation, groundwater poisoning, and social dislocation in developing nations. Conversely, oceanographic marine biologists caution that benthic abyssal ecosystems are characterized by near-zero temperatures, crushing hydrostatic pressures, and glacial metabolic rates, meaning that species inhabiting nodule fields have evolved over millions of years in extreme stability. Heavy mechanical crawlers that dredge the seabed generate sprawling underwater sediment plumes that smother filter-feeding organisms and cause irreversible biodiversity destruction across fragile ocean basins.',
    timerSeconds: 600,
    minWords: 5,
    maxWords: 75,
    sampleSummary: 'While industrial proponents claim deep-sea nodule harvesting provides critical minerals for clean energy with less terrestrial dislocation, oceanographers warn that benthic mining crawlers generate destructive sediment plumes that cause irreversible damage to ancient, fragile abyssal ecosystems.'
  },

  // ==========================================
  // WE: Write Essay (WE-02 to WE-05)
  // ==========================================
  {
    id: 'WE-02',
    taskType: 'WE',
    part: 'PART_1',
    title: 'Write Essay 02: Mass Tourism Revenue vs Environmental & Cultural Degradation',
    prompt: 'Some people believe that international mass tourism brings vital economic revenue and employment to developing regions, while others argue that its detrimental environmental and cultural impacts far outweigh the financial benefits. Discuss both views and give your own opinion with relevant academic examples. Write 200–300 words.',
    timerSeconds: 1200,
    minWords: 200,
    maxWords: 300,
    keyThemes: ['Economic revitalization vs overtourism', 'Ecological strain on fragile coastal and heritage sites', 'Cultural commodification vs authentic exchange', 'Sustainable ecotourism policy solutions']
  },
  {
    id: 'WE-03',
    taskType: 'WE',
    part: 'PART_1',
    title: 'Write Essay 03: Universal Basic Income in the Era of Advanced Automation',
    prompt: 'With the rapid advancement of automated robotic systems and artificial intelligence, certain economists argue that governments must institute a Universal Basic Income to protect displaced workers, while others contend it would disincentivize innovation and place unsustainable tax burdens on economies. Do the advantages of Universal Basic Income outweigh the disadvantages? Write 200–300 words.',
    timerSeconds: 1200,
    minWords: 200,
    maxWords: 300,
    keyThemes: ['Automation displacement of cognitive and manual labor', 'Social safety nets vs fiscal taxation viability', 'Workplace incentive effects and entrepreneurial freedom', 'Labor market structural transitions']
  },
  {
    id: 'WE-04',
    taskType: 'WE',
    part: 'PART_1',
    title: 'Write Essay 04: Space Exploration Expenditure vs Earth Poverty Alleviation',
    prompt: 'Governments around the world invest billions of dollars annually into space exploration missions to Mars and deep space. Critics suggest these financial resources should be redirected toward urgent earthly challenges such as poverty, healthcare, and climate change. To what extent do you agree or disagree with this perspective? Write 200–300 words.',
    timerSeconds: 1200,
    minWords: 200,
    maxWords: 300,
    keyThemes: ['Technological spin-offs from aerospace research (satellites, medical imaging, solar)', 'Moral imperative of addressing acute global humanitarian crises', 'Scientific curiosity and long-term planetary survival', 'Balanced allocation of national budget surpluses']
  },
  {
    id: 'WE-05',
    taskType: 'WE',
    part: 'PART_1',
    title: 'Write Essay 05: Youth Screen-Time Regulation vs Digital Literacy Development',
    prompt: 'In modern society, many young people spend an unprecedented portion of their daily lives interacting through digital devices and social media platforms. Some psychologists advocate for strict parental regulation and government screen-time limits, while others argue that digital literacy is an indispensable developmental necessity for future careers. Discuss both perspectives and present your balanced conclusion. Write 200–300 words.',
    timerSeconds: 1200,
    minWords: 200,
    maxWords: 300,
    keyThemes: ['Adolescent psychological wellbeing, sleep disruption, and social media addiction', 'Crucial computational literacy and technical workplace competencies', 'Parental mediation vs algorithmic platform regulation', 'Guided educational digital exposure']
  },

  // ==========================================
  // FIB-RW: Fill in Blanks - Dropdown (FIB-RW-06 to FIB-RW-11)
  // ==========================================
  {
    id: 'FIB-RW-06',
    taskType: 'FIB-RW',
    part: 'PART_2',
    title: 'FIB Dropdown 06: Paleolithic Cave Art & Cognitive Evolution',
    prompt: 'Archaeological discoveries of Upper Paleolithic parietal art in Franco-Cantabrian caves have revolutionized our understanding of hominin cognitive evolution. Far from being mere decorative sketches, these ochre and charcoal depictions [blank_0] sophisticated symbolic communication and ritual traditions. The deliberate placement of animal figures across undulating limestone reliefs demonstrates an acute [blank_1] of optical perspective and three-dimensional form. Furthermore, the recurrent presence of geometric signs alongside naturalistic fauna suggests an emerging proto-linguistic syntax that served to [blank_2] tribal identity and mythological knowledge across generations. Consequently, prehistorians conclude that figurative artistic expression was an indispensable [blank_3] in the emergence of modern human behavioral complexity.',
    options: [
      { id: 'blank_0', choices: ['exemplify', 'obstruct', 'terminate', 'fabricate'], answer: 'exemplify' },
      { id: 'blank_1', choices: ['awareness', 'ignorance', 'reluctance', 'suspicion'], answer: 'awareness' },
      { id: 'blank_2', choices: ['transmit', 'suppress', 'distort', 'counterfeit'], answer: 'transmit' },
      { id: 'blank_3', choices: ['milestone', 'hindrance', 'setback', 'coincidence'], answer: 'milestone' }
    ],
    passage: 'Archaeological discoveries of Upper Paleolithic parietal art in Franco-Cantabrian caves have revolutionized our understanding of hominin cognitive evolution. Far from being mere decorative sketches, these ochre and charcoal depictions [blank_0] sophisticated symbolic communication and ritual traditions. The deliberate placement of animal figures across undulating limestone reliefs demonstrates an acute [blank_1] of optical perspective and three-dimensional form. Furthermore, the recurrent presence of geometric signs alongside naturalistic fauna suggests an emerging proto-linguistic syntax that served to [blank_2] tribal identity and mythological knowledge across generations. Consequently, prehistorians conclude that figurative artistic expression was an indispensable [blank_3] in the emergence of modern human behavioral complexity.'
  },
  {
    id: 'FIB-RW-07',
    taskType: 'FIB-RW',
    part: 'PART_2',
    title: 'FIB Dropdown 07: Quantum Coherence in Photosynthetic Systems',
    prompt: 'Biophysicists investigating bacterial light-harvesting complexes have uncovered evidence that biological systems exploit quantum mechanical principles to achieve astonishing energetic [blank_0]. When a photon strikes a chlorophyll pigment, the resulting exciton does not wander haphazardly toward the reaction center via classical random walk; rather, quantum coherence allows it to explore multiple spatial pathways [blank_1]. This enables photosynthetic complexes to transfer captured solar energy with near-unity quantum efficiency, virtually eliminating thermal dissipation losses. Understanding how delicate quantum states [blank_2] in warm, noisy biological cellular environments could guide materials scientists in designing next-generation biomimetic photovoltaic cells that dramatically [blank_3] current solar conversion benchmarks.',
    options: [
      { id: 'blank_0', choices: ['efficiency', 'deterioration', 'redundancy', 'instability'], answer: 'efficiency' },
      { id: 'blank_1', choices: ['simultaneously', 'reluctantly', 'rarely', 'incompletely'], answer: 'simultaneously' },
      { id: 'blank_2', choices: ['persist', 'evaporate', 'decompose', 'scatter'], answer: 'persist' },
      { id: 'blank_3', choices: ['surpass', 'diminish', 'compromise', 'replicate'], answer: 'surpass' }
    ],
    passage: 'Biophysicists investigating bacterial light-harvesting complexes have uncovered evidence that biological systems exploit quantum mechanical principles to achieve astonishing energetic [blank_0]. When a photon strikes a chlorophyll pigment, the resulting exciton does not wander haphazardly toward the reaction center via classical random walk; rather, quantum coherence allows it to explore multiple spatial pathways [blank_1]. This enables photosynthetic complexes to transfer captured solar energy with near-unity quantum efficiency, virtually eliminating thermal dissipation losses. Understanding how delicate quantum states [blank_2] in warm, noisy biological cellular environments could guide materials scientists in designing next-generation biomimetic photovoltaic cells that dramatically [blank_3] current solar conversion benchmarks.'
  },
  {
    id: 'FIB-RW-08',
    taskType: 'FIB-RW',
    part: 'PART_2',
    title: 'FIB Dropdown 08: Behavioral Economics & Nudge Architecture',
    prompt: 'Public policy design has increasingly embraced behavioral economics to encourage prosocial civic decisions without resorting to coercive legislative mandates. Known popularly as "nudge theory," this approach alters choice [blank_0] in ways that make beneficial options intuitive and effortless. For example, changing workplace pension enrollment from an "opt-in" model to an automatic "opt-out" framework [blank_1] employee retirement participation rates across national economies. Critics, however, caution that benevolent paternalism can veer into subtle manipulation if citizens remain [blank_2] of how their subconscious biases are being engineered. Proponents counter that because every administrative environment inherently structures choice in some fashion, governments bear a moral responsibility to configure default options that [blank_3] public wellbeing.',
    options: [
      { id: 'blank_0', choices: ['architecture', 'reluctance', 'chaos', 'negligence'], answer: 'architecture' },
      { id: 'blank_1', choices: ['skyrocketed', 'stagnated', 'plummeted', 'demolished'], answer: 'skyrocketed' },
      { id: 'blank_2', choices: ['unaware', 'enthusiastic', 'critical', 'supportive'], answer: 'unaware' },
      { id: 'blank_3', choices: ['maximize', 'undermine', 'sabotage', 'restrict'], answer: 'maximize' }
    ],
    passage: 'Public policy design has increasingly embraced behavioral economics to encourage prosocial civic decisions without resorting to coercive legislative mandates. Known popularly as "nudge theory," this approach alters choice [blank_0] in ways that make beneficial options intuitive and effortless. For example, changing workplace pension enrollment from an "opt-in" model to an automatic "opt-out" framework [blank_1] employee retirement participation rates across national economies. Critics, however, caution that benevolent paternalism can veer into subtle manipulation if citizens remain [blank_2] of how their subconscious biases are being engineered. Proponents counter that because every administrative environment inherently structures choice in some fashion, governments bear a moral responsibility to configure default options that [blank_3] public wellbeing.'
  },
  {
    id: 'FIB-RW-09',
    taskType: 'FIB-RW',
    part: 'PART_2',
    title: 'FIB Dropdown 09: Microplastic Contamination & Trophic Transfer',
    prompt: 'Marine toxicology assessments demonstrate that synthetic plastic debris fragments over time into microscopic particles under solar ultraviolet irradiation and wave attrition. These microplastics, measuring less than five millimeters across, are frequently [blank_0] by lower-trophic zooplankton and benthic invertebrates that mistake them for organic particulate detritus. Once ingested, microplastics can cause gastrointestinal lacerations, disrupt nutrient absorption, and leach toxic chemical [blank_1] such as phthalates and bisphenols into biological tissues. Through the mechanism of trophic biomagnification, chemical toxins steadily [blank_2] in apex marine predators and commercial fish species, ultimately posing profound [blank_3] to human consumer health.',
    options: [
      { id: 'blank_0', choices: ['consumed', 'expelled', 'evaporated', 'neutralized'], answer: 'consumed' },
      { id: 'blank_1', choices: ['additives', 'nutrients', 'enzymes', 'hormones'], answer: 'additives' },
      { id: 'blank_2', choices: ['accumulate', 'evaporate', 'dissipate', 'diminish'], answer: 'accumulate' },
      { id: 'blank_3', choices: ['risks', 'benefits', 'remedies', 'assurances'], answer: 'risks' }
    ],
    passage: 'Marine toxicology assessments demonstrate that synthetic plastic debris fragments over time into microscopic particles under solar ultraviolet irradiation and wave attrition. These microplastics, measuring less than five millimeters across, are frequently [blank_0] by lower-trophic zooplankton and benthic invertebrates that mistake them for organic particulate detritus. Once ingested, microplastics can cause gastrointestinal lacerations, disrupt nutrient absorption, and leach toxic chemical [blank_1] such as phthalates and bisphenols into biological tissues. Through the mechanism of trophic biomagnification, chemical toxins steadily [blank_2] in apex marine predators and commercial fish species, ultimately posing profound [blank_3] to human consumer health.'
  },
  {
    id: 'FIB-RW-10',
    taskType: 'FIB-RW',
    part: 'PART_2',
    title: 'FIB Dropdown 10: Vanadium Flow Batteries & Long-Duration Grid Storage',
    prompt: 'The intermittent generation profile of utility-scale wind and solar farms necessitates resilient, grid-scale energy storage solutions capable of balancing supply across extended calm or overcast spells. While lithium-ion chemistries dominate consumer electronics, their susceptibility to thermal runaway and cycling capacity degradation limits their [blank_0] for multi-day grid buffering. In contrast, vanadium redox flow batteries store electrical energy in liquid electrolyte tanks separated by ion-selective membranes. Because energy capacity scales independently with tank volume, flow batteries offer virtually unlimited [blank_1] without suffering electrolyte degradation over tens of thousands of charge-discharge cycles. Although their upfront capital costs remain elevated, ongoing manufacturing scale is projected to make flow battery architecture an essential [blank_2] of decentralized, carbon-neutral national power [blank_3].',
    options: [
      { id: 'blank_0', choices: ['suitability', 'irrelevance', 'hindrance', 'reluctance'], answer: 'suitability' },
      { id: 'blank_1', choices: ['lifespans', 'liabilities', 'impediments', 'bottlenecks'], answer: 'lifespans' },
      { id: 'blank_2', choices: ['cornerstone', 'drawback', 'obstacle', 'casualty'], answer: 'cornerstone' },
      { id: 'blank_3', choices: ['grids', 'cables', 'sensors', 'batteries'], answer: 'grids' }
    ],
    passage: 'The intermittent generation profile of utility-scale wind and solar farms necessitates resilient, grid-scale energy storage solutions capable of balancing supply across extended calm or overcast spells. While lithium-ion chemistries dominate consumer electronics, their susceptibility to thermal runaway and cycling capacity degradation limits their [blank_0] for multi-day grid buffering. In contrast, vanadium redox flow batteries store electrical energy in liquid electrolyte tanks separated by ion-selective membranes. Because energy capacity scales independently with tank volume, flow batteries offer virtually unlimited [blank_1] without suffering electrolyte degradation over tens of thousands of charge-discharge cycles. Although their upfront capital costs remain elevated, ongoing manufacturing scale is projected to make flow battery architecture an essential [blank_2] of decentralized, carbon-neutral national power [blank_3].'
  },
  {
    id: 'FIB-RW-11',
    taskType: 'FIB-RW',
    part: 'PART_2',
    title: 'FIB Dropdown 11: Satellite Remote Sensing in Desert Archaeology',
    prompt: 'Spaceborne synthetic aperture radar and multispectral satellite sensors have inaugurated a golden age for archaeological landscape surveying across arid desert regions. Unlike optical aerial cameras that capture only visible surface topography, low-frequency microwave radar pulses can [blank_0] meters of hyper-arid sand sheets, reflecting off compacted subsurface stone foundations and subterranean paleochannels. Satellite imagery has successfully [blank_1] ancient caravan trading hubs and irrigation networks long thought lost beneath mobile sand dunes in the Arabian Rub\' al-Khali desert. These non-invasive digital reconnaissance methodologies allow archaeologists to map vast historical territories without disturbing fragile earthen [blank_2], thereby providing invaluable geospatial coordinates for targeted archaeological [blank_3].',
    options: [
      { id: 'blank_0', choices: ['penetrate', 'reflect', 'obstruct', 'solidify'], answer: 'penetrate' },
      { id: 'blank_1', choices: ['illuminated', 'concealed', 'demolished', 'fabricated'], answer: 'illuminated' },
      { id: 'blank_2', choices: ['remains', 'predictions', 'instruments', 'equations'], answer: 'remains' },
      { id: 'blank_3', choices: ['excavation', 'abandonment', 'demolition', 'speculation'], answer: 'excavation' }
    ],
    passage: 'Spaceborne synthetic aperture radar and multispectral satellite sensors have inaugurated a golden age for archaeological landscape surveying across arid desert regions. Unlike optical aerial cameras that capture only visible surface topography, low-frequency microwave radar pulses can [blank_0] meters of hyper-arid sand sheets, reflecting off compacted subsurface stone foundations and subterranean paleochannels. Satellite imagery has successfully [blank_1] ancient caravan trading hubs and irrigation networks long thought lost beneath mobile sand dunes in the Arabian Rub\' al-Khali desert. These non-invasive digital reconnaissance methodologies allow archaeologists to map vast historical territories without disturbing fragile earthen [blank_2], thereby providing invaluable geospatial coordinates for targeted archaeological [blank_3].'
  },

  // ==========================================
  // MCMA-R: Multiple Choice, Multiple Answers - Reading (MCMA-R-03 to MCMA-R-06)
  // ==========================================
  {
    id: 'MCMA-R-03',
    taskType: 'MCMA-R',
    part: 'PART_2',
    title: 'Reading MC (Multiple) 03: Collapse of Ancestral Puebloan Settlements',
    prompt: 'Archaeological tree-ring chronologies and paleoclimatic sediment cores indicate that between 1275 and 1300 CE, the Ancestral Puebloan civilizations of the Four Corners region in North America abruptly abandoned their multi-story cliff dwellings in Mesa Verde. For decades, archaeologists debated whether this mass migration was caused by an unprecedented twenty-five-year mega-drought or violent inter-communal warfare. Recent excavations combining bioarchaeological skeletal analysis with soil erosion modeling demonstrate that the collapse was multifactorial. Decades of heavy deforestation for timber and fuel had severely degraded fragile topsoils, reducing maize crop yields even before the climatic drought struck. When prolonged arid conditions culminated in consecutive failed harvests, social friction over remaining water resources triggered defensive fortification construction, communal violence, and ultimately a coordinated, organized exodus south toward the Rio Grande and Hopi Mesas.',
    question: 'According to the passage, which of the following contributed to the abandonment of Mesa Verde settlements?',
    options: [
      { id: 'A', text: 'Topsoil degradation resulting from persistent deforestation for timber and fuel.', correct: true },
      { id: 'B', text: 'A prolonged twenty-five-year mega-drought that devastated regional maize harvests.', correct: true },
      { id: 'C', text: 'A catastrophic volcanic eruption that blanketed the region in toxic sulfur ash.', correct: false },
      { id: 'D', text: 'Intensifying social friction and conflict over dwindling freshwater supplies.', correct: true },
      { id: 'E', text: 'Sudden sub-zero glacial cooling that rendered cliff dwellings permanently uninhabitable.', correct: false }
    ],
    correctAnswers: ['A', 'B', 'D']
  },
  {
    id: 'MCMA-R-04',
    taskType: 'MCMA-R',
    part: 'PART_2',
    title: 'Reading MC (Multiple) 04: Convergent Evolution of Biological Echolocation',
    prompt: 'Biological echolocation represents one of evolutionary biology\'s most celebrated examples of convergent evolution. Both microchiropteran bats navigating subterranean caves and odontocete cetaceans foraging in murky oceanic depths emit high-frequency acoustic vocalizations and interpret Returning echoes to construct spatial representations of their surroundings. Molecular geneticists comparing the genomes of bats and toothed whales discovered remarkable parallel sequence substitutions in the prestin gene, which encodes a motor protein that drives the electromechanical amplification of outer hair cells in the mammalian cochlea. Despite their disparate anatomical morphologies and diverging evolutionary lineages separated by over sixty million years, both mammalian orders converged upon identical biochemical amino acid mutations to fine-tune their hearing sensitivity toward ultrasonic frequencies.',
    question: 'Which of the following statements about echolocation in bats and cetaceans are supported by the passage?',
    options: [
      { id: 'A', text: 'Both orders utilize high-frequency acoustic vocalizations to reconstruct their physical environments.', correct: true },
      { id: 'B', text: 'They shared a common echolocating ancestor that lived less than ten thousand years ago.', correct: false },
      { id: 'C', text: 'Parallel amino acid substitutions occurred in the prestin gene across both lineages.', correct: true },
      { id: 'D', text: 'Electromechanical amplification in cochlear outer hair cells enables ultrasonic hearing sensitivity.', correct: true },
      { id: 'E', text: 'Cetaceans developed echolocation solely to communicate with pelagic bird colonies.', correct: false }
    ],
    correctAnswers: ['A', 'C', 'D']
  },
  {
    id: 'MCMA-R-05',
    taskType: 'MCMA-R',
    part: 'PART_2',
    title: 'Reading MC (Multiple) 05: Volcanic Aerosols and Historic Global Dimming',
    prompt: 'When catastrophic explosive volcanic eruptions discharge millions of metric tons of sulfur dioxide into the stratosphere, they generate global climatic reverberations that persist for years. Stratospheric sulfur dioxide oxidizes with water vapor to form microscopic sulfuric acid aerosols that reflect solar shortwave radiation back into space while absorbing upward terrestrial infrared radiation. The most famous historical precedent occurred following the 1815 eruption of Mount Tambora in Indonesia, which triggered the infamous "Year Without a Summer" in 1816 across North America and Europe. Historical agricultural ledgers and dendrochronological tree-ring records document widespread summer frosts, catastrophic cereal crop failures, and devastating livestock mortality, which in turn precipitated grain riots and severe socioeconomic volatility across the Northern Hemisphere.',
    question: 'According to the text, what consequences were directly linked to the Mount Tambora eruption?',
    options: [
      { id: 'A', text: 'Formation of sulfuric acid aerosols that reflected incoming solar radiation.', correct: true },
      { id: 'B', text: 'An immediate and permanent rise in worldwide agricultural productivity.', correct: false },
      { id: 'C', text: 'Summer frosts and widespread crop harvest failures across the Northern Hemisphere.', correct: true },
      { id: 'D', text: 'Grain shortages that triggered social riots and economic instability.', correct: true },
      { id: 'E', text: 'A total cessation of rainfall across the equatorial Pacific for a century.', correct: false }
    ],
    correctAnswers: ['A', 'C', 'D']
  },
  {
    id: 'MCMA-R-06',
    taskType: 'MCMA-R',
    part: 'PART_2',
    title: 'Reading MC (Multiple) 06: Rare Earth Elements & Green Energy Supply Chains',
    prompt: 'The transition toward clean energy infrastructure—including permanent magnet electric vehicle drivetrains and direct-drive wind turbines—has catalyzed surging worldwide demand for rare earth elements such as neodymium, praseodymium, and dysprosium. Despite their nomenclature, rare earth elements are relatively abundant in the Earth\'s crust; however, they occur in low concentrations intermingled with radioactive thorium and uranium minerals. Consequently, extracting and separating individual lanthanides requires energy-intensive chemical hydrometallurgical processing that produces massive volumes of toxic acidic tailings. Geopolitical analysts emphasize that while mineral deposits exist globally, industrial refining capacity is heavily concentrated in a handful of regions, creating significant supply chain vulnerabilities for Western renewable energy hardware manufacturers.',
    question: 'Which of the following points regarding rare earth elements are explicitly stated in the passage?',
    options: [
      { id: 'A', text: 'They are essential constituents for manufacturing electric vehicle motors and wind turbines.', correct: true },
      { id: 'B', text: 'They are practically non-existent in the Earth\'s crust and can only be gathered from meteorites.', correct: false },
      { id: 'C', text: 'Their extraction generates toxic acidic tailings due to complex chemical separation processes.', correct: true },
      { id: 'D', text: 'Global refining and processing capacity is geographically concentrated in very few regions.', correct: true },
      { id: 'E', text: 'Lanthanides produce no environmental footprint when mined in developing countries.', correct: false }
    ],
    correctAnswers: ['A', 'C', 'D']
  },

  // ==========================================
  // RO-R: Re-order Paragraphs (RO-R-03 to RO-R-06)
  // ==========================================
  {
    id: 'RO-R-03',
    taskType: 'RO-R',
    part: 'PART_2',
    title: 'Reorder Paragraphs 03: Discovery of Deep-Sea Hydrothermal Vents',
    prompt: 'Arrange the text blocks below in the correct and cohesive logical sequence.',
    paragraphs: [
      { id: 'A', text: 'Until the late 1970s, marine biologists universally believed that all complex biological life on Earth was fundamentally dependent upon solar photosynthesis.', order: 1 },
      { id: 'B', text: 'This foundational ecological paradigm was shattered in 1977 during an oceanographic expedition along the Galápagos Rift aboard the research submersible Alvin.', order: 2 },
      { id: 'C', text: 'Plunging two and a half kilometers into absolute darkness, oceanographers discovered hydrothermal chimneys spewing mineral-rich fluids exceeding 350 degrees Celsius.', order: 3 },
      { id: 'D', text: 'Surrounding these superheated volcanic fissures were dense, flourishing ecosystems of giant tube worms, clams, and crabs sustained entirely by chemosynthetic bacteria that metabolize toxic hydrogen sulfide.', order: 4 }
    ],
    correctOrder: ['A', 'B', 'C', 'D']
  },
  {
    id: 'RO-R-04',
    taskType: 'RO-R',
    part: 'PART_2',
    title: 'Reorder Paragraphs 04: Evolution of Currency from Commodity Barter to Fiat',
    prompt: 'Arrange the text blocks below in the correct and cohesive logical sequence.',
    paragraphs: [
      { id: 'A', text: 'In ancient pastoral societies, trade relied primarily on barter networks and commodity money such as grain, cattle, and cowrie shells.', order: 1 },
      { id: 'B', text: 'However, commodity barter suffered from significant inefficiencies, notably the requirement for a mutual coincidence of wants and the perishable nature of agricultural goods.', order: 2 },
      { id: 'C', text: 'To overcome these logistical barriers, merchant communities standardized metallic currency, minting durable silver and gold coins with verified weights and state insignia.', order: 3 },
      { id: 'D', text: 'Centuries later, the storage of heavy precious metal coins in merchant goldsmith vaults gave rise to paper promissory notes, laying the foundation for modern sovereign fiat currency systems.', order: 4 }
    ],
    correctOrder: ['A', 'B', 'C', 'D']
  },
  {
    id: 'RO-R-05',
    taskType: 'RO-R',
    part: 'PART_2',
    title: 'Reorder Paragraphs 05: Glacial Ice Shelf Dynamics & Calving Mechanics',
    prompt: 'Arrange the text blocks below in the correct and cohesive logical sequence.',
    paragraphs: [
      { id: 'A', text: 'Continental ice sheets in polar regions continually accumulate mass through centuries of compacted snowfall over interior plateaus.', order: 1 },
      { id: 'B', text: 'Driven by gravity and their immense weight, these massive glacial masses flow slowly outward toward coastal margins as creeping rivers of ice.', order: 2 },
      { id: 'C', text: 'Upon reaching oceanic embayments, the ice detaches from underlying bedrock and floats upon the seawater surface as expansive floating ice shelves.', order: 3 },
      { id: 'D', text: 'As warm oceanic water circulates beneath these floating margins, basal melting and tidal flexure initiate longitudinal rift fractures that ultimately culminate in massive iceberg calving events.', order: 4 }
    ],
    correctOrder: ['A', 'B', 'C', 'D']
  },
  {
    id: 'RO-R-06',
    taskType: 'RO-R',
    part: 'PART_2',
    title: 'Reorder Paragraphs 06: Antibiotic Resistance & Bacterial Conjugation',
    prompt: 'Arrange the text blocks below in the correct and cohesive logical sequence.',
    paragraphs: [
      { id: 'A', text: 'The discovery of penicillin and synthetic antimicrobial agents during the twentieth century transformed clinical medicine, rendering once-lethal bacterial infections routinely treatable.', order: 1 },
      { id: 'B', text: 'Over decades of widespread medical and agricultural application, however, relentless antibiotic exposure created immense selective pressure across microbial populations.', order: 2 },
      { id: 'C', text: 'Under this selective pressure, rare spontaneous genetic mutations and mobile genetic plasmids conferred defensive mechanisms such as beta-lactamase enzyme production.', order: 3 },
      { id: 'D', text: 'Crucially, bacteria rapidly disseminated these resistance genes to unrelated species through horizontal gene transfer and conjugation, culminating in multidrug-resistant superbugs that challenge modern medical therapies.', order: 4 }
    ],
    correctOrder: ['A', 'B', 'C', 'D']
  },

  // ==========================================
  // FIB-R: Fill in Blanks - Drag & Drop (FIB-R-05 to FIB-R-09)
  // ==========================================
  {
    id: 'FIB-R-05',
    taskType: 'FIB-R',
    part: 'PART_2',
    title: 'Drag & Drop FIB 05: Epigenetic Gene Regulation & Chromatin Remodeling',
    prompt: 'Molecular genetics has demonstrated that cellular identity is not determined solely by the static sequence of genetic base pairs. Epigenetic mechanisms, including DNA methylation and histone acetylation, dynamically regulate gene [blank_0] in response to environmental stimuli. When methyl groups attach to cytosine bases in promoter regions, they typically [blank_1] transcription by preventing transcription factor binding. Conversely, histone acetylation loosens tightly packed chromatin, rendering DNA sequences accessible for mRNA [blank_2]. These epigenetic modifications can persist through mitotic cell divisions, allowing tissues to maintain specialized cellular functions throughout an organism\'s [blank_3].',
    blanks: ['expression', 'repress', 'synthesis', 'lifespan'],
    wordPool: ['expression', 'repress', 'synthesis', 'lifespan', 'deterioration', 'accelerate', 'destruction'],
    pool: ['expression', 'repress', 'synthesis', 'lifespan', 'deterioration', 'accelerate', 'destruction'],
    passage: 'Molecular genetics has demonstrated that cellular identity is not determined solely by the static sequence of genetic base pairs. Epigenetic mechanisms, including DNA methylation and histone acetylation, dynamically regulate gene [blank_0] in response to environmental stimuli. When methyl groups attach to cytosine bases in promoter regions, they typically [blank_1] transcription by preventing transcription factor binding. Conversely, histone acetylation loosens tightly packed chromatin, rendering DNA sequences accessible for mRNA [blank_2]. These epigenetic modifications can persist through mitotic cell divisions, allowing tissues to maintain specialized cellular functions throughout an organism\'s [blank_3].'
  },
  {
    id: 'FIB-R-06',
    taskType: 'FIB-R',
    part: 'PART_2',
    title: 'Drag & Drop FIB 06: Tectonic Subduction Zones & Megathrust Earthquakes',
    prompt: 'Plate tectonic boundary zones where dense oceanic lithosphere descends beneath lighter continental crust are known as [blank_0] zones. As tectonic plates grind past one another, immense frictional resistance prevents smooth movement, causing elastic strain energy to steadily [blank_1] along the locked fault interface over centuries. When the accumulated shear stress finally exceeds the frictional strength of the rock, catastrophic ruptures occur, triggering high-magnitude [blank_2] earthquakes. The sudden vertical displacement of the overlying oceanic water column during such ruptures can subsequently generate devastating, transoceanic [blank_3] waves.',
    blanks: ['subduction', 'accumulate', 'megathrust', 'tsunami'],
    wordPool: ['subduction', 'accumulate', 'megathrust', 'tsunami', 'divergent', 'evaporate', 'tornado'],
    pool: ['subduction', 'accumulate', 'megathrust', 'tsunami', 'divergent', 'evaporate', 'tornado'],
    passage: 'Plate tectonic boundary zones where dense oceanic lithosphere descends beneath lighter continental crust are known as [blank_0] zones. As tectonic plates grind past one another, immense frictional resistance prevents smooth movement, causing elastic strain energy to steadily [blank_1] along the locked fault interface over centuries. When the accumulated shear stress finally exceeds the frictional strength of the rock, catastrophic ruptures occur, triggering high-magnitude [blank_2] earthquakes. The sudden vertical displacement of the overlying oceanic water column during such ruptures can subsequently generate devastating, transoceanic [blank_3] waves.'
  },
  {
    id: 'FIB-R-07',
    taskType: 'FIB-R',
    part: 'PART_2',
    title: 'Drag & Drop FIB 07: Pollination Biology & Ecosystem Stability',
    prompt: 'Approximately seventy-five percent of the world\'s leading food crop cultivars depend upon wild and domesticated animal pollinators for optimal fruit and seed production. Beyond their agricultural [blank_0], insect pollinators such as solitary bees and hoverflies maintain the structural integrity of terrestrial plant communities by facilitating genetic outcrossing. However, global pollinator populations currently face severe demographic declines driven by widespread pesticide application, habitat [blank_1], and parasitic pathogens. Conservation ecologists warn that the collapse of native pollinator networks would trigger cascading trophic disruptions, severely destabilizing forest biodiversity and undermining global food [blank_2]. Mitigating these losses requires restoring wildflower meadow corridors and reducing chemical insecticide usage in intensive agricultural [blank_3].',
    blanks: ['yields', 'fragmentation', 'security', 'landscapes'],
    wordPool: ['yields', 'fragmentation', 'security', 'landscapes', 'shortages', 'expansion', 'specimens'],
    pool: ['yields', 'fragmentation', 'security', 'landscapes', 'shortages', 'expansion', 'specimens'],
    passage: 'Approximately seventy-five percent of the world\'s leading food crop cultivars depend upon wild and domesticated animal pollinators for optimal fruit and seed production. Beyond their agricultural [blank_0], insect pollinators such as solitary bees and hoverflies maintain the structural integrity of terrestrial plant communities by facilitating genetic outcrossing. However, global pollinator populations currently face severe demographic declines driven by widespread pesticide application, habitat [blank_1], and parasitic pathogens. Conservation ecologists warn that the collapse of native pollinator networks would trigger cascading trophic disruptions, severely destabilizing forest biodiversity and undermining global food [blank_2]. Mitigating these losses requires restoring wildflower meadow corridors and reducing chemical insecticide usage in intensive agricultural [blank_3].'
  },
  {
    id: 'FIB-R-08',
    taskType: 'FIB-R',
    part: 'PART_2',
    title: 'Drag & Drop FIB 08: Nanomedicine & Targeted Chemotherapy Delivery',
    prompt: 'Conventional systemic chemotherapy often produces debilitating clinical side effects because cytotoxic drugs circulate indiscriminately, damaging healthy dividing cells alongside neoplastic tissues. Nanomedicine seeks to [blank_0] this limitation by encapsulating chemotherapeutic agents inside biocompatible nanoscale liposomes or polymeric nanoparticles. These drug carriers exploit the enhanced permeability and retention effect, extravasating into tumor tissues through leaky, abnormal blood vessels while remaining excluded from healthy, intact [blank_1]. By conjugating tumor-specific ligands onto the nanoparticle surface, researchers can achieve active molecular targeting, ensuring that therapeutic payloads are selectively internalized by malignant cells. This targeted precision significantly enhances therapeutic efficacy while minimizing systemic toxic [blank_2] in cancer [blank_3].',
    blanks: ['overcome', 'capillaries', 'side-effects', 'patients'],
    wordPool: ['overcome', 'capillaries', 'side-effects', 'patients', 'amplify', 'muscles', 'prescriptions'],
    pool: ['overcome', 'capillaries', 'side-effects', 'patients', 'amplify', 'muscles', 'prescriptions'],
    passage: 'Conventional systemic chemotherapy often produces debilitating clinical side effects because cytotoxic drugs circulate indiscriminately, damaging healthy dividing cells alongside neoplastic tissues. Nanomedicine seeks to [blank_0] this limitation by encapsulating chemotherapeutic agents inside biocompatible nanoscale liposomes or polymeric nanoparticles. These drug carriers exploit the enhanced permeability and retention effect, extravasating into tumor tissues through leaky, abnormal blood vessels while remaining excluded from healthy, intact [blank_1]. By conjugating tumor-specific ligands onto the nanoparticle surface, researchers can achieve active molecular targeting, ensuring that therapeutic payloads are selectively internalized by malignant cells. This targeted precision significantly enhances therapeutic efficacy while minimizing systemic toxic [blank_2] in cancer [blank_3].'
  },
  {
    id: 'FIB-R-09',
    taskType: 'FIB-R',
    part: 'PART_2',
    title: 'Drag & Drop FIB 09: Stratospheric Ozone Recovery & The Montreal Protocol',
    prompt: 'The discovery of a severe seasonal ozone depletion hole over Antarctica in the mid-1980s alarmed atmospheric scientists worldwide. Chlorofluorocarbons (CFCs), widely used as industrial refrigerants and aerosol propellants, slowly migrate upward into the stratosphere where intense solar ultraviolet radiation photolyzes them, releasing reactive chlorine [blank_0]. A single chlorine atom can catalytically destroy tens of thousands of ozone molecules, allowing harmful ultraviolet-B radiation to penetrate to the surface and elevate human skin cancer rates. In response, international diplomats signed the 1987 Montreal Protocol, mandating the progressive global phase-out of ozone-depleting substances. Long-term satellite observations confirm that stratospheric chlorine concentrations are steadily [blank_1], setting the Antarctic ozone layer on a measurable [blank_2] toward full historical recovery by the middle of this [blank_3].',
    blanks: ['radicals', 'declining', 'trajectory', 'century'],
    wordPool: ['radicals', 'declining', 'trajectory', 'century', 'molecules', 'increasing', 'detour'],
    pool: ['radicals', 'declining', 'trajectory', 'century', 'molecules', 'increasing', 'detour'],
    passage: 'The discovery of a severe seasonal ozone depletion hole over Antarctica in the mid-1980s alarmed atmospheric scientists worldwide. Chlorofluorocarbons (CFCs), widely used as industrial refrigerants and aerosol propellants, slowly migrate upward into the stratosphere where intense solar ultraviolet radiation photolyzes them, releasing reactive chlorine [blank_0]. A single chlorine atom can catalytically destroy tens of thousands of ozone molecules, allowing harmful ultraviolet-B radiation to penetrate to the surface and elevate human skin cancer rates. In response, international diplomats signed the 1987 Montreal Protocol, mandating the progressive global phase-out of ozone-depleting substances. Long-term satellite observations confirm that stratospheric chlorine concentrations are steadily [blank_1], setting the Antarctic ozone layer on a measurable [blank_2] toward full historical recovery by the middle of this [blank_3].'
  },

  // ==========================================
  // MCSA-R: Multiple Choice, Single Answer - Reading (MCSA-R-03 to MCSA-R-06)
  // ==========================================
  {
    id: 'MCSA-R-03',
    taskType: 'MCSA-R',
    part: 'PART_2',
    title: 'Multiple Choice, Single Answer (Reading) 03: Avian Magnetoreception',
    prompt: 'Biologists investigating how migratory songbirds navigate thousands of kilometers across unfamiliar terrain during nocturnal flights have identified a quantum biochemical mechanism located in avian eyes. Termed radical-pair magnetoreception, the process relies on cryptochrome-4 flavoproteins embedded in retinal photoreceptor cells. When blue photons strike cryptochrome molecules, they initiate an electron transfer that produces a pair of magnetically sensitive free radicals. The spin states of these entangled radical pairs oscillate between singlet and triplet configurations, with the interconversion rate modulated by the orientation and inclination of the Earth\'s weak geomagnetic field lines. Consequently, birds are thought to perceive the geomagnetic field as subtle spatial modulations of visual light intensity superimposed onto their visual field, providing an internal magnetic compass that operates independently of stars or landmarks.',
    question: 'According to the passage, how do migratory birds detect the Earth\'s geomagnetic field?',
    options: [
      { id: 'A', text: 'Through magnetically sensitive radical-pair spin states in retinal cryptochrome proteins.', correct: true },
      { id: 'B', text: 'By feeling geomagnetic vibrations through specialized nerve receptors in their foot pads.', correct: false },
      { id: 'C', text: 'By memorizing prominent mountain ranges and coastal contours during daytime flights.', correct: false },
      { id: 'D', text: 'Through electrical shocks conducted along their feather quills during turbulent storms.', correct: false }
    ]
  },
  {
    id: 'MCSA-R-04',
    taskType: 'MCSA-R',
    part: 'PART_2',
    title: 'Multiple Choice, Single Answer (Reading) 04: Double-Entry Bookkeeping Revolution',
    prompt: 'The emergence of double-entry bookkeeping in fourteenth-century Northern Italian trading cities such as Venice and Florence was instrumental in catalyzing modern commercial capitalism. Prior single-entry methods simply recorded cash disbursements in unstandardized chronological ledgers, leaving merchant enterprises vulnerable to internal fraud and arithmetic inaccuracies. Formalized by Franciscan mathematician Luca Pacioli in 1494, double-entry accounting mandated that every financial transaction be logged as both a debit and a credit across integrated balance sheets. This dual-entry symmetry established a perpetual self-auditing mechanism that enabled merchant families to calculate net profit margins accurately, evaluate partnership capital contributions, and manage sprawling international trading networks across disparate continents.',
    question: 'What was the primary structural benefit of Luca Pacioli\'s double-entry accounting system?',
    options: [
      { id: 'A', text: 'It eliminated the need for sovereign coin mints throughout Northern Italian states.', correct: false },
      { id: 'B', text: 'It established a dual-entry self-auditing symmetry that allowed accurate tracking of profits and capital.', correct: true },
      { id: 'C', text: 'It banned credit lending and forced all international transactions into physical gold barter.', correct: false },
      { id: 'D', text: 'It allowed merchant guilds to avoid paying maritime customs duties to papal authorities.', correct: false }
    ]
  },
  {
    id: 'MCSA-R-05',
    taskType: 'MCSA-R',
    part: 'PART_2',
    title: 'Multiple Choice, Single Answer (Reading) 05: Fungal Mycelial Networks & Forest Reciprocity',
    prompt: 'Forest ecology research has overturned the traditional view that trees in natural woodlands operate solely as independent competitors struggling for sunlight and groundwater. Utilizing radioactive isotope tracing, plant physiologists discovered that trees are interconnected beneath the forest floor by dense subterranean mycorrhizal fungal networks. Through these underground fungal hyphae, healthy mature trees transfer surplus carbon, water, and essential nitrogen to shaded younger saplings or dying neighboring specimens of differing species. In return, the host trees furnish mycorrhizal fungi with photosynthetic sucrose and carbohydrates that fungi cannot synthesize themselves. This symbiotic subterranean network functions as an ecological cooperative that enhances the resilience of the entire forest ecosystem against pest outbreaks and localized droughts.',
    question: 'What is the main reciprocal exchange occurring between trees and mycorrhizal fungi?',
    options: [
      { id: 'A', text: 'Trees provide photosynthetic carbohydrates to fungi in return for carbon, water, and mineral nutrients.', correct: true },
      { id: 'B', text: 'Fungi harvest sunlight on forest canopies to provide heat to tree roots.', correct: false },
      { id: 'C', text: 'Trees poison competing tree species by pumping toxins through the fungal hyphae.', correct: false },
      { id: 'D', text: 'Fungi consume dead tree bark and transform it into flammable atmospheric gas.', correct: false }
    ]
  },
  {
    id: 'MCSA-R-06',
    taskType: 'MCSA-R',
    part: 'PART_2',
    title: 'Multiple Choice, Single Answer (Reading) 06: Cryogenic Seed Vaults & Biodiversity Conservation',
    prompt: 'Perched deep within a sandstone mountain on the remote Arctic archipelago of Svalbard, the Svalbard Global Seed Vault serves as the world\'s ultimate botanical insurance policy. Operating at a perpetual temperature of minus eighteen degrees Celsius, the underground facility stores over one million duplicate seed accessions representing agricultural crop diversity from nearly every nation on Earth. The facility\'s primary purpose is not daily agricultural distribution, but rather safeguarding genetic biodiversity against catastrophic perils such as nuclear war, global climatic shifts, and regional genebank destruction caused by civil conflicts or natural disasters. By preserving wild heirloom crop relatives with unique genetic traits—such as high salinity tolerance or natural drought resistance—the vault guarantees that future plant breeders retain the essential biological alleles needed to ensure long-term global food security.',
    question: 'Why is the Svalbard Global Seed Vault located in a remote Arctic mountain facility?',
    options: [
      { id: 'A', text: 'To distribute commercial seed packets daily to local Arctic farmers.', correct: false },
      { id: 'B', text: 'To safeguard duplicate crop genetic accessions against global catastrophes and regional genebank losses.', correct: true },
      { id: 'C', text: 'To conduct military biological weapons testing in sub-zero environmental conditions.', correct: false },
      { id: 'D', text: 'To crossbreed wild Arctic grasses with tropical wheat in large indoor greenhouses.', correct: false }
    ]
  },

  // ==========================================
  // SST: Summarize Spoken Text (SST-02 to SST-05)
  // ==========================================
  {
    id: 'SST-02',
    taskType: 'SST',
    part: 'PART_3',
    title: 'Summarize Spoken Text 02: Microplastic Deposition in Antarctic Marine Ice',
    prompt: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You have 10 minutes to finish this task.',
    audioText: 'In our oceanographic seminar today, we examine alarming empirical findings from Antarctic sea ice cores. For decades, polar researchers assumed that the Southern Ocean\'s circumpolar currents functioned as an impenetrable hydrodynamic barrier, isolating Antarctic marine ecology from mid-latitude plastic pollution. However, recent ice core analysis extracted from coastal pack ice reveals substantial concentrations of microplastic polymers, predominantly polyester, nylon, and polyethylene microfibers. Atmospheric sampling confirms that light polymer fibers are transported poleward by high-altitude tropospheric wind patterns before precipitating onto coastal snowpacks. When seasonal spring temperatures initiate ice melt, concentrated microplastics are discharged directly into surface waters, where krill feed voraciously. Because Antarctic krill constitute the primary keystone species anchoring polar food webs, microplastic ingestion threatens baleen whales, penguins, and seals across the entire Southern Ocean ecosystem.',
    audioDurationSeconds: 32,
    timerSeconds: 600,
    minWords: 50,
    maxWords: 70,
    referenceNotes: 'Ice core analysis disproves Antarctic oceanic isolation, revealing high concentrations of microplastic fibers carried by high-altitude winds. Spring ice melt releases microplastics into surface waters, where keystone krill ingest them, threatening apex marine predators including penguins, seals, and baleen whales across the polar ecosystem.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'SST-03',
    taskType: 'SST',
    part: 'PART_3',
    title: 'Summarize Spoken Text 03: Sleep Architecture & Memory Consolidation in REM States',
    prompt: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You have 10 minutes to finish this task.',
    audioText: 'Cognitive neuroscientists studying sleep architecture have elucidated the biochemical mechanisms by which the sleeping human brain transforms fleeting waking experiences into robust, long-term semantic knowledge. During rapid eye movement, or REM sleep, electroencephalograms register heightened neocortical activity accompanied by profound muscular paralysis. Neuroimaging demonstrates that during these REM cycles, the hippocampus repeatedly replays neuronal firing sequences recorded during daytime learning, transferring episodic memory traces to the cerebral neocortex for permanent consolidation. Concurrently, systemic reductions in noradrenaline allow emotional associations linked to stressful memories to be decoupled from factual details. Consequently, chronic sleep deprivation does not merely impair immediate cognitive alertness; it severely undermines long-term memory synthesis and exacerbates emotional vulnerability.',
    audioDurationSeconds: 32,
    timerSeconds: 600,
    minWords: 50,
    maxWords: 70,
    referenceNotes: 'During REM sleep, hippocampal memory replay transfers daytime episodic memory traces to the cerebral neocortex for permanent long-term consolidation. Concurrently, reduced noradrenaline decouples stressful emotional distress from factual memories. Chronic sleep deprivation therefore critically impedes memory retention, conceptual learning, and emotional regulation.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'SST-04',
    taskType: 'SST',
    part: 'PART_3',
    title: 'Summarize Spoken Text 04: Dark Matter Detection in Underground Particle Observatories',
    prompt: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You have 10 minutes to finish this task.',
    audioText: 'Astrophysical measurements of galactic rotational velocities unequivocally indicate that visible baryonic matter constitutes less than fifteen percent of the total matter in the universe. The remaining eighty-five percent comprises invisible dark matter, which exerts immense gravitational influence but neither emits nor reflects electromagnetic radiation. To detect hypothetical dark matter particles—known as Weakly Interacting Massive Particles, or WIMPs—experimental physicists construct ultra-sensitive cryogenic detectors kilometers underground in abandoned salt and gold mines. Deep rock overburden shields the delicate liquid xenon detectors from cosmic ray interference. When a passing dark matter particle collides with a xenon nucleus, it produces a faint flash of scintillation light and ionization electrons, offering empirical validation for the cosmic scaffolding of modern cosmology.',
    audioDurationSeconds: 32,
    timerSeconds: 600,
    minWords: 50,
    maxWords: 70,
    referenceNotes: 'Astrophysics indicates that dark matter constitutes 85 percent of all matter in the universe, exerting gravitational pull without emitting light. To detect hypothetical WIMP particles, physicists construct subterranean cryogenic liquid xenon detectors shielded by deep bedrock from cosmic rays, searching for rare nuclear recoil scintillation flashes.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'SST-05',
    taskType: 'SST',
    part: 'PART_3',
    title: 'Summarize Spoken Text 05: Global Phosphorus Depletion & Sustainable Agronomy',
    prompt: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You have 10 minutes to finish this task.',
    audioText: 'Unlike nitrogen fertilizer, which can be synthesized indefinitely from atmospheric gases using industrial Haber-Bosch chemistry, agricultural phosphorus is a non-renewable geological mineral obtained exclusively from mined rock phosphate deposits. Phosphorus is an irreplaceable macronutrient essential for adenosine triphosphate synthesis, DNA backbone formation, and crop cellular development. Agronomic analyses indicate that over seventy percent of the planet\'s economically recoverable phosphate reserves are geographically concentrated in Morocco and Western Sahara. Furthermore, conventional farming practices waste over sixty percent of applied phosphorus through soil erosion and agricultural runoff, causing catastrophic freshwater eutrophication. Agronomists stress that without urgent technological closed-loop recycling—such as recovering struvite from urban wastewater and adopting precision microbial biofertilizers—global agriculture faces severe fertilizer price spikes within decades.',
    audioDurationSeconds: 34,
    timerSeconds: 600,
    minWords: 50,
    maxWords: 70,
    referenceNotes: 'Agricultural phosphorus is an irreplaceable, non-renewable mineral essential for plant DNA and cellular energy, with over seventy percent of global reserves concentrated in Morocco. Conventional farming loses substantial phosphorus to runoff and aquatic eutrophication, requiring urgent closed-loop circular nutrient recovery from wastewater to prevent future food security crises.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // MCMA-L: Multiple Choice, Multiple Answers - Listening (MCMA-L-03 to MCMA-L-06)
  // ==========================================
  {
    id: 'MCMA-L-03',
    taskType: 'MCMA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Multiple Answers (Listening) 03: Urban Wetland Bioremediation',
    prompt: 'Listen to the recording and select all correct statements.',
    audioText: 'In our environmental engineering module, we examined artificial wetland installations designed to treat municipal urban runoff. The constructed wetlands feature shallow vegetated cells lined with bentonite clay to prevent groundwater leaching. Emergent macrophytes, such as cattails and reeds, slow water flow velocities, allowing suspended particulate matter to settle out. Simultaneously, symbiotic rhizospheric bacteria living on plant roots transform dissolved agricultural nitrates into inert atmospheric nitrogen gas through denitrification, while heavy metals bind permanently to organic humic sediments.',
    audioDurationSeconds: 22,
    question: 'Which of the following functions of constructed wetlands were described in the lecture?',
    options: [
      { id: 'A', text: 'They use emergent plants to slow water velocities and settle suspended solids.', correct: true },
      { id: 'B', text: 'Symbiotic root bacteria convert dissolved nitrates into harmless nitrogen gas.', correct: true },
      { id: 'C', text: 'Bentonite clay liners prevent contaminated runoff from leaching into groundwater.', correct: true },
      { id: 'D', text: 'They boil runoff water with high-energy geothermal steam boilers.', correct: false },
      { id: 'E', text: 'They release toxic chlorine gas to sterilize all native aquatic organisms.', correct: false }
    ],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'MCMA-L-04',
    taskType: 'MCMA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Multiple Answers (Listening) 04: The Sapir-Whorf Hypothesis',
    prompt: 'Listen to the recording and select all correct statements.',
    audioText: 'Linguistic anthropologists distinguish between the strong and weak formulations of the Sapir-Whorf hypothesis. The strong version, linguistic determinism, claims that grammatical syntax strictly dictates cognitive perception, making thoughts outside linguistic bounds impossible. Modern cognitive science largely rejects determinism, finding that humans perceive colors and spatial relationships regardless of vocabulary. However, the weaker version, linguistic relativity, is empirically supported: language habits subtly bias memory retention, categorical grouping, and attentional focus across cultural communities.',
    audioDurationSeconds: 22,
    question: 'According to the speaker, what is the current academic consensus regarding the Sapir-Whorf hypothesis?',
    options: [
      { id: 'A', text: 'Linguistic determinism is largely rejected by contemporary cognitive scientists.', correct: true },
      { id: 'B', text: 'The weak version, linguistic relativity, has found empirical support.', correct: true },
      { id: 'C', text: 'Language patterns can subtly influence categorical grouping and memory recall.', correct: true },
      { id: 'D', text: 'Human infants cannot see visual colors unless taught specific color nouns.', correct: false },
      { id: 'E', text: 'All world languages share identical grammatical vocabularies.', correct: false }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'MCMA-L-05',
    taskType: 'MCMA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Multiple Answers (Listening) 05: Solar Flare Eruptions & Space Weather Risks',
    prompt: 'Listen to the recording and select all correct statements.',
    audioText: 'Space weather astrophysicists monitor coronal mass ejections from the solar corona that blast billions of tons of magnetized plasma across interplanetary space. When a directed plasma wave impacts the Earth\'s magnetosphere, it induces high-voltage geomagnetically induced currents along long-distance electric transmission grids. These severe electrical currents can saturate transformer cores, triggering widespread blackouts and permanently destroying high-voltage transformers. High-energy solar protons also degrade satellite solar panels and disrupt high-frequency polar aviation communications.',
    audioDurationSeconds: 22,
    question: 'What risks associated with intense coronal mass ejections were highlighted by the speaker?',
    options: [
      { id: 'A', text: 'Induction of damaging electrical currents that can overwhelm power grid transformers.', correct: true },
      { id: 'B', text: 'Disruption of high-frequency radio communications along polar flight corridors.', correct: true },
      { id: 'C', text: 'Physical degradation of orbiting satellite solar arrays by energetic solar protons.', correct: true },
      { id: 'D', text: 'Sudden permanent evaporation of the Earth\'s liquid surface oceans.', correct: false },
      { id: 'E', text: 'Extinction of all nocturnal forest animals due to daytime moonlight.', correct: false }
    ],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'MCMA-L-06',
    taskType: 'MCMA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Multiple Answers (Listening) 06: Behavioral Habit Loops & Neuroplasticity',
    prompt: 'Listen to the recording and select all correct statements.',
    audioText: 'Neurological investigations into automatic human behavior reveal that habits are governed by a three-part neurological loop located in the basal ganglia. First, an external sensory cue triggers mental anticipation. Second, the individual performs a routinized physical or cognitive routine. Third, the brain receives a dopamine-mediated reward that encodes the behavior for automatic repetition. Clinical trials demonstrate that attempting to eliminate a bad habit through willpower alone rarely succeeds; instead, behavioral psychologists recommend maintaining the existing cue and reward while deliberately substituting a constructive alternative routine.',
    audioDurationSeconds: 22,
    question: 'Which principles of the habit loop were discussed by the lecturer?',
    options: [
      { id: 'A', text: 'Habit loops are structurally managed within the basal ganglia of the brain.', correct: true },
      { id: 'B', text: 'The habit loop comprises three primary elements: cue, routine, and reward.', correct: true },
      { id: 'C', text: 'Willpower alone is usually ineffective without substituting the underlying routine.', correct: true },
      { id: 'D', text: 'Dopamine has no biological connection to reward processing in human habits.', correct: false },
      { id: 'E', text: 'Habits can only be formed before an individual reaches five years of age.', correct: false }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // FIB-L: Fill in Blanks - Listening (FIB-L-03 to FIB-L-06)
  // ==========================================
  {
    id: 'FIB-L-03',
    taskType: 'FIB-L',
    part: 'PART_3',
    title: 'Fill in the Blanks (Listening) 03',
    prompt: 'Satellite climatology utilizes spaceborne radiometers to monitor changes in planetary [blank_0]. When polar sea ice melts, dark oceanic water absorbs substantially more solar [blank_1], initiating a positive feedback mechanism that amplifies high-latitude [blank_2].',
    audioText: 'Satellite climatology utilizes spaceborne radiometers to monitor changes in planetary albedo. When polar sea ice melts, dark oceanic water absorbs substantially more solar radiation, initiating a positive feedback mechanism that amplifies high-latitude warming.',
    audioDurationSeconds: 14,
    answers: ['albedo', 'radiation', 'warming'],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'FIB-L-04',
    taskType: 'FIB-L',
    part: 'PART_3',
    title: 'Fill in the Blanks (Listening) 04',
    prompt: 'Clinical studies in stroke [blank_0] emphasize the remarkable capacity of adult human neural circuits for functional [blank_1]. Intensive occupational therapies stimulate surviving cortical neurons to form new synaptic [blank_2] that bypass damaged vascular tissue.',
    audioText: 'Clinical studies in stroke rehabilitation emphasize the remarkable capacity of adult human neural circuits for functional reorganization. Intensive occupational therapies stimulate surviving cortical neurons to form new synaptic connections that bypass damaged vascular tissue.',
    audioDurationSeconds: 15,
    answers: ['rehabilitation', 'reorganization', 'connections'],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'FIB-L-05',
    taskType: 'FIB-L',
    part: 'PART_3',
    title: 'Fill in the Blanks (Listening) 05',
    prompt: 'During industrial organic synthesis, chemical engineers introduce solid [blank_0] to reduce reaction activation energy. Heterogeneous catalysts provide active surface [blank_1] that accelerate chemical molecular conversions without being [blank_2] in the reaction process.',
    audioText: 'During industrial organic synthesis, chemical engineers introduce solid catalysts to reduce reaction activation energy. Heterogeneous catalysts provide active surface sites that accelerate chemical molecular conversions without being consumed in the reaction process.',
    audioDurationSeconds: 15,
    answers: ['catalysts', 'sites', 'consumed'],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'FIB-L-06',
    taskType: 'FIB-L',
    part: 'PART_3',
    title: 'Fill in the Blanks (Listening) 06',
    prompt: 'Binary cycle geothermal power stations utilize subterranean thermal [blank_0] to heat secondary organic working fluids with low boiling [blank_1]. The vaporized working fluid expands through turbines to generate [blank_2] before being recondensed in closed-loop systems.',
    audioText: 'Binary cycle geothermal power stations utilize subterranean thermal brine to heat secondary organic working fluids with low boiling points. The vaporized working fluid expands through turbines to generate electricity before being recondensed in closed-loop systems.',
    audioDurationSeconds: 15,
    answers: ['brine', 'points', 'electricity'],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // HCS: Highlight Correct Summary (HCS-03 to HCS-06)
  // ==========================================
  {
    id: 'HCS-03',
    taskType: 'HCS',
    part: 'PART_3',
    title: 'Highlight Correct Summary 03: Coral Bleaching & Symbiont Shuffling',
    prompt: 'Listen to the recording and select the paragraph that best summarizes the speaker message.',
    audioText: 'Marine biologists monitoring the Great Barrier Reef have observed that while sustained heatwaves cause catastrophic mass coral bleaching, certain coral colonies exhibit surprising thermal resilience. Molecular analysis reveals that these resistant colonies host thermotolerant dinoflagellate algae from the genus Durusdinium within their gastrodermal tissues. Under thermal stress, resilient corals undergo symbiont shuffling, replacing heat-sensitive Cladocopium algae with Durusdinium symbionts. This physiological adjustment allows the holobiont to maintain photosynthetic sugar synthesis even when water temperatures exceed historical averages by up to two degrees Celsius.',
    audioDurationSeconds: 24,
    options: [
      {
        id: 'A',
        text: 'Certain coral colonies endure elevated ocean temperatures by hosting thermotolerant Durusdinium algae through symbiont shuffling, which sustains photosynthesis under heat stress.',
        correct: true
      },
      {
        id: 'B',
        text: 'All corals instantly disintegrate when water temperatures rise because algal symbionts poison coral host tissues during marine heatwaves.',
        correct: false
      },
      {
        id: 'C',
        text: 'Great Barrier Reef corals survive thermal stress solely by feeding on deep-sea mineral mud rather than utilizing photosynthetic algal energy.',
        correct: false
      },
      {
        id: 'D',
        text: 'Durusdinium algae are dangerous invasive parasites that cause irreversible bleaching in all known Pacific reef species.',
        correct: false
      }
    ],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'HCS-04',
    taskType: 'HCS',
    part: 'PART_3',
    title: 'Highlight Correct Summary 04: Industrial Automation & Skilled Labor Shifts',
    prompt: 'Listen to the recording and select the paragraph that best summarizes the speaker message.',
    audioText: 'Historical analyses of technological automation challenge the widespread fear that industrial robotics invariably cause net employment destruction. While automated robotic machining tools displace routine assembly workers, they simultaneously generate unprecedented demand for precision technicians, software controls engineers, and predictive maintenance specialists. Economic data demonstrates that advanced manufacturing economies that embrace rapid robotic integration maintain higher median wages and lower structural unemployment than nations that delay capital equipment modernization.',
    audioDurationSeconds: 22,
    options: [
      {
        id: 'A',
        text: 'Rather than causing net job destruction, industrial automation displaces routine assembly roles while creating high-wage specialized positions in engineering, maintenance, and software.',
        correct: true
      },
      {
        id: 'B',
        text: 'Industrial robotics should be outlawed globally because machines eliminate all manufacturing jobs and lower average national incomes permanently.',
        correct: false
      },
      {
        id: 'C',
        text: 'Robotic assembly plants require no human supervision, maintenance technicians, or software engineering whatsoever.',
        correct: false
      },
      {
        id: 'D',
        text: 'Nations that invest heavily in robotics suffer higher unemployment and lower median wages than countries with purely manual labor forces.',
        correct: false
      }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'HCS-05',
    taskType: 'HCS',
    part: 'PART_3',
    title: 'Highlight Correct Summary 05: Mars Rover Geology & Ancient Lacustrine Sediments',
    prompt: 'Listen to the recording and select the paragraph that best summarizes the speaker message.',
    audioText: 'Geological data transmitted by the Curiosity rover inside Gale Crater on Mars has confirmed that the basin was once occupied by a vast, enduring freshwater lake system billions of years ago. Spectroscopic instruments detected layered mudstone strata rich in smectite clay minerals and organic carbon molecules, indicating neutral pH water chemistry and abundant chemical energy sources. These ancient geochemical conditions confirm that early Mars possessed stable aqueous environments capable of supporting microbial habitability.',
    audioDurationSeconds: 22,
    options: [
      {
        id: 'A',
        text: 'Curiosity rover findings of layered clay-rich mudstones in Gale Crater demonstrate that early Mars featured neutral, long-standing freshwater lakes hospitable to microbial life.',
        correct: true
      },
      {
        id: 'B',
        text: 'Gale Crater was proven to be a dry, acidic volcanic caldera that never held water or supported habitability at any point in Martian history.',
        correct: false
      },
      {
        id: 'C',
        text: 'The Curiosity rover discovered living microbial colonies actively swimming in subsurface liquid freshwater ponds on Mars.',
        correct: false
      },
      {
        id: 'D',
        text: 'Mars had liquid water in its atmosphere, but surface water never accumulated into lakes due to extreme solar radiation.',
        correct: false
      }
    ],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'HCS-06',
    taskType: 'HCS',
    part: 'PART_3',
    title: 'Highlight Correct Summary 06: Circadian Clocks & Metabolic Synchronization',
    prompt: 'Listen to the recording and select the paragraph that best summarizes the speaker message.',
    audioText: 'Molecular chronobiology has established that internal circadian rhythms are not confined to the brain\'s central suprachiasmatic nucleus. Nearly every peripheral organ, including the liver, pancreas, and skeletal muscle, possesses autonomous molecular clock genes that oscillate on an approximate twenty-four-hour cycle. When modern lifestyle factors—such as midnight eating or artificial blue light exposure—desynchronize peripheral metabolic clocks from the central master clock, insulin sensitivity deteriorates, accelerating chronic metabolic disorders such as obesity and type 2 diabetes.',
    audioDurationSeconds: 22,
    options: [
      {
        id: 'A',
        text: 'Peripheral organs possess autonomous circadian clocks; when environmental disruptors such as late-night eating cause desynchronization from the master clock, metabolic health and insulin sensitivity decline.',
        correct: true
      },
      {
        id: 'B',
        text: 'The human body has only one clock located in the brain, and peripheral tissues have no genetic mechanism to track time.',
        correct: false
      },
      {
        id: 'C',
        text: 'Artificial blue light at night boosts insulin sensitivity and helps cure chronic metabolic illnesses across all age groups.',
        correct: false
      },
      {
        id: 'D',
        text: 'Meal timing has no documented influence on the molecular clock genes regulating pancreatic and liver function.',
        correct: false
      }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // MCSA-L: Multiple Choice, Single Answer - Listening (MCSA-L-03 to MCSA-L-06)
  // ==========================================
  {
    id: 'MCSA-L-03',
    taskType: 'MCSA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Single Answer (Listening) 03: Green Hydrogen Electrolysis',
    prompt: 'Listen to the recording and answer the multiple-choice question.',
    audioText: 'In our chemical engineering lecture on the hydrogen economy, we discussed proton exchange membrane, or PEM, electrolyzers. Unlike alkaline electrolysis systems, PEM systems can operate at significantly higher current densities and respond almost instantaneously to fluctuating power inputs, making them ideally suited for direct coupling with variable wind and solar electricity sources.',
    audioDurationSeconds: 18,
    question: 'Why are PEM electrolyzers well-suited for integration with wind and solar power?',
    options: [
      { id: 'A', text: 'They can adjust rapidly to fluctuating renewable power inputs.', correct: true },
      { id: 'B', text: 'They operate only with high-temperature coal combustion heat.', correct: false },
      { id: 'C', text: 'They require no water or electrical conductivity whatsoever.', correct: false },
      { id: 'D', text: 'They are built entirely from recycled plastic beverage bottles.', correct: false }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'MCSA-L-04',
    taskType: 'MCSA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Single Answer (Listening) 04: Medieval Guilds & Craft Regulation',
    prompt: 'Listen to the recording and answer the multiple-choice question.',
    audioText: 'Economic historians studying medieval European craft guilds have noted that while guilds restricted outside commercial competition and set fixed commodity prices, they also established rigorous apprenticeship standards and mandatory quality inspections that protected consumers against substandard or adulterated manufactured goods.',
    audioDurationSeconds: 18,
    question: 'What consumer benefit was provided by medieval merchant craft guilds?',
    options: [
      { id: 'A', text: 'Enforcement of rigorous apprenticeship training and strict product quality standards.', correct: true },
      { id: 'B', text: 'Guaranteed free international shipping for all household commodities.', correct: false },
      { id: 'C', text: 'Permanent tax exemptions for every working-class urban resident.', correct: false },
      { id: 'D', text: 'Banning all forms of metallic currency in favor of barter trading.', correct: false }
    ],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'MCSA-L-05',
    taskType: 'MCSA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Single Answer (Listening) 05: Synthetic Biology & Environmental Biosensors',
    prompt: 'Listen to the recording and answer the multiple-choice question.',
    audioText: 'Bioengineers have synthesized genetically engineered bacterial biosensors capable of detecting minute trace concentrations of heavy metal contaminants in municipal drinking water. By linking arsenic-responsive promoter genes to green fluorescent protein synthesis, the bacteria emit visible luminescence when exposed to dangerous arsenic levels, offering an inexpensive diagnostic tool for rural communities.',
    audioDurationSeconds: 20,
    question: 'How do engineered bacterial biosensors indicate the presence of arsenic in water?',
    options: [
      { id: 'A', text: 'By synthesizing green fluorescent protein that causes the bacteria to glow.', correct: true },
      { id: 'B', text: 'By boiling the water sample to create audible acoustic whistling.', correct: false },
      { id: 'C', text: 'By rapidly forming solid magnetic crystals that sink to the bottom.', correct: false },
      { id: 'D', text: 'By turning contaminated water into non-potable dark petroleum oil.', correct: false }
    ],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'MCSA-L-06',
    taskType: 'MCSA-L',
    part: 'PART_3',
    title: 'Multiple Choice, Single Answer (Listening) 06: High-Altitude Hypoxia Adaptations',
    prompt: 'Listen to the recording and answer the multiple-choice question.',
    audioText: 'Physiological studies of indigenous populations on the Tibetan Plateau reveal unique genetic adaptations to high-altitude hypoxia. Unlike lowland visitors who produce excess red blood cells that thicken blood and elevate cardiovascular strain, Tibetans carry an EPAS1 gene variant that maintains normal hemoglobin concentrations while elevating resting respiratory rates and nitric oxide blood vessel dilation.',
    audioDurationSeconds: 20,
    question: 'How does the EPAS1 adaptation benefit Tibetan populations living at high altitudes?',
    options: [
      { id: 'A', text: 'It maintains normal hemoglobin levels while increasing nitric oxide blood vessel dilation.', correct: true },
      { id: 'B', text: 'It increases blood viscosity by tripling the number of red blood cells.', correct: false },
      { id: 'C', text: 'It eliminates the body requirement to consume dietary oxygen entirely.', correct: false },
      { id: 'D', text: 'It prevents the heart from beating faster during strenuous physical exercise.', correct: false }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // SMW: Select Missing Word (SMW-03 to SMW-06)
  // ==========================================
  {
    id: 'SMW-03',
    taskType: 'SMW',
    part: 'PART_3',
    title: 'Select Missing Word 03: Direct Air Carbon Capture',
    prompt: 'Listen to the recording. The final word or phrase is replaced with a beep. Choose the correct completion.',
    audioText: 'Direct air capture facilities utilize industrial chemical contactors to extract carbon dioxide directly from ambient air. While the chemical adsorption processes are thermodynamically sound, current operational facilities face substantial obstacles concerning energetic requirements and financial [BEEP].',
    audioDurationSeconds: 15,
    question: 'Select the option that most appropriately completes the recording ending with [BEEP].',
    options: [
      { id: 'A', text: 'viability', correct: true },
      { id: 'B', text: 'precipitation', correct: false },
      { id: 'C', text: 'photosynthesis', correct: false },
      { id: 'D', text: 'evaporation', correct: false }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'SMW-04',
    taskType: 'SMW',
    part: 'PART_3',
    title: 'Select Missing Word 04: Mesopotamian Cuneiform Accounting',
    prompt: 'Listen to the recording. The final word or phrase is replaced with a beep. Choose the correct completion.',
    audioText: 'Archaeological discoveries in Mesopotamia demonstrate that written language did not originate for poetry or religious literature. Rather, early Sumerian cuneiform clay tablets were developed primarily as administrative tools for recording agricultural grain surplus, livestock herds, and taxation [BEEP].',
    audioDurationSeconds: 16,
    question: 'Select the option that most appropriately completes the recording ending with [BEEP].',
    options: [
      { id: 'A', text: 'obligations', correct: true },
      { id: 'B', text: 'astronomy', correct: false },
      { id: 'C', text: 'meteorology', correct: false },
      { id: 'D', text: 'reproduction', correct: false }
    ],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'SMW-05',
    taskType: 'SMW',
    part: 'PART_3',
    title: 'Select Missing Word 05: Deep Sea Submarine Canyons',
    prompt: 'Listen to the recording. The final word or phrase is replaced with a beep. Choose the correct completion.',
    audioText: 'Submarine canyons incised into continental shelves serve as primary conduits funneling coastal organic matter into the deep ocean. Episodic sediment avalanches, known as turbidity currents, carve deep bathymetric channels while transporting vital nutrients to benthic [BEEP].',
    audioDurationSeconds: 15,
    question: 'Select the option that most appropriately completes the recording ending with [BEEP].',
    options: [
      { id: 'A', text: 'communities', correct: true },
      { id: 'B', text: 'atmospheres', correct: false },
      { id: 'C', text: 'satellites', correct: false },
      { id: 'D', text: 'glaciers', correct: false }
    ],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'SMW-06',
    taskType: 'SMW',
    part: 'PART_3',
    title: 'Select Missing Word 06: Nanoparticle Polymer Encapsulation',
    prompt: 'Listen to the recording. The final word or phrase is replaced with a beep. Choose the correct completion.',
    audioText: 'In pharmaceutical development, coating therapeutic nanoparticles with hydrophilic polyethylene glycol polymers shields them from detection by the immune system\'s reticuloendothelial system. This surface modification dramatically prolongs the drug carrier\'s circulatory half-life and therapeutic [BEEP].',
    audioDurationSeconds: 16,
    question: 'Select the option that most appropriately completes the recording ending with [BEEP].',
    options: [
      { id: 'A', text: 'efficacy', correct: true },
      { id: 'B', text: 'toxicity', correct: false },
      { id: 'C', text: 'depreciation', correct: false },
      { id: 'D', text: 'friction', correct: false }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // HIW: Highlight Incorrect Words (HIW-03 to HIW-06)
  // ==========================================
  {
    id: 'HIW-03',
    taskType: 'HIW',
    part: 'PART_3',
    title: 'Highlight Incorrect Words 03: Glacial Ice Flow',
    prompt: 'Listen to the recording. Click the words in the text that differ from what the speaker says.',
    audioText: 'Glaciological monitoring reveals that basal meltwater acts as a hydraulic lubricant beneath continental ice sheets, accelerating glacial movement toward the coastline.',
    displayedText: 'Glaciological monitoring reveals that basal volcanic acts as a magnetic lubricant beneath continental ice sheets, restricting glacial movement toward the coastline.',
    audioDurationSeconds: 13,
    incorrectWordIndices: [5, 8, 14],
    replacements: [
      { word: 'volcanic', spokenWord: 'meltwater' },
      { word: 'magnetic', spokenWord: 'hydraulic' },
      { word: 'restricting', spokenWord: 'accelerating' }
    ],
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'HIW-04',
    taskType: 'HIW',
    part: 'PART_3',
    title: 'Highlight Incorrect Words 04: Cellular Mitosis',
    prompt: 'Listen to the recording. Click the words in the text that differ from what the speaker says.',
    audioText: 'During cellular metaphase, duplicated chromosomes align along the equatorial plate before spindle fibers pull sister chromatids apart toward opposite poles.',
    displayedText: 'During cellular metaphase, damaged chromosomes align along the equatorial plate before electric fibers pull sister chromatids apart toward adjacent poles.',
    audioDurationSeconds: 13,
    incorrectWordIndices: [3, 10, 16],
    replacements: [
      { word: 'damaged', spokenWord: 'duplicated' },
      { word: 'electric', spokenWord: 'spindle' },
      { word: 'adjacent', spokenWord: 'opposite' }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'HIW-05',
    taskType: 'HIW',
    part: 'PART_3',
    title: 'Highlight Incorrect Words 05: Renaissance Cartography',
    prompt: 'Listen to the recording. Click the words in the text that differ from what the speaker says.',
    audioText: 'Sixteenth century navigators relied on the Mercator projection because it preserves constant compass bearings as straight lines across nautical charts.',
    displayedText: 'Sixteenth century navigators relied on the Mercator projection because it distorts constant compass bearings as curved lines across nautical charts.',
    audioDurationSeconds: 12,
    incorrectWordIndices: [8, 13],
    replacements: [
      { word: 'distorts', spokenWord: 'preserves' },
      { word: 'curved', spokenWord: 'straight' }
    ],
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'HIW-06',
    taskType: 'HIW',
    part: 'PART_3',
    title: 'Highlight Incorrect Words 06: Acoustic Insulation in Architecture',
    prompt: 'Listen to the recording. Click the words in the text that differ from what the speaker says.',
    audioText: 'Porous insulation materials absorb high-frequency sound waves by converting acoustic kinetic energy into thermal dissipation through internal microscopic friction.',
    displayedText: 'Heavy insulation materials reflect high-frequency sound waves by converting acoustic kinetic energy into chemical dissipation through internal microscopic friction.',
    audioDurationSeconds: 13,
    incorrectWordIndices: [0, 3, 11],
    replacements: [
      { word: 'Heavy', spokenWord: 'Porous' },
      { word: 'reflect', spokenWord: 'absorb' },
      { word: 'chemical', spokenWord: 'thermal' }
    ],
    voiceAccent: 'en-US',
    speechRate: 0.95
  },

  // ==========================================
  // WFD: Write From Dictation (WFD-04 to WFD-11)
  // ==========================================
  {
    id: 'WFD-04',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 04',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'The statistical analysis revealed significant variations across experimental groups.',
    audioDurationSeconds: 6,
    referenceSentence: 'The statistical analysis revealed significant variations across experimental groups.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'WFD-05',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 05',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'Postgraduate candidates must submit their dissertation drafts by the end of this month.',
    audioDurationSeconds: 6,
    referenceSentence: 'Postgraduate candidates must submit their dissertation drafts by the end of this month.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'WFD-06',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 06',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'Sustainable urban development requires collaborative planning between engineers and environmental scientists.',
    audioDurationSeconds: 7,
    referenceSentence: 'Sustainable urban development requires collaborative planning between engineers and environmental scientists.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'WFD-07',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 07',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'All laboratory safety protocols must be strictly adhered to during chemical experiments.',
    audioDurationSeconds: 6,
    referenceSentence: 'All laboratory safety protocols must be strictly adhered to during chemical experiments.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'WFD-08',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 08',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'The university library provides access to millions of peer-reviewed digital journals.',
    audioDurationSeconds: 6,
    referenceSentence: 'The university library provides access to millions of peer-reviewed digital journals.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  },
  {
    id: 'WFD-09',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 09',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'Economic indicators suggest a steady recovery in domestic retail spending this quarter.',
    audioDurationSeconds: 6,
    referenceSentence: 'Economic indicators suggest a steady recovery in domestic retail spending this quarter.',
    voiceAccent: 'en-AU',
    speechRate: 0.95
  },
  {
    id: 'WFD-10',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 10',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'Biological diversity is crucial for maintaining the resilience of terrestrial ecosystems.',
    audioDurationSeconds: 6,
    referenceSentence: 'Biological diversity is crucial for maintaining the resilience of terrestrial ecosystems.',
    voiceAccent: 'en-US',
    speechRate: 0.95
  },
  {
    id: 'WFD-11',
    taskType: 'WFD',
    part: 'PART_3',
    title: 'Write From Dictation 11',
    prompt: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    audioText: 'Scholars from various disciplines convened at the conference to debate technological ethics.',
    audioDurationSeconds: 6,
    referenceSentence: 'Scholars from various disciplines convened at the conference to debate technological ethics.',
    voiceAccent: 'en-GB',
    speechRate: 0.95
  }
];

// Merge without duplicates based on id
const existingIds = new Set(qb.items.map((i) => i.id));
let addedCount = 0;

newItems.forEach((item) => {
  if (!existingIds.has(item.id)) {
    qb.items.push(item);
    existingIds.add(item.id);
    addedCount++;
  }
});

// Add a second pre-configured Full Mock Test B (drawing alternate items)
const fullMockBItemIds = [
  'PI-02',
  'RA-07', 'RA-08', 'RA-09', 'RA-10', 'RA-11', 'RA-12',
  'RS-11', 'RS-12', 'RS-13', 'RS-14', 'RS-15', 'RS-16', 'RS-17', 'RS-18', 'RS-19', 'RS-20',
  'DI-07', 'DI-08', 'DI-09', 'DI-10', 'DI-11', 'DI-12',
  'RL-03', 'RL-04',
  'SGD-03', 'SGD-04',
  'RTS-03', 'RTS-04',
  'ASQ-06', 'ASQ-07', 'ASQ-08', 'ASQ-09', 'ASQ-10',
  'SWT-03', 'SWT-04',
  'WE-02',
  'FIB-RW-06', 'FIB-RW-07', 'FIB-RW-08', 'FIB-RW-09', 'FIB-RW-10',
  'MCMA-R-03', 'MCMA-R-04',
  'RO-R-03', 'RO-R-04',
  'FIB-R-05', 'FIB-R-06', 'FIB-R-07', 'FIB-R-08',
  'MCSA-R-03', 'MCSA-R-04',
  'SST-02',
  'MCMA-L-03', 'MCMA-L-04',
  'FIB-L-03', 'FIB-L-04',
  'HCS-03', 'HCS-04',
  'MCSA-L-03', 'MCSA-L-04',
  'SMW-03', 'SMW-04',
  'HIW-03', 'HIW-04',
  'WFD-04', 'WFD-05', 'WFD-06'
];

if (!qb.testPackages) qb.testPackages = [];
const existingPkgB = qb.testPackages.find((p) => p.id === 'PKG-FULL-B');
if (!existingPkgB) {
  qb.testPackages.splice(1, 0, {
    id: 'PKG-FULL-B',
    name: 'Full Mock Test B (Alternate Draw)',
    description: 'Complete 68-item Pearson PTE Academic Simulation sampled from Bank Set B.',
    itemIds: fullMockBItemIds,
    createdAt: new Date().toISOString()
  });
}

fs.writeFileSync(qbPath, JSON.stringify(qb, null, 2), 'utf8');

console.log(`Successfully added ${addedCount} items to Question Bank!`);
console.log(`Total questions in bank: ${qb.items.length}`);
const counts = {};
qb.items.forEach((it) => (counts[it.taskType] = (counts[it.taskType] || 0) + 1));
console.log('Updated Task Type Counts:\n', counts);
