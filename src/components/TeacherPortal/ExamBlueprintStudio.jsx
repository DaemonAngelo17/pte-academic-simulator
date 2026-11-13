import React, { useState, useEffect } from 'react';
import AiQuestionGeneratorModal from './AiQuestionGeneratorModal';
import {
  Layers,
  Clock,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Plus,
  Trash2,
  Save,
  Play,
  Download,
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Sparkles,
  Settings,
  Search,
  Filter,
  Eye,
  Edit3,
  RefreshCw,
  FolderPlus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { INTERACTION_ARCHETYPES, BASE_TASK_TYPES } from '../../config/examConfigDefaults';
import { formatTimeMMSS } from '../../config/pteRules';

export default function ExamBlueprintStudio({
  questionBank,
  onLaunchStudentExam,
  onUpdateQuestionBank
}) {
  const [activeSubTab, setActiveSubTab] = useState('blueprints'); // 'blueprints' | 'taskTypes'

  // Blueprints state
  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(null);
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [isSavingBlueprint, setIsSavingBlueprint] = useState(false);
  const [statusNotification, setStatusNotification] = useState(null);

  // Add Questions to Blueprint Modal state
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [searchQuestionTerm, setSearchQuestionTerm] = useState('');
  const [filterPart, setFilterPart] = useState('all');
  const [filterTaskType, setFilterTaskType] = useState('all');

  // Task Types Registry state
  const [taskTypes, setTaskTypes] = useState(BASE_TASK_TYPES);
  const [showNewTaskTypeModal, setShowNewTaskTypeModal] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState(null);

  // New/Edit Task Type form state
  const [taskTypeForm, setTaskTypeForm] = useState({
    code: '',
    name: '',
    part: 'PART_1',
    category: 'Speaking',
    archetype: 'spoken',
    scored: true,
    prepSeconds: 35,
    recordSeconds: 40,
    dedicatedTimerSeconds: 0,
    minWords: 0,
    maxWords: 0,
    scoringMode: 'rubric_ai',
    pointsPerCorrect: 1,
    penaltyPerIncorrect: 0,
    instructions: '',
    skillsContributed: ['Speaking']
  });

  const showToast = (message, type = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Fetch live blueprints and task types from backend
  const loadData = async () => {
    try {
      const [bpRes, ttRes] = await Promise.all([
        fetch('/api/blueprints').catch(() => null),
        fetch('/api/task-types').catch(() => null)
      ]);

      if (bpRes && bpRes.ok) {
        const bpData = await bpRes.json();
        if (Array.isArray(bpData.blueprints) && bpData.blueprints.length > 0) {
          setBlueprints(bpData.blueprints);
          if (!selectedBlueprintId) {
            setSelectedBlueprintId(bpData.blueprints[0].id);
            setActiveBlueprint(JSON.parse(JSON.stringify(bpData.blueprints[0])));
          }
        } else if (questionBank?.testPackages?.length > 0) {
          setBlueprints(questionBank.testPackages);
          setSelectedBlueprintId(questionBank.testPackages[0].id);
          setActiveBlueprint(JSON.parse(JSON.stringify(questionBank.testPackages[0])));
        }
      }

      if (ttRes && ttRes.ok) {
        const ttData = await ttRes.json();
        if (ttData.taskTypes && Object.keys(ttData.taskTypes).length > 0) {
          setTaskTypes({ ...BASE_TASK_TYPES, ...ttData.taskTypes });
        }
      }
    } catch {
      // Fallback to local defaults
      if (questionBank?.testPackages?.length > 0) {
        setBlueprints(questionBank.testPackages);
        setSelectedBlueprintId(questionBank.testPackages[0].id);
        setActiveBlueprint(JSON.parse(JSON.stringify(questionBank.testPackages[0])));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected blueprint changes
  const handleSelectBlueprint = (id) => {
    setSelectedBlueprintId(id);
    const found = blueprints.find((b) => b.id === id);
    if (found) {
      setActiveBlueprint(JSON.parse(JSON.stringify(found)));
    }
  };

  // Save Blueprint to backend
  const handleSaveBlueprint = async () => {
    if (!activeBlueprint) return;
    setIsSavingBlueprint(true);
    try {
      // Ensure sync between itemIds array and items array
      const items = activeBlueprint.items || [];
      const itemIds = items.map((it) => (typeof it === 'string' ? it : it.id));
      const payload = {
        ...activeBlueprint,
        items,
        itemIds
      };

      const res = await fetch('/api/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Exam Blueprint "${payload.name}" saved successfully!`, 'success');
        setBlueprints(data.blueprints || []);
        setActiveBlueprint(data.blueprint);
        if (onUpdateQuestionBank) {
          onUpdateQuestionBank({
            ...questionBank,
            testPackages: data.blueprints
          });
        }
      } else {
        showToast(data.error || 'Failed to save blueprint', 'error');
      }
    } catch (err) {
      showToast('Error saving blueprint: ' + err.message, 'error');
    } finally {
      setIsSavingBlueprint(false);
    }
  };

  // Create New Blueprint
  const handleCreateBlueprint = () => {
    const newId = `PKG-CUSTOM-${Date.now()}`;
    const newBp = {
      id: newId,
      name: 'Custom Exam Blueprint',
      description: 'Custom exam package with custom question sequencing and timing rules.',
      createdAt: new Date().toISOString(),
      sectionConfig: {
        PART_1: {
          name: 'Part 1: Speaking & Writing',
          timerStrategy: 'per_item',
          sectionSeconds: 80 * 60,
          enabled: true
        },
        PART_2: {
          name: 'Part 2: Reading',
          timerStrategy: 'cumulative_section',
          sectionSeconds: 27 * 60,
          enabled: true
        },
        PART_3: {
          name: 'Part 3: Listening',
          timerStrategy: 'hybrid_sst_plus_shared',
          sharedPoolSeconds: 25 * 60,
          sstTimerSeconds: 10 * 60,
          enabled: true
        }
      },
      items: (questionBank?.items || []).slice(0, 5).map((it) => ({
        id: it.id,
        taskType: it.taskType,
        part: it.part,
        timingOverrides: {},
        scoringOverrides: {}
      })),
      itemIds: (questionBank?.items || []).slice(0, 5).map((it) => it.id)
    };

    setBlueprints([newBp, ...blueprints]);
    setSelectedBlueprintId(newId);
    setActiveBlueprint(newBp);
    showToast('New Exam Blueprint created! Add questions and configure timing.', 'info');
  };

  // Clone Current Blueprint
  const handleCloneBlueprint = () => {
    if (!activeBlueprint) return;
    const cloneId = `PKG-CLONE-${Date.now()}`;
    const clone = {
      ...JSON.parse(JSON.stringify(activeBlueprint)),
      id: cloneId,
      name: `${activeBlueprint.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setBlueprints([clone, ...blueprints]);
    setSelectedBlueprintId(cloneId);
    setActiveBlueprint(clone);
    showToast(`Cloned blueprint as "${clone.name}"`, 'success');
  };

  // Delete Blueprint
  const handleDeleteBlueprint = async (id) => {
    if (!confirm('Are you sure you want to delete this Exam Blueprint?')) return;
    try {
      const res = await fetch(`/api/blueprints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = blueprints.filter((b) => b.id !== id);
        setBlueprints(remaining);
        if (remaining.length > 0) {
          setSelectedBlueprintId(remaining[0].id);
          setActiveBlueprint(JSON.parse(JSON.stringify(remaining[0])));
        } else {
          setSelectedBlueprintId(null);
          setActiveBlueprint(null);
        }
        showToast('Blueprint deleted successfully.', 'info');
      }
    } catch (err) {
      showToast('Error deleting blueprint: ' + err.message, 'error');
    }
  };

  // Reorder Item: Move Up
  const handleMoveItemUp = (index) => {
    if (!activeBlueprint || index <= 0) return;
    const items = [...(activeBlueprint.items || [])];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    setActiveBlueprint({ ...activeBlueprint, items });
  };

  // Reorder Item: Move Down
  const handleMoveItemDown = (index) => {
    if (!activeBlueprint || !activeBlueprint.items || index >= activeBlueprint.items.length - 1) return;
    const items = [...activeBlueprint.items];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    setActiveBlueprint({ ...activeBlueprint, items });
  };

  // Remove Item from Blueprint
  const handleRemoveItem = (index) => {
    if (!activeBlueprint || !activeBlueprint.items) return;
    const items = activeBlueprint.items.filter((_, idx) => idx !== index);
    setActiveBlueprint({ ...activeBlueprint, items });
  };

  // Update Item Timing Override
  const handleUpdateItemTiming = (index, field, value) => {
    if (!activeBlueprint || !activeBlueprint.items) return;
    const items = [...activeBlueprint.items];
    const current = items[index];
    const itemObj = typeof current === 'string' ? { id: current } : { ...current };
    itemObj.timingOverrides = {
      ...(itemObj.timingOverrides || {}),
      [field]: value === '' ? undefined : Number(value)
    };
    items[index] = itemObj;
    setActiveBlueprint({ ...activeBlueprint, items });
  };

  // Update Item Scoring Override
  const handleUpdateItemScoring = (index, field, value) => {
    if (!activeBlueprint || !activeBlueprint.items) return;
    const items = [...activeBlueprint.items];
    const current = items[index];
    const itemObj = typeof current === 'string' ? { id: current } : { ...current };
    itemObj.scoringOverrides = {
      ...(itemObj.scoringOverrides || {}),
      [field]: value === '' ? undefined : Number(value)
    };
    items[index] = itemObj;
    setActiveBlueprint({ ...activeBlueprint, items });
  };

  // Add questions to active blueprint
  const handleAddQuestionToBlueprint = (item) => {
    if (!activeBlueprint) return;
    const items = [...(activeBlueprint.items || [])];
    const exists = items.some((it) => (typeof it === 'string' ? it === item.id : it.id === item.id));
    if (exists) {
      showToast(`${item.id} is already in this blueprint.`, 'info');
      return;
    }
    items.push({
      id: item.id,
      taskType: item.taskType,
      part: item.part,
      timingOverrides: {},
      scoringOverrides: {}
    });
    setActiveBlueprint({ ...activeBlueprint, items });
    showToast(`Added ${item.id} to blueprint.`, 'success');
  };

  // Save Task Type to backend
  const handleSaveTaskType = async () => {
    if (!taskTypeForm.code || !taskTypeForm.name) {
      alert('Please provide Task Code and Name.');
      return;
    }
    try {
      const res = await fetch('/api/task-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskTypeForm)
      });
      const data = await res.json();
      if (res.ok) {
        setTaskTypes({ ...taskTypes, [taskTypeForm.code.toUpperCase()]: data.taskType });
        setShowNewTaskTypeModal(false);
        showToast(`Task Type ${taskTypeForm.code.toUpperCase()} saved!`, 'success');
      } else {
        alert(data.error || 'Failed to save task type');
      }
    } catch (err) {
      alert('Error saving task type: ' + err.message);
    }
  };

  // Export Blueprint as JSON
  const handleExportBlueprintJson = () => {
    if (!activeBlueprint) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeBlueprint, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${activeBlueprint.id || 'blueprint'}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Import Blueprint from JSON
  const handleImportBlueprintJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.name) throw new Error('Missing blueprint name');
        parsed.id = parsed.id || `PKG-IMPORTED-${Date.now()}`;
        setBlueprints([parsed, ...blueprints]);
        setSelectedBlueprintId(parsed.id);
        setActiveBlueprint(parsed);
        showToast(`Imported blueprint "${parsed.name}" successfully!`, 'success');
      } catch (err) {
        alert('Invalid blueprint JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter questions for the "Add Question" modal
  const allBankItems = questionBank?.items || [];
  const filteredBankItems = allBankItems.filter((item) => {
    const matchesSearch =
      !searchQuestionTerm ||
      item.id.toLowerCase().includes(searchQuestionTerm.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchQuestionTerm.toLowerCase())) ||
      (item.prompt && item.prompt.toLowerCase().includes(searchQuestionTerm.toLowerCase()));

    const matchesPart = filterPart === 'all' || item.part === filterPart;
    const matchesTask = filterTaskType === 'all' || item.taskType === filterTaskType;

    return matchesSearch && matchesPart && matchesTask;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusNotification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold border ${
            statusNotification.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : statusNotification.type === 'info'
              ? 'bg-blue-50 border-blue-300 text-blue-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          {statusNotification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{statusNotification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Exam Blueprints &amp; Structure Studio
            </h2>
            <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
              Extensible Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build custom exam structures, reorder questions, override section and question time limits, and configure scoring rules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('blueprints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'blueprints'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Exam Blueprints ({blueprints.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('taskTypes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'taskTypes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Task Type Registry ({Object.keys(taskTypes).length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: EXAM BLUEPRINTS & QUESTION SEQUENCING         */}
      {/* ========================================================= */}
      {activeSubTab === 'blueprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Blueprint Selector & Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Exam Blueprint
                </h3>
                <div className="flex items-center space-x-1">
                  <label className="cursor-pointer p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100" title="Import Blueprint JSON">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept=".json" onChange={handleImportBlueprintJson} className="hidden" />
                  </label>
                  <button
                    onClick={handleCreateBlueprint}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Create New Blueprint"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Blueprint List */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {blueprints.map((bp) => {
                  const isSelected = bp.id === selectedBlueprintId;
                  const count = (bp.items || bp.itemIds || []).length;
                  return (
                    <div
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-xs text-slate-900">{bp.name}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {count} items
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {bp.description || 'No description provided.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blueprint Meta Card */}
            {activeBlueprint && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Blueprint Settings
                </h3>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blueprint Name</label>
                  <input
                    type="text"
                    value={activeBlueprint.name || ''}
                    onChange={(e) => setActiveBlueprint({ ...activeBlueprint, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    value={activeBlueprint.description || ''}
                    onChange={(e) => setActiveBlueprint({ ...activeBlueprint, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 focus:outline-hidden resize-none"
                  />
                </div>

                {/* Section Timing Overrides */}
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase">Section Time Limits</h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Part 1 (Speaking &amp; Writing)</span>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <input
                          type="number"
                          value={Math.round((activeBlueprint.sectionConfig?.PART_1?.sectionSeconds || 4800) / 60)}
                          onChange={(e) => {
                            const mins = Math.max(1, Number(e.target.value) || 1);
                            setActiveBlueprint({
                              ...activeBlueprint,
                              sectionConfig: {
                                ...(activeBlueprint.sectionConfig || {}),
                                PART_1: {
                                  ...(activeBlueprint.sectionConfig?.PART_1 || {}),
                                  sectionSeconds: mins * 60
                                }
                              }
                            });
                          }}
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                        />
                        <span className="text-[11px] text-slate-600 font-medium">mins</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Part 2 (Reading)</span>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <input
                          type="number"
                          value={Math.round((activeBlueprint.sectionConfig?.PART_2?.sectionSeconds || 1620) / 60)}
                          onChange={(e) => {
                            const mins = Math.max(1, Number(e.target.value) || 1);
                            setActiveBlueprint({
                              ...activeBlueprint,
                              sectionConfig: {
                                ...(activeBlueprint.sectionConfig || {}),
                                PART_2: {
                                  ...(activeBlueprint.sectionConfig?.PART_2 || {}),
                                  sectionSeconds: mins * 60
                                }
                              }
                            });
                          }}
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                        />
                        <span className="text-[11px] text-slate-600 font-medium">mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Part 3 Shared Pool</span>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <input
                          type="number"
                          value={Math.round((activeBlueprint.sectionConfig?.PART_3?.sharedPoolSeconds || 1500) / 60)}
                          onChange={(e) => {
                            const mins = Math.max(1, Number(e.target.value) || 1);
                            setActiveBlueprint({
                              ...activeBlueprint,
                              sectionConfig: {
                                ...(activeBlueprint.sectionConfig || {}),
                                PART_3: {
                                  ...(activeBlueprint.sectionConfig?.PART_3 || {}),
                                  sharedPoolSeconds: mins * 60
                                }
                              }
                            });
                          }}
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                        />
                        <span className="text-[11px] text-slate-600 font-medium">mins</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">SST Dedicated Timer</span>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <input
                          type="number"
                          value={Math.round((activeBlueprint.sectionConfig?.PART_3?.sstTimerSeconds || 600) / 60)}
                          onChange={(e) => {
                            const mins = Math.max(1, Number(e.target.value) || 1);
                            setActiveBlueprint({
                              ...activeBlueprint,
                              sectionConfig: {
                                ...(activeBlueprint.sectionConfig || {}),
                                PART_3: {
                                  ...(activeBlueprint.sectionConfig?.PART_3 || {}),
                                  sstTimerSeconds: mins * 60
                                }
                              }
                            });
                          }}
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                        />
                        <span className="text-[11px] text-slate-600 font-medium">mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                  <button
                    onClick={handleSaveBlueprint}
                    disabled={isSavingBlueprint}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingBlueprint ? 'Saving...' : 'Save Blueprint'}</span>
                  </button>

                  <button
                    onClick={handleExportBlueprintJson}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-300 transition"
                    title="Export Blueprint JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleCloneBlueprint}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-300 transition"
                    title="Clone as New Blueprint"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteBlueprint(activeBlueprint.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs rounded border border-rose-200 transition"
                    title="Delete Blueprint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Question Sequencing & Overrides (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activeBlueprint ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Header bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Question Sequencing ({activeBlueprint.items?.length || 0} Questions)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAiGenModal(true)}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-xs"
                      title="Synthesize custom questions with AI and insert directly into this blueprint"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>AI Synthesize</span>
                    </button>

                    <button
                      onClick={() => setShowAddQuestionsModal(true)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Questions</span>
                    </button>

                    <button
                      onClick={() => onLaunchStudentExam && onLaunchStudentExam(`PKG:${activeBlueprint.id}`)}
                      className="px-3 py-1 bg-[#003865] hover:bg-[#002644] text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>Launch in Terminal</span>
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 w-28">Order</th>
                        <th className="py-2.5 px-3">Question ID &amp; Type</th>
                        <th className="py-2.5 px-3 w-36">Timing Overrides</th>
                        <th className="py-2.5 px-3 w-32">Scoring Overrides</th>
                        <th className="py-2.5 px-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeBlueprint.items || []).map((rawItem, idx) => {
                        const itemObj = typeof rawItem === 'string' ? { id: rawItem } : rawItem;
                        const fullItem = (questionBank?.items || []).find((it) => it.id === itemObj.id) || {};
                        const taskType = itemObj.taskType || fullItem.taskType || 'CUSTOM';
                        const timing = itemObj.timingOverrides || {};
                        const scoring = itemObj.scoringOverrides || {};

                        return (
                          <tr key={`${itemObj.id}-${idx}`} className="hover:bg-slate-50 transition">
                            {/* Sequence number */}
                            <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-400">
                              {idx + 1}
                            </td>

                            {/* Move Up / Down */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveItemUp(idx)}
                                  disabled={idx === 0}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition"
                                  title="Move Earlier in Exam"
                                >
                                  <MoveUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveItemDown(idx)}
                                  disabled={idx === activeBlueprint.items.length - 1}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition"
                                  title="Move Later in Exam"
                                >
                                  <MoveDown className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Question Title & Type */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-mono">
                                  {taskType}
                                </span>
                                <span>{itemObj.id}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {fullItem.title || fullItem.prompt || 'No prompt preview available'}
                              </p>
                            </td>

                            {/* Timing Overrides */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 w-10">Prep:</span>
                                  <input
                                    type="number"
                                    placeholder={String(fullItem.prepSeconds || 0)}
                                    value={timing.prepSeconds ?? ''}
                                    onChange={(e) => handleUpdateItemTiming(idx, 'prepSeconds', e.target.value)}
                                    className="w-14 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded font-mono"
                                  />
                                  <span className="text-[10px] text-slate-400">s</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 w-10">Ans:</span>
                                  <input
                                    type="number"
                                    placeholder={String(fullItem.recordSeconds || fullItem.timerSeconds || 0)}
                                    value={timing.recordSeconds ?? timing.timerSeconds ?? ''}
                                    onChange={(e) => handleUpdateItemTiming(idx, 'recordSeconds', e.target.value)}
                                    className="w-14 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded font-mono"
                                  />
                                  <span className="text-[10px] text-slate-400">s</span>
                                </div>
                              </div>
                            </td>

                            {/* Scoring Overrides */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 w-8">+Pts:</span>
                                  <input
                                    type="number"
                                    placeholder="1"
                                    value={scoring.pointsPerCorrect ?? ''}
                                    onChange={(e) => handleUpdateItemScoring(idx, 'pointsPerCorrect', e.target.value)}
                                    className="w-12 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded font-mono"
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 w-8">-Pen:</span>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={scoring.penaltyPerIncorrect ?? ''}
                                    onChange={(e) => handleUpdateItemScoring(idx, 'penaltyPerIncorrect', e.target.value)}
                                    className="w-12 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded font-mono"
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Remove button */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove question from blueprint"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {(!activeBlueprint.items || activeBlueprint.items.length === 0) && (
                    <div className="p-10 text-center text-slate-400 space-y-2">
                      <p className="text-xs">This blueprint has no questions assigned yet.</p>
                      <button
                        onClick={() => setShowAddQuestionsModal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold"
                      >
                        + Add Questions from Question Bank
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                Select or create an Exam Blueprint to begin editing its sequence and timers.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: TASK TYPE REGISTRY (EXTENSIBLE QUESTION TYPES) */}
      {/* ========================================================= */}
      {activeSubTab === 'taskTypes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered Task &amp; Question Types</h3>
              <p className="text-xs text-slate-500">
                Includes all 22 Pearson PTE Academic standards plus custom task types powered by Interaction Archetypes.
              </p>
            </div>
            <button
              onClick={() => {
                setTaskTypeForm({
                  code: '',
                  name: '',
                  part: 'PART_1',
                  category: 'Speaking',
                  archetype: 'spoken',
                  scored: true,
                  prepSeconds: 30,
                  recordSeconds: 45,
                  dedicatedTimerSeconds: 0,
                  minWords: 0,
                  maxWords: 0,
                  scoringMode: 'rubric_ai',
                  pointsPerCorrect: 1,
                  penaltyPerIncorrect: 0,
                  instructions: '',
                  skillsContributed: ['Speaking']
                });
                setShowNewTaskTypeModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task Type</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(taskTypes).map((tt) => {
              const archetypeMeta = INTERACTION_ARCHETYPES[tt.archetype] || {};
              return (
                <div key={tt.code} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                          {tt.code}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          {tt.part}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{tt.name}</h4>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {tt.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tt.instructions || 'No instructions provided.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-500">
                    <div className="flex justify-between">
                      <span>Archetype:</span>
                      <strong className="text-slate-800">{archetypeMeta.label || tt.archetype || 'Custom'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Default Timers:</span>
                      <strong className="text-slate-800 font-mono">
                        {tt.prepSeconds ? `Prep: ${tt.prepSeconds}s | ` : ''}
                        {tt.recordSeconds ? `Rec: ${tt.recordSeconds}s` : ''}
                        {tt.dedicatedTimerSeconds ? `Limit: ${formatTimeMMSS(tt.dedicatedTimerSeconds)}` : ''}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Scoring Strategy:</span>
                      <strong className="text-slate-800">{tt.scoringMode || 'Auto / Rubric'}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD QUESTIONS TO BLUEPRINT                         */}
      {/* ========================================================= */}
      {showAddQuestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-300">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Add Questions to Exam Blueprint</h3>
                <p className="text-xs text-slate-400">
                  Select questions from the question bank to include in "{activeBlueprint?.name}".
                </p>
              </div>
              <button
                onClick={() => setShowAddQuestionsModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ID, title, text..."
                  value={searchQuestionTerm}
                  onChange={(e) => setSearchQuestionTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <select
                  value={filterPart}
                  onChange={(e) => setFilterPart(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="all">All Parts</option>
                  <option value="PART_1">Part 1: Speaking &amp; Writing</option>
                  <option value="PART_2">Part 2: Reading</option>
                  <option value="PART_3">Part 3: Listening</option>
                </select>
              </div>

              <div>
                <select
                  value={filterTaskType}
                  onChange={(e) => setFilterTaskType(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="all">All Task Types</option>
                  {Object.keys(taskTypes).map((code) => (
                    <option key={code} value={code}>
                      {code} - {taskTypes[code]?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Picker List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredBankItems.map((item) => {
                const isAlreadyIn = (activeBlueprint?.items || []).some(
                  (it) => (typeof it === 'string' ? it === item.id : it.id === item.id)
                );
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition flex items-center justify-between"
                  >
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                          {item.id}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.taskType}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.prompt || item.referenceText}</p>
                    </div>

                    <button
                      onClick={() => handleAddQuestionToBlueprint(item)}
                      disabled={isAlreadyIn}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 ${
                        isAlreadyIn
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isAlreadyIn ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}

              {filteredBankItems.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching questions found in question bank.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowAddQuestionsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
              >
                Done Adding Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Question Synthesizer Modal */}
      <AiQuestionGeneratorModal
        isOpen={showAiGenModal}
        onClose={() => setShowAiGenModal(false)}
        activeBlueprint={activeBlueprint}
        onAddToBlueprint={(item) => handleAddQuestionToBlueprint(item)}
        onSaveToQuestionBank={(savedItems) => {
          if (onUpdateQuestionBank && questionBank) {
            onUpdateQuestionBank({
              ...questionBank,
              items: [...(questionBank.items || []), ...(Array.isArray(savedItems) ? savedItems : [])]
            });
          }
        }}
      />

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW TASK TYPE                               */}
      {/* ========================================================= */}
      {showNewTaskTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Define New Task &amp; Question Type</h3>
              <button
                onClick={() => setShowNewTaskTypeModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Task Code (e.g. RTS2, ESSAY-SHORT)</label>
                  <input
                    type="text"
                    value={taskTypeForm.code}
                    onChange={(e) => setTaskTypeForm({ ...taskTypeForm, code: e.target.value.toUpperCase() })}
                    placeholder="MY-TASK"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Task Name</label>
                  <input
                    type="text"
                    value={taskTypeForm.name}
                    onChange={(e) => setTaskTypeForm({ ...taskTypeForm, name: e.target.value })}
                    placeholder="e.g. Quick Speaking Interview"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam Part</label>
                  <select
                    value={taskTypeForm.part}
                    onChange={(e) => setTaskTypeForm({ ...taskTypeForm, part: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="PART_1">Part 1: Speaking &amp; Writing</option>
                    <option value="PART_2">Part 2: Reading</option>
                    <option value="PART_3">Part 3: Listening</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={taskTypeForm.category}
                    onChange={(e) => setTaskTypeForm({ ...taskTypeForm, category: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Speaking">Speaking</option>
                    <option value="Writing">Writing</option>
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interaction Archetype</label>
                  <select
                    value={taskTypeForm.archetype}
                    onChange={(e) => setTaskTypeForm({ ...taskTypeForm, archetype: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-medium text-blue-900"
                  >
                    {Object.entries(INTERACTION_ARCHETYPES).map(([key, arch]) => (
                      <option key={key} value={key}>
                        {arch.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing parameters */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase">Default Timers</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500">Prep Countdown (s)</label>
                    <input
                      type="number"
                      value={taskTypeForm.prepSeconds}
                      onChange={(e) => setTaskTypeForm({ ...taskTypeForm, prepSeconds: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Recording / Answer (s)</label>
                    <input
                      type="number"
                      value={taskTypeForm.recordSeconds}
                      onChange={(e) => setTaskTypeForm({ ...taskTypeForm, recordSeconds: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Dedicated Timer (s)</label>
                    <input
                      type="number"
                      value={taskTypeForm.dedicatedTimerSeconds}
                      onChange={(e) => setTaskTypeForm({ ...taskTypeForm, dedicatedTimerSeconds: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Scoring parameters */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase">Scoring Criteria &amp; Strategy</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500">Scoring Mode</label>
                    <select
                      value={taskTypeForm.scoringMode}
                      onChange={(e) => setTaskTypeForm({ ...taskTypeForm, scoringMode: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="rubric_ai">AI Rubric &amp; Human</option>
                      <option value="points_per_blank">Points Per Blank / Option</option>
                      <option value="negative_marking">Negative Marking (+1 / -1)</option>
                      <option value="exact_match">Exact Text Match</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Points Per Correct</label>
                    <input
                      type="number"
                      value={taskTypeForm.pointsPerCorrect}
                      onChange={(e) => setTaskTypeForm({ ...taskTypeForm, pointsPerCorrect: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Penalty Per Incorrect</label>
                    <input
                      type="number"
                      value={taskTypeForm.penaltyPerIncorrect}
                      onChange={(e) => setTaskTypeForm({ ...taskTypeForm, penaltyPerIncorrect: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={taskTypeForm.instructions}
                  onChange={(e) => setTaskTypeForm({ ...taskTypeForm, instructions: e.target.value })}
                  placeholder="Official instructions shown to the candidate on the exam screen..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowNewTaskTypeModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTaskType}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                Save Task Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

