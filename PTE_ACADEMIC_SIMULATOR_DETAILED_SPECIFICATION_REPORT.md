# PTE Academic Classroom Simulator & Teacher Command Center
## Comprehensive System Specification, Task Catalog, Timing Mechanics & Test Engine Audit Report
### Aligned with Official Post-August 7, 2025 Pearson PTE Academic™ Score Guide & Google Sheets Manual Scoring System

**Date of Report:** November 12, 2026  
**Application Directory:** `/Users/ezrajosephsaracho/.gemini/antigravity/scratch/pte-academic-simulator/`  
**Current Codebase Version:** v2.1 Official Rubric Update (Full-Stack Express + React + Vite)  
**Target Reference:** Official Post-August 7, 2025 Pearson PTE Academic™ Score Guide & Google Sheets Manual Scoring Bridge (`'PTE_Live_Sync'!A:AV`)

---

## Executive Summary & System Architecture

The **PTE Academic Classroom Simulator** is a production-grade examination, administration, and evaluation platform designed to mirror the post-August 7, 2025 Pearson PTE Academic computer-delivered testing environment. The simulator provides:

1. **Student Exam Terminal (`/student`)**: Authentic Pearson VUE testing UI with real-time audio waveform capture via Web Audio API, strict preparation and recording countdowns, single-play audio listeners with trailing tone beeps, one-way forward navigation with unattempted item confirmation modals, strict sentence and word-count validators, state recovery checkpoints, and full-screen enforcement.
2. **Teacher Command Center (`/teacher`)**: Comprehensive administrative suite featuring:
   - **Classroom Grading Station (`GradingStation.jsx`)**: High-precision manual grading interface with half-point steppers, official trait dropdowns, dual-speed audio playback, speech-to-text transcript verification, and one-click AI evaluation powered by official post-August 2025 Pearson rubrics (supporting OpenAI GPT-4o, Google Gemini, Anthropic Claude, xAI Grok, DeepSeek, local Ollama / LM Studio, and offline heuristic fallbacks).
   - **Question Bank Manager**: Master repository containing **186 validated items** across all 23 task types with image and audio attachment capabilities.
   - **Exam Blueprint Studio**: Dynamic exam builder supporting standard test packages (Full Mocks, Speaking/Reading/Listening section tests) and custom interaction archetypes.
   - **Google Sheets Manual Scoring Bridge (`GoogleSheetBridge.jsx`)**: Real-time two-way synchronization into an exact **48-column Google Sheets schema** (`'PTE_Live_Sync'!A:AV`), featuring automatic validation, offline queueing, webhook integration, service account push, and one-click TSV clipboard export.

---

## Complete Catalog of Exam Task Types (23 Task Types)

The simulator supports all **23 Pearson PTE Academic task types**, including the modern **Summarize Group Discussion (SGD)** and **Respond to a Situation (RTS)** tasks, updated strictly to post-August 7, 2025 Pearson scoring standards.

### Summary Matrix of All 23 Task Types

| # | Code | Task Name | Part | Skills Tested (Score Guide) | Input / Interaction Archetype | Standard Quota | Item Max Pts | Task Max Pts |
|---|------|-----------|------|-----------------------------|-------------------------------|----------------|--------------|--------------|
| 1 | **PI** | Personal Introduction | Part 1 | Speaking (Unscored) | Spoken Response (Mic + Timer) | 1 item | 0 | 0 |
| 2 | **RA** | Read Aloud | Part 1 | **Speaking** | Spoken Response (Mic + Timer) | 6 items | 15 | 90 |
| 3 | **RS** | Repeat Sentence | Part 1 | Speaking, Listening | Spoken Response (Audio + Mic) | 10 items | 13 | 130 |
| 4 | **DI** | Describe Image | Part 1 | Speaking | Spoken Response (Image + Mic) | 6 items | 16 | 96 |
| 5 | **RL** | Retell Lecture | Part 1 | Speaking, Listening | Spoken Response (Audio + Mic) | 2 items | 16 | 32 |
| 6 | **SGD** | Summarize Group Discussion | Part 1 | Speaking, Listening | Spoken Response (Multi-speaker Audio + Mic) | 2 items | 16 | 32 |
| 7 | **RTS** | Respond to a Situation | Part 1 | Speaking | Spoken Response (Audio Scenario + Mic) | 2 items | 16 | 32 |
| 8 | **ASQ** | Answer Short Question | Part 1 | **Listening** | Spoken Response (Audio Question + Mic) | 5 items | 1 | 5 |
| 9 | **SWT** | Summarize Written Text | Part 1 | Writing, Reading | Timed Single-Sentence Textbox | 2 items | 9 | 18 |
| 10 | **WE** | Write Essay | Part 1 | Writing | Timed Extended Textbox (200–300 words) | 1 item | 26 | 26 |
| 11 | **FIB-RW** | Reading & Writing: Fill in Blanks | Part 2 | Reading, Writing | Inline Dropdown Select in Context | 5 items (25 blanks) | 1 / blank | 25 |
| 12 | **MCMA-R** | Multiple Choice, Multiple Answers (Reading) | Part 2 | Reading | Checkbox Multi-Select (Negative Marking) | 2 items (5 correct) | 1 / correct | 5 |
| 13 | **RO-R** | Reorder Paragraphs | Part 2 | Reading | Draggable Sequence Order (Adjacent Pairs) | 2 items (8 pairs) | 1 / pair | 8 |
| 14 | **FIB-R** | Reading: Fill in Blanks | Part 2 | Reading | Drag & Drop Word Pool | 4 items (17 blanks) | 1 / blank | 17 |
| 15 | **MCSA-R** | Multiple Choice, Single Answer (Reading) | Part 2 | Reading | Radio Single-Select | 2 items | 1 | 2 |
| 16 | **SST** | Summarize Spoken Text | Part 3 | Listening, Writing | Timed Audio + Summary Box (50–70 words) | 1 item | 12 | 12 |
| 17 | **MCMA-L** | Multiple Choice, Multiple Answers (Listening) | Part 3 | Listening | Single-Play Audio + Multi-Select Checkbox | 2 items (5 correct) | 1 / correct | 5 |
| 18 | **FIB-L** | Fill in the Blanks (Listening) | Part 3 | Listening, Writing | Single-Play Audio + In-text Typing | 2 items (10 blanks) | 1 / blank | 10 |
| 19 | **HCS** | Highlight Correct Summary | Part 3 | Listening, Reading | Single-Play Audio + Radio Single-Select | 2 items | 1 | 2 |
| 20 | **MCSA-L** | Multiple Choice, Single Answer (Listening) | Part 3 | Listening | Single-Play Audio + Radio Single-Select | 2 items | 1 | 2 |
| 21 | **SMW** | Select Missing Word | Part 3 | Listening | Single-Play Audio with Trailing Beep + Radio | 2 items | 1 | 2 |
| 22 | **HIW** | Highlight Incorrect Words | Part 3 | Listening, Reading | Single-Play Audio + Clickable Words in Passage | 2 items (10 words) | 1 / word | 10 |
| 23 | **WFD** | Write from Dictation | Part 3 | Listening, Writing | Single-Play Audio + Sequence-Aligned Textbox | 3 items (31 words) | 1 / word | 31 |

* **Total Items in Full Official Exam:** **68 items** (including PI-01).  
* **Total Question Bank Capacity:** **186 validated items**.  
* **Target Exam Maximum Score:** **592 Points** (Part 1 = 461, Part 2 = 57, Part 3 = 74).  
* **Communicative Sub-Skill Composite Score:** **736 Points** (Speaking = 412, Writing = 122, Reading = 77, Listening = 125).

---

## Communicative Sub-Skill & Cross-Attribution Architecture

In accordance with the post-August 7, 2025 Pearson PTE Academic Score Guide:
1. **Read Aloud (RA) Contributes to Speaking Only:** Per official scoring updates, RA contributes 100% of its score to Speaking (0 cross-skill Reading points).
2. **Answer Short Question (ASQ) Contributes to Listening Only:** ASQ contributes 100% of its score to Listening (0 Speaking points).
3. **Productive vs. Receptive Breakdown Rule:**
   - On productive integrated tasks (DI, RTS, WE), full trait scores go to the primary productive skill.
   - On receptive-to-productive integrated tasks (RL, SGD, SWT, SST), content points cross-contribute to the source receptive skill, while full trait totals contribute to the productive skill.

### Composite Score Attribution Table (Total Max = 736 Points)

| Communicative Sub-Skill | Max Points | Item Contribution Breakdown |
|:---|:---:|:---|
| **Speaking** | **412** | **RA** (90) + **RS** (130) + **DI** (96) + **RL** (32) + **SGD** (32) + **RTS** (32) |
| **Writing** | **122** | **SWT** (18) + **WE** (26) + **FIB-RW** (25) + **SST** (12) + **FIB-L** (10) + **WFD** (31) |
| **Reading** | **77** | **SWT Content Only** (8) + **FIB-RW** (25) + **MCMA-R** (5) + **RO-R** (8) + **FIB-R** (17) + **MCSA-R** (2) + **HCS** (2) + **HIW** (10) |
| **Listening** | **125** | **RS Content Only** (30) + **RL Content Only** (12) + **SGD Content Only** (12) + **ASQ** (5) + **SST Content Only** (4) + **MCMA-L** (5) + **FIB-L** (10) + **HCS** (2) + **MCSA-L** (2) + **SMW** (2) + **HIW** (10) + **WFD** (31) |
| **Composite Total** | **736** | **Speaking (412) + Writing (122) + Reading (77) + Listening (125) = 736** |

---

## Direct Exam Section Point Architecture (Target Exam Max = 592 Points)

The direct point sum across the three test sections strictly equals **592 Points**:

```
Part 1 (Speaking & Writing) : 461 Points
Part 2 (Reading)            :  57 Points
Part 3 (Listening)          :  74 Points
---------------------------------------
Total Direct Exam Points    : 592 Points
```

### Detailed Section Totals

#### Part 1: Speaking & Writing (461 Points)
* **RA (6 items × 15 pts):** 90 pts
* **RS (10 items × 13 pts):** 130 pts
* **DI (6 items × 16 pts):** 96 pts
* **RL (2 items × 16 pts):** 32 pts
* **SGD (2 items × 16 pts):** 32 pts
* **RTS (2 items × 16 pts):** 32 pts
* **ASQ (5 items × 1 pt):** 5 pts
* **SWT (2 items × 9 pts):** 18 pts
* **WE (1 item × 26 pts):** 26 pts
* *Part 1 Subtotal:* **461 pts**

#### Part 2: Reading (57 Points)
* **FIB-RW (5 items, 25 total blanks):** 25 pts
* **MCMA-R (2 items, 5 total correct options):** 5 pts
* **RO-R (2 items, 8 total adjacent pairs):** 8 pts
* **FIB-R (4 items, 17 total blanks):** 17 pts
* **MCSA-R (2 items × 1 pt):** 2 pts
* *Part 2 Subtotal:* **57 pts**

#### Part 3: Listening (74 Points)
* **SST (1 item × 12 pts):** 12 pts
* **MCMA-L (2 items, 5 total correct options):** 5 pts
* **FIB-L (2 items, 10 total blanks):** 10 pts
* **HCS (2 items × 1 pt):** 2 pts
* **MCSA-L (2 items × 1 pt):** 2 pts
* **SMW (2 items × 1 pt):** 2 pts
* **HIW (2 items, 10 total target words):** 10 pts
* **WFD (3 items, 31 total target words):** 31 pts
* *Part 3 Subtotal:* **74 pts**

---

## Detailed Task Specifications, Timing, and Audio Rules

### Part 1: Speaking & Writing

* **Overall Section Allocation:** 76–84 minutes (default reference timer: **80:00 minutes**).
* **Timer Strategy:** **Per-Item Countdown + Dedicated Writing Item Timers**.
* **Pre-Exam Equipment Check:** Interactive headset speaker verification and microphone recording test with live waveform feedback.
* **Microphone Mechanics (`AudioRecorderWidget`):**
  - **Preparation Countdown:** "Beginning in XX seconds...".
  - **Tone Rule:** When prep countdown reaches 0, an authentic 800Hz / 920Hz audio tone sounds to open the microphone, **EXCEPT on RS (Repeat Sentence) and ASQ (Answer Short Question)** where the microphone opens immediately without a beep.
  - **Live Visualizer:** Displays real-time audio input level via Web Audio API `AnalyserNode` with decibel tracking.
  - **3-Second Silence Cutoff Rule:** If candidate does not speak for 3 consecutive seconds after recording begins, the microphone automatically shuts off, recording stops, and status updates to `"Completed (Mic closed due to >3s silence)"`.
  - **Recording Storage:** Streams recordings via multipart upload to `/api/upload-recording` and saves to `server/storage/recordings/{CandidateID}_{ItemID}.webm` (or `.mp4`/`.wav`).

#### Task 1: Personal Introduction (PI)
- **Item ID:** `PI-01`
- **Scored:** No (Profile reference only; sent to institutions).
- **Preparation Time:** 25 seconds.
- **Recording Time:** 30 seconds.
- **Prompt:** Personal, educational, and professional background statement.

#### Task 2: Read Aloud (RA)
- **Standard Quota:** 6 items (`RA-01` to `RA-06`).
- **Preparation Time:** 35 seconds.
- **Recording Time:** 40 seconds.
- **Prompt:** Academic text passage (up to 60 words).
- **Scoring Traits:** Content (0–5), Oral Fluency (0–5), Pronunciation (0–5). Max: **15 points**.
- **Skill Contribution:** **Speaking only** (0 Reading cross-points).
- **Knockout Rule:** If Content = 0, Fluency and Pronunciation are knocked out to 0 (itemTotal = 0).

#### Task 3: Repeat Sentence (RS)
- **Standard Quota:** 10 items (`RS-01` to `RS-10`).
- **Audio Prompt Length:** 3–9 seconds (single play).
- **Preparation Time:** 0 seconds (mic opens immediately after audio ends).
- **Beep:** **NO beep** (Pearson rule).
- **Recording Time:** 15 seconds.
- **Scoring Traits:** Content (0–3), Oral Fluency (0–5), Pronunciation (0–5). Max: **13 points**.
  - Content 3: 100% of words in correct sequence.
  - Content 2: At least 50% of words in sequence.
  - Content 1: Less than 50% of words.
  - Content 0: Almost no words or off-topic.
- **Skill Contribution:** Total item score (0–13) to Speaking; Content score only (0–3) to Listening.
- **Knockout Rule:** If Content = 0, Fluency and Pronunciation are knocked out to 0 (itemTotal = 0).

#### Task 4: Describe Image (DI)
- **Standard Quota:** 6 items (`DI-01` to `DI-06`).
- **Media:** Charts, bar graphs, line graphs, maps, Venn diagrams, flowcharts, or process SVGs.
- **Preparation Time:** 25 seconds.
- **Recording Time:** 40 seconds.
- **Scoring Traits:** Content (0–6), Oral Fluency (0–5), Pronunciation (0–5). Max: **16 points** (was 15).
- **Skill Contribution:** Speaking only.
- **Knockout Rule:** If Content = 0, Fluency and Pronunciation are knocked out to 0 (itemTotal = 0).

#### Task 5: Retell Lecture (RL)
- **Standard Quota:** 2 items (`RL-01` to `RL-02`).
- **Media:** 60–90 second lecture audio prompt + relevant background image.
- **Preparation Time:** 10 seconds.
- **Recording Time:** 40 seconds.
- **Scoring Traits:** Content (0–6), Oral Fluency (0–5), Pronunciation (0–5). Max: **16 points** (was 15).
- **Skill Contribution:** Total item score (0–16) to Speaking; Content score only (0–6) to Listening.
- **Knockout Rule:** If Content = 0, Fluency and Pronunciation are knocked out to 0 (itemTotal = 0).

#### Task 6: Summarize Group Discussion (SGD)
- **Standard Quota:** 2 items (`SGD-01` to `SGD-02`).
- **Media:** 60–180 second multi-speaker discussion audio between academic participants.
- **Preparation Time:** 10 seconds.
- **Recording Time:** 120 seconds (2 minutes).
- **Scoring Traits:** Content (0–6), Oral Fluency (0–5), Pronunciation (0–5). Max: **16 points** (was 15).
- **Skill Contribution:** Total item score (0–16) to Speaking; Content score only (0–6) to Listening.
- **Knockout Rule:** If Content = 0, Fluency and Pronunciation are knocked out to 0 (itemTotal = 0).

#### Task 7: Respond to a Situation (RTS)
- **Standard Quota:** 2 items (`RTS-01` to `RTS-02`).
- **Media:** Written campus/academic prompt + accompanying audio narration.
- **Preparation Time:** **10 seconds** (official PTE Academic standard; 20 seconds is PTE Core only).
- **Recording Time:** 40 seconds.
- **Scoring Traits:** Appropriateness/Content (0–6), Oral Fluency (0–5), Pronunciation (0–5). Max: **16 points** (was 15).
- **Skill Contribution:** Speaking only.
- **Knockout Rule:** If Content = 0, Fluency and Pronunciation are knocked out to 0 (itemTotal = 0).

#### Task 8: Answer Short Question (ASQ)
- **Standard Quota:** 5 items (`ASQ-01` to `ASQ-05`).
- **Audio Prompt Length:** 3–9 seconds.
- **Preparation Time:** 0 seconds (mic opens immediately).
- **Beep:** **NO beep** (Pearson rule).
- **Recording Time:** 10 seconds.
- **Scoring:** 1 point for correct word/phrase match, 0 for incorrect. Max: **1 point**.
- **Skill Contribution:** **Listening only** (0 Speaking points; 100% of score goes to Listening_Raw_Points).

#### Task 9: Summarize Written Text (SWT)
- **Standard Quota:** 2 items (`SWT-01` to `SWT-02`).
- **Passage Length:** Up to 300 words.
- **Dedicated Item Timer:** **10:00 minutes** per question (independent countdown; auto-advances at 0:00).
- **Form Constraint:** **Strictly ONE single sentence** between **5 and 75 words**.
- **Real-Time UI Telemetry:** Word counter and sentence boundary detector.
- **Scoring Traits:** Content (0–4), Form (0–1), Grammar (0–2), Vocabulary (0–2). Max: **9 points** (was 7).
- **Skill Contribution:** Total item score (0–9) to Writing; Content score only (0–4) to Reading.
- **Hard Zero-Point Knockout Rule:**
  $$\text{if } (\text{form} == 0 \parallel \text{content} == 0) \implies \text{itemTotal} = 0 \text{ (all sub-traits and Reading cross-points set to 0)}$$

#### Task 10: Write Essay (WE) — Official 26-Point Rubric
- **Standard Quota:** 1 item (`WE-01`).
- **Dedicated Item Timer:** **20:00 minutes** per question (auto-advances at 0:00).
- **Word Count Target:** **200–300 words**.
  - 200–300 words = Form 2.
  - 120–199 or 301–380 words = Form 1.
  - Below 120 or above 380 words = Form 0 (Knockout).
- **Built-in Editor Features:** Cut, Copy, Paste clipboard tools, real-time word counter, auto-save buffer.
- **Scoring Traits (26-Point Scale):**
  - **Content:** 0–6
  - **Form:** 0–2
  - **Development, Structure & Coherence:** 0–6
  - **General Linguistic Range:** 0–6
  - **Grammar:** 0–2
  - **Vocabulary:** 0–2
  - **Spelling:** 0–2
  - **Total Item Max:** **26 points** (updated from legacy 15-point scale).
- **Skill Contribution:** Writing only (26 points).
- **Hard Zero-Point Knockout Rule:**
  $$\text{if } (\text{form} == 0 \parallel \text{content} == 0) \implies \text{itemTotal} = 0 \text{ (no partial points allowed; all sub-traits set to 0)}$$

---

### Part 2: Reading

* **Overall Section Allocation:** 23–30 minutes (default: **27:00 minutes** = 1620 seconds).
* **Timer Strategy:** **Cumulative Section Timer**. A single shared clock counts down for all Part 2 items. Candidates manage their own time across items.
* **Navigation:** One-way forward navigation with unattempted item warning modal.

#### Task 11: Reading & Writing: Fill in the Blanks (FIB-RW)
- **Standard Quota:** 5 items (`FIB-RW-01` to `FIB-RW-05`). Total blanks across test: **25 blanks**.
- **Interaction:** Inline dropdown selection menus inside paragraph text.
- **Scoring:** **+1 point** per correct dropdown selection. Max: **25 points**.
- **Skill Contribution:** Direct double-credit: 25 points to Reading, 25 points to Writing.

#### Task 12: Multiple Choice, Multiple Answers - Reading (MCMA-R)
- **Standard Quota:** 2 items (`MCMA-R-01` to `MCMA-R-02`). Total correct options: **5 options**.
- **Interaction:** Multi-select checkboxes.
- **Scoring Rules (Negative Marking):**
  - **+1 point** for each correct option selected.
  - **-1 point** for each incorrect option selected.
  - **Score Floor:** Minimum score is **0** (score cannot go negative).
- **Skill Contribution:** Reading only.

#### Task 13: Reorder Paragraphs (RO-R)
- **Standard Quota:** 2 items (`RO-R-01` to `RO-R-02`). Total adjacent pairs: **8 pairs**.
- **Interaction:** 4–5 shuffled text boxes. Candidates reorder paragraphs by dragging or clicking Up/Down buttons into the target order list.
- **Scoring Rule (Adjacent Pairs Algorithm):**
  - Evaluates consecutive pairs in the student's order (`Sentence[i]` followed by `Sentence[i+1]`).
  - **+1 point** for each adjacent pair matching the correct sequence. Max: **8 points**.
- **Skill Contribution:** Reading only.

#### Task 14: Reading: Fill in the Blanks (FIB-R)
- **Standard Quota:** 4 items (`FIB-R-01` to `FIB-R-04`). Total blanks: **17 blanks**.
- **Interaction:** Drag-and-drop word chips from an open word pool (including distractors) into text blanks.
- **Scoring:** **+1 point** for each correctly placed word. Max: **17 points**.
- **Skill Contribution:** Reading only.

#### Task 15: Multiple Choice, Single Answer - Reading (MCSA-R)
- **Standard Quota:** 2 items (`MCSA-R-01` to `MCSA-R-02`).
- **Interaction:** Radio button single-select.
- **Scoring:** **1 point** for correct, **0** for incorrect. Max: **2 points**.
- **Skill Contribution:** Reading only.

---

### Part 3: Listening

* **Overall Section Allocation:** 31–39 minutes (default: **35:00 minutes**).
* **Timer Strategy:** **Hybrid Architecture**:
  1. **Summarize Spoken Text (SST):** Dedicated **10:00 minute** timer per item.
  2. **Remaining Listening Items (Tasks 17–23):** Governed by a **shared cumulative timer of 25:00 minutes**.
* **Audio Playback Rules:**
  - **Pre-listening Countdown:** 7 seconds before audio starts.
  - **Single Play Only:** Recordings play once only. No pause, rewind, or replay buttons in testing mode.
  - **SMW Trailing Beep:** Replaces the final words of the lecture with an 800Hz/920Hz terminal beep tone.

#### Task 16: Summarize Spoken Text (SST)
- **Standard Quota:** 1 item (`SST-01`).
- **Audio Length:** 60–90 second lecture.
- **Dedicated Timer:** **10:00 minutes** (runs during audio and writing).
- **Word Count Target:** **50–70 words**.
  - 50–70 words = Form 2.
  - 40–49 or 71–100 words = Form 1.
  - Below 40 or above 100 words = Form 0 (Knockout).
- **Scoring Traits:** Content (0–4), Form (0–2), Grammar (0–2), Vocabulary (0–2), Spelling (0–2). Max: **12 points** (was 10).
- **Skill Contribution:** Total item score (0–12) to Writing; Content score only (0–4) to Listening.
- **Hard Zero-Point Knockout Rule:**
  $$\text{if } (\text{form} == 0 \parallel \text{content} == 0) \implies \text{itemTotal} = 0 \text{ (all sub-traits and Listening cross-points set to 0)}$$

#### Task 17: Multiple Choice, Multiple Answers - Listening (MCMA-L)
- **Standard Quota:** 2 items (`MCMA-L-01` to `MCMA-L-02`). Total correct options: **5 options**.
- **Audio:** 40–90 seconds.
- **Interaction:** Multi-select checkboxes.
- **Scoring Rules (Negative Marking):**
  - **+1 point** for each correct option selected.
  - **-1 point** for each incorrect option selected.
  - **Score Floor:** Minimum score is **0**. Max: **5 points**.
- **Skill Contribution:** Listening only.

#### Task 18: Fill in the Blanks - Listening (FIB-L)
- **Standard Quota:** 2 items (`FIB-L-01` to `FIB-L-02`). Total blanks: **10 blanks**.
- **Audio:** 30–60 seconds.
- **Interaction:** Transcript displayed with missing words as text input fields. Candidates type words while listening.
- **Scoring Rules:**
  - **+1 point** per correctly spelled word. Max: **10 points**.
  - Includes Pearson UK/US spelling normalization (e.g., `colour` = `color`, `analyse` = `analyze`, `programme` = `program`).
- **Skill Contribution:** 10 points to Listening, 10 points to Writing.

#### Task 19: Highlight Correct Summary (HCS)
- **Standard Quota:** 2 items (`HCS-01` to `HCS-02`).
- **Audio:** 30–90 seconds.
- **Interaction:** Radio selection among 4 summary paragraphs.
- **Scoring:** **1 point** for correct summary, **0** for incorrect. Max: **2 points**.
- **Skill Contribution:** 2 points to Listening, 2 points to Reading.

#### Task 20: Multiple Choice, Single Answer - Listening (MCSA-L)
- **Standard Quota:** 2 items (`MCSA-L-01` to `MCSA-L-02`).
- **Audio:** 30–60 seconds.
- **Interaction:** Radio button single-select.
- **Scoring:** **1 point** for correct, **0** for incorrect. Max: **2 points**.
- **Skill Contribution:** Listening only.

#### Task 21: Select Missing Word (SMW)
- **Standard Quota:** 2 items (`SMW-01` to `SMW-02`).
- **Audio:** 20–70 seconds. Final keyword or phrase is replaced with a synthesized audio beep.
- **Interaction:** Radio button selection to complete the sentence.
- **Scoring:** **1 point** for correct, **0** for incorrect. Max: **2 points**.
- **Skill Contribution:** Listening only.

#### Task 22: Highlight Incorrect Words (HIW)
- **Standard Quota:** 2 items (`HIW-01` to `HIW-02`). Total target words: **10 words**.
- **Audio:** 15–50 seconds.
- **Interaction:** Full transcript displayed. Candidate clicks on words that differ between audio and text (words highlight in yellow). Clicking again toggles off.
- **Scoring Rules (Negative Marking):**
  - **+1 point** for each correctly identified incorrect word.
  - **-1 point** for each normal word clicked by mistake.
  - **Score Floor:** Minimum score is **0**. Max: **10 points**.
- **Skill Contribution:** 10 points to Listening, 10 points to Reading.

#### Task 23: Write from Dictation (WFD) — Sequence-Aligned Grader
- **Standard Quota:** 3 items (`WFD-01` to `WFD-03`). Total target words across 3 items: **31 words**.
- **Audio:** 3–9 seconds (single spoken sentence).
- **Interaction:** Text input box.
- **Order-Dependent Sequence Alignment Algorithm:**
  - Evaluates typed candidate words against reference sentence words using **Longest Common Subsequence (LCS)** dynamic programming.
  - Words must be spelled accurately **and in the correct relative sequence** to earn +1 point each.
  - Normalizes terminal punctuation, casing, and accepted Pearson UK/US spelling variants (e.g., `theatre`/`theater`, `defence`/`defense`).
  - Max: **31 points**.
- **Skill Contribution:** 31 points to Listening, 31 points to Writing.

---

## Scoring Architecture & Google Sheets Schema

### 1. Deterministic Auto-Scoring Engine (`src/utils/autoScoring.js`)
All objective tasks in Part 2 (Reading) and Part 3 (Listening) are scored deterministically:
* `scoreFibRw`: Direct key-value match against blanks (+1 per correct).
* `scoreMcma`: Evaluates multi-select arrays, deducting 1 for false positives, with a hard floor of 0.
* `scoreRo`: Evaluates array order against adjacent pairs model ($N-1$ points maximum).
* `scoreFibR`: Compares assigned blanks against answer key (+1 per correct).
* `scoreMcsa` & `scoreHcs` & `scoreSmw`: Single correct selection match (+1 per correct).
* `scoreHiw`: Clicked word index comparison with negative penalty and floor of 0.
* `scoreWfd`: **Dynamic Programming LCS sequence alignment** enforcing strict word order matching.

### 2. Manual & AI Scoring Rubrics (`src/components/TeacherPortal/GradingStation.jsx`)
Subjective tasks (Part 1 Speaking & Writing + SST) are graded via teacher inputs or AI raters using the official post-August 7, 2025 Pearson rubric traits:

| Trait ID | Trait Label | Applicable Tasks | Score Range | Stepper Increments | Notes |
|:---|:---|:---|:---:|:---:|:---|
| `content` | Content / Ideas | RA, RS, DI, RL, SGD, RTS, ASQ, SWT, WE, SST | **0–6** (DI/RL/SGD/RTS/WE)<br>**0–5** (RA)<br>**0–4** (SWT/SST)<br>**0–3** (RS)<br>**0–1** (ASQ) | 1.0 increments | Primary communicative driver. Knockout trigger if 0. |
| `fluency` | Oral Fluency | RA, RS, DI, RL, SGD, RTS | 0.0–5.0 | 0.5 increments | Pacing, phrasing, rhythm, hesitation suppression. |
| `pronunciation` | Pronunciation | RA, RS, DI, RL, SGD, RTS | 0.0–5.0 | 0.5 increments | Phoneme clarity, stress patterns, intelligibility. |
| `form` | Form / Word Count | SWT, WE, SST | **0–2** (WE/SST)<br>**0–1** (SWT) | 1.0 increments | Word count boundaries & single-sentence constraints. Knockout trigger if 0. |
| `grammar` | Grammar | SWT, WE, SST | 0–2 | 1.0 increments | Syntactic structure and grammatical accuracy. |
| `vocabulary` | Vocabulary | SWT, WE, SST | 0–2 | 1.0 increments | Academic vocabulary range and lexical precision. |
| `spelling` | Spelling | WE, SST | 0–2 | 1.0 increments | Consistent orthographic convention (US or UK). |
| `development` | Development, Structure & Coherence | WE | **0–6** | 1.0 increments | Logical progression, paragraph organization, transition signposting. |
| `linguistic` | General Linguistic Range | WE | **0–6** | 1.0 increments | Complex clause structures and syntactic variety. |

### 3. The Official Zero-Point Knockout Rule
The simulator enforces strict zero-point knockout logic across both manual and automated scoring paths:
* **Speaking Knockout Formula (RA, RS, DI, RL, SGD, RTS):**
  $$\text{if } (\text{content} == 0) \implies \text{fluency} = 0, \;\text{pronunciation} = 0, \;\text{itemTotal} = 0$$
  This increments the `Part1_Zero_Knockouts` audit counter in the Google Sheet payload.
* **Writing Knockout Formula (SWT, WE, SST):**
  $$\text{if } (\text{form} == 0 \parallel \text{content} == 0) \implies \text{itemTotal} = 0 \text{ (zeroes all sub-traits and cross-skill points)}$$
  No partial credit is awarded on Write Essay when word count is outside 120–380 words ($\text{form} = 0$) or when off-topic ($\text{content} = 0$).

### 4. 48-Column Database Schema (Columns A through AV)
The app outputs a normalized **48-column record** aligned with Google Sheets. Target Sheet Tab: `'PTE_Live_Sync'!A:AV`.

```
Col A  (0)  : Timestamp                       Col Y  (24) : Part1_Points_Awarded
Col B  (1)  : Session_Code                    Col Z  (25) : Part1_Max_Available (461)
Col C  (2)  : Sync_Source                     Col AA (26) : Part1_Section_Pct
Col D  (3)  : Grading_Status                  Col AB (27) : Part1_Zero_Knockouts
Col E  (4)  : Candidate_ID                    Col AC (28) : Part2_Points_Awarded
Col F  (5)  : Candidate_Name                  Col AD (29) : Part2_Max_Available (57)
Col G  (6)  : Test_Date                       Col AE (30) : Part2_Section_Pct
Col H  (7)  : Lead_Evaluator                  Col AF (31) : Part2_Negative_Floors
Col I  (8)  : Target_Score                    Col AG (32) : Part3_Points_Awarded
Col J  (9)  : Overall_PTE_Score (10-90)       Col AH (33) : Part3_Max_Available (74)
Col K  (10) : Concordant_IELTS_Band (4.0-9.0) Col AI (34) : Part3_Section_Pct
Col L  (11) : CEFR_Level (A2-C2)              Col AJ (35) : Part3_Floors_Applied
Col M  (12) : Performance_Classification      Col AK (36) : P1_T1_Read_Aloud (Max 90)
Col N  (13) : Overall_Exam_Mastery_Pct        Col AL (37) : P1_T2_Repeat_Sentence (Max 130)
Col O  (14) : Total_Points_Earned (Strict)    Col AM (38) : P1_T3_Describe_Image (Max 96)
Col P  (15) : Total_Max_Points (592)          Col AN (39) : P1_T4_Retell_Lecture (Max 32)
Col Q  (16) : Speaking_PTE_Score (10-90)      Col AO (40) : P1_T5_Summarize_Discussion (Max 32)
Col R  (17) : Speaking_Raw_Points (Max 412)   Col AP (41) : P1_T6_Respond_Situation (Max 32)
Col S  (18) : Writing_PTE_Score (10-90)       Col AQ (42) : P1_T7_Answer_Short_Question (Max 5)
Col T  (19) : Writing_Raw_Points (Max 122)    Col AR (43) : P1_T8_Summarize_Written_Text (Max 18)
Col U  (20) : Reading_PTE_Score (10-90)       Col AS (44) : P1_T9_Write_Essay (Max 26)
Col V  (21) : Reading_Raw_Points (Max 77)     Col AT (45) : P2_Reading_Total_Points (Max 57)
Col W  (22) : Listening_PTE_Score (10-90)     Col AU (46) : P3_Listening_Total_Points (Max 74)
Col X  (23) : Listening_Raw_Points (Max 125)  Col AV (47) : Validation_Status_All_Verified
```

* **Column O Equality Invariant:**  
  $$\text{Col O (Total\_Points\_Earned)} \equiv \text{Col Y (Part1)} + \text{Col AC (Part2)} + \text{Col AG (Part3)}$$
* **Column AV Verification String:**  
  Always outputs strictly `"All 22 Tasks Verified (Parts 1–3)"` once validation passes.

---

## AI Rater System Prompts & LLM Integration

The grading server (`server.js`) interfaces with OpenAI (GPT-4o), Google Gemini (Gemini 2.5 Flash / Pro), Anthropic Claude (Claude 3.5 Sonnet), xAI Grok (grok-2), DeepSeek (deepseek-chat), and offline local Ollama instances using this system prompt:

```text
You are an expert Pearson PTE Academic Automated Scoring Engine Examiner.
Your role is to evaluate student speech transcripts and written essays according to the official post-August 7, 2025 Pearson PTE Academic Score Guide rubrics.

Rules:
1. Speaking Tasks:
   - DI, RL, SGD, RTS:
     * Content: Rate 0 to 6 (0 if empty or completely off-topic; max 6).
     * Oral Fluency: Rate 0.0 to 5.0 (0.5 increments). Rate rhythm, phrasing, lack of unnatural pauses.
     * Pronunciation: Rate 0.0 to 5.0 (0.5 increments). Rate clarity of vowels, consonants, stress.
     * Item Max: 16 points.
   - Read Aloud (RA):
     * Content: Rate 0 to 5 (word accuracy).
     * Oral Fluency: Rate 0.0 to 5.0 (0.5 increments).
     * Pronunciation: Rate 0.0 to 5.0 (0.5 increments).
     * Item Max: 15 points.
   - Repeat Sentence (RS):
     * Content: Rate 0 to 3 (3 = 100% words in sequence, 2 = 50%+ words, 1 = <50% words, 0 = 0 words).
     * Oral Fluency: Rate 0.0 to 5.0 (0.5 increments).
     * Pronunciation: Rate 0.0 to 5.0 (0.5 increments).
     * Item Max: 13 points.
   - ZERO-POINT KNOCKOUT RULE for Spoken Tasks: If Content = 0, Oral Fluency and Pronunciation MUST be 0 (itemTotal = 0).

2. Summarize Written Text (SWT):
   - Content: Rate 0 to 4 (captures key main points and essential relations).
   - Form: STRICTLY 1 point only if response is EXACTLY ONE single sentence of 5 to 75 words.
   - Grammar: Rate 0 to 2 (grammatical structure and sentence mechanics).
   - Vocabulary: Rate 0 to 2 (appropriate academic diction and lexical choice).
   - Item Max: 9 points.
   - HARD ZERO-POINT KNOCKOUT RULE: If Form = 0 (multiple sentences, <5 words, or >75 words) or Content = 0, the entire item is knocked out to 0 (all sub-traits 0, itemTotal = 0).

3. Write Essay (WE) - 26-Point Scale:
   - Content: Rate 0 to 6 (addresses all parts of topic with persuasive, well-supported arguments).
   - Form: Rate 0 to 2 (200–300 words = 2; 120–199 or 301–380 words = 1; under 120 or over 380 words = 0).
   - Development, Structure & Coherence: Rate 0 to 6 (logical organizational progression, clear paragraphing, cohesive devices).
   - General Linguistic Range: Rate 0 to 6 (syntactic variety, sophisticated complex structures, clear expression of ideas).
   - Grammar: Rate 0 to 2 (grammatical accuracy and control).
   - Vocabulary: Rate 0 to 2 (broad academic lexical resource, precision, collocations).
   - Spelling: Rate 0 to 2 (accurate spelling according to one consistent national standard).
   - Item Max: 26 points.
   - HARD ZERO-POINT KNOCKOUT RULE: If Form = 0 (word count < 120 or > 380) or Content = 0, the entire essay is knocked out to 0 (no partial points allowed, all sub-traits 0, itemTotal = 0).

4. Summarize Spoken Text (SST):
   - Content: Rate 0 to 4 (synthesizes core lecture themes and secondary details).
   - Form: Rate 0 to 2 (50–70 words = 2; 40–49 or 71–100 words = 1; under 40 or over 100 words = 0).
   - Grammar: Rate 0 to 2 (grammatical accuracy).
   - Vocabulary: Rate 0 to 2 (appropriate vocabulary).
   - Spelling: Rate 0 to 2 (accurate spelling).
   - Item Max: 12 points.
   - HARD ZERO-POINT KNOCKOUT RULE: If Form = 0 (word count < 40 or > 100) or Content = 0, the entire summary is knocked out to 0 (all sub-traits 0, itemTotal = 0).

5. Answer Short Question (ASQ):
   - Content: 0 or 1 point (accurate keyword/phrase).
```

---

## Audio Pipeline, Neural TTS, and Speech-to-Text

### 1. Studio Neural Text-to-Speech Engine
- Integrates Microsoft Edge Neural TTS with high-definition voices across 5 regional accents:
  - **British English (UK):** `en-GB-SoniaNeural` (Female BBC RP) & `en-GB-RyanNeural` (Male Oxford Academic).
  - **American English (US):** `en-US-AriaNeural` (Female Expressive) & `en-US-GuyNeural` (Male Broadcaster).
  - **Australian English (AU):** `en-AU-NatashaNeural` (Female ABC) & `en-AU-WilliamNeural` (Male Natural).
  - **Canadian English (CA):** `en-CA-ClaraNeural`.
  - **Indian English (IN):** `en-IN-NeerjaNeural`.
- **Automatic Caching:** Audio files generated via `/api/tts` are cached in `server/storage/tts_cache` as MP3 files to ensure sub-50ms playback and zero latency on repeated tests.
- **Fallback:** Automatic fallback to browser Web Speech API synthesis if the server is offline.

### 2. Candidate Speech Recording & Transcription
- **Microphone Capture:** Uses `navigator.mediaDevices.getUserMedia` with fallback MIME codec negotiation:
  1. `audio/webm;codecs=opus` (Chromium / Firefox)
  2. `audio/mp4;codecs=mp4a.40.2` (Safari / macOS / iOS)
  3. `audio/wav`
- **Low RAM Streaming Upload:** Streams audio blobs via multipart POST to `/api/upload-recording`, saving directly to disk.
- **Dual Speech-to-Text Architecture:**
  - **Live Client-side STT:** Web Speech API provides real-time preliminary speech transcripts.
  - **Server-side STT (`/api/transcribe`):** Dispatches student audio recordings to OpenAI Whisper, local Whisper, or Gemini multimodal audio endpoints for accurate transcript verification during grading.

---

## Exam Blueprint Studio & Customization Capabilities

Through the **Exam Blueprint Studio**, instructors can configure:

1. **Pre-built Exam Packages:**
   - `PKG-FULL-A`: Full Mock Test A (68 items).
   - `PKG-FULL-B`: Full Mock Test B (alternate 68-item draw).
   - `PKG-SPEAKING-DRILL`: Part 1 Speaking Intensive (33 items).
   - `PKG-READING-DRILL`: Part 2 Reading Mastery (15 items).
   - `PKG-LISTENING-DRILL`: Part 3 Listening Intensive (16 items).
2. **Item-Level Timing Overrides:**
   - Preparation countdown seconds (`prepSeconds`).
   - Recording time limit (`recordSeconds`).
   - Dedicated item timer duration (`dedicatedTimerSeconds`).
   - Pre-listening audio countdown seconds (`audioCountdownSeconds`).
   - Minimum and maximum word boundaries (`minWords`, `maxWords`).
3. **Item-Level Scoring Overrides:**
   - Custom scoring modes (`points_per_blank`, `negative_marking`, `adjacent_pairs`, `rubric_ai`).
   - Points per correct answer and penalty per incorrect selection.
   - Negative score floor rules (`scoreFloor`).
   - Custom rubric trait definitions.
4. **Custom Task Type Registry:**
   - Define entirely new task types based on 6 interaction archetypes (`spoken`, `extended_text`, `inline_blanks`, `multiple_choice`, `reorder`, `audio_cloze`).

---

## Full ZIP Export & Submission Packaging

Students or teachers can download a `.zip` archive (`/api/export-exam-zip/:submissionId`) containing:
* `manifest.json`: Full student metadata, session info, timestamps, and item response map.
* `scores.json`: Automatic scores, manual teacher scores, trait breakdowns, and concordance metrics.
* `responses.tsv`: Tab-separated values formatted for direct spreadsheet import.
* `recordings/`: All candidate spoken `.webm` / `.mp4` audio files, named systematically as `{CandidateID}_{ItemID}.webm`.
* `transcripts/`: Live and AI speech-to-text transcripts for every speaking item.

---

## Verification & Compliance Checklist

- [x] **Target Exam Maximum:** Exactly **592 Points** (Part 1 = 461, Part 2 = 57, Part 3 = 74).
- [x] **Communicative Sub-Skill Composite Maximum:** Exactly **736 Points** (Speaking = 412, Writing = 122, Reading = 77, Listening = 125).
- [x] **Read Aloud (RA) Attribution:** 100% Speaking (0 Reading cross-points).
- [x] **Answer Short Question (ASQ) Attribution:** 100% Listening (0 Speaking points).
- [x] **DI, RL, SGD, RTS Trait Scales:** Content 0–6, Fluency 0–5, Pronunciation 0–5 (Max 16 points).
- [x] **Summarize Written Text (SWT) Scale:** Content 0–4, Form 0–1, Grammar 0–2, Vocabulary 0–2 (Max 9 points).
- [x] **Write Essay (WE) Scale:** 26 points total (Content 0–6, Form 0–2, Dev 0–6, Ling 0–6, Grammar 0–2, Vocab 0–2, Spelling 0–2).
- [x] **Summarize Spoken Text (SST) Scale:** Content 0–4, Form 0–2, Grammar 0–2, Vocabulary 0–2, Spelling 0–2 (Max 12 points).
- [x] **Hard Zero-Point Knockouts:** `content === 0` knocks out fluency & pronunciation for speaking; `form === 0 || content === 0` knocks out all traits for SWT, WE, SST.
- [x] **Respond to a Situation (RTS) Timing:** Preparation time set to **10 seconds**.
- [x] **Write from Dictation (WFD) Grading:** Sequence-aligned dynamic programming (LCS) scoring.
- [x] **Google Sheets Sync Validation:** Column O equals Cols Y + AC + AG; Column AV strictly outputs `"All 22 Tasks Verified (Parts 1–3)"`.

---

*Report generated and verified against the codebase at `/Users/ezrajosephsaracho/.gemini/antigravity/scratch/pte-academic-simulator/`.*
