import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PTE_TASK_TYPES } from '../../config/pteRules';
import { countWords } from '../../config/pteRules';
import SettingsModal from '../Common/SettingsModal';
import CandidateAnswerInspector from './CandidateAnswerInspector';
import SubmissionFilesVaultModal from './SubmissionFilesVaultModal';
import ManualScoringTransferModal from './ManualScoringTransferModal';
import CandidateReportCardModal from './CandidateReportCardModal';
import {
  computeSubmissionSummary,
  build48ColumnRow,
  getIeltsConcordance,
  calculateItemMetrics,
  PTE_48_HEADERS
} from '../../utils/scoringEngine';
import { autoScoreItem } from '../../utils/autoScoring';
import {
  Users,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  Check,
  Search,
  BookOpen,
  Volume2,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  Save,
  Trash2,
  Sparkles,
  HelpCircle,
  Bot,
  Zap,
  Settings,
  Key,
  Link,
  RefreshCw,
  Edit3,
  FileArchive,
  FolderDown,
  Calculator,
  HardDrive,
  FolderOpen,
  Award,
  TrendingUp,
  FileAudio,
  Printer,
  X
} from 'lucide-react';
import { downloadExamSubmissionZip } from '../../utils/zipExporter';

// Official PTE Half-Point Options (0 to 5)
const HALF_POINT_OPTIONS_5 = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
// Content scale for RS (0 to 3)
const CONTENT_OPTIONS_3 = [0, 1, 2, 3];
// Content scale for SWT & SST (0 to 4)
const CONTENT_OPTIONS_4 = [0, 1, 2, 3, 4];
// Content scale for DI, RL, SGD, RTS, WE (0 to 6)
const CONTENT_OPTIONS_6 = [0, 1, 2, 3, 4, 5, 6];
// Development & Linguistic Range scale for WE (0 to 6)
const TRAIT_OPTIONS_6 = [0, 1, 2, 3, 4, 5, 6];
// Writing traits options (0 to 2)
const TRAIT_OPTIONS_2 = [0, 1, 2];
// Form trait options for SWT (0 to 1)
const FORM_OPTIONS_1 = [0, 1];

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheetId = "1cEuVE8dFFbtHfO_unLIDn3SFPE_z05pk8-ZE79HujlM";
    var ss;
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
    } catch(err) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    // Branch 1: Manual Scoring System Workbook Transfer (Master Dashboard, Parts 1-3, Report Card)
    if (data.action === "TRANSFER_MANUAL_SCORING") {
      var wb = data.workbookData || {};
      var dash = wb.dashboard || {};
      var p1 = wb.part1 || {};
      var p2 = wb.part2 || {};
      var p3 = wb.part3 || {};

      // 1. Master Dashboard
      var dashSheet = ss.getSheetByName("Master Dashboard") || ss.getSheetByName("Master_Dashboard");
      if (dashSheet) {
        dashSheet.getRange("B5").setValue(dash.candidateName || "");
        dashSheet.getRange("C5").setValue("Candidate ID: " + (dash.candidateId || ""));
        dashSheet.getRange("B6").setValue(dash.testDate || "");
        dashSheet.getRange("C6").setValue(dash.targetScore || "");
        dashSheet.getRange("B7").setValue(dash.leadEvaluator || "");
        dashSheet.getRange("C7").setValue(dash.gradingStatus || "✅ Completed");
      }

      // 2. Part 1 - Speaking & Writing
      var p1Sheet = ss.getSheetByName("Part 1 - Speaking & Writing") || ss.getSheetByName("Part 1: Spk & Wrt") || ss.getSheetByName("Part 1");
      if (p1Sheet) {
        if (p1.ra && p1.ra.length > 0) {
          for (var i = 0; i < Math.min(6, p1.ra.length); i++) {
            var r = p1.ra[i];
            p1Sheet.getRange(6 + i, 3, 1, 6).setValues([[ r.promptWords, r.readingErrors, r.rawContent, r.scaledContent, r.pron, r.fluency ]]);
          }
        }
        if (p1.rs && p1.rs.length > 0) {
          for (var i = 0; i < Math.min(10, p1.rs.length); i++) {
            var r = p1.rs[i];
            p1Sheet.getRange(16 + i, 3, 1, 3).setValues([[ r.content, r.pron, r.fluency ]]);
          }
        }
        if (p1.di && p1.di.length > 0) {
          for (var i = 0; i < Math.min(6, p1.di.length); i++) {
            var r = p1.di[i];
            p1Sheet.getRange(30 + i, 3, 1, 3).setValues([[ r.content, r.pron, r.fluency ]]);
          }
        }
        if (p1.rl && p1.rl.length > 0) {
          for (var i = 0; i < Math.min(2, p1.rl.length); i++) {
            var r = p1.rl[i];
            p1Sheet.getRange(40 + i, 3, 1, 3).setValues([[ r.content, r.pron, r.fluency ]]);
          }
        }
        if (p1.sgd && p1.sgd.length > 0) {
          for (var i = 0; i < Math.min(2, p1.sgd.length); i++) {
            var r = p1.sgd[i];
            p1Sheet.getRange(46 + i, 3, 1, 3).setValues([[ r.content, r.pron, r.fluency ]]);
          }
        }
        if (p1.rts && p1.rts.length > 0) {
          for (var i = 0; i < Math.min(2, p1.rts.length); i++) {
            var r = p1.rts[i];
            p1Sheet.getRange(52 + i, 3, 1, 3).setValues([[ r.content, r.pron, r.fluency ]]);
          }
        }
        if (p1.asq && p1.asq.length > 0) {
          for (var i = 0; i < Math.min(5, p1.asq.length); i++) {
            var r = p1.asq[i];
            p1Sheet.getRange(58 + i, 4).setValue(r.accuracy);
          }
        }
        if (p1.swt && p1.swt.length > 0) {
          for (var i = 0; i < Math.min(2, p1.swt.length); i++) {
            var r = p1.swt[i];
            p1Sheet.getRange(67 + i, 3, 1, 6).setValues([[ r.wordCount, r.sentenceCount, r.form, r.content, r.grammar, r.vocabulary ]]);
          }
        }
        if (p1.we && p1.we.length > 0) {
          var r = p1.we[0];
          p1Sheet.getRange(73, 3, 1, 8).setValues([[ r.wordCount, r.form, r.content, r.development, r.linguistic, r.grammar, r.vocabulary, r.spelling ]]);
        }
      }

      // 3. Part 2 - Reading
      var p2Sheet = ss.getSheetByName("Part 2 - Reading") || ss.getSheetByName("Part 2: Reading") || ss.getSheetByName("Part 2");
      if (p2Sheet) {
        if (p2.fibRw && p2.fibRw.length > 0) {
          for (var i = 0; i < Math.min(5, p2.fibRw.length); i++) {
            var r = p2.fibRw[i];
            p2Sheet.getRange(5 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
        if (p2.mcmaR && p2.mcmaR.length > 0) {
          for (var i = 0; i < Math.min(2, p2.mcmaR.length); i++) {
            var r = p2.mcmaR[i];
            p2Sheet.getRange(15 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
        if (p2.roR && p2.roR.length > 0) {
          for (var i = 0; i < Math.min(2, p2.roR.length); i++) {
            var r = p2.roR[i];
            p2Sheet.getRange(22 + i, 4).setValue(r.correctPairs);
          }
        }
        if (p2.fibR && p2.fibR.length > 0) {
          for (var i = 0; i < Math.min(4, p2.fibR.length); i++) {
            var r = p2.fibR[i];
            p2Sheet.getRange(29 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
        if (p2.mcsaR && p2.mcsaR.length > 0) {
          for (var i = 0; i < Math.min(2, p2.mcsaR.length); i++) {
            var r = p2.mcsaR[i];
            p2Sheet.getRange(37 + i, 4, 1, 2).setValues([[ r.selected, r.key ]]);
          }
        }
      }

      // 4. Part 3 - Listening
      var p3Sheet = ss.getSheetByName("Part 3 - Listening") || ss.getSheetByName("Part 3: Listening") || ss.getSheetByName("Part 3");
      if (p3Sheet) {
        if (p3.sst && p3.sst.length > 0) {
          var r = p3.sst[0];
          p3Sheet.getRange(6, 3, 1, 6).setValues([[ r.wordCount, r.form, r.content, r.grammar, r.vocabulary, r.spelling ]]);
        }
        if (p3.mcmaL && p3.mcmaL.length > 0) {
          for (var i = 0; i < Math.min(2, p3.mcmaL.length); i++) {
            var r = p3.mcmaL[i];
            p3Sheet.getRange(12 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
        if (p3.fibL && p3.fibL.length > 0) {
          for (var i = 0; i < Math.min(2, p3.fibL.length); i++) {
            var r = p3.fibL[i];
            p3Sheet.getRange(19 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
        if (p3.hcs && p3.hcs.length > 0) {
          for (var i = 0; i < Math.min(2, p3.hcs.length); i++) {
            var r = p3.hcs[i];
            p3Sheet.getRange(26 + i, 4, 1, 2).setValues([[ r.selected, r.key ]]);
          }
        }
        if (p3.mcsaL && p3.mcsaL.length > 0) {
          for (var i = 0; i < Math.min(2, p3.mcsaL.length); i++) {
            var r = p3.mcsaL[i];
            p3Sheet.getRange(33 + i, 4, 1, 2).setValues([[ r.selected, r.key ]]);
          }
        }
        if (p3.smw && p3.smw.length > 0) {
          for (var i = 0; i < Math.min(2, p3.smw.length); i++) {
            var r = p3.smw[i];
            p3Sheet.getRange(40 + i, 4, 1, 2).setValues([[ r.selected, r.key ]]);
          }
        }
        if (p3.hiw && p3.hiw.length > 0) {
          for (var i = 0; i < Math.min(2, p3.hiw.length); i++) {
            var r = p3.hiw[i];
            p3Sheet.getRange(47 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
        if (p3.wfd && p3.wfd.length > 0) {
          for (var i = 0; i < Math.min(3, p3.wfd.length); i++) {
            var r = p3.wfd[i];
            p3Sheet.getRange(54 + i, 4, 1, 2).setValues([[ r.correct, r.incorrect ]]);
          }
        }
      }

      // 5. Candidate Report Card
      var repSheet = ss.getSheetByName("Candidate Report Card") || ss.getSheetByName("Candidate_Report_Card");
      if (repSheet) {
        repSheet.getRange("D4").setValue(dash.candidateName || "");
        repSheet.getRange("F4").setValue(dash.candidateId || "");
        repSheet.getRange("H4").setValue(dash.testDate || "");
        repSheet.getRange("D7").setValue(dash.candidateName || "");
        repSheet.getRange("F7").setValue(dash.candidateId || "");
        repSheet.getRange("D8").setValue(dash.testDate || "");
        repSheet.getRange("F8").setValue(dash.leadEvaluator || "");
        repSheet.getRange("D14").setValue(dash.overallPte || 80);
        repSheet.getRange("E14").setValue(dash.ieltsBand || "8.0");
        repSheet.getRange("F14").setValue(dash.cefrLevel || "C1-C2");
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Successfully transferred details for " + (dash.candidateName || "Candidate") + " to Master Dashboard, Parts 1-3, and Report Card!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Branch 2: Standard 48-Column Database Append (PTE_Live_Sync)
    var sheetName = "PTE_Live_Sync";
    var sheet = ss.getSheetByName(sheetName);
    
    // Exact 48-Column Database Schema (Columns A through AV)
    var headers48 = [
      "Timestamp", "Session_Code", "Sync_Source", "Grading_Status", "Candidate_ID",
      "Candidate_Name", "Test_Date", "Lead_Evaluator", "Target_Score", "Overall_PTE_Score",
      "Concordant_IELTS_Band", "CEFR_Level", "Performance_Classification", "Overall_Exam_Mastery_Pct",
      "Total_Points_Earned", "Total_Max_Points", "Speaking_PTE_Score", "Speaking_Raw_Points",
      "Writing_PTE_Score", "Writing_Raw_Points", "Reading_PTE_Score", "Reading_Raw_Points",
      "Listening_PTE_Score", "Listening_Raw_Points", "Part1_Points_Awarded", "Part1_Max_Available",
      "Part1_Section_Pct", "Part1_Zero_Knockouts", "Part2_Points_Awarded", "Part2_Max_Available",
      "Part2_Section_Pct", "Part2_Negative_Floors", "Part3_Points_Awarded", "Part3_Max_Available",
      "Part3_Section_Pct", "Part3_Floors_Applied", "P1_T1_Read_Aloud", "P1_T2_Repeat_Sentence",
      "P1_T3_Describe_Image", "P1_T4_Retell_Lecture", "P1_T5_Summarize_Discussion", "P1_T6_Respond_Situation",
      "P1_T7_Answer_Short_Question", "P1_T8_Summarize_Written_Text", "P1_T9_Write_Essay",
      "P2_Reading_Total_Points", "P3_Listening_Total_Points", "Validation_Status_All_Verified"
    ];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers48);
      sheet.getRange(1, 1, 1, 48).setFontWeight("bold").setBackground("#e0f2fe");
    } else if (sheet.getLastRow() === 0 || sheet.getLastColumn() < 48) {
      sheet.getRange(1, 1, 1, 48).setValues([headers48]).setFontWeight("bold").setBackground("#e0f2fe");
    }

    var row = data.row;
    if (!row || !Array.isArray(row)) {
      if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
        row = data.rows[0];
      }
    }

    if (!row) {
      // Fallback: construct from legacy payload if row not provided
      row = [
        data.timestamp || new Date().toISOString(),
        (data.student && data.student.sessionCode) || "PTE-LIVE-SESSION",
        "Web App & Sheet Engine",
        data.gradingStatus || "Completed",
        (data.student && data.student.id) || "PTE-CANDIDATE",
        (data.student && data.student.name) || "Candidate",
        (data.timestamp || new Date().toISOString()).slice(0, 10),
        "PTE Automated Scoring Engine",
        (data.student && data.student.targetScore) || "PTE 79+",
        (data.scores && data.scores.overallPte) || 79,
        (data.scores && data.scores.ieltsBand) || 8.0,
        "C1-C2", "Very Good User (Superior)", "87.0%",
        517.0, 592.0,
        (data.scores && data.scores.speaking) || 79, 353.0,
        (data.scores && data.scores.writing) || 85, 114.0,
        (data.scores && data.scores.reading) || 81, 68.0,
        (data.scores && data.scores.listening) || 81, 111.0,
        398.0, 461.0, "86.3%", 0,
        51.0, 57.0, "89.5%", 0,
        68.0, 74.0, "91.9%", 0,
        79.0, 112.0, 81.0, 27.0, 25.0, 27.0, 5.0, 17.0, 23.0,
        51.0, 60.0, "All 22 Tasks Verified (Parts 1–3)"
      ];
    }

    // Ensure exactly 48 elements
    while (row.length < 48) row.push("");
    if (row.length > 48) row = row.slice(0, 48);

    // Upsert or Append: Check Candidate ID (Col E / index 4) or Session Code (Col B / index 1)
    var candidateId = String(row[4] || "");
    var sessionCode = String(row[1] || "");
    var lastRow = sheet.getLastRow();
    var matchRow = -1;

    if (lastRow > 1) {
      var existingData = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
      for (var i = 0; i < existingData.length; i++) {
        var existingSession = String(existingData[i][1] || "");
        var existingCandidate = String(existingData[i][4] || "");
        if ((candidateId && existingCandidate === candidateId) || (sessionCode && existingSession === sessionCode)) {
          matchRow = i + 2;
          break;
        }
      }
    }

    if (matchRow > 1) {
      sheet.getRange(matchRow, 1, 1, 48).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Successfully synchronized 48-column record for " + (row[5] || candidateId) + " to PTE_Live_Sync!A:AV",
      rowNumber: matchRow > 1 ? matchRow : sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
};`;

export default function GradingStation({
  questionBank,
  onLaunchStudentExam,
  onNavigateTab,
  selectedCandidateId,
  onSelectCandidate
}) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(selectedCandidateId || null);
  const [selectedItemId, setSelectedItemId] = useState('RA-01');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'pending' | 'graded'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilesVault, setShowFilesVault] = useState(false);
  const [showManualTransferModal, setShowManualTransferModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Sync selected candidate when passed from parent tab
  useEffect(() => {
    if (selectedCandidateId && selectedCandidateId !== selectedSubId) {
      setSelectedSubId(selectedCandidateId);
    }
  }, [selectedCandidateId]);

  // Rubric Drawer State
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [activeRubricTab, setActiveRubricTab] = useState('pronunciation'); // 'pronunciation' | 'fluency' | 'content' | 'essay' | 'knockout'

  // Drag-and-drop Submission Pack (.json) upload state
  const [isDraggingPack, setIsDraggingPack] = useState(false);
  const packFileInputRef = useRef(null);

  // Local scores state: { [itemId]: { content, fluency, pronunciation, form, devCoherence, linguisticRange, grammar, vocabulary, spelling, total, comments, readingErrors } }
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedTSV, setCopiedTSV] = useState(false);

  // Grok AI & Google Sheet Integration State
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [isBatchGrading, setIsBatchGrading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncMessage, setSheetSyncMessage] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    grokApiKey: '',
    googleSheetWebhookUrl: '',
    autoSyncToGoogleSheet: false,
    hasGrokKey: false
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Speech-to-Text & Transcript Teacher Management State
  const [isTranscribingWhisper, setIsTranscribingWhisper] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [tempTranscript, setTempTranscript] = useState('');
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleExportExamZip = async (subToExport) => {
    const targetSub = subToExport || activeSubmission;
    if (!targetSub) return;
    setIsExportingZip(true);
    try {
      await downloadExamSubmissionZip(targetSub, questionBank?.items || []);
    } catch (err) {
      alert('Zip export failed: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleTranscribeWithWhisper = async (itemId) => {
    const resp = activeSubmission?.responses?.[itemId];
    if (!resp) return;
    setIsTranscribingWhisper(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: resp.recordedAudio?.fileName,
          audioUrl: resp.recordedAudio?.audioUrl || resp.recordedAudio?.localBlobUrl,
          prompt: selectedItem?.prompt,
          referenceText: selectedItem?.referenceText
        })
      });
      const data = await res.json();
      if (data?.ok && data.transcript) {
        handleSaveTranscript(itemId, data.transcript);
      } else {
        alert(data?.error || 'Could not transcribe with Whisper. Native browser STT is used.');
      }
    } catch (err) {
      alert('Transcription request error: ' + err.message);
    } finally {
      setIsTranscribingWhisper(false);
    }
  };

  const handleSaveTranscript = (itemId, newTranscript) => {
    if (!activeSubmission) return;
    const cleanTranscript = (newTranscript || '').trim();
    const updatedSubmissions = submissions.map((sub) => {
      if (sub.id !== activeSubmission.id) return sub;
      const existingResp = sub.responses?.[itemId] || {};
      return {
        ...sub,
        responses: {
          ...sub.responses,
          [itemId]: {
            ...existingResp,
            transcript: cleanTranscript,
            text: cleanTranscript,
            recordedAudio: {
              ...(existingResp.recordedAudio || {}),
              transcript: cleanTranscript
            }
          }
        }
      };
    });
    setSubmissions(updatedSubmissions);
    setIsEditingTranscript(false);

    // Save updated submission pack to backend
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...activeSubmission,
        responses: {
          ...activeSubmission.responses,
          [itemId]: {
            ...(activeSubmission.responses?.[itemId] || {}),
            transcript: cleanTranscript,
            text: cleanTranscript
          }
        }
      })
    }).catch(() => {});
  };

  // Fetch integrations from backend
  const fetchIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations');
      const data = await res.json();
      if (data?.ok) {
        setSettings({
          grokApiKey: data.grokApiKey || '',
          googleSheetWebhookUrl: data.googleSheetWebhookUrl || '',
          autoSyncToGoogleSheet: !!data.autoSyncToGoogleSheet,
          hasGrokKey: !!data.hasGrokKey
        });
      }
    } catch {
      // fallback
    }
  };

  // Fetch submissions from local backend
  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data?.submissions) {
        setSubmissions(data.submissions);
        if (!selectedSubId && data.submissions.length > 0) {
          setSelectedSubId(data.submissions[0].id);
        }
      }
    } catch {
      // fallback to localStorage
      const local = JSON.parse(localStorage.getItem('pte_submissions') || '[]');
      setSubmissions(local);
      if (!selectedSubId && local.length > 0) {
        setSelectedSubId(local[0].id);
      }
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchIntegrations();
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data?.ok) {
        fetchIntegrations();
        setShowSettingsModal(false);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const activeSubmission = submissions.find((s) => s.id === selectedSubId);
  const activeExamItems = activeSubmission?.examItems && activeSubmission.examItems.length > 0
    ? activeSubmission.examItems
    : (questionBank?.items || []);

  const submissionSummary = useMemo(() => {
    if (!activeSubmission) return null;
    return computeSubmissionSummary(activeSubmission, scores, activeExamItems);
  }, [activeSubmission, scores, activeExamItems]);

  // When active submission changes, load its manualScores
  useEffect(() => {
    if (activeSubmission?.manualScores) {
      setScores(activeSubmission.manualScores);
    } else {
      setScores({});
    }
  }, [selectedSubId]);

  // Handle Drag-and-Drop of Student Submission Pack (.json)
  const handlePackFileImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const packs = Array.isArray(parsed) ? parsed : [parsed];
        for (const pack of packs) {
          if (!pack.studentId) continue;
          await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pack)
          });
        }
        fetchSubmissions();
      } catch {
        // ignore invalid pack
      }
    };
    reader.readAsText(file);
  };

  // Score change helper
  const handleScoreFieldChange = (itemId, field, val) => {
    const num = isNaN(parseFloat(val)) ? 0 : parseFloat(val);
    const cur = scores[itemId] || {};
    const updated = { ...cur, [field]: num };

    const activeItems = activeSubmission?.examItems && activeSubmission.examItems.length > 0
      ? activeSubmission.examItems
      : (questionBank?.items || []);
    const item = activeItems.find((it) => it.id === itemId) || (questionBank?.items || []).find((it) => it.id === itemId);
    const taskType = item?.taskType;

    // Hard Zero-Point Knockout Rule enforcement:
    if (['RA', 'RS', 'DI', 'RL', 'SGD', 'RTS'].includes(taskType)) {
      if (updated.content === 0) {
        updated.fluency = 0;
        updated.pronunciation = 0;
        updated.total = 0;
      } else {
        updated.total = (updated.content || 0) + (updated.fluency || 0) + (updated.pronunciation || 0);
      }
    } else if (taskType === 'SWT') {
      if (updated.content === 0 || updated.form === 0) {
        updated.total = 0;
      } else {
        updated.total = (updated.content || 0) + (updated.form || 0) + (updated.grammar || 0) + (updated.vocabulary || 0);
      }
    } else if (taskType === 'WE') {
      if (updated.content === 0 || updated.form === 0) {
        updated.total = 0;
      } else {
        updated.total =
          (updated.content || 0) +
          (updated.form || 0) +
          (updated.devCoherence || 0) +
          (updated.linguisticRange || 0) +
          (updated.grammar || 0) +
          (updated.vocabulary || 0) +
          (updated.spelling || 0);
      }
    } else if (taskType === 'SST') {
      if (updated.content === 0 || updated.form === 0) {
        updated.total = 0;
      } else {
        updated.total =
          (updated.content || 0) +
          (updated.form || 0) +
          (updated.grammar || 0) +
          (updated.vocabulary || 0) +
          (updated.spelling || 0);
      }
    } else {
      updated.total =
        (updated.content || 0) +
        (updated.fluency || 0) +
        (updated.pronunciation || 0) +
        (updated.form || 0) +
        (updated.devCoherence || 0) +
        (updated.linguisticRange || 0) +
        (updated.grammar || 0) +
        (updated.vocabulary || 0) +
        (updated.spelling || 0);
    }

    setScores({
      ...scores,
      [itemId]: updated
    });
  };

  const handleCommentsChange = (itemId, text) => {
    const cur = scores[itemId] || { total: 0 };
    setScores({
      ...scores,
      [itemId]: { ...cur, comments: text }
    });
  };

  const handleSaveAllGrades = async () => {
    if (!activeSubmission) return;
    setIsSaving(true);

    const summary = computeSubmissionSummary(activeSubmission, scores, activeExamItems);
    const updatedSub = {
      ...activeSubmission,
      manualScores: scores,
      computedScores: summary,
      row: summary?.row || build48ColumnRow(activeSubmission, summary),
      overallPte: summary?.overallPte,
      ieltsBand: summary?.ielts?.band,
      gradingStatus: 'graded',
      updatedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSub)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchSubmissions();
    } catch {
      // fallback
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransferToBridge = async () => {
    if (!activeSubmission) return;
    await handleSaveAllGrades();
    if (onSelectCandidate) onSelectCandidate(activeSubmission.id);
    if (onNavigateTab) onNavigateTab('bridge');
  };

  // Google Sheet 48-Column TSV Copy (Columns A through AV)
  const handleCopyGoogleSheetTSV = () => {
    if (!activeSubmission) return;
    const summary = computeSubmissionSummary(activeSubmission, scores, activeExamItems);
    const row = summary?.row || build48ColumnRow(activeSubmission, summary);
    const tsvRow = row.map((v) => (typeof v === 'string' && v.includes('\t') ? `"${v}"` : v)).join('\t');
    navigator.clipboard.writeText(tsvRow);
    setCopiedTSV(true);
    setTimeout(() => setCopiedTSV(false), 3000);
  };

  const handleAiGradeCurrentItem = async () => {
    if (!selectedItem) return;
    setIsAutoGrading(true);
    try {
      const resp = activeSubmission?.responses?.[selectedItem.id] || {};
      const res = await fetch('/api/ai-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          taskType: selectedItem.taskType,
          prompt: selectedItem.prompt,
          studentResponse: resp,
          referenceText: selectedItem.referenceText || selectedItem.prompt || ''
        })
      });
      const data = await res.json();
      if (data?.ok && data.traits) {
        const cur = scores[selectedItem.id] || {};
        const updated = {
          ...cur,
          ...data.traits,
          comments: data.examinerComments || cur.comments || '',
          ratedBy: data.ratedBy
        };
        const total =
          (updated.content || 0) +
          (updated.fluency || 0) +
          (updated.pronunciation || 0) +
          (updated.form || 0) +
          (updated.devCoherence || 0) +
          (updated.linguisticRange || 0) +
          (updated.grammar || 0) +
          (updated.vocabulary || 0) +
          (updated.spelling || 0);
        updated.total = total;

        setScores((prev) => ({
          ...prev,
          [selectedItem.id]: updated
        }));
      }
    } catch (err) {
      console.error('AI grade failed:', err);
    } finally {
      setIsAutoGrading(false);
    }
  };

  const handleBatchAiGradeAll = async () => {
    if (!activeSubmission) return;
    setIsBatchGrading(true);
    setBatchProgress('Starting Grok AI automated scoring engine...');

    const itemsToGrade = activeExamItems.filter((it) => {
      return ['RA', 'RS', 'DI', 'RL', 'SGD', 'RTS', 'ASQ', 'SWT', 'WE', 'SST'].includes(it.taskType);
    });

    const updatedScores = { ...scores };

    for (let i = 0; i < itemsToGrade.length; i++) {
      const it = itemsToGrade[i];
      setBatchProgress(`Evaluating item ${i + 1}/${itemsToGrade.length} (${it.id} - ${it.taskType})...`);
      try {
        const resp = activeSubmission?.responses?.[it.id] || {};
        const res = await fetch('/api/ai-grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: it.id,
            taskType: it.taskType,
            prompt: it.prompt,
            studentResponse: resp,
            referenceText: it.referenceText || it.prompt || ''
          })
        });
        const data = await res.json();
        if (data?.ok && data.traits) {
          const cur = updatedScores[it.id] || {};
          const itemSc = {
            ...cur,
            ...data.traits,
            comments: data.examinerComments || cur.comments || '',
            ratedBy: data.ratedBy
          };
          itemSc.total =
            (itemSc.content || 0) +
            (itemSc.fluency || 0) +
            (itemSc.pronunciation || 0) +
            (itemSc.form || 0) +
            (itemSc.devCoherence || 0) +
            (itemSc.linguisticRange || 0) +
            (itemSc.grammar || 0) +
            (itemSc.vocabulary || 0) +
            (itemSc.spelling || 0);
          updatedScores[it.id] = itemSc;
        }
      } catch (err) {
        console.warn(`AI grading failed for ${it.id}:`, err);
      }
    }

    setScores(updatedScores);
    setIsBatchGrading(false);
    setBatchProgress(null);

    // Save and finalize submission
    const updatedSub = {
      ...activeSubmission,
      manualScores: updatedScores,
      gradingStatus: 'graded',
      updatedAt: new Date().toISOString()
    };
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSub)
    });
    fetchSubmissions();
  };

  const handleSyncToGoogleSheet = async () => {
    if (!activeSubmission) return;
    setIsSyncingSheet(true);
    setSheetSyncMessage(null);
    try {
      const summary = computeSubmissionSummary(activeSubmission, scores, activeExamItems);
      const subToSync = {
        ...activeSubmission,
        manualScores: scores,
        computedScores: summary,
        row: summary?.row || build48ColumnRow(activeSubmission, summary),
        overallPte: summary?.overallPte,
        ieltsBand: summary?.ielts?.band,
        gradingStatus: 'graded'
      };

      const res = await fetch('/api/google-sheet/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission: subToSync })
      });
      const data = await res.json();
      if (data.ok) {
        setSheetSyncMessage({ type: 'success', text: data.message });
      } else if (data.requiresUrl) {
        setSheetSyncMessage({ type: 'warning', text: data.message });
        setShowSettingsModal(true);
      } else {
        setSheetSyncMessage({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch {
      setSheetSyncMessage({ type: 'error', text: 'Network error connecting to Google Sheet sync service.' });
    } finally {
      setIsSyncingSheet(false);
      setTimeout(() => setSheetSyncMessage(null), 6000);
    }
  };

  // Filter roster
  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus === 'pending' && s.gradingStatus === 'graded') return false;
    if (filterStatus === 'graded' && s.gradingStatus !== 'graded') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = s.studentName?.toLowerCase().includes(q);
      const matchId = s.studentId?.toLowerCase().includes(q);
      const matchSes = s.sessionCode?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchSes) return false;
    }
    return true;
  });

  const selectedItem = activeExamItems.find((it) => it.id === selectedItemId) || (questionBank?.items || []).find((it) => it.id === selectedItemId);
  const studentResponse = activeSubmission?.responses?.[selectedItemId] || null;
  const currentItemScore = scores[selectedItemId] || {};

  const isObjectiveTask =
    selectedItem &&
    (selectedItem.part === 'PART_2' ||
      (selectedItem.part === 'PART_3' && selectedItem.taskType !== 'SST'));

  const isSpokenTask =
    selectedItem && ['RA', 'RS', 'DI', 'RL', 'SGD', 'RTS', 'ASQ'].includes(selectedItem.taskType);

  const isWrittenTask =
    selectedItem && ['SWT', 'WE', 'SST'].includes(selectedItem.taskType);

  return (
    <div className="space-y-6 relative">
      {/* Top Header & Submission Pack Importer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              Multi-Student Classroom Manager &amp; Teacher Grading Station
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grade multi-student mock exams side-by-side with official Pearson rubrics, 100% auto-graded objective tasks, and one-click Google Sheet TSV export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Submission Pack Importer Button */}
          <button
            type="button"
            onClick={() => packFileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
            title="Import student submission packs taken on offline laptops"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Drop/Import Submission Packs (.json)</span>
          </button>
          <input
            ref={packFileInputRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach((f) => handlePackFileImport(f));
            }}
          />

          {/* Toggle Official Rubric Drawer Button */}
          <button
            type="button"
            onClick={() => setIsRubricOpen(!isRubricOpen)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold transition"
          >
            <BookOpen className="w-4 h-4 text-indigo-700" />
            <span>{isRubricOpen ? 'Close Rubric Drawer' : 'Official Rubric Drawer'}</span>
          </button>

          {/* Quick link to Scoring Equations Studio */}
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('equations')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold transition"
              title="Open Equation Studio to customize scoring formulas, GSE linear scales, and CEFR cutoffs"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Scoring Equations</span>
            </button>
          )}

          {/* Batch Auto-Grade All with Grok AI */}
          {activeSubmission && (
            <button
              type="button"
              onClick={handleBatchAiGradeAll}
              disabled={isBatchGrading}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
              title="Auto-grade all speaking & writing items with Grok AI rater"
            >
              {isBatchGrading ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>{isBatchGrading ? 'Auto-Grading with Grok...' : '⚡ Auto-Grade with Grok'}</span>
            </button>
          )}

          {/* Open Candidate Files & Audio Vault */}
          {activeSubmission && (
            <button
              type="button"
              onClick={() => setShowFilesVault(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-900/90 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              title="Open files & candidate voice recordings vault"
            >
              <FileAudio className="w-4 h-4 text-emerald-400" />
              <span>Files &amp; Audio Vault</span>
            </button>
          )}

          {/* Open in Google Sheet Bridge Button */}
          {activeSubmission && onNavigateTab && (
            <button
              type="button"
              onClick={handleTransferToBridge}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
              title="Transfer to Google Sheet Bridge with 48 columns preloaded"
            >
              <ExternalLink className="w-4 h-4 text-emerald-300" />
              <span>Open in Google Sheet Bridge</span>
            </button>
          )}

          {/* Transfer to Manual Scoring Sheet Button */}
          {activeSubmission && (
            <button
              type="button"
              onClick={() => setShowManualTransferModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              title="Transfer candidate details and task scores to Google Sheet Manual Scoring Worksheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>📊 Transfer to Manual Sheet</span>
            </button>
          )}

          {/* Print Candidate Report Card Button */}
          {activeSubmission && (
            <button
              type="button"
              onClick={() => setShowReportCardModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              title="View and print official Candidate Score Report Card (PDF)"
            >
              <Printer className="w-4 h-4 text-blue-100" />
              <span>🖨️ Print Report Card</span>
            </button>
          )}

          {/* Sync to Google Sheet Button */}
          {activeSubmission && (
            <button
              type="button"
              onClick={handleSyncToGoogleSheet}
              disabled={isSyncingSheet}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
              title="Push graded student scores directly to Google Sheet Webhook"
            >
              {isSyncingSheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-slate-300" />}
              <span>{isSyncingSheet ? 'Syncing...' : 'Sync 48-Cols'}</span>
            </button>
          )}

          {/* Export Exam Pack Zip Button */}
          {activeSubmission && (
            <button
              type="button"
              onClick={() => handleExportExamZip(activeSubmission)}
              disabled={isExportingZip}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
              title="Download arranged folders with questions, audio clips, transcripts, and AI prompts (.zip)"
            >
              {isExportingZip ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" /> : <FileArchive className="w-4 h-4 text-indigo-200" />}
              <span>{isExportingZip ? 'Packaging Zip...' : '📦 Export Exam Pack (.zip)'}</span>
            </button>
          )}

          {activeSubmission && (
            <button
              type="button"
              onClick={handleCopyGoogleSheetTSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              title="Copy row data to paste into Google Sheet manually"
            >
              {copiedTSV ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTSV ? 'Copied TSV!' : 'Copy TSV'}</span>
            </button>
          )}

          {activeSubmission && (
            <button
              type="button"
              onClick={handleSaveAllGrades}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#003865] hover:bg-[#002847] text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Finalize Grades'}</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition border border-slate-200"
            title="Configure Grok API Key and Google Sheet Webhook"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Batch Progress Banner */}
      {isBatchGrading && batchProgress && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold flex items-center space-x-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span>{batchProgress}</span>
        </div>
      )}

      {/* Google Sheet Sync Message Toast */}
      {sheetSyncMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            sheetSyncMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : sheetSyncMessage.type === 'warning'
              ? 'bg-amber-50 border border-amber-300 text-amber-900'
              : 'bg-red-50 border border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>{sheetSyncMessage.text}</span>
          </div>
          <button type="button" onClick={() => setSheetSyncMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Grades saved and synced for {activeSubmission?.studentName} ({activeSubmission?.studentId})!</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE OVERALL SUBMISSION SCORE SUMMARY BANNER              */}
      {/* ========================================================= */}
      {submissionSummary && activeSubmission && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-blue-900/60 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-blue-900/60 pb-4">
            {/* Left: Candidate & Overall PTE Score */}
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/90 border border-blue-400 shadow-md shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Overall PTE</span>
                <span className="text-3xl font-black text-white">{submissionSummary.overallPte}</span>
                <span className="text-[9px] font-mono text-blue-200">Scale 10–90</span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeSubmission.studentName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950">
                    {submissionSummary.cefrLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    IELTS {submissionSummary.ielts?.band} ({submissionSummary.ielts?.label})
                  </span>
                  {submissionSummary.knockoutCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-500/50">
                      ⚠️ {submissionSummary.knockoutCount} Zero Knockout{submissionSummary.knockoutCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-200">
                  Candidate ID: <span className="font-mono text-white font-bold">{activeSubmission.studentId}</span> • Session: <span className="font-mono text-white font-bold">{activeSubmission.sessionCode}</span> • Target: <span className="font-bold text-amber-300">{activeSubmission.targetScore || 'PTE 79+'}</span>
                </p>
              </div>
            </div>

            {/* Right: Summary Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManualTransferModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                title="Transfer to Manual Scoring Worksheet (Master Dashboard, Parts 1-3)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Manual Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReportCardModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                title="Print Candidate Report Card"
              >
                <Printer className="w-3.5 h-3.5 text-blue-200" />
                <span>Print Card</span>
              </button>

              <button
                type="button"
                onClick={handleTransferToBridge}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
                title="Open this candidate in Google Sheet Bridge with 48 columns preloaded"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                <span>Bridge (48-Cols)</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToGoogleSheet}
                disabled={isSyncingSheet}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {isSyncingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                <span>Sync Sheet</span>
              </button>

              <button
                type="button"
                onClick={handleCopyGoogleSheetTSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                title="Copy 48-column TSV row"
              >
                {copiedTSV ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTSV ? 'Copied Row!' : 'Copy TSV'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilesVault(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <FileAudio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Files &amp; Audio</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAllGrades}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Grades'}</span>
              </button>
            </div>
          </div>

          {/* Communicative Skills Quad Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-300 block">Speaking Score</span>
                <span className="font-mono text-xl font-black text-white">{submissionSummary.speakingPte}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{submissionSummary.speakingRaw} raw pts</span>
              </div>
              <Volume2 className="w-6 h-6 text-blue-400 opacity-60" />
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Writing Score</span>
                <span className="font-mono text-xl font-black text-white">{submissionSummary.writingPte}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{submissionSummary.writingRaw} raw pts</span>
              </div>
              <FileText className="w-6 h-6 text-indigo-400 opacity-60" />
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Reading Score</span>
                <span className="font-mono text-xl font-black text-white">{submissionSummary.readingPte}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{submissionSummary.readingRaw} raw pts</span>
              </div>
              <BookOpen className="w-6 h-6 text-emerald-400 opacity-60" />
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Listening Score</span>
                <span className="font-mono text-xl font-black text-white">{submissionSummary.listeningPte}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{submissionSummary.listeningRaw} raw pts</span>
              </div>
              <TrendingUp className="w-6 h-6 text-amber-400 opacity-60" />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Student Roster (Left) vs Side-by-Side Grading Station (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: MULTI-STUDENT ROSTER & SUBMISSION MANAGER   */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Student Roster ({submissions.length})
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('pending')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('graded')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    filterStatus === 'graded' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Graded
                </button>
              </div>
            </div>

            {/* Roster Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate name or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Offline Drag-and-Drop Area for Student Submission Packs */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPack(true);
              }}
              onDragLeave={() => setIsDraggingPack(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPack(false);
                const files = Array.from(e.dataTransfer.files || []);
                files.forEach((f) => handlePackFileImport(f));
              }}
              className={`p-3 border-2 border-dashed rounded-lg text-center transition cursor-pointer ${
                isDraggingPack
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
              }`}
              onClick={() => packFileInputRef.current?.click()}
            >
              <p className="text-[11px] font-bold text-slate-700">
                Drop offline student .json submission packs here
              </p>
              <p className="text-[10px] text-slate-400">
                Instantly aggregates test packs from multiple student laptops
              </p>
            </div>

            {/* Roster Cards List */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No student submissions found.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = sub.id === selectedSubId;
                  const isGraded = sub.gradingStatus === 'graded';
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubId(sub.id);
                        if (onSelectCandidate) onSelectCandidate(sub.id);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition flex flex-col space-y-1.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {sub.studentName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isGraded
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isGraded ? '✅ Graded' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="truncate max-w-[90px]">{sub.studentId}</span>
                        <span className="font-bold text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded text-[10px]">
                          {sub.targetScore || 'PTE 79+'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportExamZip(sub);
                            }}
                            className="p-1 hover:bg-indigo-100 text-indigo-700 rounded transition"
                            title="Download full exam pack (.zip) for this candidate"
                          >
                            <FileArchive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Question Navigator for Selected Student */}
          {activeSubmission && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>Select Task Item</span>
                <span className="font-mono text-slate-400">
                  {Object.keys(activeSubmission.responses || {}).length} Submitted
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1">
                {activeExamItems.map((it) => {
                  const isSelected = it.id === selectedItemId;
                  const resp = activeSubmission.responses?.[it.id];
                  const hasResponse = !!resp;
                  const itemAutoScore = resp?.rawScore ?? resp?.finalScore;
                  const hasTeacherGrade = scores[it.id]?.total !== undefined;

                  const isObj =
                    it.part === 'PART_2' ||
                    (it.part === 'PART_3' && it.taskType !== 'SST');

                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setSelectedItemId(it.id)}
                      className={`w-full p-2 rounded text-left text-xs transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-700 text-white font-bold shadow-2xs'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className={`font-mono text-[11px] ${
                            isSelected ? 'text-white' : 'text-blue-900 font-bold'
                          }`}
                        >
                          {it.id}
                        </span>
                        <span className="truncate">{it.taskType}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {isObj && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-blue-900 text-blue-100'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            Auto: {itemAutoScore ?? 0}
                          </span>
                        )}
                        {!isObj && hasTeacherGrade && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {scores[it.id].total} pts
                          </span>
                        )}
                        {!isObj && !hasTeacherGrade && hasResponse && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Needs Grade
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: SIDE-BY-SIDE GRADING WORKSPACE              */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {activeSubmission && selectedItem ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              {/* Candidate Info Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-mono font-bold text-xs rounded">
                      {selectedItem.id}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{selectedItem.title}</h4>
                    {selectedItem?.originalBankId && selectedItem.originalBankId !== selectedItem.id && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded font-mono text-[10px] font-bold">
                        🎲 Randomized (Bank: {selectedItem.originalBankId})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span>
                      Candidate:{' '}
                      <strong className="text-slate-800">{activeSubmission.studentName}</strong> (
                      {activeSubmission.studentId})
                    </span>
                    <span>•</span>
                    <span>
                      Target:{' '}
                      <strong className="text-blue-900 font-bold">
                        {activeSubmission.targetScore || 'PTE 79+'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Section: {selectedItem.part}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Item Points
                  </span>
                  <span className="font-mono text-xl font-black text-emerald-700">
                    {currentItemScore.total ?? studentResponse?.rawScore ?? 0} pts
                  </span>
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/* SIDE-BY-SIDE: PROMPT & MATERIALS VS CANDIDATE RESPONSE    */}
              {/* --------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                {/* Left: Official Prompt / Passage / Media Card */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>Official Prompt &amp; Materials ({selectedItem.taskType})</span>
                    </span>
                    {selectedItem.taskType === 'RA' && (
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-mono font-bold text-[11px] rounded">
                        Prompt Words: {selectedItem.promptWords || countWords(selectedItem.prompt)}
                      </span>
                    )}
                  </div>

                  {/* Prompt Passage / Text */}
                  {(selectedItem.prompt || selectedItem.audioText || selectedItem.referenceSentence) && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Passage / Prompt Text:</span>
                      <p className="text-xs text-slate-800 leading-relaxed font-serif select-text p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        {selectedItem.prompt || selectedItem.audioText || selectedItem.referenceSentence}
                      </p>
                    </div>
                  )}

                  {/* Diagram / Image for Describe Image (DI) */}
                  {selectedItem.imageUrl && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Diagram / Visual Prompt:</span>
                      <div className="flex justify-center p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <img
                          src={selectedItem.imageUrl}
                          alt="Describe Image Diagram"
                          className="max-h-56 w-auto object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Official Audio Prompt Player */}
                  {(selectedItem.audioText || selectedItem.audioUrl) && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Official Audio Prompt (What Student Heard):</span>
                      </span>
                      <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200 text-xs space-y-2">
                        <p className="font-serif italic text-indigo-950 text-xs">
                          "{selectedItem.audioText || selectedItem.prompt}"
                        </p>
                        <audio
                          controls
                          src={
                            selectedItem.audioUrl ||
                            (selectedItem.audioText
                              ? `/api/tts?text=${encodeURIComponent(selectedItem.audioText)}&voice=${encodeURIComponent(selectedItem.voiceAccent || 'en-US-AriaNeural')}`
                              : null)
                          }
                          className="w-full h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Candidate Submitted Answer & Media Inspector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>Candidate Response ({activeSubmission.studentName})</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowFilesVault(true)}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center space-x-1 hover:underline"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>All Files &amp; Audio</span>
                    </button>
                  </div>

                  <CandidateAnswerInspector
                    item={selectedItem}
                    response={studentResponse}
                    submission={activeSubmission}
                    isTranscribingWhisper={isTranscribingWhisper}
                    onTranscribeWhisper={handleTranscribeWithWhisper}
                    isEditingTranscript={isEditingTranscript}
                    tempTranscript={tempTranscript}
                    setTempTranscript={setTempTranscript}
                    onStartEditTranscript={(txt) => {
                      setTempTranscript(txt);
                      setIsEditingTranscript(true);
                    }}
                    onCancelEditTranscript={() => setIsEditingTranscript(false)}
                    onSaveTranscript={handleSaveTranscript}
                  />
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/* TEACHER RUBRIC GRADING INPUTS (EXACT GOOGLE SHEET FORMAT)  */}
              {/* --------------------------------------------------------- */}
              {!isObjectiveTask && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Teacher Manual Scoring Selectors ({selectedItem.id} — {selectedItem.taskType})
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsRubricOpen(true)}
                      className="text-xs text-blue-700 hover:underline font-semibold flex items-center space-x-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Check Rubric Descriptors</span>
                    </button>
                  </div>

                  {/* Grok AI Single-Item Auto-Grade Action Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#003865] to-indigo-900 text-white p-3.5 rounded-lg shadow-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold">Grok AI Automated Scoring Engine</span>
                          {currentItemScore.ratedBy && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30">
                              ✓ {currentItemScore.ratedBy}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-blue-200">
                          Evaluates speech transcript & writing against Pearson rubrics
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAiGradeCurrentItem}
                      disabled={isAutoGrading}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 self-start sm:self-auto shrink-0"
                    >
                      {isAutoGrading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                      <span>{isAutoGrading ? 'Grading with Grok...' : '🤖 Auto-Grade with Grok AI'}</span>
                    </button>
                  </div>

                  {/* 1. READ ALOUD (RA): Auto Prompt Words + Reading Errors + Pronunciation + Fluency */}
                  {selectedItem.taskType === 'RA' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Reading Errors Input
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={currentItemScore.readingErrors ?? 0}
                          onChange={(e) => {
                            const errs = Number(e.target.value) || 0;
                            const promptWords = selectedItem.promptWords || countWords(selectedItem.prompt);
                            // Official PTE Content scoring heuristic for RA: 1-decimal rounding ROUND(((PromptWords - ReadingErrors) / PromptWords) * 5, 1)
                            const errorRatio = Math.min(1, errs / Math.max(1, promptWords));
                            const autoContent = Math.max(0, Math.round((1 - errorRatio) * 50) / 10);
                            handleScoreFieldChange(selectedItem.id, 'readingErrors', errs);
                            handleScoreFieldChange(selectedItem.id, 'content', autoContent);
                          }}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Content Score (0–5)
                        </label>
                        <select
                          value={currentItemScore.content ?? 5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'content', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {currentItemScore.content != null && !HALF_POINT_OPTIONS_5.includes(Number(currentItemScore.content)) && (
                            <option value={currentItemScore.content}>
                              {currentItemScore.content} pts (Calculated)
                            </option>
                          )}
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Pronunciation (0–5)
                        </label>
                        <select
                          value={currentItemScore.pronunciation ?? 3.5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'pronunciation', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Oral Fluency (0–5)
                        </label>
                        <select
                          value={currentItemScore.fluency ?? 3.5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'fluency', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 2. REPEAT SENTENCE (RS): Content (0-3), Pronunciation (0-5), Oral Fluency (0-5) */}
                  {selectedItem.taskType === 'RS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Content (0–3: 3=100%, 2=50%+, 1=&lt;50%)
                        </label>
                        <select
                          value={currentItemScore.content ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'content', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {CONTENT_OPTIONS_3.map((v) => (
                            <option key={v} value={v}>
                              {v} pts {v === 3 ? '(100% words)' : v === 2 ? '(50%+ words)' : v === 1 ? '(<50% words)' : '(0 words)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Pronunciation (0–5)
                        </label>
                        <select
                          value={currentItemScore.pronunciation ?? 3.5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'pronunciation', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Oral Fluency (0–5)
                        </label>
                        <select
                          value={currentItemScore.fluency ?? 3.5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'fluency', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 3. DI, RL, SGD, RTS: Content (0-6), Pronunciation (0-5), Oral Fluency (0-5) */}
                  {['DI', 'RL', 'SGD', 'RTS'].includes(selectedItem.taskType) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Content Score (0–6 Scale)
                        </label>
                        <select
                          value={currentItemScore.content ?? 4}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'content', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {CONTENT_OPTIONS_6.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Pronunciation (0–5)
                        </label>
                        <select
                          value={currentItemScore.pronunciation ?? 3.5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'pronunciation', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Oral Fluency (0–5)
                        </label>
                        <select
                          value={currentItemScore.fluency ?? 3.5}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'fluency', e.target.value)}
                          className="w-full px-3 py-2 border rounded font-mono font-bold bg-white"
                        >
                          {HALF_POINT_OPTIONS_5.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 4. ASQ: Binary 1 / 0 Toggle for Vocabulary Accuracy */}
                  {selectedItem.taskType === 'ASQ' && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">Vocabulary Accuracy (ASQ)</span>
                        <span className="text-slate-500 text-[11px]">
                          Acceptable answers: {(selectedItem.acceptableAnswers || ['stethoscope']).join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleScoreFieldChange(selectedItem.id, 'content', 1)}
                          className={`px-4 py-1.5 rounded-lg font-bold transition ${
                            (currentItemScore.content ?? 1) === 1
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ✓ Correct (1 pt)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScoreFieldChange(selectedItem.id, 'content', 0)}
                          className={`px-4 py-1.5 rounded-lg font-bold transition ${
                            (currentItemScore.content ?? 1) === 0
                              ? 'bg-red-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ✗ Incorrect (0 pt)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5A. SUMMARIZE WRITTEN TEXT (SWT): Max 9 pts (Content 0-4 + Form 0-1 + Grammar 0-2 + Vocabulary 0-2) */}
                  {selectedItem.taskType === 'SWT' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Content (0–4)</label>
                        <select
                          value={currentItemScore.content ?? 4}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'content', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {CONTENT_OPTIONS_4.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Form (0–1: 1 sent, 5–75w)</label>
                        <select
                          value={currentItemScore.form ?? 1}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'form', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {FORM_OPTIONS_1.map((v) => (
                            <option key={v} value={v}>
                              {v} pt {v === 1 ? '(Valid 1 sent)' : '(0 = Knockout)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Grammar (0–2)</label>
                        <select
                          value={currentItemScore.grammar ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'grammar', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Vocabulary (0–2)</label>
                        <select
                          value={currentItemScore.vocabulary ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'vocabulary', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 5B. WRITE ESSAY (WE): Max 26 pts (Content 0-6 + Form 0-2 + Dev 0-6 + Ling 0-6 + Grammar 0-2 + Vocab 0-2 + Spell 0-2) */}
                  {selectedItem.taskType === 'WE' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Content (0–6)</label>
                        <select
                          value={currentItemScore.content ?? 6}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'content', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {CONTENT_OPTIONS_6.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Form (0–2)</label>
                        <select
                          value={currentItemScore.form ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'form', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts {v === 2 ? '(200-300w)' : v === 1 ? '(120-199/301-380)' : '(<120 / Knockout)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Development (0–6)</label>
                        <select
                          value={currentItemScore.devCoherence ?? 6}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'devCoherence', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_6.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Linguistic Range (0–6)</label>
                        <select
                          value={currentItemScore.linguisticRange ?? 6}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'linguisticRange', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_6.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Grammar (0–2)</label>
                        <select
                          value={currentItemScore.grammar ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'grammar', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Vocabulary (0–2)</label>
                        <select
                          value={currentItemScore.vocabulary ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'vocabulary', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Spelling (0–2)</label>
                        <select
                          value={currentItemScore.spelling ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'spelling', e.target.value)}
                          className="w-full px-2 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 5C. SUMMARIZE SPOKEN TEXT (SST): Max 12 pts (Content 0-4 + Form 0-2 + Grammar 0-2 + Vocab 0-2 + Spelling 0-2) */}
                  {selectedItem.taskType === 'SST' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Content (0–4)</label>
                        <select
                          value={currentItemScore.content ?? 4}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'content', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {CONTENT_OPTIONS_4.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Form (0–2: 50–70w)</label>
                        <select
                          value={currentItemScore.form ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'form', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts {v === 2 ? '(50-70w)' : v === 1 ? '(40-49/71-100)' : '(<40 / Knockout)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Grammar (0–2)</label>
                        <select
                          value={currentItemScore.grammar ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'grammar', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Vocabulary (0–2)</label>
                        <select
                          value={currentItemScore.vocabulary ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'vocabulary', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Spelling (0–2)</label>
                        <select
                          value={currentItemScore.spelling ?? 2}
                          onChange={(e) => handleScoreFieldChange(selectedItem.id, 'spelling', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded font-mono font-bold bg-white"
                        >
                          {TRAIT_OPTIONS_2.map((v) => (
                            <option key={v} value={v}>
                              {v} pts
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Feedback / Comments Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Teacher Rubric Notes / Student Feedback
                    </label>
                    <input
                      type="text"
                      value={currentItemScore.comments || ''}
                      onChange={(e) => handleCommentsChange(selectedItem.id, e.target.value)}
                      placeholder="e.g. Accurate keyword extraction, natural pacing with minimal mid-clause hesitations..."
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* OBJECTIVE TASKS: TEACHER MANUAL SCORING & OVERRIDE */}
              {isObjectiveTask && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        Teacher Manual Scoring &amp; Override ({selectedItem.id} — {selectedItem.taskType})
                      </h5>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      Auto Score: <strong className="text-emerald-700">{studentResponse?.rawScore ?? studentResponse?.finalScore ?? 0} pts</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 block text-xs">
                          Awarded Item Score (Manual Override):
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          Max: {selectedItem.maxPoints || 5} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Enter points directly if AI or auto-scoring was offline, or if manual credit is warranted.
                      </p>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="number"
                          min="0"
                          max={selectedItem.maxPoints || 10}
                          step="0.5"
                          value={currentItemScore.overrideScore ?? currentItemScore.total ?? (studentResponse?.rawScore ?? 0)}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            handleScoreFieldChange(selectedItem.id, 'overrideScore', val);
                            handleScoreFieldChange(selectedItem.id, 'total', val);
                          }}
                          className="w-24 px-3 py-1.5 border-2 border-emerald-500 rounded-lg font-mono font-bold text-base text-emerald-950 bg-emerald-50/50"
                        />
                        <span className="font-mono text-xs font-bold text-slate-700">pts</span>

                        <button
                          type="button"
                          onClick={() => {
                            const def = studentResponse?.rawScore ?? studentResponse?.finalScore ?? 0;
                            handleScoreFieldChange(selectedItem.id, 'overrideScore', def);
                            handleScoreFieldChange(selectedItem.id, 'total', def);
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                        >
                          Reset to Auto
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <label className="font-bold text-slate-800 block text-xs">
                        Teacher Rubric Notes / Student Feedback:
                      </label>
                      <textarea
                        rows={3}
                        value={currentItemScore.comments || ''}
                        onChange={(e) => handleCommentsChange(selectedItem.id, e.target.value)}
                        placeholder="e.g. Verified answer choices against Pearson marking key..."
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 text-center text-slate-400 border rounded-xl">
              Select a student and task from the left roster to begin grading.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* EMBEDDED COLLAPSIBLE RUBRIC DRAWER                        */}
      {/* ========================================================= */}
      {isRubricOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-300 flex flex-col">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-sm">Official PTE Academic Descriptor Rubrics</h4>
            </div>
            <button
              type="button"
              onClick={() => setIsRubricOpen(false)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>

          {/* Rubric Tab Buttons */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveRubricTab('pronunciation')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeRubricTab === 'pronunciation' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pronunciation (0–5)
            </button>
            <button
              type="button"
              onClick={() => setActiveRubricTab('fluency')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeRubricTab === 'fluency' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Oral Fluency (0–5)
            </button>
            <button
              type="button"
              onClick={() => setActiveRubricTab('content')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeRubricTab === 'content' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Content (0–6)
            </button>
            <button
              type="button"
              onClick={() => setActiveRubricTab('essay')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeRubricTab === 'essay' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Essay Traits
            </button>
            <button
              type="button"
              onClick={() => setActiveRubricTab('knockout')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeRubricTab === 'knockout' ? 'bg-red-700 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Zero-Point Rule
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4 text-slate-800 leading-relaxed">
            {activeRubricTab === 'pronunciation' && (
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900 border-b pb-1">
                  Pronunciation Descriptor Table (0–5)
                </h5>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">5 — Native-like</strong>
                    All vowels and consonants are produced clearly; stress is placed accurately on syllables and words.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">4 — Advanced</strong>
                    Vowels and consonants are pronounced clearly; intelligibility is effortlessly maintained with only subtle non-native accent.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">3 — Good</strong>
                    Most vowels and consonants are correct; occasional mispronunciations do not obscure the intended meaning.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">2 — Intermediate</strong>
                    Noticeable non-native phonetic distortions; requires attentive listening from native speakers.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">1 — Early</strong>
                    Frequent pronunciation errors cause severe strain or misunderstanding.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-red-700 block font-mono">0 — Non-English</strong>
                    Speech is entirely unintelligible or contains no recognizable English phonemes.
                  </div>
                </div>
              </div>
            )}

            {activeRubricTab === 'fluency' && (
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900 border-b pb-1">
                  Oral Fluency Descriptor Table (0–5)
                </h5>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">5 — Native-like</strong>
                    Smooth rhythm and natural phrasing; no hesitation, repetitions, false starts, or unnatural pauses.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">4 — Advanced</strong>
                    Continuous speaking rhythm with appropriate phrasing; minor hesitation does not interrupt discourse flow.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">3 — Good</strong>
                    Speaking pace is consistent; acceptable pauses at clause boundaries with occasional self-correction.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">2 — Intermediate</strong>
                    Uneven delivery with noticeable pauses, false starts, or staccato phrasing.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">1 — Limited</strong>
                    Slow, halting delivery with frequent pauses between single words.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-red-700 block font-mono">0 — Disfluent</strong>
                    Fragmented utterances or extended silence exceeding 3 seconds.
                  </div>
                </div>
              </div>
            )}

            {activeRubricTab === 'content' && (
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900 border-b pb-1">
                  Content Descriptor Scale (0–6 for DI, RL, SGD, RTS)
                </h5>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">6 — Full Description &amp; Underlying Implications</strong>
                    Covers all key elements, relationships, chronological trends, and significant conclusions with high precision.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">5 — Comprehensive Description</strong>
                    Covers all main points and their basic relationships with supporting details.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">4 — Clear Main Points</strong>
                    Covers most key trends or speaker arguments with minor omissions.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">3 — Basic Summary</strong>
                    Presents only basic or isolated points without synthesized connections.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">2 — Fragmentary Mention</strong>
                    Refers to only one or two isolated facts.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block font-mono">1 — Minimal Relevance</strong>
                    Vague reference to general topic without specific facts.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-red-700 block font-mono">0 — Completely Off-Topic</strong>
                    No relevant points from the prompt or image.
                  </div>
                </div>
              </div>
            )}

            {activeRubricTab === 'essay' && (
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900 border-b pb-1">
                  Written Discourse &amp; Essay Traits
                </h5>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block">Development, Structure &amp; Coherence (0–2)</strong>
                    Logical organizational progression, clear transitions between paragraphs, cohesive argument flow.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block">General Linguistic Range (0–2)</strong>
                    Demonstrates ability to express nuances of thought using sophisticated syntactic structures.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block">Grammar (0–2)</strong>
                    2: Correct grammatical control with rare slips; 1: Minor errors do not obscure meaning; 0: Multiple systematic errors.
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded">
                    <strong className="text-indigo-900 block">Vocabulary &amp; Spelling (0–2 each)</strong>
                    Appropriate academic lexical collocations; standard English spelling rules observed consistently.
                  </div>
                </div>
              </div>
            )}

            {activeRubricTab === 'knockout' && (
              <div className="space-y-3 bg-red-50 p-4 rounded-xl border border-red-200 text-red-950">
                <h5 className="font-bold text-sm flex items-center space-x-1.5 text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <span>The Official Zero-Point Knockout Rule</span>
                </h5>
                <p className="leading-relaxed">
                  In official Pearson PTE Academic evaluation, if a response receives a score of <strong>0 for Content</strong> or <strong>0 for Form</strong>, the item receives a <strong>score of ZERO for all remaining traits</strong>!
                </p>
                <div className="space-y-1.5 text-xs text-red-900/90 pt-1">
                  <div>• <strong>Summarize Written Text (SWT)</strong>: If not written as exactly 1 single sentence or outside 5–75 words, Form = 0, resulting in 0 points overall.</div>
                  <div>• <strong>Write Essay (WE)</strong>: If completely off-topic or under 120 words / over 380 words, Content/Form = 0, nullifying Grammar, Vocabulary, and Spelling points.</div>
                  <div>• <strong>Speaking (RA, RS, DI, RL, SGD)</strong>: If the speaker is silent, speaks in a foreign language, or produces zero words related to prompt, Content = 0.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Files & Voice Recordings Vault Modal */}
      {showFilesVault && activeSubmission && (
        <SubmissionFilesVaultModal
          submission={activeSubmission}
          onClose={() => setShowFilesVault(false)}
          onExportZip={handleExportExamZip}
        />
      )}

      {/* Manual Scoring Sheet Transfer Modal */}
      {showManualTransferModal && activeSubmission && (
        <ManualScoringTransferModal
          isOpen={showManualTransferModal}
          onClose={() => setShowManualTransferModal(false)}
          submission={activeSubmission}
          manualScores={manualScores}
          questionBankItems={questionBankItems}
          onOpenReportCard={() => {
            setShowManualTransferModal(false);
            setShowReportCardModal(true);
          }}
        />
      )}

      {/* Candidate Score Report Card Modal (Printable) */}
      {showReportCardModal && activeSubmission && (
        <CandidateReportCardModal
          isOpen={showReportCardModal}
          onClose={() => setShowReportCardModal(false)}
          submission={activeSubmission}
          manualScores={manualScores}
          questionBankItems={questionBankItems}
          onPushToSheet={async (wbData) => {
            const res = await fetch('/api/google-sheet/transfer-manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'TRANSFER_MANUAL_SCORING',
                submission: activeSubmission,
                workbookData: wbData
              })
            });
            return await res.json();
          }}
        />
      )}

      {/* Global Settings & API Configuration Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSaved={() => {
          fetch('/api/integrations')
            .then((res) => res.json())
            .then((data) => {
              if (data && data.ok) {
                setSettings({
                  grokApiKey: data.grokApiKey || '',
                  hasGrokKey: Boolean(data.hasGrokKey),
                  googleSheetWebhookUrl: data.googleSheetWebhookUrl || '',
                  autoSyncToGoogleSheet: Boolean(data.autoSyncToGoogleSheet)
                });
              }
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}

