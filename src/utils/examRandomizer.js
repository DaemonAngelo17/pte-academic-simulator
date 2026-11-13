/**
 * Helper to build a randomized exam set sampled from the master question bank
 * while mapping each drawn item to its canonical Google Sheet exam slot.
 */

// Official item counts per task type for a standard full exam
export const OFFICIAL_ITEM_QUOTAS = {
  PI: 1,
  RA: 6,
  RS: 10,
  DI: 6,
  RL: 2,
  SGD: 2,
  RTS: 2,
  ASQ: 5,
  SWT: 2,
  WE: 1,
  'FIB-RW': 5,
  'MCMA-R': 2,
  'RO-R': 2,
  'FIB-R': 4,
  'MCSA-R': 2,
  SST: 1,
  'MCMA-L': 2,
  'FIB-L': 2,
  HCS: 2,
  'MCSA-L': 2,
  SMW: 2,
  HIW: 2,
  WFD: 3
};

// Canonical slot ID prefix generator
export function getSlotId(taskType, indexOneBased) {
  const pad = String(indexOneBased).padStart(2, '0');
  return `${taskType}-${pad}`;
}

/**
 * Fisher-Yates array shuffle (non-mutating)
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles internal choices/options within a question item
 * without corrupting correct answer references or IDs.
 */
export function randomizeItemPromptsAndChoices(item) {
  if (!item) return item;
  const cloned = JSON.parse(JSON.stringify(item));

  // 1. Multiple-choice single / multiple options: MCMA-R, MCSA-R, MCMA-L, MCSA-L, HCS, SMW
  if (Array.isArray(cloned.options) && ['MCMA-R', 'MCSA-R', 'MCMA-L', 'MCSA-L', 'HCS', 'SMW'].includes(cloned.taskType)) {
    cloned.options = shuffleArray(cloned.options);
  }

  // 2. FIB-RW: Shuffle dropdown choices in each blank option
  if (cloned.taskType === 'FIB-RW' && Array.isArray(cloned.options)) {
    cloned.options = cloned.options.map((opt) => ({
      ...opt,
      choices: Array.isArray(opt.choices) ? shuffleArray(opt.choices) : opt.choices
    }));
  }

  // 3. FIB-R: Shuffle draggable word pool
  if (cloned.taskType === 'FIB-R' && (Array.isArray(cloned.wordPool) || Array.isArray(cloned.pool))) {
    const pool = cloned.wordPool || cloned.pool || [];
    const shuffledPool = shuffleArray(pool);
    cloned.wordPool = shuffledPool;
    cloned.pool = shuffledPool;
  }

  // 4. RO-R: Shuffle initial presentation order of paragraphs
  if (cloned.taskType === 'RO-R' && Array.isArray(cloned.paragraphs)) {
    cloned.paragraphs = shuffleArray(cloned.paragraphs);
  }

  return cloned;
}

/**
 * Builds a randomized exam set.
 * For each task type, it randomly draws the quota from all available questions of that type,
 * and assigns them canonical slot IDs (e.g. RA-01..RA-06) while recording the original item ID and data.
 *
 * @param {Array} allItems - All items from questionBank.items
 * @param {Object} options - { scope: 'all' | 'PART_1' | 'PART_2' | 'PART_3', randomize: boolean, shuffleChoices: boolean }
 * @returns {Array} List of exam items ready for the exam engine and auto-scoring
 */
export function buildExamSet(allItems = [], options = {}) {
  const { scope = 'all', randomize = true, shuffleChoices = true } = options;

  if (!allItems || allItems.length === 0) return [];

  // Group items by taskType
  const grouped = {};
  allItems.forEach((it) => {
    if (!grouped[it.taskType]) grouped[it.taskType] = [];
    grouped[it.taskType].push(it);
  });

  // Determine task types based on scope
  const taskTypesInOrder = [
    // Part 1
    'PI', 'RA', 'RS', 'DI', 'RL', 'SGD', 'RTS', 'ASQ', 'SWT', 'WE',
    // Part 2
    'FIB-RW', 'MCMA-R', 'RO-R', 'FIB-R', 'MCSA-R',
    // Part 3
    'SST', 'MCMA-L', 'FIB-L', 'HCS', 'MCSA-L', 'SMW', 'HIW', 'WFD'
  ];

  const partMap = {
    PI: 'PART_1', RA: 'PART_1', RS: 'PART_1', DI: 'PART_1', RL: 'PART_1',
    SGD: 'PART_1', RTS: 'PART_1', ASQ: 'PART_1', SWT: 'PART_1', WE: 'PART_1',
    'FIB-RW': 'PART_2', 'MCMA-R': 'PART_2', 'RO-R': 'PART_2', 'FIB-R': 'PART_2', 'MCSA-R': 'PART_2',
    SST: 'PART_3', 'MCMA-L': 'PART_3', 'FIB-L': 'PART_3', HCS: 'PART_3',
    'MCSA-L': 'PART_3', SMW: 'PART_3', HIW: 'PART_3', WFD: 'PART_3'
  };

  const filteredTypes = taskTypesInOrder.filter((type) => {
    if (scope === 'all') return true;
    return partMap[type] === scope;
  });

  const finalExamItems = [];

  filteredTypes.forEach((type) => {
    const pool = grouped[type] || [];
    if (pool.length === 0) return;

    const quota = OFFICIAL_ITEM_QUOTAS[type] || pool.length;
    // If randomize is true, shuffle the pool before slicing
    const candidateList = randomize ? shuffleArray(pool) : pool;
    const drawn = candidateList.slice(0, quota);

    drawn.forEach((originalItem, index) => {
      const canonicalSlotId = getSlotId(type, index + 1);

      // Deep clone item and optionally randomize inner choices/prompts
      let examItem = shuffleChoices
        ? randomizeItemPromptsAndChoices(originalItem)
        : JSON.parse(JSON.stringify(originalItem));

      examItem = {
        ...examItem,
        id: canonicalSlotId, // Aligns 100% with the Google Sheet row ID and auto-scoring slots!
        originalBankId: originalItem.id, // Preserves original question bank ID
        slotIndex: index + 1
      };

      finalExamItems.push(examItem);
    });
  });

  return finalExamItems;
}

/**
 * Assembles a randomized test package for teachers to save or distribute.
 */
export function generateRandomExamPackage(name = 'Randomized Practice Set', allItems = [], options = {}) {
  const examSet = buildExamSet(allItems, { ...options, randomize: true, shuffleChoices: false });
  const itemIds = examSet.map((it) => it.originalBankId || it.id);

  return {
    id: `PKG-RND-${Date.now().toString(36).toUpperCase()}`,
    name,
    description: `Assembled randomized test package containing ${itemIds.length} items drawn from question bank.`,
    itemIds,
    createdAt: new Date().toISOString()
  };
}

/**
 * Returns statistics comparing current bank inventory against standard quotas
 */
export function getQuestionBankStats(allItems = []) {
  const counts = {};
  allItems.forEach((it) => {
    counts[it.taskType] = (counts[it.taskType] || 0) + 1;
  });

  const stats = [];
  Object.keys(OFFICIAL_ITEM_QUOTAS).forEach((type) => {
    const available = counts[type] || 0;
    const quota = OFFICIAL_ITEM_QUOTAS[type];
    stats.push({
      taskType: type,
      available,
      quota,
      ratio: (available / quota).toFixed(1) + 'x'
    });
  });

  return {
    totalItems: allItems.length,
    counts,
    quotas: OFFICIAL_ITEM_QUOTAS,
    stats
  };
}
