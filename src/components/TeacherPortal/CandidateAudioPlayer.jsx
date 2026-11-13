import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  AlertCircle,
  FileAudio,
  CheckCircle2,
  FastForward,
  Rewind
} from 'lucide-react';

export default function CandidateAudioPlayer({
  audioUrl,
  localBlobUrl,
  dataUrl,
  fileName,
  studentId,
  itemId,
  durationRecorded,
  closedDueToSilence,
  onAudioPlay,
  onAudioEnded
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationRecorded || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [resolvedUrl, setResolvedUrl] = useState(null);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Compute best available audio source URL
  useEffect(() => {
    setLoadError(null);
    setCurrentTime(0);
    setIsPlaying(false);

    let url = audioUrl || localBlobUrl || dataUrl;
    if (!url && fileName) {
      url = `/api/recordings/${encodeURIComponent(fileName)}`;
    } else if (!url && studentId && itemId) {
      url = `/api/recordings/${encodeURIComponent(`${studentId}_${itemId}.webm`)}`;
    }
    setResolvedUrl(url || null);
  }, [audioUrl, localBlobUrl, dataUrl, fileName, studentId, itemId]);

  // Sync playback rate and volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackRate, volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current || !resolvedUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (onAudioPlay) onAudioPlay();
        })
        .catch((err) => {
          console.warn('Playback start error:', err);
          // Try fallback if url was local blob that expired
          if (fileName && resolvedUrl !== `/api/recordings/${encodeURIComponent(fileName)}`) {
            const fallback = `/api/recordings/${encodeURIComponent(fileName)}`;
            setResolvedUrl(fallback);
          } else {
            setLoadError('Could not play audio. File may not be stored on server.');
          }
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
    if (onAudioEnded) onAudioEnded();
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * (duration || 1);
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const skipSeconds = (sec) => {
    if (!audioRef.current) return;
    const nextTime = Math.max(0, Math.min(duration || 999, audioRef.current.currentTime + sec));
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const effectiveFileName = fileName || `${studentId || 'candidate'}_${itemId || 'audio'}.webm`;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4 rounded-xl shadow-md border border-blue-900/40 space-y-3">
      {resolvedUrl && (
        <audio
          ref={audioRef}
          src={resolvedUrl}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={() => {
            if (fileName && resolvedUrl !== `/api/recordings/${encodeURIComponent(fileName)}`) {
              setResolvedUrl(`/api/recordings/${encodeURIComponent(fileName)}`);
            } else {
              setLoadError('Audio clip could not be loaded from server or local cache.');
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          }}
        />
      )}

      {/* Header Info Strip */}
      <div className="flex items-center justify-between text-xs border-b border-blue-900/50 pb-2">
        <div className="flex items-center space-x-2">
          <FileAudio className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-100 tracking-wide text-xs">
            Candidate Voice Recording
          </span>
          <span className="font-mono text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-800">
            {effectiveFileName}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {closedDueToSilence && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-semibold">
              ⚠️ Silence Cutoff (&gt;3s)
            </span>
          )}
          {duration > 0 && (
            <span className="font-mono text-emerald-400 font-bold text-xs">
              {duration.toFixed(1)}s recorded
            </span>
          )}
        </div>
      </div>

      {loadError ? (
        <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-200 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{loadError}</span>
          </div>
          {resolvedUrl && (
            <a
              href={resolvedUrl}
              download={effectiveFileName}
              className="text-xs text-blue-300 underline font-bold hover:text-blue-100"
            >
              Direct Link
            </a>
          )}
        </div>
      ) : !resolvedUrl ? (
        <div className="p-4 text-center text-xs text-slate-400 italic">
          No voice recording file found for this task item.
        </div>
      ) : (
        <>
          {/* Timeline & Scrubber */}
          <div className="space-y-1">
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden cursor-pointer relative hover:h-3.5 transition-all group"
              title="Click or drag to scrub"
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              {/* Skip -5s */}
              <button
                type="button"
                onClick={() => skipSeconds(-5)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                title="Rewind 5 seconds"
              >
                <Rewind className="w-4 h-4" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition active:scale-95"
                title={isPlaying ? 'Pause candidate voice' : 'Play candidate voice'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Skip +5s */}
              <button
                type="button"
                onClick={() => skipSeconds(5)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                title="Fast forward 5 seconds"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Restart */}
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                    if (!isPlaying) togglePlay();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                title="Replay from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed Chips (Critical for Teachers Grading Pronunciation) */}
            <div className="flex items-center space-x-1 bg-slate-800/70 p-1 rounded-lg border border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Speed:</span>
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                    playbackRate === rate
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume & Download */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-16 h-1.5 bg-slate-700 rounded-lg accent-blue-500 cursor-pointer"
                  title="Volume"
                />
              </div>

              {resolvedUrl && (
                <a
                  href={resolvedUrl}
                  download={effectiveFileName}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                  title="Download raw audio recording file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .webm</span>
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

