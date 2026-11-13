import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Upload,
  Volume2,
  Mic,
  MicOff,
  Play,
  Square,
  Plus,
  Trash2,
  Image as ImageIcon,
  BarChart3,
  MoveUp,
  MoveDown,
  Check,
  CheckSquare,
  RefreshCw,
  FileText,
  Sparkles,
  Eye,
  HelpCircle,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { TASK_TEMPLATES } from '../../utils/questionTemplates';
import { speakText, stopSpeaking } from '../../utils/audioUtils';

const VOICE_OPTIONS = [
  { code: 'en-GB-SoniaNeural', label: 'British English (Sonia - Female)', flag: '🇬🇧', accent: 'en-GB' },
  { code: 'en-GB-RyanNeural', label: 'British English (Ryan - Male)', flag: '🇬🇧', accent: 'en-GB' },
  { code: 'en-US-AriaNeural', label: 'American English (Aria - Female)', flag: '🇺🇸', accent: 'en-US' },
  { code: 'en-US-GuyNeural', label: 'American English (Guy - Male)', flag: '🇺🇸', accent: 'en-US' },
  { code: 'en-AU-NatashaNeural', label: 'Australian English (Natasha - Female)', flag: '🇦🇺', accent: 'en-AU' },
  { code: 'en-AU-WilliamNeural', label: 'Australian English (William - Male)', flag: '🇦🇺', accent: 'en-AU' }
];

export const TASK_LIST = [
  // Part 1
  { folderName: '01_Read_Aloud', taskType: 'RA', parentKey: 'Part1_Speaking_Writing', label: '01. Read Aloud (RA)', part: 'PART_1' },
  { folderName: '02_Repeat_Sentence', taskType: 'RS', parentKey: 'Part1_Speaking_Writing', label: '02. Repeat Sentence (RS)', part: 'PART_1' },
  { folderName: '03_Describe_Image', taskType: 'DI', parentKey: 'Part1_Speaking_Writing', label: '03. Describe Image (DI)', part: 'PART_1' },
  { folderName: '04_Retell_Lecture', taskType: 'RL', parentKey: 'Part1_Speaking_Writing', label: '04. Retell Lecture (RL)', part: 'PART_1' },
  { folderName: '05_Summarize_Group_Discussion', taskType: 'SGD', parentKey: 'Part1_Speaking_Writing', label: '05. Summarize Group Discussion (SGD)', part: 'PART_1' },
  { folderName: '06_Respond_to_Situation', taskType: 'RTS', parentKey: 'Part1_Speaking_Writing', label: '06. Respond to Situation (RTS)', part: 'PART_1' },
  { folderName: '07_Answer_Short_Question', taskType: 'ASQ', parentKey: 'Part1_Speaking_Writing', label: '07. Answer Short Question (ASQ)', part: 'PART_1' },
  { folderName: '08_Summarize_Written_Text', taskType: 'SWT', parentKey: 'Part1_Speaking_Writing', label: '08. Summarize Written Text (SWT)', part: 'PART_1' },
  { folderName: '09_Write_Essay', taskType: 'WE', parentKey: 'Part1_Speaking_Writing', label: '09. Write Essay (WE)', part: 'PART_1' },

  // Part 2
  { folderName: '01_FIB_Dropdown', taskType: 'FIB-RW', parentKey: 'Part2_Reading', label: '01. FIB Dropdown (Reading & Writing)', part: 'PART_2' },
  { folderName: '02_MC_Multiple_Answers', taskType: 'MCMA-R', parentKey: 'Part2_Reading', label: '02. MC Multiple Answers (Reading)', part: 'PART_2' },
  { folderName: '03_Reorder_Paragraphs', taskType: 'RO-R', parentKey: 'Part2_Reading', label: '03. Reorder Paragraphs (Reading)', part: 'PART_2' },
  { folderName: '04_FIB_Drag_and_Drop', taskType: 'FIB-R', parentKey: 'Part2_Reading', label: '04. FIB Drag & Drop (Reading)', part: 'PART_2' },
  { folderName: '05_MC_Single_Answer', taskType: 'MCSA-R', parentKey: 'Part2_Reading', label: '05. MC Single Answer (Reading)', part: 'PART_2' },

  // Part 3
  { folderName: '01_Summarize_Spoken_Text', taskType: 'SST', parentKey: 'Part3_Listening', label: '01. Summarize Spoken Text (SST)', part: 'PART_3' },
  { folderName: '02_MC_Multiple_Answers', taskType: 'MCMA-L', parentKey: 'Part3_Listening', label: '02. MC Multiple Answers (Listening)', part: 'PART_3' },
  { folderName: '03_FIB_Type_In', taskType: 'FIB-L', parentKey: 'Part3_Listening', label: '03. FIB Type-In (Listening)', part: 'PART_3' },
  { folderName: '04_Highlight_Correct_Summary', taskType: 'HCS', parentKey: 'Part3_Listening', label: '04. Highlight Correct Summary (HCS)', part: 'PART_3' },
  { folderName: '05_MC_Single_Answer', taskType: 'MCSA-L', parentKey: 'Part3_Listening', label: '05. MC Single Answer (Listening)', part: 'PART_3' },
  { folderName: '06_Select_Missing_Word', taskType: 'SMW', parentKey: 'Part3_Listening', label: '06. Select Missing Word (SMW)', part: 'PART_3' },
  { folderName: '07_Highlight_Incorrect_Words', taskType: 'HIW', parentKey: 'Part3_Listening', label: '07. Highlight Incorrect Words (HIW)', part: 'PART_3' },
  { folderName: '08_Write_From_Dictation', taskType: 'WFD', parentKey: 'Part3_Listening', label: '08. Write From Dictation (WFD)', part: 'PART_3' }
];

export default function DynamicQuestionEditor({
  initialTaskFolder = '01_Read_Aloud',
  existingQuestions = [],
  onSaved,
  onCancel,
  initialQuestion = null
}) {
  const [selectedTask, setSelectedTask] = useState(() => {
    if (initialQuestion?.folderPath) {
      const match = TASK_LIST.find((t) => initialQuestion.folderPath.includes(t.folderName));
      if (match) return match;
    }
    if (initialQuestion?.taskType) {
      const match = TASK_LIST.find((t) => t.taskType === initialQuestion.taskType);
      if (match) return match;
    }
    return TASK_LIST.find((t) => t.folderName === initialTaskFolder) || TASK_LIST[0];
  });

  const [questionId, setQuestionId] = useState(initialQuestion?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Common Fields
  const [title, setTitle] = useState(initialQuestion?.title || '');
  const [promptText, setPromptText] = useState(initialQuestion?.prompt || initialQuestion?.referenceText || '');
  const [referenceNotes, setReferenceNotes] = useState(initialQuestion?.referenceNotes || '');
  const [selectedVoice, setSelectedVoice] = useState(initialQuestion?.voiceAccent || 'en-GB-SoniaNeural');
  const [prepSeconds, setPrepSeconds] = useState(
    initialQuestion?.timingOverrides?.prepSeconds ?? initialQuestion?.prepSeconds ?? 35
  );
  const [recordSeconds, setRecordSeconds] = useState(
    initialQuestion?.timingOverrides?.recordSeconds ?? initialQuestion?.recordSeconds ?? 40
  );
  const [dedicatedTimerSeconds, setDedicatedTimerSeconds] = useState(
    initialQuestion?.timingOverrides?.timerSeconds ?? initialQuestion?.timerSeconds ?? 0
  );
  const [pointsPerCorrect, setPointsPerCorrect] = useState(
    initialQuestion?.scoringOverrides?.pointsPerCorrect ?? initialQuestion?.pointsPerCorrect ?? 1
  );
  const [penaltyPerIncorrect, setPenaltyPerIncorrect] = useState(
    initialQuestion?.scoringOverrides?.penaltyPerIncorrect ?? initialQuestion?.penaltyPerIncorrect ?? 0
  );
  const [minWords, setMinWords] = useState(
    initialQuestion?.timingOverrides?.minWords ?? initialQuestion?.minWords ?? 0
  );
  const [maxWords, setMaxWords] = useState(
    initialQuestion?.timingOverrides?.maxWords ?? initialQuestion?.maxWords ?? 0
  );
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [autoGenerateTts, setAutoGenerateTts] = useState(true);

  // Audio Source: 'tts' | 'upload' | 'record'
  const [audioSource, setAudioSource] = useState('tts');
  const [audioTranscript, setAudioTranscript] = useState(initialQuestion?.audioText || '');
  const [uploadedAudioData, setUploadedAudioData] = useState(null); // { fileName, dataUrl }

  // Mic Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Image Source for DI: 'upload' | 'svg_chart'
  const [imageSource, setImageSource] = useState('upload');
  const [uploadedImageData, setUploadedImageData] = useState(null); // { fileName, dataUrl }
  const [svgChartType, setSvgChartType] = useState('bar'); // 'bar' | 'line' | 'pie'
  const [svgChartTitle, setSvgChartTitle] = useState('Renewable Energy Adoption (2015-2025)');
  const [svgDataItems, setSvgDataItems] = useState([
    { label: 'Solar PV', value: 64 },
    { label: 'Wind Power', value: 52 },
    { label: 'Hydroelectric', value: 39 },
    { label: 'Biomass', value: 21 }
  ]);

  // Multi-Speaker Group Discussion (SGD)
  const [speakers, setSpeakers] = useState([
    { name: 'Speaker 1 (Student Rep)', text: 'Higher education should be universally state-funded because tuition fees exacerbate socioeconomic disparity.', voice: 'en-GB-SoniaNeural' },
    { name: 'Speaker 2 (Economics Professor)', text: 'While universal subsidies sound equitable, evidence suggests public funding without merit incentives can strain national budgets and lower per-student teaching resources.', voice: 'en-US-GuyNeural' },
    { name: 'Speaker 3 (Policy Advisor)', text: 'A balanced compromise is income-contingent loans or targeted grants for underprivileged demographics rather than blanket subsidies.', voice: 'en-AU-NatashaNeural' }
  ]);

  // Multiple Choice Options (MCMA, MCSA, HCS, SMW)
  const [mcQuestion, setMcQuestion] = useState('');
  const [mcOptions, setMcOptions] = useState([
    { id: 'A', text: '', correct: true },
    { id: 'B', text: '', correct: false },
    { id: 'C', text: '', correct: false },
    { id: 'D', text: '', correct: false }
  ]);

  // Cloze Dropdown (FIB-RW)
  const [fibRwText, setFibRwText] = useState('');
  const [newDropdownBlank, setNewDropdownBlank] = useState({ correct: '', distractor1: '', distractor2: '', distractor3: '' });

  // Cloze Drag & Drop (FIB-R)
  const [fibRText, setFibRText] = useState('');
  const [fibRDistractors, setFibRDistractors] = useState(['troposphere', 'illumination', 'amplified']);
  const [newDistractorInput, setNewDistractorInput] = useState('');

  // Reorder Paragraphs (RO-R)
  const [paragraphs, setParagraphs] = useState([
    'In the mid-fifteenth century, Johannes Gutenberg perfected the movable metal-type printing press in Mainz, Germany.',
    'Prior to this mechanical breakthrough, European manuscripts were laboriously copied by hand in monastic scriptoria.',
    'This technological innovation exponentially reduced the labor and cost required to reproduce texts.',
    'Consequently, scientific ideas and literacy spread across the continent at an unprecedented speed, accelerating the Renaissance.'
  ]);

  // Highlight Incorrect Words (HIW)
  const [hiwFullText, setHiwFullText] = useState('');
  const [hiwReplacements, setHiwReplacements] = useState([]); // [{ spoken: 'boundary', written: 'weather' }]

  // Short Question (ASQ)
  const [asqQuestion, setAsqQuestion] = useState('');
  const [asqAnswers, setAsqAnswers] = useState('thermometer, a thermometer');

  // Previewing TTS Audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const activeAudioRef = useRef(null);

  // Auto-suggest next ID based on existing questions
  useEffect(() => {
    const prefix = selectedTask.taskType.replace('-R', '').replace('-L', '').replace('-RW', '');
    const folderQuestions = existingQuestions.filter(
      (q) => q.folderPath?.includes(selectedTask.folderName) || q.taskType === selectedTask.taskType
    );
    const nextNum = folderQuestions.length + 1;
    setQuestionId(`${selectedTask.taskType}-${String(nextNum).padStart(2, '0')}`);

    // Prepopulate with task template if available
    const tmplKey = Object.keys(TASK_TEMPLATES).find((k) => k.startsWith(selectedTask.folderName)) || selectedTask.folderName;
    const tmpl = TASK_TEMPLATES[tmplKey];
    if (tmpl) {
      setTitle(`${tmpl.title} (${selectedTask.taskType}-${String(nextNum).padStart(2, '0')})`);
      if (['RA', 'RS', 'SWT', 'WE', 'WFD'].includes(selectedTask.taskType)) {
        setPromptText(tmpl.sampleContent);
      } else if (['RL', 'RTS', 'SST'].includes(selectedTask.taskType)) {
        setAudioTranscript(tmpl.sampleContent);
      } else if (selectedTask.taskType === 'FIB-RW') {
        setFibRwText(tmpl.sampleContent);
      } else if (selectedTask.taskType === 'FIB-R') {
        setFibRText(tmpl.sampleContent);
      } else if (selectedTask.taskType === 'FIB-L') {
        setPromptText(tmpl.sampleContent);
      } else if (selectedTask.taskType === 'HIW') {
        setHiwFullText(tmpl.sampleContent);
      }
    }
  }, [selectedTask, existingQuestions]);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Word Counter Helper
  const wordCount = (text = '') => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // ==========================================
  // MIC RECORDING LOGIC
  // ==========================================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setUploadedAudioData({
            fileName: `${questionId}.webm`,
            dataUrl: reader.result
          });
          setRecordedAudioUrl(URL.createObjectURL(audioBlob));
          showToast('Audio recorded successfully! Ready to save.');
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      showToast('Could not access microphone. Please check browser permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // ==========================================
  // AUDIO PLAYBACK TEST
  // ==========================================
  const playPreviewAudio = (textToSpeak) => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    if (uploadedAudioData?.dataUrl) {
      const audio = new Audio(uploadedAudioData.dataUrl);
      activeAudioRef.current = audio;
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      return;
    }

    if (textToSpeak && textToSpeak.trim()) {
      setIsPlayingAudio(true);
      const url = `/api/tts?text=${encodeURIComponent(textToSpeak.trim())}&voice=${encodeURIComponent(selectedVoice)}`;
      const audio = new Audio(url);
      activeAudioRef.current = audio;

      audio.play().catch(() => {
        speakText(textToSpeak, () => setIsPlayingAudio(false), { accent: selectedVoice.slice(0, 5) });
      });

      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        speakText(textToSpeak, () => setIsPlayingAudio(false), { accent: selectedVoice.slice(0, 5) });
      };
    }
  };

  const stopAudioPlayback = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    stopSpeaking();
    setIsPlayingAudio(false);
  };

  // ==========================================
  // SVG CHART BUILDER (FOR DESCRIBE IMAGE)
  // ==========================================
  const renderSvgChartPreview = () => {
    return (
      <svg viewBox="0 0 500 280" className="w-full h-auto bg-slate-900 rounded-lg p-4 font-sans">
        <text x="250" y="30" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="bold">
          {svgChartTitle || 'Academic Chart'}
        </text>

        {svgChartType === 'bar' && (
          <g transform="translate(40, 50)">
            {/* Axis lines */}
            <line x1="0" y1="0" x2="0" y2="180" stroke="#64748b" strokeWidth="2" />
            <line x1="0" y1="180" x2="420" y2="180" stroke="#64748b" strokeWidth="2" />

            {svgDataItems.map((item, idx) => {
              const barWidth = 60;
              const x = 30 + idx * 95;
              const maxVal = 100;
              const barHeight = (item.value / maxVal) * 160;
              const y = 180 - barHeight;
              const colors = ['#38bdf8', '#34d399', '#f59e0b', '#ec4899'];
              const fill = colors[idx % colors.length];

              return (
                <g key={idx}>
                  <rect x={x} y={y} width={barWidth} height={barHeight} fill={fill} rx="4" />
                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                    {item.value}%
                  </text>
                  <text x={x + barWidth / 2} y="198" textAnchor="middle" fill="#94a3b8" fontSize="10">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    );
  };

  const getSvgString = () => {
    const bars = svgDataItems
      .map((item, idx) => {
        const barWidth = 60;
        const x = 30 + idx * 95;
        const barHeight = (item.value / 100) * 160;
        const y = 180 - barHeight;
        const colors = ['#38bdf8', '#34d399', '#f59e0b', '#ec4899'];
        return `<g><rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[idx % colors.length]}" rx="4"/><text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">${item.value}%</text><text x="${x + barWidth / 2}" y="198" text-anchor="middle" fill="#94a3b8" font-size="10">${item.label}</text></g>`;
      })
      .join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" style="background:#0f172a; font-family: sans-serif;"><text x="250" y="30" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="bold">${svgChartTitle}</text><g transform="translate(40, 50)"><line x1="0" y1="0" x2="0" y2="180" stroke="#64748b" stroke-width="2"/><line x1="0" y1="180" x2="420" y2="180" stroke="#64748b" stroke-width="2"/>${bars}</g></svg>`;
  };

  // ==========================================
  // COMPOSE .TXT CONTENT BASED ON TASK TYPE
  // ==========================================
  const generateTxtContent = () => {
    const taskType = selectedTask.taskType;

    // 1. Plain Text Speaking/Writing (RA, RS, SWT, WE, WFD)
    if (['RA', 'RS', 'SWT', 'WE', 'WFD'].includes(taskType)) {
      return promptText.trim();
    }

    // 2. Describe Image (DI)
    if (taskType === 'DI') {
      let txt = `TITLE: ${title || svgChartTitle}\n`;
      txt += `CHART_TYPE: ${svgChartType.toUpperCase()} Chart\n`;
      txt += `DATA:\n`;
      svgDataItems.forEach((d) => {
        txt += `- ${d.label}: ${d.value}%\n`;
      });
      if (referenceNotes.trim()) {
        txt += `NOTES: ${referenceNotes.trim()}\n`;
      }
      return txt;
    }

    // 3. Audio / Retell Lecture / Respond to Situation / SST
    if (['RL', 'RTS', 'SST'].includes(taskType)) {
      if (promptText.trim() && audioTranscript.trim()) {
        return `PROMPT:\n${promptText.trim()}\n\nTRANSCRIPT:\n${audioTranscript.trim()}`;
      }
      return audioTranscript.trim() || promptText.trim();
    }

    // 4. Summarize Group Discussion (SGD)
    if (taskType === 'SGD') {
      let txt = '';
      speakers.forEach((s) => {
        txt += `${s.name}: ${s.text}\n`;
      });
      return txt.trim();
    }

    // 5. Multiple Choice (MCMA-R, MCSA-R, MCMA-L, MCSA-L, HCS, SMW)
    if (['MCMA-R', 'MCSA-R', 'MCMA-L', 'MCSA-L', 'HCS', 'SMW'].includes(taskType)) {
      let txt = '';
      if (['MCMA-R', 'MCSA-R'].includes(taskType)) {
        txt += `PASSAGE:\n${promptText.trim()}\n\n`;
      } else {
        txt += `AUDIO:\n${audioTranscript.trim() || promptText.trim()}\n\n`;
      }

      if (mcQuestion.trim()) {
        txt += `QUESTION:\n${mcQuestion.trim()}\n\n`;
      }

      txt += `OPTIONS:\n`;
      mcOptions.forEach((opt) => {
        txt += `${opt.id}) ${opt.text.trim()}\n`;
      });

      const correctIds = mcOptions.filter((o) => o.correct).map((o) => o.id);
      txt += `\nANSWER: ${correctIds.join(', ')}`;
      return txt;
    }

    // 6. Cloze Dropdown (FIB-RW)
    if (taskType === 'FIB-RW') {
      return fibRwText.trim();
    }

    // 7. Cloze Drag & Drop (FIB-R)
    if (taskType === 'FIB-R') {
      let txt = fibRText.trim();
      if (fibRDistractors.length > 0) {
        txt += `\n\nDISTRACTORS: ${fibRDistractors.join(', ')}`;
      }
      return txt;
    }

    // 8. Cloze Listening Type-In (FIB-L)
    if (taskType === 'FIB-L') {
      return promptText.trim();
    }

    // 9. Reorder Paragraphs (RO-R)
    if (taskType === 'RO-R') {
      return paragraphs.filter((p) => p.trim()).join('\n');
    }

    // 10. Highlight Incorrect Words (HIW)
    if (taskType === 'HIW') {
      return hiwFullText.trim();
    }

    // 11. Answer Short Question (ASQ)
    if (taskType === 'ASQ') {
      return `QUESTION: ${asqQuestion.trim()}\nANSWER: ${asqAnswers.trim()}`;
    }

    return promptText.trim();
  };

  // ==========================================
  // SAVE QUESTION HANDLER
  // ==========================================
  const handleSaveQuestion = async () => {
    if (!questionId.trim()) {
      showToast('Please provide a valid Question ID (e.g. RA-07)', 'error');
      return;
    }

    const txtContent = generateTxtContent();
    if (!txtContent) {
      showToast('Please enter the question text or prompt before saving.', 'error');
      return;
    }

    setIsSaving(true);
    const folderPath = `${selectedTask.parentKey}/${selectedTask.folderName}`;

    // Prepare media file if applicable
    let mediaFile = null;
    if (selectedTask.taskType === 'DI') {
      if (imageSource === 'upload' && uploadedImageData?.dataUrl) {
        mediaFile = uploadedImageData;
      } else if (imageSource === 'svg_chart') {
        // Save generated SVG as file
        const svgContent = getSvgString();
        const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
        mediaFile = {
          fileName: `${questionId}.svg`,
          dataUrl: `data:image/svg+xml;base64,${base64Svg}`
        };
      }
    } else if (uploadedAudioData?.dataUrl) {
      mediaFile = uploadedAudioData;
    }

    // Determine TTS generation text
    let ttsText = '';
    let shouldGenerateTts = autoGenerateTts;

    if (['RS', 'RL', 'RTS', 'SST', 'MCMA-L', 'MCSA-L', 'SMW', 'WFD', 'ASQ'].includes(selectedTask.taskType)) {
      ttsText = audioTranscript.trim() || promptText.trim() || asqQuestion.trim();
    } else if (selectedTask.taskType === 'SGD') {
      ttsText = speakers.map((s) => `${s.name}: ${s.text}`).join('\n');
    } else if (selectedTask.taskType === 'FIB-L') {
      // Strip brackets for TTS
      ttsText = promptText.replace(/\[([^\]]+)\]/g, '$1');
    }

    try {
      const payload = {
        folderPath,
        baseId: questionId.trim(),
        txtContent,
        mediaFile,
        generateTts: shouldGenerateTts && !!ttsText,
        ttsText,
        ttsVoice: selectedVoice,
        timingOverrides: {
          prepSeconds: prepSeconds !== '' ? Number(prepSeconds) : undefined,
          recordSeconds: recordSeconds !== '' ? Number(recordSeconds) : undefined,
          timerSeconds: dedicatedTimerSeconds ? Number(dedicatedTimerSeconds) : undefined,
          minWords: minWords ? Number(minWords) : undefined,
          maxWords: maxWords ? Number(maxWords) : undefined
        },
        scoringOverrides: {
          pointsPerCorrect: Number(pointsPerCorrect),
          penaltyPerIncorrect: Number(penaltyPerIncorrect)
        },
        metadata: {
          title: title || `${selectedTask.title} (${questionId.trim()})`,
          taskType: selectedTask.taskType,
          part: selectedTask.part,
          prepSeconds: prepSeconds !== '' ? Number(prepSeconds) : undefined,
          recordSeconds: recordSeconds !== '' ? Number(recordSeconds) : undefined,
          timerSeconds: dedicatedTimerSeconds ? Number(dedicatedTimerSeconds) : undefined,
          minWords: minWords ? Number(minWords) : undefined,
          maxWords: maxWords ? Number(maxWords) : undefined,
          pointsPerCorrect: Number(pointsPerCorrect),
          penaltyPerIncorrect: Number(penaltyPerIncorrect)
        }
      };

      const res = await fetch('/api/save-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Saved ${questionId} directly to ${folderPath}!`, 'success');
        if (onSaved) onSaved(data);
      } else {
        showToast(data.error || 'Failed to save question', 'error');
      }
    } catch (err) {
      console.error('Save question error:', err);
      showToast('Network error while saving question to server.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Top Banner & Task Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#003865] text-white rounded-lg shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Dynamic Question Creator & Studio
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-[#003865] rounded-full">
                  Adaptive Input Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Inputs adapt automatically based on task requirements: prompts, questions, options, microphone, audio files, and SVG charts.
              </p>
            </div>
          </div>
        </div>

        {/* Task Dropdown & ID input */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              PTE Task Type
            </label>
            <select
              value={selectedTask.folderName}
              onChange={(e) => {
                const found = TASK_LIST.find((t) => t.folderName === e.target.value);
                if (found) setSelectedTask(found);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:border-[#003865] focus:outline-hidden"
            >
              <optgroup label="Part 1: Speaking & Writing">
                {TASK_LIST.filter((t) => t.part === 'PART_1').map((t) => (
                  <option key={t.folderName} value={t.folderName}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Part 2: Reading">
                {TASK_LIST.filter((t) => t.part === 'PART_2').map((t) => (
                  <option key={t.folderName} value={t.folderName}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Part 3: Listening">
                {TASK_LIST.filter((t) => t.part === 'PART_3').map((t) => (
                  <option key={t.folderName} value={t.folderName}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Question Item ID
            </label>
            <input
              type="text"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#003865] focus:border-[#003865] focus:outline-hidden w-28 text-center"
              placeholder="e.g. RA-07"
            />
          </div>

          <div className="self-end">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Target Folder:</span>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              {selectedTask.folderName}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between animate-fadeIn ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{notification.msg}</span>
          <button type="button" onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          ADAPTIVE TASK-SPECIFIC INPUT FORMS
          ========================================================================= */}
      <div className="space-y-6">
        {/* Title / Description */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Question Title / Topic
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:border-[#003865] focus:outline-hidden"
            placeholder="e.g. Astrophysics: Supernova Nucleosynthesis"
          />
        </div>

        {/* -------------------------------------------------------------
            1. PLAIN TEXT TASKS (RA, RS, SWT, WE, WFD)
            ------------------------------------------------------------- */}
        {['RA', 'RS', 'SWT', 'WE', 'WFD'].includes(selectedTask.taskType) && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Passage / Target Sentence
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-500 font-semibold">
                  {wordCount(promptText)} words
                </span>
                {selectedTask.taskType === 'SWT' && (
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                    Target: 150-300 words passage
                  </span>
                )}
                {selectedTask.taskType === 'WE' && (
                  <span className="text-[11px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold">
                    Essay Prompt
                  </span>
                )}
              </div>
            </div>

            <textarea
              rows={selectedTask.taskType === 'RS' || selectedTask.taskType === 'WFD' ? 3 : 6}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed text-slate-800 focus:border-[#003865] focus:outline-hidden"
              placeholder={`Enter text for ${selectedTask.label}...`}
            />

            {/* Voice Preview for plain text audio tasks */}
            {(selectedTask.taskType === 'RS' || selectedTask.taskType === 'WFD') && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-700"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.flag} {v.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => playPreviewAudio(promptText)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#003865] rounded text-xs font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isPlayingAudio ? 'Stop Voice' : 'Preview Voice'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            2. DESCRIBE IMAGE (DI)
            ------------------------------------------------------------- */}
        {selectedTask.taskType === 'DI' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                Image & Chart Source
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    imageSource === 'upload' ? 'bg-[#003865] text-white' : 'bg-white text-slate-600 border border-slate-300'
                  }`}
                >
                  Upload Image File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('svg_chart')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    imageSource === 'svg_chart' ? 'bg-[#003865] text-white' : 'bg-white text-slate-600 border border-slate-300'
                  }`}
                >
                  Auto-Generate SVG Chart
                </button>
              </div>
            </div>

            {imageSource === 'upload' ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 p-6 rounded-xl text-center bg-white">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = () => {
                          setUploadedImageData({
                            fileName: `${questionId}.${file.name.split('.').pop()}`,
                            dataUrl: reader.result
                          });
                          showToast(`Image ${file.name} ready to save!`);
                        };
                      }
                    }}
                    className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">Upload PNG, JPG, or SVG chart</p>
                </div>

                {uploadedImageData && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-2 font-mono">Image Preview ({uploadedImageData.fileName})</p>
                    <img src={uploadedImageData.dataUrl} alt="Preview" className="max-h-48 mx-auto rounded border" />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Chart Title</label>
                    <input
                      type="text"
                      value={svgChartTitle}
                      onChange={(e) => setSvgChartTitle(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Chart Data Categories & %</label>
                    <div className="space-y-2">
                      {svgDataItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const copy = [...svgDataItems];
                              copy[idx].label = e.target.value;
                              setSvgDataItems(copy);
                            }}
                            className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white"
                            placeholder="Category"
                          />
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) => {
                              const copy = [...svgDataItems];
                              copy[idx].value = Number(e.target.value);
                              setSvgDataItems(copy);
                            }}
                            className="w-16 p-1.5 border border-slate-300 rounded text-xs bg-white text-center font-bold"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SVG Live Preview */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Live SVG Render:</span>
                  {renderSvgChartPreview()}
                </div>
              </div>
            )}

            {/* Reference notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Description Notes / Scoring Key
              </label>
              <textarea
                rows={3}
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                placeholder="Key trends, highest and lowest values, overall conclusion..."
              />
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            3. AUDIO / LECTURE TASKS (RL, RTS, SST)
            ------------------------------------------------------------- */}
        {['RL', 'RTS', 'SST'].includes(selectedTask.taskType) && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-600" />
                Lecture Audio & Transcript
              </label>

              {/* Audio Source Modes */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAudioSource('tts')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    audioSource === 'tts' ? 'bg-[#003865] text-white' : 'bg-white text-slate-600 border'
                  }`}
                >
                  Neural TTS Transcript
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource('record')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    audioSource === 'record' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 border'
                  }`}
                >
                  Record Mic
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource('upload')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    audioSource === 'upload' ? 'bg-[#003865] text-white' : 'bg-white text-slate-600 border'
                  }`}
                >
                  Upload .mp3/.wav
                </button>
              </div>
            </div>

            {/* Neural TTS Mode */}
            {audioSource === 'tts' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Lecture Transcript (To Be Spoken)</label>
                    <span className="text-[11px] font-mono text-slate-400">{wordCount(audioTranscript)} words</span>
                  </div>
                  <textarea
                    rows={5}
                    value={audioTranscript}
                    onChange={(e) => setAudioTranscript(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
                    placeholder="Enter academic lecture transcript..."
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Voice:</span>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-700"
                    >
                      {VOICE_OPTIONS.map((v) => (
                        <option key={v.code} value={v.code}>
                          {v.flag} {v.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => playPreviewAudio(audioTranscript)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 rounded text-xs font-semibold transition-all active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isPlayingAudio ? 'Stop Speech' : '🔊 Preview Speech'}
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoGenerateTts}
                      onChange={(e) => setAutoGenerateTts(e.target.checked)}
                      className="rounded text-[#003865]"
                    />
                    <span>Automatically generate studio .mp3 on save</span>
                  </label>
                </div>
              </div>
            )}

            {/* Live Mic Recording Mode */}
            {audioSource === 'record' && (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-3">
                <div className="p-3 bg-red-50 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-800">Direct Microphone Recording</p>
                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-xs animate-pulse"
                    >
                      <Square className="w-4 h-4" />
                      Stop Recording
                    </button>
                  )}

                  {recordedAudioUrl && (
                    <button
                      type="button"
                      onClick={() => playPreviewAudio()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      <Play className="w-4 h-4" />
                      {isPlayingAudio ? 'Stop' : 'Play Recording'}
                    </button>
                  )}
                </div>

                {recordedAudioUrl && (
                  <p className="text-xs text-emerald-600 font-semibold">Recording ready! Will be saved as audio with this item.</p>
                )}
              </div>
            )}

            {/* Audio File Upload Mode */}
            {audioSource === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 p-6 rounded-xl text-center bg-white space-y-2">
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onloadend = () => {
                        setUploadedAudioData({
                          fileName: `${questionId}.${file.name.split('.').pop()}`,
                          dataUrl: reader.result
                        });
                        showToast(`Audio ${file.name} ready to save!`);
                      };
                    }
                  }}
                  className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
                <p className="text-[11px] text-slate-400">Upload pre-recorded .mp3 or .wav lecture</p>
                {uploadedAudioData && (
                  <div className="mt-3">
                    <p className="text-xs text-emerald-600 font-semibold">Loaded: {uploadedAudioData.fileName}</p>
                    <button
                      type="button"
                      onClick={() => playPreviewAudio()}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded text-xs font-semibold"
                    >
                      <Play className="w-3.5 h-3.5" /> Play Audio
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            4. MULTI-SPEAKER GROUP DISCUSSION (SGD)
            ------------------------------------------------------------- */}
        {selectedTask.taskType === 'SGD' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AudioWaveform className="w-4 h-4 text-emerald-600" />
                3-Speaker Academic Dialogue Builder
              </label>
              <button
                type="button"
                onClick={() => {
                  const combinedText = speakers.map((s) => `${s.name}: ${s.text}`).join('\n');
                  playPreviewAudio(combinedText);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded text-xs font-bold active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Preview Combined Audio
              </button>
            </div>

            <div className="space-y-3">
              {speakers.map((sp, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={sp.name}
                      onChange={(e) => {
                        const copy = [...speakers];
                        copy[idx].name = e.target.value;
                        setSpeakers(copy);
                      }}
                      className="font-bold text-xs text-[#003865] border-b border-slate-200 pb-0.5 focus:outline-hidden"
                    />

                    <select
                      value={sp.voice}
                      onChange={(e) => {
                        const copy = [...speakers];
                        copy[idx].voice = e.target.value;
                        setSpeakers(copy);
                      }}
                      className="text-[11px] p-1 bg-slate-50 border border-slate-200 rounded"
                    >
                      {VOICE_OPTIONS.map((v) => (
                        <option key={v.code} value={v.code}>
                          {v.flag} {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    value={sp.text}
                    onChange={(e) => {
                      const copy = [...speakers];
                      copy[idx].text = e.target.value;
                      setSpeakers(copy);
                    }}
                    className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            5. MULTIPLE CHOICE TASKS (MCMA, MCSA, HCS, SMW)
            ------------------------------------------------------------- */}
        {['MCMA-R', 'MCSA-R', 'MCMA-L', 'MCSA-L', 'HCS', 'SMW'].includes(selectedTask.taskType) && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Passage or Audio Transcript */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                {selectedTask.taskType.endsWith('-R') ? 'Reading Passage' : 'Audio Transcript (Neural TTS)'}
              </label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
                placeholder={selectedTask.taskType === 'SMW' ? 'Audio text ending in [BEEP]...' : 'Enter passage or transcript...'}
              />
              {selectedTask.taskType === 'SMW' && (
                <button
                  type="button"
                  onClick={() => setPromptText((prev) => prev.trim() + ' [BEEP]')}
                  className="mt-1 text-[11px] font-bold text-blue-600 hover:underline"
                >
                  + Append [BEEP] to audio
                </button>
              )}
            </div>

            {/* Question Prompt */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Question Prompt</label>
              <input
                type="text"
                value={mcQuestion}
                onChange={(e) => setMcQuestion(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                placeholder="e.g. Which of the following statements are supported by the passage?"
              />
            </div>

            {/* Dynamic Options Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Answer Options (Mark Correct Answer)</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextLetter = String.fromCharCode(65 + mcOptions.length);
                    setMcOptions([...mcOptions, { id: nextLetter, text: '', correct: false }]);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#003865] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              </div>

              {mcOptions.map((opt, idx) => {
                const isMulti = selectedTask.taskType.includes('MCMA');
                return (
                  <div key={opt.id} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg">
                    {/* Checkbox or Radio */}
                    <input
                      type={isMulti ? 'checkbox' : 'radio'}
                      name="mc_correct_answer"
                      checked={opt.correct}
                      onChange={(e) => {
                        if (isMulti) {
                          const copy = [...mcOptions];
                          copy[idx].correct = e.target.checked;
                          setMcOptions(copy);
                        } else {
                          const copy = mcOptions.map((o, i) => ({ ...o, correct: i === idx }));
                          setMcOptions(copy);
                        }
                      }}
                      className="w-4 h-4 text-[#003865]"
                    />
                    <span className="font-mono font-bold text-xs text-slate-600 w-5">{opt.id})</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const copy = [...mcOptions];
                        copy[idx].text = e.target.value;
                        setMcOptions(copy);
                      }}
                      className="flex-1 text-xs border border-slate-200 rounded p-1.5 focus:border-[#003865] focus:outline-hidden"
                      placeholder={`Option ${opt.id} content...`}
                    />
                    {mcOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = mcOptions.filter((_, i) => i !== idx);
                          setMcOptions(filtered);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            6. CLOZE DROPDOWN (FIB-RW)
            ------------------------------------------------------------- */}
        {selectedTask.taskType === 'FIB-RW' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Passage with [correct|distractor1|distractor2] Dropdowns
                </label>
                <span className="text-[11px] text-slate-500">Syntax: [correct|wrong1|wrong2|wrong3]</span>
              </div>
              <textarea
                rows={6}
                value={fibRwText}
                onChange={(e) => setFibRwText(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed font-sans"
                placeholder="City planners have long [recognized|ignored|dismissed] that green spaces improve health..."
              />
            </div>

            {/* Interactive Blank Inserter Helper */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
              <span className="text-xs font-bold text-slate-700 block">✨ Quick Dropdown Blank Inserter:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Correct word"
                  value={newDropdownBlank.correct}
                  onChange={(e) => setNewDropdownBlank({ ...newDropdownBlank, correct: e.target.value })}
                  className="p-1.5 border border-emerald-300 rounded text-xs bg-emerald-50/30"
                />
                <input
                  type="text"
                  placeholder="Wrong 1"
                  value={newDropdownBlank.distractor1}
                  onChange={(e) => setNewDropdownBlank({ ...newDropdownBlank, distractor1: e.target.value })}
                  className="p-1.5 border border-slate-200 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Wrong 2"
                  value={newDropdownBlank.distractor2}
                  onChange={(e) => setNewDropdownBlank({ ...newDropdownBlank, distractor2: e.target.value })}
                  className="p-1.5 border border-slate-200 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Wrong 3"
                  value={newDropdownBlank.distractor3}
                  onChange={(e) => setNewDropdownBlank({ ...newDropdownBlank, distractor3: e.target.value })}
                  className="p-1.5 border border-slate-200 rounded text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newDropdownBlank.correct.trim()) return;
                  const blankStr = `[${newDropdownBlank.correct.trim()}|${newDropdownBlank.distractor1.trim()}|${newDropdownBlank.distractor2.trim()}|${newDropdownBlank.distractor3.trim()}]`;
                  setFibRwText((prev) => prev + ' ' + blankStr);
                  setNewDropdownBlank({ correct: '', distractor1: '', distractor2: '', distractor3: '' });
                }}
                className="px-3 py-1.5 bg-[#003865] text-white rounded text-xs font-bold"
              >
                + Insert into Passage
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            7. CLOZE DRAG & DROP (FIB-R)
            ------------------------------------------------------------- */}
        {selectedTask.taskType === 'FIB-R' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">Passage with [blank] Targets</label>
                <span className="text-[11px] text-slate-500">Syntax: Put brackets around answers, e.g. [stratosphere]</span>
              </div>
              <textarea
                rows={5}
                value={fibRText}
                onChange={(e) => setFibRText(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
                placeholder="The Earth's ozone layer resides in the [stratosphere], absorbing harmful [radiation]..."
              />
            </div>

            {/* Distractor Pool */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Extra Distractor Word Bank (Pool):</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {fibRDistractors.map((word, idx) => (
                  <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs font-medium flex items-center gap-1">
                    {word}
                    <button
                      type="button"
                      onClick={() => setFibRDistractors(fibRDistractors.filter((_, i) => i !== idx))}
                      className="text-amber-500 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newDistractorInput}
                  onChange={(e) => setNewDistractorInput(e.target.value)}
                  placeholder="New distractor word..."
                  className="p-1.5 border border-slate-300 rounded text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDistractorInput.trim()) {
                      setFibRDistractors([...fibRDistractors, newDistractorInput.trim()]);
                      setNewDistractorInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold"
                >
                  + Add Distractor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            8. REORDER PARAGRAPHS (RO-R)
            ------------------------------------------------------------- */}
        {selectedTask.taskType === 'RO-R' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Paragraphs in Master Correct Sequence (Will Be Shuffled for Students)
              </label>
              <button
                type="button"
                onClick={() => setParagraphs([...paragraphs, ''])}
                className="flex items-center gap-1 text-xs font-bold text-[#003865] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Paragraph Box
              </button>
            </div>

            <div className="space-y-2">
              {paragraphs.map((p, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2 shadow-2xs">
                  <span className="font-mono font-bold text-xs text-slate-400 mt-2">#{idx + 1}</span>
                  <textarea
                    rows={2}
                    value={p}
                    onChange={(e) => {
                      const copy = [...paragraphs];
                      copy[idx] = e.target.value;
                      setParagraphs(copy);
                    }}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded focus:border-[#003865] focus:outline-hidden"
                  />
                  <div className="flex flex-col gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...paragraphs];
                          [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                          setParagraphs(copy);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < paragraphs.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...paragraphs];
                          [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
                          setParagraphs(copy);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {paragraphs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setParagraphs(paragraphs.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-red-50 text-red-500 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            9. SHORT QUESTION (ASQ)
            ------------------------------------------------------------- */}
        {selectedTask.taskType === 'ASQ' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Question Prompt (Spoken Question)</label>
              <input
                type="text"
                value={asqQuestion}
                onChange={(e) => setAsqQuestion(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                placeholder="e.g. What instrument is used to measure ambient temperature?"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Accepted Answers (Comma-separated for auto-grading)
              </label>
              <input
                type="text"
                value={asqAnswers}
                onChange={(e) => setAsqAnswers(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                placeholder="e.g. thermometer, a thermometer"
              />
            </div>
          </div>
        )}
        {/* -------------------------------------------------------------
            ADVANCED TIMING & SCORING OVERRIDES (Future-Proofing)
            ------------------------------------------------------------- */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center space-x-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedSettings ? 'Hide Custom Timing & Scoring Overrides' : '+ Custom Timing & Scoring Overrides'}</span>
          </button>

          {showAdvancedSettings && (
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Question Timing &amp; Scoring Configuration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Preparation Time (seconds)</label>
                  <input
                    type="number"
                    value={prepSeconds}
                    onChange={(e) => setPrepSeconds(e.target.value)}
                    placeholder="35"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Countdown before candidate response begins</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Recording / Answer Time (seconds)</label>
                  <input
                    type="number"
                    value={recordSeconds}
                    onChange={(e) => setRecordSeconds(e.target.value)}
                    placeholder="40"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Microphone recording / audio capture window</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dedicated Timer (seconds)</label>
                  <input
                    type="number"
                    value={dedicatedTimerSeconds}
                    onChange={(e) => setDedicatedTimerSeconds(e.target.value)}
                    placeholder="600"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Used for SWT (600s), WE (1200s), or SST (600s)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Points Per Correct</label>
                  <input
                    type="number"
                    value={pointsPerCorrect}
                    onChange={(e) => setPointsPerCorrect(e.target.value)}
                    placeholder="1"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Penalty Per Incorrect</label>
                  <input
                    type="number"
                    value={penaltyPerIncorrect}
                    onChange={(e) => setPenaltyPerIncorrect(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Min Target Words</label>
                  <input
                    type="number"
                    value={minWords}
                    onChange={(e) => setMinWords(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Max Target Words</label>
                  <input
                    type="number"
                    value={maxWords}
                    onChange={(e) => setMaxWords(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM ACTIONS & SAVE BAR
          ========================================================================= */}
      <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Will be saved as <span className="font-mono font-bold text-slate-900">{questionId}.txt</span> in{' '}
            <span className="font-mono text-slate-700">{selectedTask.folderName}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {initialQuestion && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Are you sure you want to permanently delete question "${questionId}"?`)) return;
                try {
                  const res = await fetch('/api/delete-question', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      folderPath: initialQuestion.folderPath || selectedTask.folderPath || selectedTask.folderName,
                      baseId: questionId
                    })
                  });
                  const d = await res.json();
                  if (res.ok) {
                    showToast(`Deleted ${questionId} successfully.`, 'info');
                    if (onSaved) onSaved(d);
                  } else {
                    showToast(d.error || 'Failed to delete question', 'error');
                  }
                } catch (e) {
                  showToast('Error: ' + e.message, 'error');
                }
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveQuestion}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 bg-[#003865] hover:bg-[#002847] text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving to Disk...' : '💾 Save Question to Disk'}
          </button>
        </div>
      </div>
    </div>
  );
}

