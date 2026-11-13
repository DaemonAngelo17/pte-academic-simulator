import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle2, Square, Download, Volume2, FileText, Sparkles, Edit3, Check } from 'lucide-react';
import { playShortBeep } from '../../utils/audioUtils';

/**
 * Cross-Browser MIME type & codec detection (WebM Opus for Chromium/Firefox, MP4/AAC for Safari/iOS/macOS)
 */
export function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return { mimeType: '', extension: 'webm' };
  const candidates = [
    { mime: 'audio/webm;codecs=opus', ext: 'webm' },
    { mime: 'audio/webm', ext: 'webm' },
    { mime: 'audio/mp4;codecs=mp4a.40.2', ext: 'mp4' },
    { mime: 'audio/mp4', ext: 'mp4' },
    { mime: 'audio/aac', ext: 'aac' },
    { mime: 'audio/ogg;codecs=opus', ext: 'ogg' },
    { mime: 'audio/wav', ext: 'wav' }
  ];

  for (const item of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(item.mime)) {
        return { mimeType: item.mime, extension: item.ext };
      }
    } catch {}
  }
  return { mimeType: '', extension: 'webm' };
}

/**
 * Authentic Pearson PTE Audio Status & Microphone Recorder
 * Implements:
 * - "Beginning in XX seconds..." preparation countdown
 * - Official PTE Beep Rule: plays beep when mic opens EXCEPT on RS and ASQ
 * - Web Audio API AnalyserNode live waveform visualizer + blue progress bar
 * - 3-Second Silence Cutoff Rule: auto-closes mic after 3 consecutive seconds of silence
 *   and sets status to "Completed (Mic closed due to >3s silence)"
 * - Saves downloadable blob tagged with CandidateID_ItemID (e.g., PTE-2025-8842_RA-01.webm / .mp4)
 */
export default function AudioRecorderWidget({
  taskType = 'RA',
  itemId = 'RA-01',
  candidateId = 'PTE-2025-8842',
  prepSeconds = 35,
  recordSeconds = 40,
  waitForAudioPrompt = false,
  onRecordingComplete
}) {
  const { extension: preferredExt } = getSupportedAudioMimeType();

  // If this item comes after an audio prompt (or waitForAudioPrompt is true), enforce the 3s pause
  const isPostAudioSpeaking = waitForAudioPrompt || ['RS', 'RL', 'SGD', 'RTS', 'ASQ'].includes(taskType);
  const effectivePrepSeconds = isPostAudioSpeaking
    ? (prepSeconds > 0 ? prepSeconds : 3)
    : prepSeconds;

  // Phases: 'waiting_prompt' | 'prep' | 'recording' | 'completed'
  const [phase, setPhase] = useState(() => {
    if (waitForAudioPrompt) return 'waiting_prompt';
    return effectivePrepSeconds > 0 ? 'prep' : 'recording';
  });

  const [prepRemaining, setPrepRemaining] = useState(effectivePrepSeconds);
  const [recRemaining, setRecRemaining] = useState(recordSeconds);
  const [statusLabel, setStatusLabel] = useState('');
  const [closedBySilence, setClosedBySilence] = useState(false);
  const [silenceMs, setSilenceMs] = useState(0);
  const [waveformBars, setWaveformBars] = useState(() => new Array(20).fill(8));
  const [currentDb, setCurrentDb] = useState(-60);

  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
  const [serverAudioUrl, setServerAudioUrl] = useState(null);
  const [fileNameTag, setFileNameTag] = useState(`${candidateId}_${itemId}.${preferredExt}`);

  // Speech-to-Text State
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [isAiTranscribing, setIsAiTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recStartTimestampRef = useRef(null);
  const silenceStartRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const closedBySilenceRef = useRef(false);

  // STT Recognizer References
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const liveTranscriptRef = useRef('');

  // Alert tone sounds when recording begins after preparation / 3s pause
  const shouldPlayBeep = true;

  useEffect(() => {
    const cleanCandidate = String(candidateId || 'STD-8842').replace(/[^a-zA-Z0-9_-]/g, '-');
    const cleanItem = String(itemId || 'ITEM').replace(/[^a-zA-Z0-9_-]/g, '-');
    setFileNameTag(`${cleanCandidate}_${cleanItem}.${preferredExt}`);
  }, [candidateId, itemId, preferredExt]);

  // Transition from waiting_prompt when audio finishes -> Start short 3s pause
  useEffect(() => {
    if (waitForAudioPrompt) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('waiting_prompt');
      setStatusLabel('Playing audio prompt (recording starts after audio)...');
    } else if (phase === 'waiting_prompt') {
      const pauseDuration = 3;
      setPrepRemaining(pauseDuration);
      setStatusLabel(`Beginning in ${pauseDuration} seconds...`);
      setPhase('prep');
    }
  }, [waitForAudioPrompt]);

  const stopAudioPipeline = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const uploadAndFinalizeRecording = async (blob, durationSec, wasSilenceCutoff) => {
    const localUrl = blob ? URL.createObjectURL(blob) : null;
    if (localUrl) setRecordedBlobUrl(localUrl);

    const finalStatusText = wasSilenceCutoff
      ? 'Completed (Mic closed due to >3s silence)'
      : 'Completed';

    setStatusLabel(finalStatusText);

    const resolvedTranscript = (finalTranscriptRef.current || liveTranscriptRef.current || liveTranscript || '').trim();

    let persistedUrl = localUrl;

    if (blob && blob.size > 0) {
      // 1. Streaming binary multipart upload (Low RAM usage across 30+ recordings)
      let uploadSuccess = false;
      try {
        const formData = new FormData();
        formData.append('audioFile', blob, fileNameTag);
        formData.append('fileName', fileNameTag);
        formData.append('transcript', resolvedTranscript);

        const res = await fetch('/api/upload-recording', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data?.ok && data.url) {
          persistedUrl = data.url;
          setServerAudioUrl(data.url);
          uploadSuccess = true;
        }
      } catch (uploadErr) {
        console.warn('Streaming audio upload failed, falling back to base64 reader:', uploadErr);
      }

      // 2. Base64 fallback if multipart is unavailable
      if (!uploadSuccess) {
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result;
            try {
              const res = await fetch('/api/upload-recording', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileName: fileNameTag,
                  dataUrl,
                  transcript: resolvedTranscript
                })
              });
              const data = await res.json();
              if (data?.ok && data.url) {
                persistedUrl = data.url;
                setServerAudioUrl(data.url);
              }
            } catch {}

            if (onRecordingComplete) {
              onRecordingComplete({
                fileName: fileNameTag,
                audioUrl: persistedUrl,
                localBlobUrl: localUrl,
                dataUrl,
                durationRecorded: durationSec,
                closedDueToSilence: wasSilenceCutoff,
                statusText: finalStatusText,
                transcript: resolvedTranscript
              });
            }
          };
          reader.readAsDataURL(blob);
          return;
        } catch {}
      }
    }

    if (onRecordingComplete) {
      onRecordingComplete({
        fileName: fileNameTag,
        audioUrl: persistedUrl,
        localBlobUrl: localUrl,
        durationRecorded: durationSec,
        closedDueToSilence: wasSilenceCutoff,
        statusText: finalStatusText,
        transcript: resolvedTranscript
      });
    }
  };

  const finishRecording = (silenceTriggered = false) => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    closedBySilenceRef.current = silenceTriggered;
    setClosedBySilence(silenceTriggered);

    const elapsedSec = recStartTimestampRef.current
      ? Math.max(1, Math.round((Date.now() - recStartTimestampRef.current) / 1000))
      : recordSeconds - recRemaining;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setWaveformBars(new Array(20).fill(4));
    setPhase('completed');
    setStatusLabel(
      silenceTriggered ? 'Completed (Mic closed due to >3s silence)' : 'Completed'
    );

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stopAudioPipeline();
        uploadAndFinalizeRecording(blob, elapsedSec, silenceTriggered);
      };
      mediaRecorderRef.current.stop();
    } else {
      stopAudioPipeline();
      uploadAndFinalizeRecording(null, elapsedSec, silenceTriggered);
    }
  };

  const triggerWhisperTranscription = async () => {
    setIsAiTranscribing(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileNameTag,
          audioUrl: serverAudioUrl || recordedBlobUrl
        })
      });
      const data = await res.json();
      if (data?.ok && data.transcript) {
        setLiveTranscript(data.transcript);
        finalTranscriptRef.current = data.transcript;
        liveTranscriptRef.current = data.transcript;
        if (onRecordingComplete) {
          onRecordingComplete({
            fileName: fileNameTag,
            audioUrl: serverAudioUrl || recordedBlobUrl,
            durationRecorded: recordSeconds - recRemaining,
            closedDueToSilence: closedBySilence,
            statusText: statusLabel,
            transcript: data.transcript
          });
        }
      }
    } catch (err) {
      console.warn('Whisper transcription failed:', err);
    } finally {
      setIsAiTranscribing(false);
    }
  };

  const startMicRecording = async () => {
    if (hasFinishedRef.current) return;
    if (waitForAudioPrompt) {
      console.warn('Audio prompt is still playing; deferring mic recording until audio finishes');
      return;
    }
    if (shouldPlayBeep) {
      playShortBeep(840, 0.28);
    }

    setPhase('recording');
    setStatusLabel('Recording');
    setRecRemaining(recordSeconds);
    setSilenceMs(0);
    recStartTimestampRef.current = Date.now();
    silenceStartRef.current = Date.now();

    // 0. Setup Web Speech API for Real-Time Speech-to-Text
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = localStorage.getItem('pte_stt_language') || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              final += res[0].transcript + ' ';
            } else {
              interim += res[0].transcript;
            }
          }
          const combined = (final + interim).trim();
          setLiveTranscript(combined);
          liveTranscriptRef.current = combined;
          if (final.trim()) {
            finalTranscriptRef.current = final.trim();
          } else if (combined) {
            finalTranscriptRef.current = combined;
          }
        };

        recognition.onerror = (e) => {
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            console.warn('SpeechRecognition error:', e.error);
          }
        };

        recognition.onend = () => {
          if (!hasFinishedRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
        setSttSupported(true);
      } catch (sttErr) {
        console.warn('SpeechRecognition start failed:', sttErr);
      }
    } else {
      setSttSupported(false);
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        streamRef.current = stream;

        // 1. Setup MediaRecorder with cross-browser codec negotiation
        const { mimeType: supportedMime } = getSupportedAudioMimeType();
        const recorderOptions = supportedMime ? { mimeType: supportedMime } : undefined;
        const mediaRecorder = recorderOptions ? new MediaRecorder(stream, recorderOptions) : new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(250);

        // 2. Setup Web Audio API AnalyserNode for live waveform & 3-Second Silence Cutoff Rule
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);
        analyserRef.current = analyser;

        const timeData = new Uint8Array(analyser.fftSize);
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        const monitorAudioLoop = () => {
          if (hasFinishedRef.current) return;
          analyser.getByteTimeDomainData(timeData);
          analyser.getByteFrequencyData(freqData);

          // Calculate RMS signal energy
          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const normalized = (timeData[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          const db = 20 * Math.log10(Math.max(rms, 0.0001));
          setCurrentDb(Math.round(db));

          // Update 20 waveform visualizer bars
          const bars = [];
          const step = Math.floor(freqData.length / 20) || 1;
          for (let b = 0; b < 20; b++) {
            const val = freqData[b * step] || 0;
            bars.push(Math.max(6, Math.min(100, Math.round((val / 255) * 100))));
          }
          setWaveformBars(bars);

          // 3-Second Silence Rule Check:
          // Threshold: rms < 0.015 (~ -36 dBFS) is considered silence
          const isSilentNow = rms < 0.015;
          if (isSilentNow) {
            const elapsedSilence = Date.now() - (silenceStartRef.current || Date.now());
            setSilenceMs(elapsedSilence);
            if (elapsedSilence >= 3000) {
              finishRecording(true);
              return;
            }
          } else {
            silenceStartRef.current = Date.now();
            setSilenceMs(0);
          }

          rafRef.current = requestAnimationFrame(monitorAudioLoop);
        };

        rafRef.current = requestAnimationFrame(monitorAudioLoop);
        return;
      }
    } catch {
      // Fallback when browser blocks mic or no hardware mic is present:
      // Run visual waveform & allow manual 3s silence trigger
    }

    // Fallback animation if hardware microphone stream is unavailable
    const fallbackInterval = setInterval(() => {
      if (hasFinishedRef.current) {
        clearInterval(fallbackInterval);
        return;
      }
      const nextBars = Array.from({ length: 20 }, () => Math.floor(15 + Math.random() * 65));
      setWaveformBars(nextBars);
    }, 150);
    rafRef.current = fallbackInterval;
  };

  // Preparation Countdown Effect (Short 3s pause after audio or item prep timer)
  useEffect(() => {
    if (phase !== 'prep') return;

    let currentSec = prepRemaining > 0 ? prepRemaining : (effectivePrepSeconds > 0 ? effectivePrepSeconds : 3);
    setStatusLabel(`Beginning in ${currentSec} seconds...`);

    const interval = setInterval(() => {
      currentSec -= 1;
      setPrepRemaining(currentSec);
      if (currentSec <= 0) {
        clearInterval(interval);
        startMicRecording();
      } else {
        setStatusLabel(`Beginning in ${currentSec} seconds...`);
      }
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [phase]);

  // Recording Countdown Effect
  useEffect(() => {
    if (phase !== 'recording') return;

    timerRef.current = setInterval(() => {
      setRecRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishRecording(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Initial mount when effectivePrepSeconds === 0 and not waiting for prompt
  useEffect(() => {
    if (!waitForAudioPrompt && effectivePrepSeconds === 0 && phase === 'recording' && !recStartTimestampRef.current) {
      startMicRecording();
    }
    return () => {
      stopAudioPipeline();
    };
  }, []);

  const prepProgressPercent =
    effectivePrepSeconds > 0 ? ((effectivePrepSeconds - prepRemaining) / effectivePrepSeconds) * 100 : 100;
  const recProgressPercent =
    recordSeconds > 0 ? ((recordSeconds - recRemaining) / recordSeconds) * 100 : 100;

  return (
    <div className="border border-slate-300 rounded bg-white p-4 max-w-lg w-full shadow-xs my-4 select-none">
      {/* Header Title */}
      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <Mic
            className={`w-4 h-4 ${
              phase === 'recording' ? 'text-blue-600 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span>Audio Status / Recorded Answer</span>
        </span>
        <span className="font-mono text-[11px] text-slate-500 normal-case">{fileNameTag}</span>
      </div>

      {/*Current Status Line */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-semibold">Current Status:</span>
        {phase === 'waiting_prompt' && (
          <span className="text-indigo-700 font-bold flex items-center space-x-1.5">
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
            <span>Playing audio prompt (recording starts after audio)...</span>
          </span>
        )}
        {phase === 'prep' && (
          <span className="text-amber-700 font-bold">
            Beginning in {prepRemaining} seconds...
          </span>
        )}
        {phase === 'recording' && (
          <span className="text-blue-700 font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Recording ({recRemaining}s left)</span>
          </span>
        )}
        {phase === 'completed' && (
          <span
            className={`font-bold flex items-center space-x-1 ${
              closedBySilence ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusLabel || 'Completed'}</span>
          </span>
        )}
      </div>

      {/* Preparation Bar */}
      {phase === 'prep' && (
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300">
            <div
              className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${prepProgressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
            <span className="text-[11px] text-slate-500">
              {shouldPlayBeep
                ? 'A short tone will sound when recording begins'
                : 'Mic opens immediately without a tone'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                startMicRecording();
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer active:scale-95"
              title="Skip remaining preparation countdown and begin recording immediately"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Now ({prepRemaining}s)</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Recording: Live Blue Progress Bar + Live Waveform Visualizer + 3s Silence Monitor */}
      {phase === 'recording' && (
        <div className="space-y-3">
          {/* Authentic PTE Live Blue Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden border border-slate-300">
            <div
              className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${recProgressPercent}%` }}
            />
          </div>

          {/* Live Web Audio API Waveform Visualizer */}
          <div className="bg-slate-900 rounded p-2.5 flex items-end justify-between h-14 space-x-1 border border-slate-700">
            {waveformBars.map((heightPct, idx) => (
              <div
                key={idx}
                className="flex-1 bg-blue-400 rounded-t transition-all duration-75"
                style={{ height: `${ Math.max(8, heightPct) }%` }}
              />
            ))}
          </div>

          {/* 3-Second Silence Monitor Bar & Controls */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono">
                Silence Timer:{' '}
                <strong className={silenceMs > 1500 ? 'text-red-600' : 'text-slate-800'}>
                  {(silenceMs / 1000).toFixed(1)}s / 3.0s
                </strong>
              </span>
              <span className="text-slate-400">({currentDb} dB)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => finishRecording(true)}
                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold transition"
                title="Trigger >3s silence cutoff"
              >
                Test &gt;3s Silence Cutoff
              </button>
              <button
                type="button"
                onClick={() => finishRecording(false)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-950 text-white rounded font-semibold transition"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live Speech-to-Text Card */}
          <div className="bg-slate-50 border border-blue-200 rounded p-2.5 space-y-1.5 transition-all">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-blue-900 flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>Live Speech-to-Text Recognition:</span>
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                {(liveTranscript.trim() ? liveTranscript.trim().split(/\s+/).length : 0)} words
              </span>
            </div>
            <p className="text-xs text-slate-800 font-serif italic min-h-[22px] leading-relaxed select-text">
              {liveTranscript || (
                <span className="text-slate-400 font-sans not-italic text-[11px]">
                  {sttSupported
                    ? 'Speak clearly into your microphone — speech transcript generates in real time...'
                    : 'Real-time speech recognition not supported in this browser. Microphone audio will be recorded and transcribed.'}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Completed State with Playback, Downloadable Tagged Clip & Spoken Transcript */}
      {phase === 'completed' && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded border text-xs space-y-2.5 ${
              closedBySilence
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{statusLabel}</span>
              {(serverAudioUrl || recordedBlobUrl) && (
                <a
                  href={serverAudioUrl || recordedBlobUrl}
                  download={fileNameTag}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Download {fileNameTag}</span>
                </a>
              )}
            </div>

            {(serverAudioUrl || recordedBlobUrl) && (
              <audio
                controls
                src={serverAudioUrl || recordedBlobUrl}
                className="w-full h-8"
              />
            )}
          </div>

          {/* Captured Speech-to-Text Spoken Transcript */}
          <div className="bg-white border border-slate-200 rounded p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Speech-to-Text Spoken Transcript:</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {(finalTranscriptRef.current || liveTranscript || '').trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  type="button"
                  onClick={triggerWhisperTranscription}
                  disabled={isAiTranscribing}
                  className="inline-flex items-center space-x-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition disabled:opacity-50"
                  title="Run server Whisper transcription"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isAiTranscribing ? 'Transcribing...' : 'Whisper AI'}</span>
                </button>
              </div>
            </div>

            {isEditingTranscript ? (
              <div className="space-y-2">
                <textarea
                  value={liveTranscript}
                  onChange={(e) => {
                    setLiveTranscript(e.target.value);
                    finalTranscriptRef.current = e.target.value;
                    liveTranscriptRef.current = e.target.value;
                  }}
                  rows={3}
                  className="w-full p-2 border border-blue-300 rounded text-xs font-serif leading-relaxed focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Type or correct spoken transcript..."
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTranscript(false);
                      if (onRecordingComplete) {
                        onRecordingComplete({
                          fileName: fileNameTag,
                          audioUrl: serverAudioUrl || recordedBlobUrl,
                          durationRecorded: recordSeconds - recRemaining,
                          closedDueToSilence: closedBySilence,
                          statusText: statusLabel,
                          transcript: liveTranscript.trim()
                        });
                      }
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save Transcript</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="font-serif text-slate-800 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-100 select-text">
                  {(finalTranscriptRef.current || liveTranscript || '').trim() ? (
                    `"${(finalTranscriptRef.current || liveTranscript || '').trim()}"`
                  ) : (
                    <span className="text-slate-400 not-italic font-sans text-[11px]">
                      (No spoken transcript captured. Click "Edit / Enter" or "Whisper AI" to attach spoken words.)
                    </span>
                  )}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Real-time Native Speech-to-Text</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingTranscript(true)}
                    className="text-blue-700 hover:underline font-semibold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit / Enter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
