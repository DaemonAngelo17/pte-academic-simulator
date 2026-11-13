import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Sliders,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  FileSpreadsheet,
  Activity,
  Plus,
  Trash2,
  Cpu
} from 'lucide-react';
import {
  DEFAULT_SCORING_EQUATIONS,
  loadScoringEquations,
  saveScoringEquations,
  resetScoringEquations,
  scalePteWithConfig,
  calculateOverallPteWithConfig,
  scoreRaContentWithConfig,
  getCefrWithConfig,
  getIeltsWithConfig
} from '../../config/scoringEquations';

export default function EquationStudio({ onEquationsUpdated }) {
  const [equations, setEquations] = useState(() => loadScoringEquations());
  const [activeTab, setActiveTab] = useState('gse'); // 'gse', 'tasks', 'cefr', 'ielts', 'sandbox'
  const [savedToast, setSavedToast] = useState(false);
  const [resetToast, setResetToast] = useState(false);
  const [errorToast, setErrorToast] = useState('');

  // Live Test Sandbox State
  const [testStudent, setTestStudent] = useState({
    name: 'Elena Rostova',
    part1Raw: 398.1,
    part2Raw: 51.0,
    part3Raw: 68.0,
    speakingRaw: 353.1,
    writingRaw: 114.0,
    readingRaw: 68.0,
    listeningRaw: 111.0
  });

  // RA Content Live Calculator State
  const [raTester, setRaTester] = useState({
    promptWords: 60,
    readingErrors: 4
  });

  // Load from backend on mount if available
  useEffect(() => {
    fetch('/api/scoring-equations')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok && data.equations) {
          setEquations(data.equations);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await saveScoringEquations(equations);
      if (res && res.ok) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
        if (onEquationsUpdated) onEquationsUpdated(equations);
      } else {
        setErrorToast(res?.error || 'Failed to save equations');
        setTimeout(() => setErrorToast(''), 4000);
      }
    } catch (err) {
      setErrorToast(err.message || 'Error saving equations');
      setTimeout(() => setErrorToast(''), 4000);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all scoring equations to the official Pearson Post-August 7, 2025 standard?')) {
      const def = await resetScoringEquations();
      setEquations(def);
      setResetToast(true);
      setTimeout(() => setResetToast(false), 3000);
      if (onEquationsUpdated) onEquationsUpdated(def);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(equations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pte_scoring_equations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && typeof parsed === 'object') {
          setEquations({ ...DEFAULT_SCORING_EQUATIONS, ...parsed });
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 3000);
        }
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Sandbox calculations
  const totalEarned = Math.round((Number(testStudent.part1Raw) + Number(testStudent.part2Raw) + Number(testStudent.part3Raw)) * 10) / 10;
  const totalMax = Number(equations.gseScale?.targetMaxPoints?.total || 592.0);
  const masteryPct = totalMax > 0 ? ((totalEarned / totalMax) * 100).toFixed(1) : '87.3';

  const spkPte = scalePteWithConfig(testStudent.speakingRaw, equations.gseScale?.targetMaxPoints?.speaking || 412, equations);
  const wrtPte = scalePteWithConfig(testStudent.writingRaw, equations.gseScale?.targetMaxPoints?.writing || 122, equations);
  const rdPte = scalePteWithConfig(testStudent.readingRaw, equations.gseScale?.targetMaxPoints?.reading || 77, equations);
  const lstPte = scalePteWithConfig(testStudent.listeningRaw, equations.gseScale?.targetMaxPoints?.listening || 125, equations);

  const calculatedOverall = calculateOverallPteWithConfig(totalEarned, {
    speakingPte: spkPte,
    writingPte: wrtPte,
    readingPte: rdPte,
    listeningPte: lstPte
  }, equations);

  const cefrInfo = getCefrWithConfig(calculatedOverall, equations);
  const ieltsInfo = getIeltsWithConfig(calculatedOverall, equations);

  // RA Content calculation
  const raCalculated = scoreRaContentWithConfig(raTester.promptWords, raTester.readingErrors, equations);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Scoring Equations &amp; Rubrics Studio</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {equations.gseScale?.overallMethod === 'points_ratio' ? 'Post-Aug 2025 Standard' : 'Custom Formula Engine'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Adjust linear GSE conversions, overall exam score formulas, RA decimal rounding, and CEFR/IELTS thresholds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
            title="Reset to official Pearson post-August 7, 2025 standards"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Standards</span>
          </button>

          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition cursor-pointer flex items-center space-x-1.5">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
            title="Download equation profile as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; Apply Equations</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Scoring equations saved successfully! All grading station evaluations and Google Sheet sync operations will now use this profile.</span>
        </div>
      )}

      {resetToast && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in shadow-xs">
          <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Restored Pearson Official Post-August 7, 2025 standard equations (Elena = 80, 592 Target Max, 1-Decimal RA Content).</span>
        </div>
      )}

      {errorToast && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex space-x-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('gse')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'gse'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>GSE &amp; Overall Score Formula</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Task Scoring Formulas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cefr')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'cefr'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>CEFR &amp; Performance Cutoffs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ielts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'ielts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>IELTS Concordance Table</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'sandbox'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Live Equation Sandbox &amp; Tester</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: GSE & OVERALL SCORE FORMULA                        */}
      {/* ========================================================= */}
      {activeTab === 'gse' && (
        <div className="space-y-6">
          {/* Method Selector Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>1. Overall PTE Score Calculation Equation</span>
            </h3>
            <p className="text-xs text-slate-600">
              Select how the final 10–90 Overall PTE Score is computed from candidate exam performance:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A */}
              <div
                onClick={() =>
                  setEquations({
                    ...equations,
                    gseScale: { ...equations.gseScale, overallMethod: 'points_ratio' }
                  })
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  equations.gseScale?.overallMethod === 'points_ratio'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-blue-900">Exam Points Ratio</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Official Pearson (Post-Aug 2025)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Scales directly from Total Points Earned across Parts 1–3 divided by Total Exam Max ({equations.gseScale?.targetMaxPoints?.total || 592} pts).
                  </p>
                </div>
                <div className="mt-3 font-mono text-[11px] bg-slate-900 text-blue-300 p-2 rounded-lg">
                  10 + 80 * (TotalPoints / {equations.gseScale?.targetMaxPoints?.total || 592})
                </div>
              </div>

              {/* Option B */}
              <div
                onClick={() =>
                  setEquations({
                    ...equations,
                    gseScale: { ...equations.gseScale, overallMethod: 'skills_mean' }
                  })
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  equations.gseScale?.overallMethod === 'skills_mean'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">Communicative Skills Mean</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Legacy Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Unweighted arithmetic mean of the four communicative skill scores (Speaking, Writing, Reading, Listening).
                  </p>
                </div>
                <div className="mt-3 font-mono text-[11px] bg-slate-900 text-amber-300 p-2 rounded-lg">
                  (SpkPte + WrtPte + RdPte + LstPte) / 4
                </div>
              </div>

              {/* Option C */}
              <div
                onClick={() =>
                  setEquations({
                    ...equations,
                    gseScale: { ...equations.gseScale, overallMethod: 'custom_weighted' }
                  })
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  equations.gseScale?.overallMethod === 'custom_weighted'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">Custom Weighted Composite</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Custom Weights
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Weighted linear combination of the 4 communicative skills using custom percentage weights.
                  </p>
                </div>
                <div className="mt-3 font-mono text-[11px] bg-slate-900 text-purple-300 p-2 rounded-lg">
                  w1*Spk + w2*Wrt + w3*Rd + w4*Lst
                </div>
              </div>
            </div>

            {/* Custom weights inputs if selected */}
            {equations.gseScale?.overallMethod === 'custom_weighted' && (
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-purple-900">Configure Skill Weights (Must sum to 1.00):</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block">Speaking Weight</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={equations.gseScale?.weights?.speaking ?? 0.25}
                      onChange={(e) =>
                        setEquations({
                          ...equations,
                          gseScale: {
                            ...equations.gseScale,
                            weights: { ...equations.gseScale.weights, speaking: parseFloat(e.target.value) || 0 }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 border rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block">Writing Weight</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={equations.gseScale?.weights?.writing ?? 0.25}
                      onChange={(e) =>
                        setEquations({
                          ...equations,
                          gseScale: {
                            ...equations.gseScale,
                            weights: { ...equations.gseScale.weights, writing: parseFloat(e.target.value) || 0 }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 border rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block">Reading Weight</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={equations.gseScale?.weights?.reading ?? 0.25}
                      onChange={(e) =>
                        setEquations({
                          ...equations,
                          gseScale: {
                            ...equations.gseScale,
                            weights: { ...equations.gseScale.weights, reading: parseFloat(e.target.value) || 0 }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 border rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block">Listening Weight</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={equations.gseScale?.weights?.listening ?? 0.25}
                      onChange={(e) =>
                        setEquations({
                          ...equations,
                          gseScale: {
                            ...equations.gseScale,
                            weights: { ...equations.gseScale.weights, listening: parseFloat(e.target.value) || 0 }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 border rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GSE Scale Parameters & Benchmarks */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>2. GSE Linear Scale Range &amp; Target Point Denominators</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum GSE Score</label>
                <input
                  type="number"
                  value={equations.gseScale?.minGse ?? 10}
                  onChange={(e) =>
                    setEquations({
                      ...equations,
                      gseScale: { ...equations.gseScale, minGse: parseInt(e.target.value, 10) || 10 }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm bg-white"
                />
                <span className="text-[11px] text-slate-400">Official standard: 10</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum GSE Score</label>
                <input
                  type="number"
                  value={equations.gseScale?.maxGse ?? 90}
                  onChange={(e) =>
                    setEquations({
                      ...equations,
                      gseScale: { ...equations.gseScale, maxGse: parseInt(e.target.value, 10) || 90 }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm bg-white"
                />
                <span className="text-[11px] text-slate-400">Official standard: 90</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scale Multiplier (Range)</label>
                <input
                  type="number"
                  value={equations.gseScale?.scaleRange ?? 80}
                  onChange={(e) =>
                    setEquations({
                      ...equations,
                      gseScale: { ...equations.gseScale, scaleRange: parseInt(e.target.value, 10) || 80 }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm bg-white"
                />
                <span className="text-[11px] text-slate-400">Default: 80 (Max - Min)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Target Section &amp; Communicative Skill Maximum Raw Points (Denominators):
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Part 1 Max (Speaking &amp; Writing)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.part1 ?? 461.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, part1: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 461.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Part 2 Max (Reading)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.part2 ?? 57.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, part2: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 57.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Part 3 Max (Listening)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.part3 ?? 74.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, part3: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 74.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Total Exam Max</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.total ?? 592.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, total: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs font-bold text-blue-800 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 592.0 (461+57+74)</span>
                </div>
              </div>

              {/* Skill Max Points */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Speaking Composite Max</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.speaking ?? 412.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, speaking: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 412.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Writing Composite Max</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.writing ?? 122.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, writing: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 122.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Reading Composite Max</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.reading ?? 77.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, reading: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 77.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Listening Composite Max</label>
                  <input
                    type="number"
                    step="0.5"
                    value={equations.gseScale?.targetMaxPoints?.listening ?? 125.0}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        gseScale: {
                          ...equations.gseScale,
                          targetMaxPoints: { ...equations.gseScale.targetMaxPoints, listening: parseFloat(e.target.value) || 0 }
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Default: 125.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TASK SCORING FORMULAS                              */}
      {/* ========================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Read Aloud Formula Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Read Aloud (RA) Content Scaling Equation</span>
              </h3>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                ROUND(((Words - Errors) / Words) * {equations.readAloud?.scaleMax ?? 5}, {equations.readAloud?.roundingDecimals ?? 1})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scale Maximum Content Points</label>
                <input
                  type="number"
                  step="0.5"
                  value={equations.readAloud?.scaleMax ?? 5.0}
                  onChange={(e) =>
                    setEquations({
                      ...equations,
                      readAloud: { ...equations.readAloud, scaleMax: parseFloat(e.target.value) || 5.0 }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm bg-white"
                />
                <span className="text-[11px] text-slate-400">Default: 5.0</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rounding Precision</label>
                <select
                  value={equations.readAloud?.roundingDecimals ?? 1}
                  onChange={(e) =>
                    setEquations({
                      ...equations,
                      readAloud: { ...equations.readAloud, roundingDecimals: parseInt(e.target.value, 10) || 0 }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm bg-white"
                >
                  <option value={1}>1 Decimal Place (ROUND to 0.1, matching Google Sheet)</option>
                  <option value={0}>Nearest Integer (0, 1, 2, 3, 4, 5)</option>
                  <option value={2}>2 Decimal Places (0.01)</option>
                </select>
                <span className="text-[11px] text-slate-400">Google Sheet uses 1 decimal place</span>
              </div>
            </div>

            {/* Live Interactive RA Calculator */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Read Aloud Content Calculator:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prompt Words</label>
                  <input
                    type="number"
                    min="1"
                    value={raTester.promptWords}
                    onChange={(e) => setRaTester({ ...raTester, promptWords: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reading Errors</label>
                  <input
                    type="number"
                    min="0"
                    value={raTester.readingErrors}
                    onChange={(e) => setRaTester({ ...raTester, readingErrors: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono text-xs bg-white"
                  />
                </div>
                <div className="p-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-between font-mono">
                  <span className="text-xs font-sans">Scaled Content Score:</span>
                  <span className="text-base font-bold">{raCalculated} / {equations.readAloud?.scaleMax ?? 5.0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Write from Dictation & Negative Marking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WFD Alignment */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Write from Dictation (WFD) Alignment</span>
              </h3>
              <p className="text-xs text-slate-600">
                Determines whether student sentences are graded in strict word sequence or order-independently:
              </p>

              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="radio"
                    name="wfd_mode"
                    checked={equations.writeFromDictation?.alignmentMethod === 'lcs'}
                    onChange={() =>
                      setEquations({
                        ...equations,
                        writeFromDictation: { ...equations.writeFromDictation, alignmentMethod: 'lcs' }
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Sequence Alignment (LCS)</span>
                    <span className="block text-[11px] text-slate-500">Order-dependent matching (Official Pearson standard).</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="radio"
                    name="wfd_mode"
                    checked={equations.writeFromDictation?.alignmentMethod === 'bag_of_words'}
                    onChange={() =>
                      setEquations({
                        ...equations,
                        writeFromDictation: { ...equations.writeFromDictation, alignmentMethod: 'bag_of_words' }
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Bag of Words (Order-Independent)</span>
                    <span className="block text-[11px] text-slate-500">Words count regardless of position in sentence.</span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equations.writeFromDictation?.ukUsNormalization ?? true}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        writeFromDictation: { ...equations.writeFromDictation, ukUsNormalization: e.target.checked }
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-slate-700">Accept UK / US spelling variants (e.g., colour / color)</span>
                </label>
              </div>
            </div>

            {/* Hard Knockouts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>Constructed Task Knockout Rules</span>
              </h3>
              <p className="text-xs text-slate-600">
                Enforces hard zero knockouts per the post-August 7, 2025 Pearson rubric:
              </p>

              <div className="space-y-3">
                <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equations.knockouts?.speakingZeroContentKnockout ?? true}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        knockouts: { ...equations.knockouts, speakingZeroContentKnockout: e.target.checked }
                      })
                    }
                    className="w-4 h-4 mt-0.5 rounded text-blue-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Speaking Zero-Content Knockout</span>
                    <span className="block text-[11px] text-slate-500">
                      If Content = 0 on RA, RS, DI, RL, SGD, or RTS, automatically set Fluency = 0, Pronunciation = 0, and Item Total = 0.
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equations.knockouts?.writingZeroFormOrContentKnockout ?? true}
                    onChange={(e) =>
                      setEquations({
                        ...equations,
                        knockouts: { ...equations.knockouts, writingZeroFormOrContentKnockout: e.target.checked }
                      })
                    }
                    className="w-4 h-4 mt-0.5 rounded text-blue-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Writing Zero-Form or Content Knockout</span>
                    <span className="block text-[11px] text-slate-500">
                      If Form = 0 or Content = 0 on SWT, WE, or SST, zero out all sub-traits and award 0 total item points.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CEFR & PERFORMANCE CUTOFFS                         */}
      {/* ========================================================= */}
      {activeTab === 'cefr' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>CEFR &amp; Performance Classification Thresholds</span>
              </h3>
              <p className="text-xs text-slate-500">
                Modify score cutoffs and performance descriptors synced to Google Sheet Columns L and M.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const list = equations.cefrThresholds || [];
                setEquations({
                  ...equations,
                  cefrThresholds: [...list, { minScore: 50, cefr: 'B1-B2', classification: 'Competent User (Threshold)' }]
                });
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Minimum Overall Score</th>
                  <th className="py-2.5 px-3">CEFR Level</th>
                  <th className="py-2.5 px-3">Performance Classification Label</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(equations.cefrThresholds || []).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={t.minScore}
                        onChange={(e) => {
                          const updated = [...equations.cefrThresholds];
                          updated[idx] = { ...updated[idx], minScore: parseInt(e.target.value, 10) || 0 };
                          setEquations({ ...equations, cefrThresholds: updated });
                        }}
                        className="w-20 px-2 py-1 border rounded font-mono text-xs bg-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={t.cefr}
                        onChange={(e) => {
                          const updated = [...equations.cefrThresholds];
                          updated[idx] = { ...updated[idx], cefr: e.target.value };
                          setEquations({ ...equations, cefrThresholds: updated });
                        }}
                        className="w-24 px-2 py-1 border rounded font-bold text-blue-800 text-xs bg-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={t.classification}
                        onChange={(e) => {
                          const updated = [...equations.cefrThresholds];
                          updated[idx] = { ...updated[idx], classification: e.target.value };
                          setEquations({ ...equations, cefrThresholds: updated });
                        }}
                        className="w-full max-w-md px-2 py-1 border rounded text-xs bg-white font-medium text-slate-800"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = equations.cefrThresholds.filter((_, i) => i !== idx);
                          setEquations({ ...equations, cefrThresholds: updated });
                        }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: IELTS CONCORDANCE TABLE                            */}
      {/* ========================================================= */}
      {activeTab === 'ielts' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Concordant IELTS Band Conversion Table</span>
              </h3>
              <p className="text-xs text-slate-500">
                Maps 10–90 GSE PTE scores to official IELTS 9.0 scale bands synced to Google Sheet Column K.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Minimum PTE Score</th>
                  <th className="py-2.5 px-3">Concordant IELTS Band</th>
                  <th className="py-2.5 px-3">Competency Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(equations.ieltsConcordance || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900">
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={row.minPte}
                        onChange={(e) => {
                          const updated = [...equations.ieltsConcordance];
                          updated[idx] = { ...updated[idx], minPte: parseInt(e.target.value, 10) || 0 };
                          setEquations({ ...equations, ieltsConcordance: updated });
                        }}
                        className="w-20 px-2 py-1 border rounded text-xs bg-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.band}
                        onChange={(e) => {
                          const updated = [...equations.ieltsConcordance];
                          updated[idx] = { ...updated[idx], band: e.target.value };
                          setEquations({ ...equations, ieltsConcordance: updated });
                        }}
                        className="w-24 px-2 py-1 border rounded font-bold text-blue-700 text-xs bg-white"
                      />
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => {
                          const updated = [...equations.ieltsConcordance];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setEquations({ ...equations, ieltsConcordance: updated });
                        }}
                        className="w-full max-w-sm px-2 py-1 border rounded text-xs bg-white text-slate-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: LIVE EQUATION SANDBOX & TESTER                     */}
      {/* ========================================================= */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>Interactive Equation Testing Sandbox</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Test your customized equations against benchmark student profiles and inspect the real-time calculated scores.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setTestStudent({
                      name: 'Elena Rostova',
                      part1Raw: 398.1,
                      part2Raw: 51.0,
                      part3Raw: 68.0,
                      speakingRaw: 353.1,
                      writingRaw: 114.0,
                      readingRaw: 68.0,
                      listeningRaw: 111.0
                    })
                  }
                  className="px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition"
                >
                  Load Elena Rostova (Score 80 Test)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestStudent({
                      name: 'Alexander Wright',
                      part1Raw: 420.5,
                      part2Raw: 54.0,
                      part3Raw: 71.0,
                      speakingRaw: 380.0,
                      writingRaw: 118.0,
                      readingRaw: 73.0,
                      listeningRaw: 119.0
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition"
                >
                  Load Alexander Wright
                </button>
              </div>
            </div>

            {/* Test Student Raw Points Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Part 1 Raw Points (Spk &amp; Wrt)</span>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.part1Raw}
                  onChange={(e) => setTestStudent({ ...testStudent, part1Raw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-white font-bold"
                />
                <span className="text-[11px] text-slate-500 block">Target Denominator: {equations.gseScale?.targetMaxPoints?.part1 || 461.0}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Part 2 Raw Points (Reading)</span>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.part2Raw}
                  onChange={(e) => setTestStudent({ ...testStudent, part2Raw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-white font-bold"
                />
                <span className="text-[11px] text-slate-500 block">Target Denominator: {equations.gseScale?.targetMaxPoints?.part2 || 57.0}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Part 3 Raw Points (Listening)</span>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.part3Raw}
                  onChange={(e) => setTestStudent({ ...testStudent, part3Raw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-white font-bold"
                />
                <span className="text-[11px] text-slate-500 block">Target Denominator: {equations.gseScale?.targetMaxPoints?.part3 || 74.0}</span>
              </div>
            </div>

            {/* Communicative Raw Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">Speaking Raw</label>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.speakingRaw}
                  onChange={(e) => setTestStudent({ ...testStudent, speakingRaw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">Writing Raw</label>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.writingRaw}
                  onChange={(e) => setTestStudent({ ...testStudent, writingRaw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">Reading Raw</label>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.readingRaw}
                  onChange={(e) => setTestStudent({ ...testStudent, readingRaw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">Listening Raw</label>
                <input
                  type="number"
                  step="0.1"
                  value={testStudent.listeningRaw}
                  onChange={(e) => setTestStudent({ ...testStudent, listeningRaw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Real-Time Calculated Results Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live Simulation Output</span>
                <h4 className="text-lg font-bold text-white">Calculated Score Results: {testStudent.name}</h4>
              </div>
              <div className="text-right font-mono text-xs text-slate-300">
                Total Exam Points: <strong className="text-emerald-400 text-base">{totalEarned}</strong> / {totalMax} ({masteryPct}%)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Overall PTE Score */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Overall PTE Score</span>
                <div className="text-3xl font-extrabold text-blue-400 font-mono">{calculatedOverall}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Method: {equations.gseScale?.overallMethod === 'points_ratio' ? 'Exam Points Ratio' : 'Skills Mean'}
                </span>
              </div>

              {/* Concordant IELTS */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Concordant IELTS</span>
                <div className="text-3xl font-extrabold text-amber-400 font-mono">Band {ieltsInfo.band}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">{ieltsInfo.label}</span>
              </div>

              {/* CEFR Level */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">CEFR Level</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">{cefrInfo.cefrLevel}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">{cefrInfo.classification}</span>
              </div>

              {/* Formula Method Details */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Legacy vs Active Delta</span>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {equations.gseScale?.overallMethod === 'points_ratio' ? (
                    <span>Ratio: <span className="text-emerald-400">{calculatedOverall}</span> vs Mean: <span className="text-slate-400">{Math.round((spkPte + wrtPte + rdPte + lstPte) / 4)}</span></span>
                  ) : (
                    <span>Mean: <span className="text-amber-400">{calculatedOverall}</span></span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {testStudent.name === 'Elena Rostova' && calculatedOverall === 80 ? '✅ Elena scored exactly 80!' : ''}
                </span>
              </div>
            </div>

            {/* Communicative Skills Breakdown */}
            <div className="pt-2 border-t border-slate-700/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
                4 Communicative Sub-Skills Breakdown (GSE 10–90):
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-sans">Speaking:</span>
                  <span className="text-base font-bold text-blue-300">{spkPte}</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-sans">Writing:</span>
                  <span className="text-base font-bold text-indigo-300">{wrtPte}</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-sans">Reading:</span>
                  <span className="text-base font-bold text-emerald-300">{rdPte}</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-sans">Listening:</span>
                  <span className="text-base font-bold text-purple-300">{lstPte}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

