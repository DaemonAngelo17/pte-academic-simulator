import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import { stopSpeaking, TTS_ACCENT_OPTIONS, getNeuralVoice, playShortBeep, fallbackSpeechSynthesis } from '../../utils/audioUtils';

export default function AudioPlayerWidget({
  audioText,
  audioUrl,
  voiceAccent = 'en-US',
  speechRate = 0.95,
  audioDuration = 10,
  autoPlay = true,
  onAudioComplete,
  allowReplay = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioElementRef = useRef(null);

  // Determine exact audio URL (uploaded media or Neural TTS endpoint)
  const chosenVoice = getNeuralVoice(voiceAccent);
  const cleanText = (audioText || '').replace(/\[BEEP\]/gi, '').trim();
  const hasTrailingBeep = /\[BEEP\]/i.test(audioText || '');
  const effectiveAudioUrl = audioUrl || (cleanText ? `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(chosenVoice)}` : null);

  const cleanupPlayback = () => {
    stopSpeaking();
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
      audioElementRef.current = null;
    }
  };

  const startPlayback = () => {
    cleanupPlayback();
    setAutoplayBlocked(false);
    setProgress(0);

    if (!effectiveAudioUrl) {
      setIsPlaying(false);
      setHasPlayed(true);
      if (onAudioComplete) onAudioComplete();
      return;
    }

    setIsPlaying(true);
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = effectiveAudioUrl;
    audio.volume = isMuted ? 0 : volume;
    audioElementRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setProgress(100);
      setIsPlaying(false);
      setHasPlayed(true);
      if (hasTrailingBeep) playShortBeep(920, 0.45);
      if (onAudioComplete) onAudioComplete();
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error on URL, attempting SpeechSynthesis fallback:', effectiveAudioUrl, e);
      if (cleanText) {
        fallbackSpeechSynthesis(cleanText, hasTrailingBeep, () => {
          setProgress(100);
          setIsPlaying(false);
          setHasPlayed(true);
          if (onAudioComplete) onAudioComplete();
        }, { accent: voiceAccent, rate: speechRate });
        return;
      }
      setProgress(100);
      setIsPlaying(false);
      setHasPlayed(true);
      if (onAudioComplete) onAudioComplete();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.name === 'NotAllowedError') {
          console.warn('Browser autoplay policy blocked automatic audio start; user click needed');
          setAutoplayBlocked(true);
          setIsPlaying(false);
          return;
        }
        console.warn('Audio playback error:', err);
        setIsPlaying(false);
      });
    }
  };

  // Pre-load audio stream and handle auto-play
  useEffect(() => {
    setHasPlayed(false);
    setProgress(0);
    setAutoplayBlocked(false);

    if (effectiveAudioUrl) {
      const pre = new Audio();
      pre.preload = 'auto';
      pre.src = effectiveAudioUrl;
      pre.load();
    }

    if (autoPlay) {
      const timer = setTimeout(() => {
        startPlayback();
      }, 400);
      return () => {
        clearTimeout(timer);
        cleanupPlayback();
      };
    }

    return () => {
      cleanupPlayback();
    };
  }, [audioText, audioUrl, voiceAccent]);

  const handleStop = () => {
    cleanupPlayback();
    setIsPlaying(false);
    setProgress(100);
    setHasPlayed(true);
    if (onAudioComplete) onAudioComplete();
  };

  const accentBadge = TTS_ACCENT_OPTIONS.find((a) => a.code === voiceAccent);

  return (
    <div className="border border-slate-300 rounded bg-slate-50 p-3 max-w-md w-full shadow-xs mb-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        <div className="flex items-center space-x-2">
          <span>Audio Status</span>
          {!audioUrl && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#003865] normal-case" title={chosenVoice}>
              🎙️ {chosenVoice.replace(/Neural$/i, '')}
            </span>
          )}
          {audioUrl && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 normal-case">
              Audio Track
            </span>
          )}
        </div>
        <span
          className={
            isPlaying
              ? 'text-blue-600 font-bold flex items-center space-x-1'
              : hasPlayed
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500'
          }
        >
          {isPlaying ? (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping mr-1" />
              <span>Playing...</span>
            </>
          ) : hasPlayed ? (
            'Completed'
          ) : autoplayBlocked ? (
            'Click Play'
          ) : (
            'Ready'
          )}
        </span>
      </div>

      {/* Autoplay blocked banner / button */}
      {autoplayBlocked && !hasPlayed && (
        <button
          type="button"
          onClick={startPlayback}
          className="w-full mb-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm animate-pulse transition"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Click to Play Audio Prompt</span>
        </button>
      )}

      {/* Pearson Authentic Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300 relative">
        <div
          className="bg-blue-600 h-full transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          {isPlaying ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-2 py-0.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
            >
              Skip Audio
            </button>
          ) : (
            (allowReplay || (!hasPlayed && !autoplayBlocked)) && (
              <button
                type="button"
                onClick={startPlayback}
                className="flex items-center space-x-1 px-2 py-0.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{hasPlayed ? 'Replay' : 'Play'}</span>
              </button>
            )
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (audioElementRef.current) {
                audioElementRef.current.volume = nextMute ? 0 : volume;
              }
            }}
            className="text-slate-500 hover:text-slate-800"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
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
              if (audioElementRef.current) {
                audioElementRef.current.volume = v;
              }
            }}
            className="w-16 h-1.5 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
