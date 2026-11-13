import React, { useState, useEffect, useRef } from 'react';
import DynamicQuestionEditor from './DynamicQuestionEditor';
import AiQuestionGeneratorModal from './AiQuestionGeneratorModal';
import {
  Folder,
  FolderOpen,
  FileText,
  FileAudio,
  Image as ImageIcon,
  RefreshCw,
  Dices,
  CheckSquare,
  Square,
  Upload,
  Download,
  Volume2,
  VolumeX,
  Play,
  Square as StopSquare,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Filter,
  Eye,
  FileCode,
  AlertCircle,
  CheckCircle2,
  X,
  Settings,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  BookOpen,
  Edit3
} from 'lucide-react';
import { OFFICIAL_ITEM_QUOTAS, shuffleArray } from '../../utils/examRandomizer';
import { TASK_TEMPLATES, generateFormattingGuideMarkdown } from '../../utils/questionTemplates';
import { speakText, stopSpeaking, fallbackSpeechSynthesis } from '../../utils/audioUtils';
import initialQuestionBank from '../../data/questionBank.json';

const VOICE_OPTIONS = [
  { code: 'en-GB-SoniaNeural', label: 'British English (Sonia - Female)', flag: '🇬🇧', accent: 'en-GB' },
  { code: 'en-GB-RyanNeural', label: 'British English (Ryan - Male)', flag: '🇬🇧', accent: 'en-GB' },
  { code: 'en-US-AriaNeural', label: 'American English (Aria - Female)', flag: '🇺🇸', accent: 'en-US' },
  { code: 'en-US-GuyNeural', label: 'American English (Guy - Male)', flag: '🇺🇸', accent: 'en-US' },
  { code: 'en-AU-NatashaNeural', label: 'Australian English (Natasha - Female)', flag: '🇦🇺', accent: 'en-AU' },
  { code: 'en-AU-WilliamNeural', label: 'Australian English (William - Male)', flag: '🇦🇺', accent: 'en-AU' }
];

function buildDefaultFolderTree(items = []) {
  const parts = [
    {
      key: 'Part1_Speaking_Writing',
      title: 'Part 1: Speaking & Writing',
      part: 'PART_1',
      subfolders: [
        { folderName: '01_Read_Aloud', folderPath: 'Part1_Speaking_Writing/01_Read_Aloud', taskType: 'RA', title: 'Read Aloud', part: 'PART_1' },
        { folderName: '02_Repeat_Sentence', folderPath: 'Part1_Speaking_Writing/02_Repeat_Sentence', taskType: 'RS', title: 'Repeat Sentence', part: 'PART_1' },
        { folderName: '03_Describe_Image', folderPath: 'Part1_Speaking_Writing/03_Describe_Image', taskType: 'DI', title: 'Describe Image', part: 'PART_1' },
        { folderName: '04_Retell_Lecture', folderPath: 'Part1_Speaking_Writing/04_Retell_Lecture', taskType: 'RL', title: 'Retell Lecture', part: 'PART_1' },
        { folderName: '05_Summarize_Group_Discussion', folderPath: 'Part1_Speaking_Writing/05_Summarize_Group_Discussion', taskType: 'SGD', title: 'Summarize Group Discussion', part: 'PART_1' },
        { folderName: '06_Respond_to_Situation', folderPath: 'Part1_Speaking_Writing/06_Respond_to_Situation', taskType: 'RTS', title: 'Respond to Situation', part: 'PART_1' },
        { folderName: '07_Answer_Short_Question', folderPath: 'Part1_Speaking_Writing/07_Answer_Short_Question', taskType: 'ASQ', title: 'Answer Short Question', part: 'PART_1' },
        { folderName: '08_Summarize_Written_Text', folderPath: 'Part1_Speaking_Writing/08_Summarize_Written_Text', taskType: 'SWT', title: 'Summarize Written Text', part: 'PART_1' },
        { folderName: '09_Write_Essay', folderPath: 'Part1_Speaking_Writing/09_Write_Essay', taskType: 'WE', title: 'Write Essay', part: 'PART_1' }
      ]
    },
    {
      key: 'Part2_Reading',
      title: 'Part 2: Reading',
      part: 'PART_2',
      subfolders: [
        { folderName: '01_FIB_Dropdown', folderPath: 'Part2_Reading/01_FIB_Dropdown', taskType: 'FIB-RW', title: 'Reading & Writing: Fill in Blanks', part: 'PART_2' },
        { folderName: '02_MC_Multiple_Answers', folderPath: 'Part2_Reading/02_MC_Multiple_Answers', taskType: 'MCMA-R', title: 'Multiple Choice, Multiple Answers', part: 'PART_2' },
        { folderName: '03_Reorder_Paragraphs', folderPath: 'Part2_Reading/03_Reorder_Paragraphs', taskType: 'RO-R', title: 'Reorder Paragraphs', part: 'PART_2' },
        { folderName: '04_FIB_Drag_and_Drop', folderPath: 'Part2_Reading/04_FIB_Drag_and_Drop', taskType: 'FIB-R', title: 'Reading: Fill in the Blanks', part: 'PART_2' },
        { folderName: '05_MC_Single_Answer', folderPath: 'Part2_Reading/05_MC_Single_Answer', taskType: 'MCSA-R', title: 'Multiple Choice, Single Answer', part: 'PART_2' }
      ]
    },
    {
      key: 'Part3_Listening',
      title: 'Part 3: Listening',
      part: 'PART_3',
      subfolders: [
        { folderName: '01_Summarize_Spoken_Text', folderPath: 'Part3_Listening/01_Summarize_Spoken_Text', taskType: 'SST', title: 'Summarize Spoken Text', part: 'PART_3' },
        { folderName: '02_MC_Multiple_Answers', folderPath: 'Part3_Listening/02_MC_Multiple_Answers', taskType: 'MCMA-L', title: 'Multiple Choice, Multiple Answers', part: 'PART_3' },
        { folderName: '03_FIB_Type_In', folderPath: 'Part3_Listening/03_FIB_Type_In', taskType: 'FIB-L', title: 'Fill in the Blanks', part: 'PART_3' },
        { folderName: '04_Highlight_Correct_Summary', folderPath: 'Part3_Listening/04_Highlight_Correct_Summary', taskType: 'HCS', title: 'Highlight Correct Summary', part: 'PART_3' },
        { folderName: '05_MC_Single_Answer', folderPath: 'Part3_Listening/05_MC_Single_Answer', taskType: 'MCSA-L', title: 'Multiple Choice, Single Answer', part: 'PART_3' },
        { folderName: '06_Select_Missing_Word', folderPath: 'Part3_Listening/06_Select_Missing_Word', taskType: 'SMW', title: 'Select Missing Word', part: 'PART_3' },
        { folderName: '07_Highlight_Incorrect_Words', folderPath: 'Part3_Listening/07_Highlight_Incorrect_Words', taskType: 'HIW', title: 'Highlight Incorrect Words', part: 'PART_3' },
        { folderName: '08_Write_From_Dictation', folderPath: 'Part3_Listening/08_Write_From_Dictation', taskType: 'WFD', title: 'Write From Dictation', part: 'PART_3' }
      ]
    }
  ];

  return parts.map((p) => {
    const subfolders = p.subfolders.map((sf) => {
      const folderItems = (items || []).filter((it) => {
        const t = it.taskType;
        if (t === sf.taskType) return true;
        if (sf.taskType === 'FIB-RW' && (t === 'FIBRW' || t === 'FIB-RW')) return true;
        if (sf.taskType === 'MCMA-R' && (t === 'MCMA_R' || t === 'MCMA-R')) return true;
        if (sf.taskType === 'RO-R' && (t === 'RO' || t === 'RO-R')) return true;
        if (sf.taskType === 'FIB-R' && (t === 'FIB_R' || t === 'FIB-R')) return true;
        if (sf.taskType === 'MCSA-R' && (t === 'MCSA_R' || t === 'MCSA-R')) return true;
        if (sf.taskType === 'MCMA-L' && (t === 'MCMA_L' || t === 'MCMA-L')) return true;
        if (sf.taskType === 'FIB-L' && (t === 'FIB_L' || t === 'FIB-L' || t === 'FIBL')) return true;
        if (sf.taskType === 'MCSA-L' && (t === 'MCSA_L' || t === 'MCSA-L')) return true;
        return it.folderPath === sf.folderPath || it.folderPath === sf.folderPath.replace('03_FIB_Type_In', '03_FIB_Listening');
      });

      return {
        ...sf,
        txtCount: folderItems.length,
        totalFiles: folderItems.length,
        audioCount: folderItems.filter((i) => i.audioUrl || i.audioText).length,
        userAudioCount: folderItems.filter((i) => i.audioUrl).length,
        generatedAudioCount: folderItems.filter((i) => i.audioText).length,
        imageCount: folderItems.filter((i) => i.imageUrl).length,
        itemIds: folderItems.map((i) => i.id),
        items: folderItems,
        files: folderItems.map((i) => ({
          name: `${i.id}.txt`,
          size: (i.prompt || '').length,
          type: 'txt',
          modified: new Date().toISOString()
        }))
      };
    });

    return {
      ...p,
      subfolders,
      totalTxt: subfolders.reduce((acc, s) => acc + s.txtCount, 0),
      totalAudio: subfolders.reduce((acc, s) => acc + s.audioCount, 0),
      totalImage: subfolders.reduce((acc, s) => acc + s.imageCount, 0),
      totalQuestions: subfolders.reduce((acc, s) => acc + s.items.length, 0)
    };
  });
}

export default function QuestionManager({
  questionBank,
  onUpdateQuestionBank
}) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer' | 'builder' | 'cheat_sheet'

  // Folder Tree & Scanned items state - initialized with rich fallback
  const [folderTree, setFolderTree] = useState(() => {
    if (Array.isArray(questionBank?.folderTree) && questionBank.folderTree.length > 0) {
      return questionBank.folderTree;
    }
    const initialItems = (questionBank?.items && questionBank.items.length > 0)
      ? questionBank.items
      : initialQuestionBank.items || [];
    return buildDefaultFolderTree(initialItems);
  });

  const [selectedFolder, setSelectedFolder] = useState(() => {
    const initialItems = (questionBank?.items && questionBank.items.length > 0)
      ? questionBank.items
      : initialQuestionBank.items || [];
    const tree = buildDefaultFolderTree(initialItems);
    return tree[0]?.subfolders?.[0] || null;
  });

  const [expandedParents, setExpandedParents] = useState({
    Part1_Speaking_Writing: true,
    Part2_Reading: true,
    Part3_Listening: true
  });

  // Selected items for active exam session
  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    if (questionBank?.selectedItemIds && Array.isArray(questionBank.selectedItemIds)) {
      return new Set(questionBank.selectedItemIds);
    }
    const all = (questionBank?.items || initialQuestionBank.items || []).map((i) => i.id);
    return new Set(all);
  });

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'selected' | 'unselected'
  const [editingItem, setEditingItem] = useState(null);

  // Loading & notification states
  const [isRescanning, setIsRescanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOverFolderKey, setDragOverFolderKey] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);

  // Template Cheat Sheet & Guide state
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [showCheatSheetDrawer, setShowCheatSheetDrawer] = useState(false);
  const [showAiGeneratorModal, setShowAiGeneratorModal] = useState(false);

  // Neural TTS Voice Preview Modal / Drawer
  const [ttsState, setTtsState] = useState({
    isOpen: false,
    promptText: '',
    selectedVoice: 'en-GB-SoniaNeural',
    isPlaying: false,
    audioUrl: null,
    itemTitle: '',
    isLoading: false,
    statusText: ''
  });

  const activeAudioRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setStatusBanner({ msg, type });
    setTimeout(() => setStatusBanner(null), 4000);
  };

  // ==========================================
  // FETCH FOLDER TREE & QUESTION BANK
  // ==========================================
  const fetchTreeAndQuestions = async (isManual = false) => {
    if (isManual) setIsRescanning(true);
    try {
      const res = await fetch('/api/questions');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (data && Array.isArray(data.folderTree) && data.folderTree.length > 0) {
        setFolderTree(data.folderTree);

        // If no folder currently selected, select first available folder
        if (!selectedFolder && data.folderTree[0]?.subfolders?.[0]) {
          setSelectedFolder(data.folderTree[0].subfolders[0]);
        } else if (selectedFolder) {
          // Re-sync currently selected folder with updated data
          for (const parent of data.folderTree) {
            const found = (parent.subfolders || []).find((s) => s.folderPath === selectedFolder.folderPath);
            if (found) {
              setSelectedFolder(found);
              break;
            }
          }
        }
      } else {
        // Fallback to default generated tree if response folderTree was empty
        setFolderTree((prev) => (prev && prev.length > 0 ? prev : buildDefaultFolderTree(questionBank?.items || initialQuestionBank.items || [])));
      }

      if (data && Array.isArray(data.items) && data.items.length > 0) {
        if (onUpdateQuestionBank) {
          onUpdateQuestionBank({
            ...questionBank,
            items: data.items,
            folderTree: (data.folderTree && data.folderTree.length > 0) ? data.folderTree : folderTree,
            testPackages: data.testPackages || questionBank?.testPackages || []
          });
        }
      }

      if (isManual) {
        showToast(
          `Scanned 22 folders successfully. Total ${data.totalCount || data.items?.length || 0} exam items detected on disk!`,
          'success'
        );
      }
    } catch (err) {
      console.warn('Network sync with backend failed, keeping rich default folder tree:', err.message);
      setFolderTree((prev) => (prev && prev.length > 0 ? prev : buildDefaultFolderTree(questionBank?.items || initialQuestionBank.items || [])));
      if (isManual) {
        showToast('Rescan failed. Check if local backend server is running on port 3001.', 'error');
      }
    } finally {
      if (isManual) setIsRescanning(false);
    }
  };

  useEffect(() => {
    fetchTreeAndQuestions(false);
  }, []);

  // Update selectedFolder when folderTree changes if not already set
  useEffect(() => {
    if (!selectedFolder && folderTree[0]?.subfolders?.[0]) {
      setSelectedFolder(folderTree[0].subfolders[0]);
    }
  }, [folderTree, selectedFolder]);

  // Toggle Parent Folder Collapse
  const toggleParentCollapse = (key) => {
    setExpandedParents((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ==========================================
  // EXAM QUESTION SELECTOR & RANDOMIZER
  // ==========================================
  const toggleItemSelection = (id) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllInCurrentFolder = () => {
    if (!selectedFolder) return;
    const items = selectedFolder.items || [];
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      items.forEach((it) => next.add(it.id));
      return next;
    });
    showToast(`Selected all ${items.length} items in ${selectedFolder.title || 'folder'}`);
  };

  const deselectAllInCurrentFolder = () => {
    if (!selectedFolder) return;
    const items = selectedFolder.items || [];
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      items.forEach((it) => next.delete(it.id));
      return next;
    });
    showToast(`Deselected all items in ${selectedFolder.title || 'folder'}`);
  };

  /**
   * Auto-Select Official PTE Test Ratio
   * Automatically picks standard Pearson quota from each of the 22 folders
   */
  const handleAutoSelectOfficialRatio = () => {
    const allItems = questionBank?.items || [];
    if (!allItems.length) {
      showToast('No items available in question bank to select.', 'error');
      return;
    }

    // Group items by taskType
    const byType = {};
    allItems.forEach((it) => {
      if (!byType[it.taskType]) byType[it.taskType] = [];
      byType[it.taskType].push(it);
    });

    const newSelected = new Set();
    let totalDrawn = 0;

    Object.entries(OFFICIAL_ITEM_QUOTAS).forEach(([taskType, quota]) => {
      const pool = byType[taskType] || [];
      if (!pool.length) return;

      // Randomly sample according to official quota
      const shuffled = shuffleArray(pool);
      const drawn = shuffled.slice(0, quota);
      drawn.forEach((item) => newSelected.add(item.id));
      totalDrawn += drawn.length;
    });

    setSelectedItemIds(newSelected);

    // Save selection to questionBank state
    if (onUpdateQuestionBank) {
      onUpdateQuestionBank({
        ...questionBank,
        selectedItemIds: Array.from(newSelected)
      });
    }

    showToast(
      `🎲 Auto-Selected Official PTE Test Ratio: ${newSelected.size} items active for session!`,
      'success'
    );
  };

  // Randomize selection just for the current folder
  const handleRandomizeCurrentFolder = () => {
    const items = selectedFolder?.items || [];
    if (!selectedFolder || !items.length) return;
    const taskType = selectedFolder.taskType;
    const quota = OFFICIAL_ITEM_QUOTAS[taskType] || items.length;

    const shuffled = shuffleArray(items);
    const drawn = shuffled.slice(0, quota);
    const drawnIds = new Set(drawn.map((i) => i.id));

    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      // Remove all current folder items
      items.forEach((it) => next.delete(it.id));
      // Add drawn items
      drawnIds.forEach((id) => next.add(id));
      return next;
    });

    showToast(`🎲 Randomly selected ${drawn.length} items for ${selectedFolder.title || 'folder'}`);
  };

  // ==========================================
  // DIRECT DRAG-AND-DROP FILE UPLOADER
  // ==========================================
  const handleFilesUpload = async (targetFolder, filesList) => {
    if (!filesList || !filesList.length) return;
    setIsUploading(true);

    try {
      let successCount = 0;
      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        const formData = new FormData();
        formData.append('targetFolder', targetFolder);
        formData.append('file', file);

        const res = await fetch('/api/upload-question-file', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          successCount++;
        }
      }

      showToast(`Uploaded ${successCount} file(s) into ${targetFolder}`, 'success');
      // Trigger full rescan to update UI
      await fetchTreeAndQuestions(false);
    } catch (err) {
      console.error('File upload failed:', err);
      showToast('File upload failed. Ensure server.js is running.', 'error');
    } finally {
      setIsUploading(false);
      setDragOverFolderKey(null);
    }
  };

  // Drag and Drop handlers for main drop area
  const onMainDrop = (e) => {
    e.preventDefault();
    if (!selectedFolder) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesUpload(selectedFolder.folderPath, files);
    }
  };

  // Drag and Drop handlers for left-sidebar folders
  const onSidebarFolderDrop = (e, folderPath) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderKey(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesUpload(folderPath, files);
    }
  };

  // ==========================================
  // DOWNLOAD TXT FORMATTING GUIDE
  // ==========================================
  const handleDownloadTxtGuide = () => {
    const markdownContent = generateFormattingGuideMarkdown();
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PTE_Academic_TXT_Formatting_Guide.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded .TXT Formatting Guide (PTE_Academic_TXT_Formatting_Guide.md)');
  };

  // Copy active template to clipboard
  const handleCopyCurrentTemplate = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
    showToast('Copied template snippet to clipboard!');
  };

  // ==========================================
  // NEURAL TTS VOICE PREVIEW
  // ==========================================
  const openTtsPreview = (text, defaultVoice = 'en-GB-SoniaNeural', title = 'Voice Preview') => {
    stopCurrentAudio();
    setTtsState({
      isOpen: true,
      promptText: text || 'Please enter prompt text to test voice synthesis.',
      selectedVoice: defaultVoice,
      isPlaying: false,
      audioUrl: null,
      itemTitle: title,
      isLoading: false,
      statusText: ''
    });
  };

  const stopCurrentAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    stopSpeaking();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch { }
    }
    setTtsState((prev) => ({ ...prev, isPlaying: false, statusText: '' }));
  };

  const handlePlayVoicePreview = async () => {
    if (ttsState.isPlaying) {
      stopCurrentAudio();
      return;
    }

    const { promptText, selectedVoice } = ttsState;
    if (!promptText.trim()) return;

    setTtsState((prev) => ({ ...prev, isLoading: true, statusText: 'Synthesizing Studio Neural speech...' }));

    // Request Neural TTS from Express backend
    try {
      const url = `/api/tts?text=${encodeURIComponent(promptText.trim())}&voice=${encodeURIComponent(selectedVoice)}`;
      const audio = new Audio(url);
      activeAudioRef.current = audio;

      audio.onplaying = () => {
        setTtsState((prev) => ({
          ...prev,
          isLoading: false,
          isPlaying: true,
          statusText: `Studio Neural TTS (${selectedVoice})`
        }));
      };

      audio.onended = () => {
        setTtsState((prev) => ({ ...prev, isPlaying: false, statusText: 'Finished playback.' }));
      };

      audio.onerror = (e) => {
        console.warn('Backend Edge TTS unreachable or audio load failed, falling back to browser speech:', e);
        fallbackToBrowserSpeech(promptText, selectedVoice);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback rejected by browser policy, falling back:', err);
          fallbackToBrowserSpeech(promptText, selectedVoice);
        });
      }
    } catch (err) {
      console.warn('Exception during TTS audio request:', err);
      fallbackToBrowserSpeech(promptText, selectedVoice);
    }
  };

  const fallbackToBrowserSpeech = (text, voiceCode) => {
    const matchedVoice = VOICE_OPTIONS.find((v) => v.code === voiceCode);
    const accent = matchedVoice ? matchedVoice.accent : 'en-GB';

    setTtsState((prev) => ({
      ...prev,
      isLoading: false,
      isPlaying: true,
      statusText: `⚠️ Browser Local Speech (${accent})`
    }));

    fallbackSpeechSynthesis(
      text,
      false,
      () => {
        setTtsState((prev) => ({ ...prev, isPlaying: false, statusText: 'Finished playback.' }));
      },
      { accent }
    );
  };

  // Helper metrics
  const totalQuestionsInBank = (questionBank?.items || []).length;
  const totalSelectedCount = selectedItemIds.size;
  const currentFolderTemplate = selectedFolder ? TASK_TEMPLATES[selectedFolder.folderName] : null;

  // Filtered items in current folder
  const currentFolderItems = (selectedFolder?.items || []).filter((item) => {
    if (filterMode === 'selected' && !selectedItemIds.has(item.id)) return false;
    if (filterMode === 'unselected' && selectedItemIds.has(item.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inId = item.id.toLowerCase().includes(q);
      const inPrompt = (item.prompt || item.audioText || item.referenceText || '').toLowerCase().includes(q);
      const inTitle = (item.title || '').toLowerCase().includes(q);
      return inId || inPrompt || inTitle;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ==========================================
          TOP ACTION BAR & CONTROLS
          ========================================== */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#003865] text-white rounded-lg shadow-xs">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Question Bank & Layered Folder Explorer
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-[#003865] rounded-full">
                    22 Standard Folders
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Manage disk questions, drop new .txt files, auto-select official exam quotas, and preview neural voices.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Creation Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setShowAiGeneratorModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition-all active:scale-95"
                title="Synthesize and bulk-generate authentic Pearson exam items using Cloud AI or Local LLM"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>AI Generator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'builder' ? 'explorer' : 'builder')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95 ${activeTab === 'builder'
                    ? 'bg-slate-800 hover:bg-slate-900 text-white'
                    : 'bg-[#003865] hover:bg-[#002847] text-white'
                  }`}
                title="Open dynamic question creator with adaptive inputs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-200" />
                <span>{activeTab === 'builder' ? 'Folder Explorer' : 'Manual Builder'}</span>
              </button>
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1"></div>

            {/* Utility Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleAutoSelectOfficialRatio}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
                title="Automatically picks the standard Pearson exam quotas (6 RA, 10 RS, 6 DI, etc.)"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Official Quota</span>
              </button>

              <button
                type="button"
                onClick={() => fetchTreeAndQuestions(true)}
                disabled={isRescanning}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${isRescanning
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs active:scale-95'
                  }`}
                title="Re-reads question_bank/ from disk immediately"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>{isRescanning ? 'Scanning...' : 'Rescan'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxtGuide}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all active:scale-95"
                title="Download formatting cheat sheet for all 22 folders"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>TXT Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusBanner && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-center justify-between text-xs font-medium animate-fadeIn ${statusBanner.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
          >
            <div className="flex items-center gap-2">
              {statusBanner.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{statusBanner.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Global Stats Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200/80">
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Disk Bank: <strong className="font-bold text-slate-900">{totalQuestionsInBank}</strong> items</span>
            </div>
            <div
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-semibold border ${totalSelectedCount >= 67
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Quota: <strong className="font-bold">{totalSelectedCount}</strong> / 67 Items Selected</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live FS Sync (<code className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">question_bank/</code>)</span>
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN EXPLORER LAYOUT: SIDEBAR + CONTENT
          ========================================== */}
      {activeTab === 'builder' ? (
        <DynamicQuestionEditor
          initialTaskFolder={editingItem?.folderPath || selectedFolder?.folderName || '01_Read_Aloud'}
          existingQuestions={questionBank?.items || []}
          initialQuestion={editingItem}
          onSaved={async () => {
            setEditingItem(null);
            await fetchTreeAndQuestions(true);
            setActiveTab('explorer');
          }}
          onCancel={() => {
            setEditingItem(null);
            setActiveTab('explorer');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ==========================================
            LEFT SIDEBAR: 3-LAYER FOLDER TREE UI
            ========================================== */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col h-[750px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question Bank Tree
                </h3>
                <p className="text-[11px] text-slate-400">
                  Drag files onto any folder to upload
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                3 Parts / 22 Tasks
              </span>
            </div>

            {/* Folder Tree Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
              {((folderTree && folderTree.length > 0)
                ? folderTree
                : buildDefaultFolderTree(questionBank?.items || initialQuestionBank.items || [])
              ).map((parent) => {
                const isExpanded = expandedParents[parent.key] !== false;
                const parentSelectedCount = (parent.subfolders || []).reduce(
                  (sum, sub) => sum + (sub.items || []).filter((it) => selectedItemIds.has(it.id)).length,
                  0
                );

                return (
                  <div key={parent.key} className="rounded-lg border border-slate-100 overflow-hidden bg-slate-50/50">
                    {/* Parent Folder Header */}
                    <div
                      onClick={() => toggleParentCollapse(parent.key)}
                      className="flex items-center justify-between p-2.5 bg-slate-100 hover:bg-slate-200/80 cursor-pointer transition-colors select-none"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <Folder className="w-4 h-4 text-[#003865]" />
                        <span className="text-xs font-bold text-slate-800">
                          {parent.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 bg-white text-slate-600 rounded border border-slate-200">
                          {parentSelectedCount}/{parent.totalQuestions || 0}
                        </span>
                      </div>
                    </div>

                    {/* Subfolders List */}
                    {isExpanded && (
                      <div className="p-1 space-y-1 bg-white">
                        {(parent.subfolders || []).map((sub) => {
                          const isSelected = selectedFolder?.folderPath === sub.folderPath;
                          const isDragHover = dragOverFolderKey === sub.folderPath;
                          const subSelectedCount = (sub.items || []).filter((it) => selectedItemIds.has(it.id)).length;

                          return (
                            <div
                              key={sub.folderPath}
                              onClick={() => setSelectedFolder(sub)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverFolderKey(sub.folderPath);
                              }}
                              onDragLeave={() => setDragOverFolderKey(null)}
                              onDrop={(e) => onSidebarFolderDrop(e, sub.folderPath)}
                              className={`group p-2 rounded-lg cursor-pointer transition-all border ${isDragHover
                                  ? 'bg-blue-100 border-dashed border-2 border-blue-500 scale-[1.01]'
                                  : isSelected
                                    ? 'bg-blue-50/80 border-[#003865] shadow-xs'
                                    : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FolderOpen
                                    className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#003865]' : 'text-slate-400 group-hover:text-slate-600'
                                      }`}
                                  />
                                  <span
                                    className={`text-xs font-medium truncate ${isSelected ? 'text-[#003865] font-bold' : 'text-slate-700'
                                      }`}
                                  >
                                    {sub.folderName}
                                  </span>
                                </div>

                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {sub.taskType}
                                </span>
                              </div>

                              {/* Live File Counts Badges */}
                              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                                {/* .txt count */}
                                <span
                                  className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono"
                                  title="Text files detected"
                                >
                                  <FileText className="w-2.5 h-2.5 text-blue-500" />
                                  {sub.txtCount || (sub.items || []).length || 0} txt
                                </span>

                                {/* .mp3 / audio count */}
                                {sub.audioCount > 0 && (
                                  <span
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded font-mono"
                                    title="Audio files detected"
                                  >
                                    <FileAudio className="w-2.5 h-2.5 text-cyan-600" />
                                    {sub.audioCount} mp3
                                  </span>
                                )}

                                {/* .png / image count */}
                                {sub.imageCount > 0 && (
                                  <span
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-mono"
                                    title="Image files detected"
                                  >
                                    <ImageIcon className="w-2.5 h-2.5 text-purple-600" />
                                    {sub.imageCount} img
                                  </span>
                                )}

                                {/* Selected check count */}
                                <span
                                  className={`ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${subSelectedCount > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-400'
                                    }`}
                                  title="Items selected for current mock exam"
                                >
                                  {subSelectedCount}/{(sub.items || []).length}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer Hint */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Tip: Drag files directly onto any folder</span>
              <span className="font-mono text-slate-400">Total: 22</span>
            </div>
          </div>

          {/* ==========================================
            MAIN CONTENT PANE: FOLDER DETAILS & ITEMS
            ========================================== */}
          <div className="lg:col-span-8 space-y-4">
            {selectedFolder ? (
              <>
                {/* Folder Header Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span>question_bank</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span>{selectedFolder.part}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="font-bold text-[#003865]">{selectedFolder.folderName}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                        {selectedFolder.title}
                        <span className="px-2 py-0.5 bg-blue-100 text-[#003865] rounded text-xs font-mono font-bold">
                          {selectedFolder.taskType}
                        </span>
                      </h3>
                    </div>

                    {/* Quota & Quick Randomize for this folder */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                        Official Quota: <strong>{OFFICIAL_ITEM_QUOTAS[selectedFolder.taskType] || 'All'}</strong> items
                      </span>

                      <button
                        type="button"
                        onClick={handleRandomizeCurrentFolder}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-all active:scale-95"
                        title="Randomly picks official quota items in this folder"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        Randomize ({OFFICIAL_ITEM_QUOTAS[selectedFolder.taskType] || 2})
                      </button>

                      <button
                        type="button"
                        onClick={selectAllInCurrentFolder}
                        className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllInCurrentFolder}
                        className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Deselect
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('builder')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#003865] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors active:scale-95 shadow-2xs"
                        title="Create a new question in this folder"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Question
                      </button>
                    </div>
                  </div>

                  {/* Direct Drag & Drop Upload Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onMainDrop}
                    className="mt-4 p-4 border-2 border-dashed border-slate-300 hover:border-[#003865] rounded-xl bg-slate-50/70 hover:bg-blue-50/40 transition-all text-center flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept=".txt,.mp3,.wav,.png,.jpg,.jpeg,.webp,.svg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          handleFilesUpload(selectedFolder.folderPath, e.target.files);
                        }
                      }}
                    />
                    <div className="p-2 bg-white rounded-full shadow-xs mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-[#003865]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {isUploading ? (
                        <span className="text-blue-600 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading to disk...
                        </span>
                      ) : (
                        <>
                          Drag & Drop <span className="font-mono text-[#003865]">.txt</span>,{' '}
                          <span className="font-mono text-[#003865]">.mp3/.wav</span>, or{' '}
                          <span className="font-mono text-[#003865]">.png/.svg</span> files here
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Files will be written to <span className="font-mono text-slate-600">question_bank/{selectedFolder.folderPath}/</span>
                    </p>
                  </div>
                </div>

                {/* Inline .TXT Template Cheat Sheet */}
                {currentFolderTemplate && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div
                      onClick={() => setShowCheatSheetDrawer(!showCheatSheetDrawer)}
                      className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">
                          📄 .TXT Formatting Cheat Sheet for {selectedFolder.folderName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCurrentTemplate(currentFolderTemplate.sampleContent);
                          }}
                          className="flex items-center gap-1 text-[11px] px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 shadow-2xs transition-all active:scale-95"
                        >
                          {copiedTemplate ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedTemplate ? 'Copied!' : 'Copy Template'}
                        </button>

                        {showCheatSheetDrawer ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {showCheatSheetDrawer && (
                      <div className="p-4 border-t border-slate-100 bg-slate-900 text-slate-100 font-mono text-xs rounded-b-xl">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800 mb-2">
                          <span>Convention: {currentFolderTemplate.description}</span>
                          <span>Sample: {currentFolderTemplate.sampleFileName}</span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-emerald-300">
                          {currentFolderTemplate.sampleContent}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Question Items Filter & Search Bar */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search within ${selectedFolder.title} (ID, prompt, notes)...`}
                      className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px] mr-1">Filter:</span>
                    <button
                      type="button"
                      onClick={() => setFilterMode('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${filterMode === 'all'
                          ? 'bg-[#003865] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      All ({(selectedFolder?.items || []).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('selected')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${filterMode === 'selected'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Selected ({(selectedFolder?.items || []).filter((i) => selectedItemIds.has(i.id)).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('unselected')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${filterMode === 'unselected'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Unselected ({(selectedFolder?.items || []).filter((i) => !selectedItemIds.has(i.id)).length})
                    </button>
                  </div>
                </div>

                {/* Question Items List */}
                <div className="space-y-3">
                  {currentFolderItems.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">No question files match your criteria</p>
                      <p className="text-xs text-slate-400">
                        Drag and drop a new <span className="font-mono">.txt</span> file into the zone above or generate with AI.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAiGeneratorModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 transition active:scale-95 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Generate {selectedFolder?.title || 'Questions'} with AI</span>
                      </button>
                    </div>
                  ) : (
                    currentFolderItems.map((item) => {
                      const isSelected = selectedItemIds.has(item.id);
                      const promptPreview = item.prompt || item.audioText || item.referenceText || item.passage || '';

                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-xl border transition-all p-4 shadow-xs ${isSelected
                              ? 'border-emerald-300 bg-emerald-50/10'
                              : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Checkbox & ID */}
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleItemSelection(item.id)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-300" />
                                )}
                              </button>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-bold text-sm text-slate-900">{item.id}</span>
                                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                    {item.title || item.taskType}
                                  </span>
                                  {isSelected ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Included in Exam
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                      Excluded
                                    </span>
                                  )}

                                  {item.promptWords && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {item.promptWords} words
                                    </span>
                                  )}
                                </div>

                                {/* Prompt text preview */}
                                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed font-sans">
                                  {promptPreview}
                                </p>

                                {/* Extra Task Details (e.g., Image Preview or Options preview) */}
                                {item.imageUrl && (
                                  <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                                      <span>Paired Chart Media:</span>
                                      <a
                                        href={item.imageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline font-mono text-[11px]"
                                      >
                                        {item.imageUrl.split('/').pop()}
                                      </a>
                                    </div>
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="max-h-36 rounded border border-slate-200 bg-white"
                                    />
                                  </div>
                                )}

                                {item.options && Array.isArray(item.options) && (
                                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                                    {item.options.slice(0, 4).map((opt) => (
                                      <span
                                        key={opt.id}
                                        className={`px-2 py-0.5 rounded border ${opt.correct
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                          }`}
                                      >
                                        {opt.id}) {typeof opt.text === 'string' ? opt.text.slice(0, 30) : ''}
                                        {opt.text?.length > 30 ? '...' : ''}
                                      </span>
                                    ))}
                                    {item.options.length > 4 && (
                                      <span className="text-slate-400 text-[10px] self-center">
                                        +{item.options.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons: Edit Question & Preview Neural TTS Voice */}
                            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(item);
                                  setActiveTab('builder');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-all active:scale-95"
                                title="Edit question text, prompts, audio, timers, or scoring"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                <span>✏️ Edit Question</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openTtsPreview(
                                    promptPreview,
                                    item.voiceAccent || 'en-GB-SoniaNeural',
                                    `${item.id} (${item.title || item.taskType})`
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#003865] rounded-lg text-xs font-semibold border border-blue-200 transition-all active:scale-95"
                                title="Preview prompt with Microsoft Edge Neural Voices (UK/US/AU)"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>🔊 Preview Neural Voice</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Select a Task Folder from the Sidebar</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Explore any of the 22 Pearson task subfolders, view live file counts, customize active session items, or drag and drop new question files.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          NEURAL TTS VOICE PREVIEW MODAL / DRAWER
          ========================================== */}
      {ttsState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-scaleIn">
            <div className="p-4 bg-[#003865] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-300" />
                <h3 className="text-sm font-bold tracking-tight">
                  Neural Text-to-Speech Studio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCurrentAudio();
                  setTtsState((prev) => ({ ...prev, isOpen: false }));
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Question Prompt
                </span>
                <p className="text-xs font-semibold text-slate-800">{ttsState.itemTitle}</p>
                <textarea
                  rows={4}
                  value={ttsState.promptText}
                  onChange={(e) => setTtsState({ ...ttsState, promptText: e.target.value })}
                  className="w-full mt-1.5 p-3 text-xs text-slate-800 border border-slate-300 rounded-lg focus:border-[#003865] focus:outline-hidden font-sans leading-relaxed"
                  placeholder="Type or paste prompt text to synthesize..."
                />
              </div>

              {/* Voice Accent Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select International Neural Voice:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VOICE_OPTIONS.map((voice) => {
                    const isSelected = ttsState.selectedVoice === voice.code;
                    return (
                      <div
                        key={voice.code}
                        onClick={() => {
                          stopCurrentAudio();
                          setTtsState((prev) => ({ ...prev, selectedVoice: voice.code }));
                        }}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${isSelected
                            ? 'bg-blue-50 border-[#003865] text-[#003865] shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                      >
                        <span className="text-lg">{voice.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{voice.label}</p>
                          <p className="text-[10px] font-mono text-slate-400">{voice.code}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Synthesis Status Pill */}
              {ttsState.statusText && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-2 text-slate-600">
                  {ttsState.isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : ttsState.isPlaying ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{ttsState.statusText}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Studio HD 48kHz / Edge Neural Audio
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCurrentAudio();
                      setTtsState((prev) => ({ ...prev, isOpen: false }));
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayVoicePreview}
                    disabled={ttsState.isLoading}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 ${ttsState.isPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#003865] hover:bg-[#002847] text-white'
                      }`}
                  >
                    {ttsState.isPlaying ? (
                      <>
                        <StopSquare className="w-3.5 h-3.5" />
                        Stop Playback
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        {ttsState.isLoading ? 'Synthesizing...' : 'Play Neural Speech'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Question Generator Modal */}
      <AiQuestionGeneratorModal
        isOpen={showAiGeneratorModal}
        onClose={() => setShowAiGeneratorModal(false)}
        onSaveToQuestionBank={async () => {
          await fetchTreeAndQuestions(true);
          showToast('AI Questions generated and successfully saved to question bank!', 'success');
        }}
      />
    </div>
  );
}
