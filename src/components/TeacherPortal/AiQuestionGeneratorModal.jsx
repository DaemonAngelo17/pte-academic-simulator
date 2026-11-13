import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Bot,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  RefreshCw,
  Plus,
  BookOpen,
  Sliders,
  Check,
  Edit3,
  Trash2,
  ArrowRight,
  Headphones,
  FileText,
  Mic,
  GraduationCap
} from 'lucide-react';
import { speakText, stopSpeaking, fallbackSpeechSynthesis } from '../../utils/audioUtils';

const TOPIC_PRESETS = [
  'Climate Dynamics & Clean Energy',
  'Artificial Intelligence & Digital Ethics',
  'Cognitive Psychology & Human Memory',
  'Global Macroeconomics & Trade',
  'Urban Architecture & Smart Cities',
  'Ancient Civilizations & Maritime Archaeology',
  'Biotechnology & Personalized Medicine',
  'Astrophysics & Deep Space Exploration'
];

const TASK_CATEGORIES = [
  {
    part: 'PART_1',
    label: 'Part 1: Speaking & Writing',
    tasks: [
      { code: 'RA', name: 'Read Aloud', icon: FileText, desc: 'Academic text 50–70 words' },
      { code: 'RS', name: 'Repeat Sentence', icon: Headphones, desc: 'Spoken sentence 8–15 words' },
      { code: 'DI', name: 'Describe Image', icon: FileText, desc: 'Chart, graph or process prompt' },
      { code: 'RL', name: 'Retell Lecture', icon: Mic, desc: 'Spoken lecture 120–180 words' },
      { code: 'SGD', name: 'Summarize Group Discussion', icon: Mic, desc: '3-speaker panel dialogue' },
      { code: 'RTS', name: 'Respond to Situation', icon: Mic, desc: 'University campus scenario' },
      { code: 'ASQ', name: 'Answer Short Question', icon: Headphones, desc: 'Concise factual query' },
      { code: 'SWT', name: 'Summarize Written Text', icon: FileText, desc: 'Passage for single-sentence summary' },
      { code: 'WE', name: 'Write Essay', icon: FileText, desc: '200–300 words essay topic' }
    ]
  },
  {
    part: 'PART_2',
    label: 'Part 2: Reading',
    tasks: [
      { code: 'FIB-RW', name: 'Reading & Writing FIB', icon: Layers, desc: 'Dropdown cloze with 4 choices' },
      { code: 'MCMA-R', name: 'Multiple Choice (Multi)', icon: Layers, desc: 'Passage with multi-select answers' },
      { code: 'RO-R', name: 'Reorder Paragraphs', icon: Layers, desc: 'Scrambled sequential sentences' },
      { code: 'FIB-R', name: 'Reading FIB (Drag)', icon: Layers, desc: 'Drag-and-drop word pool' },
      { code: 'MCSA-R', name: 'Multiple Choice (Single)', icon: Layers, desc: 'Passage with 1 correct answer' }
    ]
  },
  {
    part: 'PART_3',
    label: 'Part 3: Listening',
    tasks: [
      { code: 'SST', name: 'Summarize Spoken Text', icon: Headphones, desc: 'Spoken lecture for 50–70 words' },
      { code: 'MCMA-L', name: 'Multiple Choice (Multi)', icon: Headphones, desc: 'Audio recording with multiple answers' },
      { code: 'FIB-L', name: 'Fill in the Blanks', icon: Headphones, desc: 'Audio transcript with missing words' },
      { code: 'HCS', name: 'Highlight Correct Summary', icon: Headphones, desc: 'Audio with 4 summary choices' },
      { code: 'MCSA-L', name: 'Multiple Choice (Single)', icon: Headphones, desc: 'Audio with 1 correct answer' },
      { code: 'SMW', name: 'Select Missing Word', icon: Headphones, desc: 'Audio ending in beep' },
      { code: 'HIW', name: 'Highlight Incorrect Words', icon: Headphones, desc: 'Transcript with swapped words' },
      { code: 'WFD', name: 'Write from Dictation', icon: Headphones, desc: 'Dictated 8–12 word sentence' }
    ]
  }
];

export default function AiQuestionGeneratorModal({
  isOpen,
  onClose,
  onSaveToQuestionBank,
  onOpenSettings,
  activeBlueprint = null,
  onAddToBlueprint = null
}) {
  const [selectedTaskType, setSelectedTaskType] = useState('RA');
  const [selectedTopic, setSelectedTopic] = useState('Climate Dynamics & Clean Energy');
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(2);
  const [difficulty, setDifficulty] = useState('standard');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [autoSynthesizeAudio, setAutoSynthesizeAudio] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('en-GB-SoniaNeural');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [activeProviderName, setActiveProviderName] = useState('AI Evaluator');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Audio preview state
  const [playingItemId, setPlayingItemId] = useState(null);

  // Fetch current AI configuration
  useEffect(() => {
    if (!isOpen) return;
    const loadAiConfig = async () => {
      try {
        const res = await fetch('/api/integrations');
        const data = await res.json();
        if (data?.ok) {
          const prov = data.aiProvider || 'heuristic';
          const model = data.aiModel || '';
          setActiveProviderName(
            prov === 'heuristic'
              ? 'Local Heuristic Engine (Offline)'
              : `${prov.toUpperCase()}${model ? ` (${model})` : ''}`
          );
        }
      } catch {}
    };
    loadAiConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveTopic = customTopic.trim() || selectedTopic;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    setGeneratedQuestions([]);

    try {
      const res = await fetch('/api/ai-generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: selectedTaskType,
          topic: effectiveTopic,
          difficulty,
          count: questionCount,
          instructions: specialInstructions,
          autoSynthesizeAudio
        })
      });

      const data = await res.json();
      if (data.ok && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setStatusMessage({
          type: 'success',
          text: `Generated ${data.questions.length} question(s) via ${data.provider.toUpperCase()}!`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to generate questions.'
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Network error generating questions: ' + err.message
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = (q) => {
    const textToSpeak = q.audioText || q.prompt;
    if (!textToSpeak) return;

    if (playingItemId === q.id) {
      stopSpeaking();
      setPlayingItemId(null);
      return;
    }

    setPlayingItemId(q.id);
    speakText(
      textToSpeak,
      () => setPlayingItemId(null),
      { voice: selectedVoice, allowRoboticFallback: true }
    );
  };

  const handleUpdateGeneratedQuestion = (idx, field, value) => {
    const updated = [...generatedQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    setGeneratedQuestions(updated);
  };

  const handleDeleteGeneratedQuestion = (idx) => {
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== idx));
  };

  const handleSaveAll = async (alsoAddToBlueprint = false) => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/ai-bulk-save-generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: generatedQuestions,
          autoSynthesizeAudio,
          preferredVoice: selectedVoice
        })
      });

      const data = await res.json();
      if (data.ok) {
        if (onSaveToQuestionBank) {
          onSaveToQuestionBank(data.savedItems || generatedQuestions);
        }

        if (alsoAddToBlueprint && onAddToBlueprint && Array.isArray(data.savedItems)) {
          data.savedItems.forEach((item) => onAddToBlueprint(item));
        }

        setStatusMessage({
          type: 'success',
          text: `Saved ${data.savedCount} question(s) to Question Bank successfully!`
        });

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        alert(data.error || 'Failed to save generated questions.');
      }
    } catch (err) {
      alert('Error saving questions: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-800/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">AI Question &amp; Prompt Generator</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-bold text-purple-200">
                  Cloud &amp; Local LLM
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Generate Pearson-authentic questions, prompts, and rubrics using {activeProviderName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white transition"
                title="Configure AI Models (Gemini, Grok, GPT, Ollama)"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-300" />
                <span>AI Settings</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body (Split Configuration & Preview) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task Type Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Task Format
              </label>
              <select
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <optgroup key={cat.part} label={cat.label}>
                    {cat.tasks.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.code} — {t.name} ({t.desc})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Quantity & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs"
                >
                  <option value={1}>1 Question</option>
                  <option value={2}>2 Questions</option>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs"
                >
                  <option value="standard">Standard Academic (PTE 65-79)</option>
                  <option value="challenging">Advanced Superior (PTE 79-90)</option>
                  <option value="introductory">Foundation (PTE 50-65)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Topic Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Academic Topic / Subject Domain
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(preset);
                    setCustomTopic('');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                    selectedTopic === preset && !customTopic
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or enter a custom domain (e.g., Marine Bioluminescence, Microeconomic Market Failures)..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:border-purple-600 focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* Audio & Special Instructions Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="autoSynthAudio"
                checked={autoSynthesizeAudio}
                onChange={(e) => setAutoSynthesizeAudio(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded accent-purple-600"
              />
              <label htmlFor="autoSynthAudio" className="text-xs text-slate-700 cursor-pointer select-none">
                <span className="font-bold text-slate-900 block">Pre-render Neural Audio (.mp3)</span>
                <span className="text-[11px] text-slate-500">
                  Synthesize listening and speaking audio prompts using Studio HD Edge TTS
                </span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Custom Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Include specific technical terminology; focus on Australian context..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Pearson Questions via {activeProviderName}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate {questionCount} Question(s) for {selectedTaskType}</span>
              </>
            )}
          </button>

          {/* Generated Questions Preview & Edit Cards */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Review Generated Questions ({generatedQuestions.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500 italic">
                  Review and edit before saving to the question bank
                </span>
              </div>

              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-100 text-purple-900 border border-purple-200">
                          {q.taskType}
                        </span>
                        <input
                          type="text"
                          value={q.title || ''}
                          onChange={(e) => handleUpdateGeneratedQuestion(idx, 'title', e.target.value)}
                          className="font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-purple-600 focus:outline-hidden px-1"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {(q.audioText || q.prompt) && (
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(q)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-[11px] flex items-center space-x-1"
                            title="Preview Audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{playingItemId === q.id ? 'Stop' : 'Listen'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteGeneratedQuestion(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Discard this item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Stimulus / Prompt Text
                      </label>
                      <textarea
                        rows={3}
                        value={q.prompt || ''}
                        onChange={(e) => handleUpdateGeneratedQuestion(idx, 'prompt', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed focus:border-purple-600 focus:outline-hidden font-sans"
                      />
                    </div>

                    {/* Audio or Reference Text */}
                    {(q.audioText || q.referenceText) && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {q.audioText ? 'Spoken Audio Transcript' : 'Reference / Model Answer'}
                        </label>
                        <textarea
                          rows={2}
                          value={q.audioText || q.referenceText || ''}
                          onChange={(e) =>
                            handleUpdateGeneratedQuestion(
                              idx,
                              q.audioText ? 'audioText' : 'referenceText',
                              e.target.value
                            )
                          }
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed focus:border-purple-600 focus:outline-hidden font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSaveAll(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save All to Question Bank'}</span>
                </button>

                {activeBlueprint && onAddToBlueprint && (
                  <button
                    type="button"
                    onClick={() => handleSaveAll(true)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#003865] hover:bg-[#002644] text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save &amp; Insert into Blueprint</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

