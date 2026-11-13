import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileAudio,
  FileText,
  Download,
  Upload,
  Play,
  Pause,
  Copy,
  Check,
  FileArchive,
  RefreshCw,
  FolderOpen,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import CandidateAudioPlayer from './CandidateAudioPlayer';

export default function SubmissionFilesVaultModal({
  submission,
  onClose,
  onExportZip
}) {
  const [activeTab, setActiveTab] = useState('recordings'); // 'recordings' | 'json'
  const [recordings, setRecordings] = useState([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [targetItemId, setTargetItemId] = useState('RA-01');

  const fileInputRef = useRef(null);

  const fetchCandidateRecordings = async () => {
    if (!submission?.studentId) return;
    setIsLoadingRecordings(true);
    try {
      const res = await fetch(`/api/recordings?studentId=${encodeURIComponent(submission.studentId)}`);
      const data = await res.json();
      if (data?.recordings) {
        setRecordings(data.recordings);
        if (data.recordings.length > 0 && !selectedAudio) {
          setSelectedAudio(data.recordings[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch recordings:', err);
    } finally {
      setIsLoadingRecordings(false);
    }
  };

  useEffect(() => {
    fetchCandidateRecordings();
  }, [submission?.studentId]);

  // Aggregate recordings found inside the submission object itself
  const internalRecordings = [];
  if (submission?.responses) {
    Object.entries(submission.responses).forEach(([itemId, resp]) => {
      if (resp?.recordedAudio?.fileName || resp?.recordedAudio?.audioUrl || resp?.recordedAudio?.dataUrl) {
        internalRecordings.push({
          itemId,
          fileName: resp.recordedAudio.fileName || `${submission.studentId}_${itemId}.webm`,
          duration: resp.recordedAudio.durationRecorded || 0,
          url: resp.recordedAudio.audioUrl || resp.recordedAudio.localBlobUrl || resp.recordedAudio.dataUrl,
          dataUrl: resp.recordedAudio.dataUrl,
          transcript: resp.transcript || resp.recordedAudio.transcript
        });
      }
    });
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      const safeName = `${submission.studentId}_${targetItemId}_manual_${Date.now()}.${file.name.split('.').pop()}`;
      formData.append('audioFile', file, safeName);

      const res = await fetch('/api/upload-recording', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data?.ok) {
        setUploadMessage({ type: 'success', text: `Uploaded ${safeName} successfully!` });
        fetchCandidateRecordings();
      } else {
        setUploadMessage({ type: 'error', text: data?.error || 'Upload failed' });
      }
    } catch (err) {
      setUploadMessage({ type: 'error', text: 'Network error uploading audio file.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(submission, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(submission, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Submission_${submission.studentId || 'candidate'}_${submission.sessionCode || 'PTE'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#003865] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/80 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Candidate Files &amp; Audio Vault
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {submission?.studentName} • ID: {submission?.studentId} • Session: {submission?.sessionCode}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('recordings')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'recordings'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileAudio className="w-4 h-4 text-emerald-400" />
              <span>Voice Recordings ({recordings.length || internalRecordings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'json'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Submission Data (.json)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {onExportZip && (
              <button
                type="button"
                onClick={() => onExportZip(submission)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
                title="Export complete folders with question text and audio files"
              >
                <FileArchive className="w-3.5 h-3.5" />
                <span>Export Exam Pack (.zip)</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'recordings' && (
            <div className="space-y-5">
              {/* Active Audio Player if selected */}
              {selectedAudio && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Now Playing in Vault:
                  </span>
                  <CandidateAudioPlayer
                    audioUrl={selectedAudio.url}
                    dataUrl={selectedAudio.dataUrl}
                    fileName={selectedAudio.fileName}
                    studentId={submission?.studentId}
                    itemId={selectedAudio.itemId}
                    durationRecorded={selectedAudio.duration}
                  />
                </div>
              )}

              {/* Upload Voice Recording Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Upload External Audio Recording (.webm, .wav, .mp3)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Attach manual or recovered audio file directly to this candidate's submission.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={targetItemId}
                    onChange={(e) => setTargetItemId(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white font-mono font-bold"
                  >
                    {['RA-01', 'RA-02', 'RA-03', 'RS-01', 'RS-02', 'RS-03', 'DI-01', 'DI-02', 'RL-01', 'SGD-01', 'RTS-01', 'ASQ-01'].map((id) => (
                      <option key={id} value={id}>
                        Target: {id}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.webm,.wav,.mp3,.m4a"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {uploadMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-bold ${
                    uploadMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {uploadMessage.text}
                </div>
              )}

              {/* Stored Recordings List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>Available Candidate Audio Clips</span>
                  <button
                    type="button"
                    onClick={fetchCandidateRecordings}
                    className="text-blue-700 hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                {recordings.length === 0 && internalRecordings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400 italic">
                    No voice recordings detected for this student yet. Recordings made during the exam will automatically stream and populate here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(recordings.length > 0 ? recordings : internalRecordings).map((rec, i) => {
                      const isSelected = selectedAudio?.fileName === rec.fileName;
                      const sizeKb = rec.size ? Math.round(rec.size / 1024) : null;

                      return (
                        <div
                          key={rec.fileName || i}
                          onClick={() => setSelectedAudio(rec)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                              <FileAudio className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="font-mono text-xs font-bold text-slate-900 block truncate">
                                {rec.fileName}
                              </span>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                {sizeKb && <span>{sizeKb} KB</span>}
                                {rec.duration > 0 && <span>• {rec.duration.toFixed(1)}s</span>}
                                {rec.createdAt && (
                                  <span>• {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAudio(rec);
                              }}
                              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs"
                              title="Play Audio"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <a
                              href={rec.url || `/api/recordings/${encodeURIComponent(rec.fileName)}`}
                              download={rec.fileName}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                              title="Download audio clip"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Raw Submission Object JSON
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition border border-slate-300"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] leading-relaxed max-h-[460px] overflow-auto select-text border border-slate-800">
                {JSON.stringify(submission, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

