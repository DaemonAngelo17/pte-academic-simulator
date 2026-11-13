# PTE Academic Classroom Simulator & Teacher Portal

A full-stack web application designed for classroom cohorts and instructors that complements manual scoring Google Sheets.

---

## 📁 Project Architecture & Clean Folder Structure

```
pte-academic-simulator/
├── public/
│   └── media/
│       ├── audio/              # Drop-in .mp3/.wav lecture & sentence tracks
│       └── images/             # Drop-in charts, graphs, maps, diagrams
├── server/
│   ├── apiPlugin.js            # Lightweight local backend with file-system persistence
│   └── storage/
│       ├── sessions.json       # Classroom cohort sessions
│       ├── submissions.json    # Student exam submissions & grades
│       └── recordings/         # Student audio recordings
├── src/
│   ├── components/
│   │   ├── StudentExam/        # Authentic Pearson PTE test interface
│   │   │   ├── AudioPlayerWidget.jsx
│   │   │   ├── AudioRecorderWidget.jsx
│   │   │   ├── ItemRenderer.jsx
│   │   │   └── StudentExam.jsx
│   │   └── TeacherPortal/      # Instructor Command Center
│   │       ├── GradingBridge.jsx    # Google Sheet Manual Scoring Bridge
│   │       ├── QuestionManager.jsx  # Question Bank Editor with disk persistence
│   │       ├── SessionManager.jsx   # Multi-Student Classroom Session Manager
│   │       └── TeacherPortal.jsx
│   ├── config/
│   │   └── pteRules.js         # Official Pearson test sections, timers & 22 task rules
│   ├── data/
│   │   └── questionBank.json   # 68 items covering all 22 task types & exact Item IDs
│   ├── App.jsx                 # Dual-portal landing page routing
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎯 Complete Question Bank Item IDs (68 Items)

The question bank in `src/data/questionBank.json` comes fully populated with every Item ID from your manual scoring sheet:

- **Part 1: Speaking & Writing**
  - Personal Introduction: `PI-01`
  - Read Aloud: `RA-01` to `RA-06`
  - Repeat Sentence: `RS-01` to `RS-10`
  - Describe Image: `DI-01` to `DI-06`
  - Retell Lecture: `RL-01` to `RL-02`
  - Summarize Group Discussion: `SGD-01` to `SGD-02`
  - Respond to a Situation: `RTS-01` to `RTS-02`
  - Answer Short Question: `ASQ-01` to `ASQ-05`
  - Summarize Written Text: `SWT-01` to `SWT-02` (Dedicated 10-min item timer)
  - Write Essay: `WE-01` (Dedicated 20-min item timer)

- **Part 2: Reading**
  - Reading & Writing Fill in the Blanks: `FIB-RW-01` to `FIB-RW-05`
  - Multiple Choice Multiple Answers: `MCMA-R-01` to `MCMA-R-02`
  - Reorder Paragraphs: `RO-R-01` to `RO-R-02`
  - Reading Fill in the Blanks (Drag & Drop): `FIB-R-01` to `FIB-R-04`
  - Multiple Choice Single Answer: `MCSA-R-01` to `MCSA-R-02`

- **Part 3: Listening**
  - Summarize Spoken Text: `SST-01` (Dedicated 10-min timer)
  - Multiple Choice Multiple Answers: `MCMA-L-01` to `MCMA-L-02`
  - Fill in the Blanks (Type-In): `FIB-L-01` to `FIB-L-02`
  - Highlight Correct Summary: `HCS-01` to `HCS-02`
  - Multiple Choice Single Answer: `MCSA-L-01` to `MCSA-L-02`
  - Select Missing Word: `SMW-01` to `SMW-02`
  - Highlight Incorrect Words: `HIW-01` to `HIW-02`
  - Write from Dictation: `WFD-01` to `WFD-03`

---

## ⚡ Quick Start & Deployment Options

### Method A: Run Locally via Git (Recommended for Full Studio & Audio Recording Features)

To run the complete full-stack environment with continuous audio recording persistence, neural Microsoft Edge TTS synthesis, and automated disk exports:

```bash
# 1. Clone the repository
git clone https://github.com/DaemonAngelo17/pte-academic-simulator.git
cd pte-academic-simulator

# 2. Run with one click (installs dependencies and starts backend + frontend)
./start.sh

# Or start manually:
npm install
npm run dev
```

- **Frontend Student Exam & Teacher Portal:** `http://localhost:5173`
- **Backend API & File System Storage:** `http://localhost:3001`

### Method B: Deploy to Vercel (Instant Cloud Preview & Exam Terminal)

This repository includes a pre-configured `vercel.json` and `api/index.js` serverless function.

```bash
# Deploy with Vercel CLI
npx vercel

# Or push to GitHub and import the repository directly into your Vercel Dashboard
```
- **Vercel Settings:**
  - Framework Preset: **Vite**
  - Build Command: `vite build` (or default `npm run build`)
  - Output Directory: `dist`
  - All API routes (`/api/*`) are handled serverlessly via `api/index.js`.
  - Client-side exam sessions and grading results automatically fall back to browser `localStorage` if cloud network connectivity drops.

---

## 📊 Manual Scoring Google Sheet Bridge Workflow

1. Students take the exam in the **Student Exam Terminal**. Submissions are saved to disk in `server/storage/submissions.json`.
2. Open the **Teacher Command Center** -> **Manual Scoring Google Sheet Bridge**.
3. Select any candidate submission to review their recorded voice or written answers alongside the official rubric.
4. Input teacher scores for **Content**, **Fluency / Form**, **Pronunciation / Grammar**, and feedback notes.
5. Click **"Copy to Google Sheet (TSV)"** and paste directly (`Cmd+V` or `Ctrl+V`) into your Google Sheet columns!

