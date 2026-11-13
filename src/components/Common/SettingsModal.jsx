import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  X,
  Check,
  Key,
  Link as LinkIcon,
  ExternalLink,
  Bot,
  Cpu,
  Volume2,
  HardDrive,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap,
  Server,
  Globe,
  Sliders,
  Terminal,
  FolderOpen,
  Laptop,
  Monitor,
  HelpCircle,
  ShieldCheck,
  Download,
  ChevronRight,
  Apple,
  Mic,
  Square,
  FileText,
  Tablet
} from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/audioUtils';

const AI_PROVIDERS = [
  {
    id: 'grok',
    name: 'xAI Grok',
    badge: 'Cloud API',
    description: 'Direct xAI scoring via grok-2',
    defaultEndpoint: 'https://api.x.ai/v1',
    defaultModel: 'grok-2',
    modelOptions: ['grok-2', 'grok-beta', 'grok-2-vision-1212'],
    keyName: 'grokApiKey',
    keyPlaceholder: 'xai-...',
    keyHelpUrl: 'https://console.x.ai',
    requiresKey: true,
    isLocal: false
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    badge: 'Cloud API',
    description: 'GPT-4o, GPT-4o-mini automated rater',
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    modelOptions: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    keyName: 'openaiApiKey',
    keyPlaceholder: 'sk-proj-...',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    requiresKey: true,
    isLocal: false
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Cloud API',
    description: 'Gemini 1.5 Flash / Pro through OpenAI compatibility',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-1.5-flash',
    modelOptions: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    keyName: 'geminiApiKey',
    keyPlaceholder: 'AIzaSy...',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    requiresKey: true,
    isLocal: false
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    badge: 'Cloud API',
    description: 'High-speed reasoning via deepseek-chat & deepseek-reasoner',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    modelOptions: ['deepseek-chat', 'deepseek-reasoner'],
    keyName: 'deepseekApiKey',
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.deepseek.com/api_keys',
    requiresKey: true,
    isLocal: false
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    badge: 'Cloud API',
    description: 'Claude 3.5 Sonnet detailed rubric evaluator',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    modelOptions: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    keyName: 'claudeApiKey',
    keyPlaceholder: 'sk-ant-...',
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
    requiresKey: true,
    isLocal: false
  },
  {
    id: 'ollama',
    name: 'Local Ollama',
    badge: '100% Offline / Free',
    description: 'Run locally on Mac/PC (Llama 3.2, Mistral, Qwen 2.5)',
    defaultEndpoint: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    modelOptions: ['llama3.2', 'llama3.1', 'mistral', 'qwen2.5:7b', 'phi3'],
    keyName: 'customApiKey',
    keyPlaceholder: '(No API key needed for Ollama)',
    keyHelpUrl: 'https://ollama.com',
    requiresKey: false,
    isLocal: true
  },
  {
    id: 'lmstudio',
    name: 'Local LM Studio / vLLM',
    badge: '100% Offline / Free',
    description: 'Connect to local server on port 1234 or vLLM container',
    defaultEndpoint: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    modelOptions: ['local-model', 'default'],
    keyName: 'customApiKey',
    keyPlaceholder: '(Optional local auth token)',
    keyHelpUrl: 'https://lmstudio.ai',
    requiresKey: false,
    isLocal: true
  },
  {
    id: 'custom',
    name: 'Custom OpenAI-Compatible API',
    badge: 'Custom URL',
    description: 'Any self-hosted LLM, private gateway, or OpenAI reverse proxy',
    defaultEndpoint: 'http://localhost:8000/v1',
    defaultModel: 'default',
    modelOptions: ['default'],
    keyName: 'customApiKey',
    keyPlaceholder: 'Bearer token or API Key...',
    keyHelpUrl: null,
    requiresKey: false,
    isLocal: false
  },
  {
    id: 'heuristic',
    name: 'Pearson Deterministic Rater',
    badge: 'Zero Config / Built-in',
    description: 'Deterministic rule-based word count, sentence length & grammar scoring',
    defaultEndpoint: '',
    defaultModel: 'Pearson Heuristic v1.0',
    modelOptions: ['Pearson Heuristic v1.0'],
    keyName: null,
    keyPlaceholder: '',
    keyHelpUrl: null,
    requiresKey: false,
    isLocal: true
  }
];

const TTS_ENGINES = [
  {
    id: 'edge',
    name: 'Microsoft Edge Neural',
    badge: 'Recommended / Free',
    description: 'Broadcast studio quality, 24kHz 96kbps MP3, zero API key needed'
  },
  {
    id: 'openai',
    name: 'OpenAI TTS',
    badge: 'Cloud API',
    description: 'Ultra-clear voice models (tts-1, tts-1-hd) with alloy, nova, onyx'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    badge: 'Cloud API',
    description: 'Hyper-realistic neural voice clones & multilingual v2'
  },
  {
    id: 'local',
    name: 'Local TTS Endpoint',
    badge: 'Custom Server',
    description: 'Self-hosted Piper, Kokoro, or Coqui server via HTTP POST'
  }
];

const CURATED_VOICES = [
  { id: 'en-GB-SoniaNeural', label: '🇬🇧 Sonia (UK Female - BBC Crisp RP)', accent: 'en-GB' },
  { id: 'en-GB-RyanNeural', label: '🇬🇧 Ryan (UK Male - Oxford Academic)', accent: 'en-GB' },
  { id: 'en-US-AriaNeural', label: '🇺🇸 Aria (US Female - Studio Expressive)', accent: 'en-US' },
  { id: 'en-US-GuyNeural', label: '🇺🇸 Guy (US Male - Professional Broadcaster)', accent: 'en-US' },
  { id: 'en-AU-NatashaNeural', label: '🇦🇺 Natasha (AU Female - ABC Australian)', accent: 'en-AU' },
  { id: 'en-AU-WilliamNeural', label: '🇦🇺 William (AU Male - Australian Natural)', accent: 'en-AU' },
  { id: 'en-CA-ClaraNeural', label: '🇨🇦 Clara (CA Female - Canadian Neutral)', accent: 'en-CA' },
  { id: 'en-IN-NeerjaNeural', label: '🇮🇳 Neerja (IN Female - Clear Indian English)', accent: 'en-IN' }
];

const DEVICE_REQUIREMENTS_DATA = [
  {
    id: 'mac',
    name: 'Apple Silicon Mac',
    subtitle: 'MacBook Air / Pro, Mac mini, iMac (M1, M2, M3, M4)',
    badge: 'Hardware Accelerated',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    minRam: '8 GB Unified Memory (16 GB+ Recommended)',
    minCpu: 'Apple M1 or newer (Neural Engine + Metal GPU)',
    minDisk: '3.5 GB SSD storage',
    recommendedModel: 'Meta Llama 3.2 (3B) or Qwen 2.5 (7B)',
    modelCmd: 'ollama run llama3.2',
    speedRating: '⚡⚡⚡ Super Fast (40–70 tokens/sec)',
    sttSupport: 'Native Web Speech API / Local Whisper (Metal Accelerated)',
    ttsSupport: 'Microsoft Edge Neural (Broadcast 24kHz) / Local Piper',
    suitableFor: 'Complete mock exams, instant essay evaluation, natural speech'
  },
  {
    id: 'windows',
    name: 'Standard Windows Laptop',
    subtitle: 'ThinkPad, Dell Inspiron/XPS, HP, Asus (Intel Core i5/i7 or AMD Ryzen 5/7)',
    badge: 'Standard Workhorse',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    minRam: '8 GB DDR4 / DDR5 RAM',
    minCpu: 'Intel Core i5 (8th Gen+) or AMD Ryzen 5 (AVX2 support)',
    minDisk: '4.0 GB SSD storage',
    recommendedModel: 'Meta Llama 3.2 (3B)',
    modelCmd: 'ollama run llama3.2',
    speedRating: '⚡⚡ Fast (20–35 tokens/sec on CPU)',
    sttSupport: 'Chromium Speech Recognition / Whisper Base',
    ttsSupport: 'Microsoft Edge Neural (Cached) / Local Piper',
    suitableFor: 'Everyday practice exams, classroom testing, full mock tests'
  },
  {
    id: 'budget',
    name: 'Budget Laptop / School Loaner',
    subtitle: 'Older Intel Core i3, Celeron, Pentium, or 4GB RAM Laptops',
    badge: 'Low Resource Friendly',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    minRam: '4 GB RAM (Only ~1.6 GB used by AI)',
    minCpu: 'Any 64-bit Dual-Core CPU',
    minDisk: '2.0 GB free disk space',
    recommendedModel: 'Meta Llama 3.2 (1B)',
    modelCmd: 'ollama run llama3.2:1b',
    speedRating: '⚡ Smooth on CPU (15–25 tokens/sec)',
    sttSupport: 'Browser Web Speech API (0 MB RAM overhead)',
    ttsSupport: 'Edge Neural Streaming (Disk cached) / Browser Audio',
    suitableFor: 'Budget computers, classroom loaner laptops, low-spec PCs'
  },
  {
    id: 'gaming',
    name: 'Gaming Laptop / Workstation',
    subtitle: 'Desktops & Laptops with Dedicated Nvidia RTX / AMD Radeon GPUs',
    badge: 'Maximum Accuracy',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    minRam: '16 GB – 32 GB RAM + 6GB+ GPU VRAM',
    minCpu: 'Intel Core i7/i9, AMD Ryzen 7/9, or Nvidia RTX 3060/4060/4070+',
    minDisk: '8.0 GB SSD storage',
    recommendedModel: 'Qwen 2.5 (7B), Mistral (7B), or Llama 3.1 (8B)',
    modelCmd: 'ollama run qwen2.5:7b',
    speedRating: '🚀 Blazing Fast (70–120 tokens/sec CUDA)',
    sttSupport: 'Whisper Medium / Large-v3 with CUDA Acceleration',
    ttsSupport: 'Local Kokoro-82M / Piper / Edge Neural 24kHz',
    suitableFor: 'Deep grammatical critique, vocabulary expansion, professional coaching'
  },
  {
    id: 'chromebook',
    name: 'Chromebook / Tablet / Web Browser',
    subtitle: 'ChromeOS, iPad Safari, Android Tablet, or 2GB RAM Netbooks',
    badge: 'Zero Install Required',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    minRam: '2 GB – 4 GB RAM',
    minCpu: 'Any ARM or x86 processor capable of running a modern browser',
    minDisk: '0 MB (Runs entirely in browser memory)',
    recommendedModel: 'Built-in Local Pearson AI Scoring Engine',
    modelCmd: 'Active by default (No command needed)',
    speedRating: '⚡ Instant (<50ms deterministic scoring)',
    sttSupport: 'Built-in Browser Speech Recognition API',
    ttsSupport: 'Edge Neural Audio or Browser Speech Synthesis',
    suitableFor: 'School Chromebook carts, shared computer labs, tablet testing'
  },
  {
    id: 'linux',
    name: 'Linux PC / Lab Server',
    subtitle: 'Ubuntu 22.04+, Debian, Fedora, Arch Linux',
    badge: 'Open Source',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    minRam: '8 GB RAM',
    minCpu: 'x86_64 or aarch64 CPU with systemd',
    minDisk: '4.0 GB free disk space',
    recommendedModel: 'Meta Llama 3.2 (3B)',
    modelCmd: 'curl -fsSL https://ollama.com/install.sh | sh && ollama run llama3.2',
    speedRating: '⚡⚡ Fast (Native systemd daemon)',
    sttSupport: 'Whisper.cpp / Browser Web Speech API',
    ttsSupport: 'Local Piper TTS / Edge Neural Proxy',
    suitableFor: 'Computer science labs, Linux server bridging, offline setups'
  }
];

export default function SettingsModal({ isOpen, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('ai'); // 'ai', 'tts', 'sheets', 'local'
  const [selectedDeviceCategory, setSelectedDeviceCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [form, setForm] = useState({
    aiProvider: 'grok',
    aiModel: 'grok-2',
    aiEndpoint: 'https://api.x.ai/v1',
    grokApiKey: '',
    openaiApiKey: '',
    geminiApiKey: '',
    claudeApiKey: '',
    deepseekApiKey: '',
    customApiKey: '',
    ttsEngine: 'edge',
    ttsVoice: 'en-GB-SoniaNeural',
    openaiTtsKey: '',
    elevenlabsKey: '',
    elevenlabsVoiceId: '',
    localTtsEndpoint: 'http://localhost:8000/v1/audio/speech',
    googleSheetWebhookUrl: '',
    autoSyncToGoogleSheet: true,
    customWebhookUrl: '',
    autoSyncToCustomWebhook: false,
    sttEngine: 'browser',
    sttLanguage: 'en-US',
    whisperEndpoint: 'http://localhost:9000/asr'
  });

  // Key presence status flags from backend
  const [keyStatus, setKeyStatus] = useState({});
  const [localPaths, setLocalPaths] = useState({});

  // Diagnostic Test States
  const [testAiStatus, setTestAiStatus] = useState({ state: 'idle', message: '', latency: null });
  const [testWebhookStatus, setTestWebhookStatus] = useState({ state: 'idle', message: '', code: null });
  const [copiedScript, setCopiedScript] = useState(false);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);

  // Speech-to-Text Test State
  const [isTestingStt, setIsTestingStt] = useState(false);
  const [sttTestTranscript, setSttTestTranscript] = useState('');
  const [selectedSttOs, setSelectedSttOs] = useState('mac');
  const sttTestRecognitionRef = useRef(null);

  const handleToggleSttTest = () => {
    if (isTestingStt) {
      if (sttTestRecognitionRef.current) {
        try { sttTestRecognitionRef.current.stop(); } catch {}
      }
      setIsTestingStt(false);
      return;
    }

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      showToast('Web Speech API is not supported in this browser. Use Chrome, Edge, or Safari.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = form.sttLanguage || 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
          else interim += event.results[i][0].transcript;
        }
        setSttTestTranscript((final + interim).trim());
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          showToast('Mic event: ' + e.error, 'error');
        }
      };

      recognition.onend = () => {
        setIsTestingStt(false);
      };

      setSttTestTranscript('');
      recognition.start();
      sttTestRecognitionRef.current = recognition;
      setIsTestingStt(true);
    } catch (err) {
      showToast('Failed to start microphone: ' + err.message, 'error');
    }
  };

  // Local AI Scanning State
  const [detectingLocalAi, setDetectingLocalAi] = useState(false);
  const [detectedLocalAis, setDetectedLocalAis] = useState(null);
  const [selectedOs, setSelectedOs] = useState('mac'); // 'mac', 'windows', 'linux', 'lmstudio'

  const handleScanLocalAis = async () => {
    setDetectingLocalAi(true);
    try {
      const res = await fetch('/api/integrations/detect-local-ai');
      const data = await res.json();
      setDetectedLocalAis(data);
    } catch (err) {
      showToast('Scan failed: ' + err.message, 'error');
    } finally {
      setDetectingLocalAi(false);
    }
  };

  // Fetch settings on mount / open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/integrations')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          const providerDef = AI_PROVIDERS.find((p) => p.id === data.aiProvider) || AI_PROVIDERS[0];
          setForm({
            aiProvider: data.aiProvider || 'grok',
            aiModel: data.aiModel || providerDef.defaultModel,
            aiEndpoint: data.aiEndpoint || providerDef.defaultEndpoint,
            grokApiKey: data.grokApiKey || '',
            openaiApiKey: data.openaiApiKey || '',
            geminiApiKey: data.geminiApiKey || '',
            claudeApiKey: data.claudeApiKey || '',
            deepseekApiKey: data.deepseekApiKey || '',
            customApiKey: data.customApiKey || '',
            ttsEngine: data.ttsEngine || 'edge',
            ttsVoice: data.ttsVoice || 'en-GB-SoniaNeural',
            openaiTtsKey: data.openaiTtsKey || '',
            elevenlabsKey: data.elevenlabsKey || '',
            elevenlabsVoiceId: data.elevenlabsVoiceId || '',
            localTtsEndpoint: data.localTtsEndpoint || 'http://localhost:8000/v1/audio/speech',
            googleSheetWebhookUrl: data.googleSheetWebhookUrl || '',
            autoSyncToGoogleSheet: Boolean(data.autoSyncToGoogleSheet),
            customWebhookUrl: data.customWebhookUrl || '',
            autoSyncToCustomWebhook: Boolean(data.autoSyncToCustomWebhook),
            sttEngine: data.sttEngine || 'browser',
            sttLanguage: data.sttLanguage || localStorage.getItem('pte_stt_language') || 'en-US',
            whisperEndpoint: data.whisperEndpoint || 'http://localhost:9000/asr'
          });

          setKeyStatus({
            grok: data.hasGrokKey,
            openai: data.hasOpenaiKey,
            gemini: data.hasGeminiKey,
            claude: data.hasClaudeKey,
            deepseek: data.hasDeepseekKey,
            custom: data.hasCustomKey,
            openaiTts: data.hasOpenaiTtsKey,
            elevenlabs: data.hasElevenlabsKey
          });

          if (data.localPaths) {
            setLocalPaths(data.localPaths);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load integrations:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleProviderSelect = (providerId) => {
    const prov = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!prov) return;
    setForm((prev) => ({
      ...prev,
      aiProvider: providerId,
      aiEndpoint: prov.defaultEndpoint,
      aiModel: prov.defaultModel
    }));
    setTestAiStatus({ state: 'idle', message: '', latency: null });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (typeof window !== 'undefined' && form.sttLanguage) {
        localStorage.setItem('pte_stt_language', form.sttLanguage);
      }
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data && data.ok) {
        showToast('Settings saved successfully!');
        if (onSaved) onSaved(data);
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAiConnection = async () => {
    setTestAiStatus({ state: 'testing', message: 'Connecting to AI provider...', latency: null });
    const currentProvider = AI_PROVIDERS.find((p) => p.id === form.aiProvider);
    const keyField = currentProvider ? currentProvider.keyName : null;
    const currentKey = keyField ? form[keyField] : '';

    try {
      const res = await fetch('/api/integrations/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: form.aiProvider,
          endpoint: form.aiEndpoint,
          model: form.aiModel,
          apiKey: currentKey
        })
      });
      const data = await res.json();
      if (data && data.ok) {
        setTestAiStatus({
          state: 'success',
          message: `${data.message} (${data.model})`,
          latency: data.latencyMs
        });
      } else {
        setTestAiStatus({
          state: 'error',
          message: data.error || 'Connection failed',
          latency: data.latencyMs
        });
      }
    } catch (err) {
      setTestAiStatus({
        state: 'error',
        message: err.message,
        latency: null
      });
    }
  };

  const handleTestWebhook = async () => {
    if (!form.googleSheetWebhookUrl.trim()) {
      showToast('Please enter a Google Apps Script Webhook URL first.', 'error');
      return;
    }
    setTestWebhookStatus({ state: 'testing', message: 'Pinging Google Sheets Webhook...' });
    try {
      const res = await fetch('/api/integrations/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: form.googleSheetWebhookUrl })
      });
      const data = await res.json();
      if (data && data.ok) {
        setTestWebhookStatus({
          state: 'success',
          message: data.message || 'Webhook reachable!'
        });
      } else {
        setTestWebhookStatus({
          state: 'error',
          message: data.error || `Webhook error (${data.status})`
        });
      }
    } catch (err) {
      setTestWebhookStatus({
        state: 'error',
        message: err.message
      });
    }
  };

  const handlePlayVoiceTest = () => {
    if (isPlayingTestVoice) {
      stopSpeaking();
      setIsPlayingTestVoice(false);
      return;
    }

    setIsPlayingTestVoice(true);
    const sampleText =
      'This is a live test of the Pearson PTE Academic speech synthesizer. Neural studio voices ensure clear pronunciation and natural pacing.';

    speakText(
      sampleText,
      () => setIsPlayingTestVoice(false),
      {
        voice: form.ttsVoice,
        accent: form.ttsVoice.slice(0, 5)
      }
    );
  };

  const handleClearTtsCache = async () => {
    if (!window.confirm('Clear all cached TTS audio files from disk? They will be re-synthesized as needed.')) {
      return;
    }
    try {
      const res = await fetch('/api/integrations/clear-tts-cache', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'TTS cache cleared.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDownloadSubmissions = () => {
    fetch('/api/submissions')
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pte_submissions_export_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem('pte_submissions') || '[]');
        const jsonStr = JSON.stringify({ ok: true, submissions: local, source: 'localStorage' }, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pte_submissions_local_export_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  const currentProvider = AI_PROVIDERS.find((p) => p.id === form.aiProvider) || AI_PROVIDERS[0];
  const activeKeyName = currentProvider.keyName;
  const isKeySaved = activeKeyName ? keyStatus[form.aiProvider] : false;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Simulator Settings &amp; API Integrations</span>
                <span className="text-[10px] uppercase font-bold bg-blue-950 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full">
                  Multi-Provider
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure cloud AI models, local offline LLMs (Ollama/LM Studio), neural TTS, and Google Sheets sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex space-x-1.5 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2.5 rounded-t-lg text-xs font-bold flex items-center space-x-1.5 transition border-t border-x whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-white text-blue-600 border-slate-200 border-b-transparent shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>AI Scoring &amp; Local LLMs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2.5 rounded-t-lg text-xs font-bold flex items-center space-x-1.5 transition border-t border-x whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-white text-indigo-600 border-slate-200 border-b-transparent shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Laptop className="w-4 h-4 text-indigo-600" />
            <span>Install Local AI (Laptop Guide)</span>
            <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              Free
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tts')}
            className={`px-3 py-2.5 rounded-t-lg text-xs font-bold flex items-center space-x-1.5 transition border-t border-x whitespace-nowrap ${
              activeTab === 'tts'
                ? 'bg-white text-emerald-600 border-slate-200 border-b-transparent shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>TTS Voice Engine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stt')}
            className={`px-3 py-2.5 rounded-t-lg text-xs font-bold flex items-center space-x-1.5 transition border-t border-x whitespace-nowrap ${
              activeTab === 'stt'
                ? 'bg-white text-rose-600 border-slate-200 border-b-transparent shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-600" />
            <span>Speech-to-Text (STT)</span>
            <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              Built-in
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-2.5 rounded-t-lg text-xs font-bold flex items-center space-x-1.5 transition border-t border-x whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-white text-blue-600 border-slate-200 border-b-transparent shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-3 py-2.5 rounded-t-lg text-xs font-bold flex items-center space-x-1.5 transition border-t border-x whitespace-nowrap ${
              activeTab === 'local'
                ? 'bg-white text-blue-600 border-slate-200 border-b-transparent shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <HardDrive className="w-4 h-4 text-amber-600" />
            <span>Storage &amp; Paths</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1 bg-white">
          {/* TAB 1: AI SCORING & LOCAL LLMs */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Local AI Auto-Discovery & Health Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span>Local AI Server Scanner (Zero Cloud API Cost)</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          Offline
                        </span>
                      </span>
                      <p className="text-[10px] text-slate-600">
                        Scan your machine for running Ollama, LM Studio, or LocalAI instances
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('guide')}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-bold rounded-lg transition shadow-2xs flex items-center space-x-1"
                      title="View step-by-step instructions to install local AI on your laptop"
                    >
                      <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Laptop Install Guide</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleScanLocalAis}
                      disabled={detectingLocalAi}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition shadow-xs flex items-center space-x-1.5"
                    >
                      {detectingLocalAi ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Scanning localhost...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>Scan for Local AIs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scan Results */}
                {detectedLocalAis && (
                  <div className="pt-2 border-t border-emerald-200/60 space-y-2 text-[11px]">
                    {detectedLocalAis.hasLocalServers ? (
                      <div className="space-y-1.5">
                        <span className="font-bold text-emerald-800">✅ Detected Running Local Server(s):</span>
                        {detectedLocalAis.detected.map((srv, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-slate-900">{srv.name}</span>
                                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Port {srv.port}</span>
                              </div>
                              <span className="text-slate-500 text-[10px]">Loaded models: {srv.models.join(', ')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  aiProvider: srv.type,
                                  aiEndpoint: srv.endpoint,
                                  aiModel: srv.models[0] || 'default'
                                }));
                                showToast(`Connected to ${srv.name}!`);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-2xs transition"
                            >
                              Use {srv.name}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="text-slate-700">
                          <span className="font-bold text-slate-800">No external AI server running on port 11434 / 1234.</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Built-in Pearson AI Engine is active (100% offline). To use Ollama, run: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">ollama run llama3.2</code>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('ollama run llama3.2');
                            showToast('Copied: ollama run llama3.2');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[10px] flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Command</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Provider Quick Picker */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Select Active AI Scoring Engine</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Used for automated speech transcripts &amp; essay grading
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AI_PROVIDERS.map((prov) => {
                    const isSelected = form.aiProvider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => handleProviderSelect(prov.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-xs">{prov.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              prov.isLocal
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {prov.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {prov.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Provider Config Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      {currentProvider.name} Configuration
                    </span>
                  </div>
                  {isKeySaved ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>API Key Saved</span>
                    </span>
                  ) : currentProvider.requiresKey ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                      API Key Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      No API Key Needed (Local)
                    </span>
                  )}
                </div>

                {/* API Key Input (if required by provider) */}
                {currentProvider.requiresKey && activeKeyName && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-800 text-xs">
                        {currentProvider.name} API Key
                      </label>
                      {currentProvider.keyHelpUrl && (
                        <a
                          href={currentProvider.keyHelpUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center space-x-1 text-[11px]"
                        >
                          <span>Get API Key</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword[activeKeyName] ? 'text' : 'password'}
                        value={form[activeKeyName] || ''}
                        onChange={(e) => setForm({ ...form, [activeKeyName]: e.target.value })}
                        placeholder={
                          isKeySaved
                            ? '•••••••••••••••••••••••• (Key saved on server)'
                            : currentProvider.keyPlaceholder
                        }
                        className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(activeKeyName)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword[activeKeyName] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Local API Key (optional for custom or LM Studio) */}
                {!currentProvider.requiresKey && currentProvider.id !== 'heuristic' && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-800 text-xs flex items-center justify-between">
                      <span>Authorization Token / API Key (Optional)</span>
                      <span className="text-slate-400 font-normal">Leave blank if no auth required</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword['customApiKey'] ? 'text' : 'password'}
                        value={form.customApiKey || ''}
                        onChange={(e) => setForm({ ...form, customApiKey: e.target.value })}
                        placeholder="Optional local auth token (or leave blank)"
                        className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('customApiKey')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword['customApiKey'] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Endpoint URL & Model Name Fields */}
                {currentProvider.id !== 'heuristic' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 text-xs flex items-center space-x-1">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>API Base URL / Endpoint</span>
                      </label>
                      <input
                        type="text"
                        value={form.aiEndpoint}
                        onChange={(e) => setForm({ ...form, aiEndpoint: e.target.value })}
                        placeholder={currentProvider.defaultEndpoint}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 text-xs flex items-center space-x-1">
                        <Cpu className="w-3.5 h-3.5 text-slate-500" />
                        <span>Model Identifier</span>
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={form.aiModel}
                          onChange={(e) => setForm({ ...form, aiModel: e.target.value })}
                          placeholder={currentProvider.defaultModel}
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                        {currentProvider.modelOptions && currentProvider.modelOptions.length > 0 && (
                          <select
                            value={form.aiModel}
                            onChange={(e) => setForm({ ...form, aiModel: e.target.value })}
                            className="px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
                          >
                            {currentProvider.modelOptions.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Local Setup Instructions for Ollama */}
                {currentProvider.id === 'ollama' && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5 text-[11px] text-blue-900">
                    <div className="font-bold flex items-center space-x-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>How to run Ollama locally (Zero API Key):</span>
                    </div>
                    <p className="leading-relaxed text-blue-800">
                      1. Install Ollama from{' '}
                      <a
                        href="https://ollama.com"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        ollama.com
                      </a>
                      <br />
                      2. Open your terminal and run:{' '}
                      <code className="bg-white px-1.5 py-0.5 rounded border border-blue-300 font-mono font-bold">
                        ollama run llama3.2
                      </code>
                      <br />
                      3. Click <strong>Test Connection</strong> below to verify!
                    </p>
                  </div>
                )}

                {/* Diagnostic Test Connection Row */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestAiConnection}
                    disabled={testAiStatus.state === 'testing'}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                  >
                    {testAiStatus.state === 'testing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Pinging AI Provider...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  {testAiStatus.state === 'success' && (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{testAiStatus.message}</span>
                    </span>
                  )}

                  {testAiStatus.state === 'error' && (
                    <span className="text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>{testAiStatus.message}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TTS VOICE ENGINE */}
          {activeTab === 'tts' && (
            <div className="space-y-6">
              {/* Engine Picker */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs">
                  Select Text-to-Speech Engine
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {TTS_ENGINES.map((engine) => {
                    const isSelected = form.ttsEngine === engine.id;
                    return (
                      <button
                        key={engine.id}
                        type="button"
                        onClick={() => setForm({ ...form, ttsEngine: engine.id })}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-xs">{engine.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              engine.id === 'edge'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {engine.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {engine.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Selection & Preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">Default Voice Preset</span>
                  </div>
                  <span className="text-[11px] text-slate-500">24kHz 96kbps Studio MP3</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-800 text-xs">
                      Curated Neural Accent &amp; Voice
                    </label>
                    <select
                      value={form.ttsVoice}
                      onChange={(e) => setForm({ ...form, ttsVoice: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {CURATED_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handlePlayVoiceTest}
                      className={`w-full py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition shadow-xs ${
                        isPlayingTestVoice
                          ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isPlayingTestVoice ? (
                        <>
                          <Volume2 className="w-4 h-4 animate-bounce" />
                          <span>Stop Voice Test</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Test Voice Audio (Live)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Engine Specific Auth Keys */}
                {form.ttsEngine === 'openai' && (
                  <div className="space-y-1.5 pt-2">
                    <label className="font-semibold text-slate-800 text-xs">
                      OpenAI Audio API Key (Optional if entered in AI Scoring)
                    </label>
                    <input
                      type="password"
                      value={form.openaiTtsKey}
                      onChange={(e) => setForm({ ...form, openaiTtsKey: e.target.value })}
                      placeholder="sk-proj-... (or leave blank to use OpenAI AI Key)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                    />
                  </div>
                )}

                {form.ttsEngine === 'elevenlabs' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 text-xs">
                        ElevenLabs API Key
                      </label>
                      <input
                        type="password"
                        value={form.elevenlabsKey}
                        onChange={(e) => setForm({ ...form, elevenlabsKey: e.target.value })}
                        placeholder="xi-..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-800 text-xs">
                        ElevenLabs Voice ID
                      </label>
                      <input
                        type="text"
                        value={form.elevenlabsVoiceId}
                        onChange={(e) => setForm({ ...form, elevenlabsVoiceId: e.target.value })}
                        placeholder="21m00Tcm4TlvDq8ikWAM"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {form.ttsEngine === 'local' && (
                  <div className="space-y-1.5 pt-2">
                    <label className="font-semibold text-slate-800 text-xs">
                      Local TTS Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={form.localTtsEndpoint}
                      onChange={(e) => setForm({ ...form, localTtsEndpoint: e.target.value })}
                      placeholder="http://localhost:8000/v1/audio/speech"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SPEECH-TO-TEXT (STT) & TRANSCRIPTS */}
          {activeTab === 'stt' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-1">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-rose-600" />
                  <h4 className="font-bold text-rose-950 text-sm">
                    Speech-to-Text &amp; Candidate Transcripts
                  </h4>
                  <span className="bg-rose-200 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Automatically converts candidate speech to text during speaking tasks (Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Respond to Situation). Transcripts are saved with the submission, displayed to teachers, and evaluated by the AI Examiner for pronunciation and content accuracy.
                </p>
              </div>

              {/* Primary STT Engine Selector */}
              <div className="space-y-3 pb-5 border-b border-slate-200">
                <label className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Primary Transcription Engine</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sttEngine: 'browser' })}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      form.sttEngine === 'browser'
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs ring-1 ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Browser Web Speech API</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Free / Zero-Setup
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Zero latency, runs 100% in browser. Shows live real-time words while speaking.
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-slate-400 font-mono">
                      Chrome, Edge &amp; Safari
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sttEngine: 'openai' })}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      form.sttEngine === 'openai'
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs ring-1 ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">OpenAI Whisper-1</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                          Cloud API
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Deep neural transcription with high resilience to heavy accents and noise.
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-slate-400 font-mono">
                      Uses OpenAI API Key
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sttEngine: 'local' })}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      form.sttEngine === 'local'
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs ring-1 ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Local Whisper Server</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                          100% Offline
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Self-hosted faster-whisper or whisper.cpp on your laptop or local network.
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-slate-400 font-mono">
                      e.g. port 9000
                    </div>
                  </button>
                </div>

                {/* Local Whisper Endpoint field */}
                {form.sttEngine === 'local' && (
                  <div className="space-y-1 pt-2">
                    <label className="font-semibold text-slate-800 text-xs">
                      Local Whisper ASR Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={form.whisperEndpoint}
                      onChange={(e) => setForm({ ...form, whisperEndpoint: e.target.value })}
                      placeholder="http://localhost:9000/asr"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                    />
                    <p className="text-[11px] text-slate-400">
                      Standard faster-whisper-server or OpenAI-compatible audio transcription endpoint.
                    </p>
                  </div>
                )}
              </div>

              {/* Language & Accent Settings */}
              <div className="space-y-3 pb-5 border-b border-slate-200">
                <label className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Recognition Accent / Language</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'en-US', label: '🇺🇸 English (US)' },
                    { id: 'en-GB', label: '🇬🇧 English (UK)' },
                    { id: 'en-AU', label: '🇦🇺 English (AU)' },
                    { id: 'en-CA', label: '🇨🇦 English (CA)' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setForm({ ...form, sttLanguage: lang.id })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition text-center ${
                        form.sttLanguage === lang.id
                          ? 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Microphone Test & Live STT Sandbox */}
              <div className="space-y-3 pb-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Test Microphone &amp; Live Speech-to-Text Recognition
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSttTest}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                      isTestingStt
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isTestingStt ? 'Stop Recording' : 'Speak into Microphone'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                      <span className={`w-2 h-2 rounded-full ${isTestingStt ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`} />
                      <span>{isTestingStt ? 'Listening now... say something!' : 'Speech Sandbox (Click Speak to begin)'}</span>
                    </span>
                    <span className="font-mono text-[10px]">
                      {sttTestTranscript ? `${sttTestTranscript.split(/\s+/).filter(Boolean).length} words recognized` : '0 words'}
                    </span>
                  </div>

                  <div className="min-h-[54px] p-3 bg-white rounded-lg border border-slate-200 text-xs font-serif leading-relaxed text-slate-800 select-text">
                    {sttTestTranscript ? (
                      `"${sttTestTranscript}"`
                    ) : (
                      <span className="text-slate-400 font-sans italic">
                        {isTestingStt
                          ? 'Listening... words will appear here as you speak...'
                          : 'Press "Speak into Microphone" and read a sentence to verify speech recognition.'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions to Install Local Whisper on Any Laptop */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Laptop className="w-4 h-4 text-slate-700" />
                    <span className="font-bold text-slate-900 text-xs">
                      Run Local Whisper AI on Your Laptop (100% Free &amp; Offline)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-lg p-1 flex space-x-1 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setSelectedSttOs('mac')}
                    className={`flex-1 py-1.5 rounded-md transition ${selectedSttOs === 'mac' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                  >
                    macOS (Apple Silicon / Intel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSttOs('windows')}
                    className={`flex-1 py-1.5 rounded-md transition ${selectedSttOs === 'windows' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                  >
                    Windows 10 / 11
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSttOs('linux')}
                    className={`flex-1 py-1.5 rounded-md transition ${selectedSttOs === 'linux' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                  >
                    Linux / Docker
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2">
                  {selectedSttOs === 'mac' && (
                    <>
                      <div className="text-slate-400 text-[11px] pb-1">
                        # Option 1: Install faster-whisper-server via pip (Fastest on Mac M1/M2/M3/M4)
                      </div>
                      <div className="text-emerald-400 select-all">pip install faster-whisper-server</div>
                      <div className="text-slate-400 text-[11px] pt-1"># Start server on port 9000:</div>
                      <div className="text-emerald-400 select-all">faster-whisper-server --host 127.0.0.1 --port 9000</div>
                    </>
                  )}
                  {selectedSttOs === 'windows' && (
                    <>
                      <div className="text-slate-400 text-[11px] pb-1">
                        # Install faster-whisper on Windows PowerShell:
                      </div>
                      <div className="text-emerald-400 select-all">pip install faster-whisper-server</div>
                      <div className="text-slate-400 text-[11px] pt-1"># Start Whisper local server:</div>
                      <div className="text-emerald-400 select-all">python -m faster_whisper_server --port 9000</div>
                    </>
                  )}
                  {selectedSttOs === 'linux' && (
                    <>
                      <div className="text-slate-400 text-[11px] pb-1">
                        # Run via Docker with GPU/CPU auto-detection:
                      </div>
                      <div className="text-emerald-400 select-all">docker run -d -p 9000:9000 fedirz/faster-whisper-server:latest</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE SHEETS & WEBHOOKS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              {/* Google Sheets Live Sync */}
              <div className="space-y-3 pb-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      Google Sheets Live Webhook (PTE_Live_Sync)
                    </span>
                  </div>
                  {form.googleSheetWebhookUrl ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                      Not Configured
                    </span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed text-xs">
                  Upon candidate test completion or teacher score finalization, all 48 columns (Columns A through AV: Overall PTE, IELTS Band, Communicative Subscales, and Part 1-3 Task Breakdowns) are automatically appended to your master sheet.
                </p>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 text-xs">
                    Google Apps Script Web App Deployment URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.googleSheetWebhookUrl}
                      onChange={(e) => setForm({ ...form, googleSheetWebhookUrl: e.target.value })}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="modalAutoSync"
                      checked={form.autoSyncToGoogleSheet}
                      onChange={(e) => setForm({ ...form, autoSyncToGoogleSheet: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <label htmlFor="modalAutoSync" className="text-xs text-slate-700 font-medium select-none cursor-pointer">
                      Auto-push score record to Google Sheet upon grading
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testWebhookStatus.state === 'testing'}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition border border-slate-300"
                  >
                    {testWebhookStatus.state === 'testing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Pinging...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ping Webhook</span>
                      </>
                    )}
                  </button>
                </div>

                {testWebhookStatus.message && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center space-x-1.5 ${
                      testWebhookStatus.state === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {testWebhookStatus.state === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{testWebhookStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Custom Webhook (LMS / Zapier / n8n) */}
              <div className="space-y-3 pb-5 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Custom Webhook (LMS, Zapier, Make, n8n, Supabase)
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 text-xs">
                    Custom Webhook Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={form.customWebhookUrl}
                    onChange={(e) => setForm({ ...form, customWebhookUrl: e.target.value })}
                    placeholder="https://hooks.zapier.com/hooks/catch/... or https://your-lms.com/api/pte-webhook"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="modalAutoCustomWebhook"
                    checked={form.autoSyncToCustomWebhook}
                    onChange={(e) => setForm({ ...form, autoSyncToCustomWebhook: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="modalAutoCustomWebhook" className="text-xs text-slate-700 font-medium select-none cursor-pointer">
                    POST complete JSON test payload to custom webhook on exam submission
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOCAL STORAGE & ACCESS */}
          {activeTab === 'local' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Local Filesystem Storage &amp; Database Paths
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  All question items, audio files, and student submissions are stored in clean, editable JSON and audio folders on your local machine.
                </p>
              </div>

              {/* Local Folder Paths Display */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Question Bank Root Directory</span>
                  </span>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                    {localPaths.questionBankDir || './question_bank'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Candidate Submissions Database</span>
                  </span>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                    {localPaths.submissionsDir ? `${localPaths.submissionsDir}/submissions.json` : './submissions/submissions.json'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>TTS Audio Cache Directory</span>
                  </span>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                    {localPaths.ttsCacheDir || './submissions/tts_cache'}
                  </div>
                </div>
              </div>

              {/* Local Actions */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSubmissions}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Submissions (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearTtsCache}
                  className="px-3.5 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                  <span>Clear TTS Audio Cache</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: LAPTOP INSTALLATION GUIDE FOR LOCAL AI */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
                        <span>How to Install &amp; Run Local AI on Any Laptop</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold">
                          100% Free &amp; Offline
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300">
                        Zero API bills, zero internet required during exams, total data privacy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>100% Private</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Candidate recordings &amp; essays never leave the laptop.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center space-x-1 text-amber-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Zero API Cost</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      No OpenAI or Grok credit card required. Unlimited free evaluations.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center space-x-1 text-blue-400 font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Runs on Any Laptop</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Optimized for 8GB RAM laptops (MacBook Air, Windows, Linux).
                    </p>
                  </div>
                </div>
              </div>

              {/* OS Selection Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    Select Your Laptop Operating System:
                  </label>
                  <span className="text-[11px] text-slate-500">Pick the guide for your device</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOs('mac')}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      selectedOs === 'mac'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Apple className="w-4 h-4 text-slate-900" />
                    <div>
                      <div className="text-xs">macOS</div>
                      <div className="text-[10px] text-slate-500 font-normal">M1-M4 &amp; Intel</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOs('windows')}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      selectedOs === 'windows'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs">Windows</div>
                      <div className="text-[10px] text-slate-500 font-normal">10 / 11 (All laptops)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOs('linux')}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      selectedOs === 'linux'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs">Linux</div>
                      <div className="text-[10px] text-slate-500 font-normal">Ubuntu / Debian</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOs('lmstudio')}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      selectedOs === 'lmstudio'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-xs">LM Studio</div>
                      <div className="text-[10px] text-slate-500 font-normal">Visual GUI (No code)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* OS Specific Instructions Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                {/* 1. macOS Instructions */}
                {selectedOs === 'mac' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <Apple className="w-4 h-4" />
                        <span>macOS (MacBook Air, MacBook Pro, Mac Mini, iMac)</span>
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        Time: ~2 minutes
                      </span>
                    </div>

                    {/* Step 1 */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                        <span>Download &amp; Install Ollama</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <p className="text-slate-600 text-[11px]">
                          Download the official Mac installer or run the 1-line Homebrew command:
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href="https://ollama.com/download/mac"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1.5 shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Ollama for Mac (.zip)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-slate-400 text-[10px] font-bold">OR TERMINAL:</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('brew install ollama');
                              showToast('Copied: brew install ollama');
                            }}
                            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-mono text-slate-800 flex items-center space-x-1 shadow-2xs"
                          >
                            <span>brew install ollama</span>
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Open Terminal &amp; Start the Model (Llama 3.2 3B)</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <p className="text-slate-600 text-[11px]">
                          Open your Mac Terminal (press <kbd className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">Cmd + Space</kbd>, type <code>Terminal</code>, press Enter) and run:
                        </p>
                        <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
                          <span>ollama run llama3.2</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('ollama run llama3.2');
                              showToast('Copied: ollama run llama3.2');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-semibold flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Command</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          * Download is only ~2.0 GB. Once downloaded, it will say <code className="text-indigo-600 font-bold">&gt;&gt;&gt; Send a message</code> and it is running locally!
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Connect the Simulator</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <p className="text-slate-600 text-[11px]">
                          Click the button below to verify your local Ollama connection:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('ai');
                            handleScanLocalAis();
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Scan &amp; Connect to Local Ollama Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Windows Instructions */}
                {selectedOs === 'windows' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <Monitor className="w-4 h-4 text-blue-600" />
                        <span>Windows 10 / 11 (Dell, HP, Lenovo, Surface, Asus, Acer, etc.)</span>
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        Time: ~2 minutes
                      </span>
                    </div>

                    {/* Step 1 */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                        <span>Download Ollama for Windows</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <p className="text-slate-600 text-[11px]">
                          Download the official Windows installer (.exe) and double-click to install:
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href="https://ollama.com/download/windows"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1.5 shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download OllamaSetup.exe</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-slate-400 text-[10px] font-bold">OR WINGET:</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('winget install Ollama.Ollama');
                              showToast('Copied: winget install Ollama.Ollama');
                            }}
                            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-mono text-slate-800 flex items-center space-x-1 shadow-2xs"
                          >
                            <span>winget install Ollama.Ollama</span>
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Open Command Prompt &amp; Run Llama 3.2</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <p className="text-slate-600 text-[11px]">
                          Press <kbd className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">Win + R</kbd>, type <code>cmd</code>, press Enter, then paste:
                        </p>
                        <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
                          <span>ollama run llama3.2</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('ollama run llama3.2');
                              showToast('Copied: ollama run llama3.2');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-semibold flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Command</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          * Ollama runs silently in your Windows System Tray (near the clock) and will automatically restart with Windows.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Connect the Simulator</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('ai');
                            handleScanLocalAis();
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Scan &amp; Connect to Local Ollama Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Linux Instructions */}
                {selectedOs === 'linux' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <Terminal className="w-4 h-4 text-amber-600" />
                        <span>Linux (Ubuntu, Debian, Fedora, Arch, Linux Mint)</span>
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        Time: ~1 minute
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                        <span>Install Ollama with One Command</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
                          <span>curl -fsSL https://ollama.com/install.sh | sh</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('curl -fsSL https://ollama.com/install.sh | sh');
                              showToast('Copied install command');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-semibold flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Command</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Start Llama 3.2</span>
                      </div>
                      <div className="pl-7 space-y-2">
                        <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
                          <span>ollama run llama3.2</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('ollama run llama3.2');
                              showToast('Copied: ollama run llama3.2');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-semibold flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Command</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Connect the Simulator</span>
                      </div>
                      <div className="pl-7">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('ai');
                            handleScanLocalAis();
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Scan &amp; Connect to Local Ollama Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. LM Studio Instructions */}
                {selectedOs === 'lmstudio' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <Cpu className="w-4 h-4 text-purple-600" />
                        <span>LM Studio (100% Visual GUI — No Terminal Commands Needed)</span>
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Beginner Friendly
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">
                      If you prefer a visual desktop application instead of using the command line:
                    </p>

                    <ol className="list-decimal pl-5 space-y-2 text-slate-700 text-[11px]">
                      <li>
                        Download and install LM Studio from{' '}
                        <a
                          href="https://lmstudio.ai"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-bold"
                        >
                          lmstudio.ai
                        </a>{' '}
                        (available for Mac and Windows).
                      </li>
                      <li>
                        Open LM Studio, search for <strong>Llama 3.2 3B</strong> or <strong>Mistral 7B</strong>, and click <strong>Download</strong>.
                      </li>
                      <li>
                        Click the <strong>&lt;-&gt; (Developer / Local Server)</strong> tab on the left sidebar.
                      </li>
                      <li>
                        Select the downloaded model in the top dropdown, then click the green <strong>Start Server</strong> button (runs on port 1234).
                      </li>
                      <li>
                        Click the button below to connect the simulator to LM Studio with 1 click:
                      </li>
                    </ol>

                    <div className="pl-4 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            aiProvider: 'lmstudio',
                            aiEndpoint: 'http://localhost:1234/v1',
                            aiModel: 'local-model'
                          }));
                          setActiveTab('ai');
                          showToast('Configured for LM Studio on port 1234!');
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Connect to LM Studio (Port 1234)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Comprehensive Device & Hardware Requirements Matrix */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span>Minimum Hardware Requirements for Local AIs by Device Type</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Find the exact model and memory specifications tailored for your laptop or classroom device.
                    </p>
                  </div>

                  {/* Device Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1">
                    {[
                      { id: 'all', label: 'All Devices' },
                      { id: 'mac', label: '🍏 Mac' },
                      { id: 'windows', label: '💻 Windows' },
                      { id: 'budget', label: '⚡ 4GB Budget' },
                      { id: 'gaming', label: '🚀 Workstation' },
                      { id: 'chromebook', label: '🌐 Chromebook' },
                      { id: 'linux', label: '🐧 Linux' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedDeviceCategory(tab.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                          selectedDeviceCategory === tab.id
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Device Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DEVICE_REQUIREMENTS_DATA.filter(
                    (d) => selectedDeviceCategory === 'all' || d.id === selectedDeviceCategory
                  ).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              {item.id === 'mac' && <Apple className="w-3.5 h-3.5 text-slate-900" />}
                              {item.id === 'windows' && <Laptop className="w-3.5 h-3.5 text-blue-600" />}
                              {item.id === 'budget' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                              {item.id === 'gaming' && <Cpu className="w-3.5 h-3.5 text-purple-600" />}
                              {item.id === 'chromebook' && <Tablet className="w-3.5 h-3.5 text-emerald-600" />}
                              {item.id === 'linux' && <Terminal className="w-3.5 h-3.5 text-slate-700" />}
                              <span>{item.name}</span>
                            </h5>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{item.subtitle}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>

                        {/* Specs List */}
                        <div className="bg-slate-50 rounded-lg p-2 space-y-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Min RAM:</span>
                            <strong className="text-slate-800 font-semibold">{item.minRam}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">CPU / Chip:</span>
                            <span className="text-slate-700 font-medium truncate max-w-[170px]" title={item.minCpu}>
                              {item.minCpu}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Storage:</span>
                            <span className="text-slate-700 font-medium">{item.minDisk}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-1 mt-1">
                            <span className="text-slate-500">Speed:</span>
                            <span className="text-blue-700 font-bold">{item.speedRating}</span>
                          </div>
                        </div>

                        {/* Capabilities & Subsystems */}
                        <div className="space-y-1 text-[10px] text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-700">Recommended Model:</span>{' '}
                            <span className="text-indigo-700 font-bold">{item.recommendedModel}</span>
                          </div>
                          <div className="text-[9px] text-slate-500">
                            <strong>STT:</strong> {item.sttSupport}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            <strong>TTS:</strong> {item.ttsSupport}
                          </div>
                        </div>
                      </div>

                      {/* Action Command Button */}
                      {item.modelCmd !== 'Active by default (No command needed)' ? (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.modelCmd);
                            showToast(`Copied: ${item.modelCmd}`);
                          }}
                          className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-mono text-[10px] font-bold flex items-center justify-center space-x-1 shadow-2xs transition"
                          title="Click to copy terminal command"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{item.modelCmd}</span>
                        </button>
                      ) : (
                        <div className="mt-2 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center rounded-lg text-[10px] font-bold">
                          ✓ Pre-Configured &amp; Active (No Download Needed)
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Summary Comparison Matrix Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 overflow-x-auto">
                  <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <Laptop className="w-3.5 h-3.5 text-slate-600" />
                    <span>Quick Hardware Specifications Matrix</span>
                  </span>

                  <table className="w-full text-left text-[11px] border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-1.5 pr-2">Device Type</th>
                        <th className="py-1.5 pr-2">Min RAM</th>
                        <th className="py-1.5 pr-2">Processor</th>
                        <th className="py-1.5 pr-2">Free Disk</th>
                        <th className="py-1.5 pr-2">Best Local Model</th>
                        <th className="py-1.5">Zero-Install Option</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 text-slate-700">
                      <tr>
                        <td className="py-2 pr-2 font-bold text-slate-900">🍏 Apple Silicon (M1-M4)</td>
                        <td className="py-2 pr-2 font-semibold text-emerald-700">8 GB</td>
                        <td className="py-2 pr-2">Apple M1/M2/M3/M4</td>
                        <td className="py-2 pr-2">3.5 GB</td>
                        <td className="py-2 pr-2 font-mono text-indigo-700 font-bold">llama3.2 (3B)</td>
                        <td className="py-2 text-emerald-600 font-bold">✓ Included</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-2 font-bold text-slate-900">💻 Standard Windows Laptop</td>
                        <td className="py-2 pr-2 font-semibold text-blue-700">8 GB</td>
                        <td className="py-2 pr-2">Intel Core i5 / Ryzen 5</td>
                        <td className="py-2 pr-2">4.0 GB</td>
                        <td className="py-2 pr-2 font-mono text-indigo-700 font-bold">llama3.2 (3B)</td>
                        <td className="py-2 text-emerald-600 font-bold">✓ Included</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-2 font-bold text-slate-900">⚡ Budget / School Loaner</td>
                        <td className="py-2 pr-2 font-semibold text-amber-700">4 GB</td>
                        <td className="py-2 pr-2">Intel Core i3 / Celeron</td>
                        <td className="py-2 pr-2">2.0 GB</td>
                        <td className="py-2 pr-2 font-mono text-emerald-700 font-bold">llama3.2:1b (1B)</td>
                        <td className="py-2 text-emerald-600 font-bold">✓ Included</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-2 font-bold text-slate-900">🚀 Workstation / Gaming PC</td>
                        <td className="py-2 pr-2 font-semibold text-purple-700">16 GB+</td>
                        <td className="py-2 pr-2">i7/i9 + Nvidia RTX GPU</td>
                        <td className="py-2 pr-2">8.0 GB</td>
                        <td className="py-2 pr-2 font-mono text-purple-700 font-bold">qwen2.5:7b (7B)</td>
                        <td className="py-2 text-emerald-600 font-bold">✓ Included</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-2 font-bold text-slate-900">🌐 Chromebook / Tablet</td>
                        <td className="py-2 pr-2 font-semibold text-slate-700">2 GB – 4 GB</td>
                        <td className="py-2 pr-2">Any ARM / x86 Browser</td>
                        <td className="py-2 pr-2">0 MB</td>
                        <td className="py-2 pr-2 font-semibold text-slate-600">Pearson Offline Engine</td>
                        <td className="py-2 text-emerald-600 font-bold">✓ Active Default</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subsystem Specifications Deep Dive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {/* Subsystem 1: LLM Engine */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-indigo-950 font-bold text-[11px]">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1. Local LLM Evaluator (Ollama)</span>
                    </div>
                    <p className="text-[10px] text-indigo-900 leading-relaxed">
                      • <strong>Processor:</strong> Any 64-bit CPU with AVX2 instruction set or Apple Silicon.<br />
                      • <strong>Memory:</strong> ~1.6 GB RAM for 1B, ~3.2 GB for 3B, ~6.5 GB for 7B.<br />
                      • <strong>Port:</strong> Listens automatically on <code className="bg-white/80 px-1 py-0.2 rounded font-mono">http://localhost:11434</code>.
                    </p>
                  </div>

                  {/* Subsystem 2: STT Engine */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-blue-950 font-bold text-[11px]">
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. Speech-to-Text (Transcripts)</span>
                    </div>
                    <p className="text-[10px] text-blue-900 leading-relaxed">
                      • <strong>Browser Native (Default):</strong> 0 MB extra RAM, uses built-in Chrome/Safari speech engine.<br />
                      • <strong>Local Whisper (Optional):</strong> Requires 2 GB RAM &amp; 500 MB disk for base model.
                    </p>
                  </div>

                  {/* Subsystem 3: TTS Engine */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-emerald-950 font-bold text-[11px]">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3. Neural Voice Engine (TTS)</span>
                    </div>
                    <p className="text-[10px] text-emerald-900 leading-relaxed">
                      • <strong>Edge Neural (Default):</strong> Broadcast 24kHz audio; automatically cached locally to disk.<br />
                      • <strong>Local Piper / Kokoro:</strong> Runs on any dual-core CPU with ~500 MB RAM usage.
                    </p>
                  </div>
                </div>

                {/* Zero-Install Reassurance Card */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Need a 100% Zero-Install Solution for Testing Rooms or Loaners?</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      You do not have to install Ollama or any extra software! The simulator comes pre-packaged with the <strong>Built-in Local Pearson AI Scoring Engine</strong> active by default. It grades pronunciation, oral fluency, reading comprehension, and essay word-counts 100% offline in client JavaScript with <strong>zero downloads, zero background processes, and zero external network access</strong> required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {toastMessage && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{toastMessage}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Integration Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

