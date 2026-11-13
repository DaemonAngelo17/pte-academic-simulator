/**
 * Studio Neural Speech Synthesizer & Audio Utilities for PTE Academic
 * Uses high-fidelity Microsoft Edge Neural TTS with broadcast-quality British, American,
 * and Australian accents, multi-speaker dialogue parsing, and automated caching.
 * Gracefully falls back to Web Speech API if server is offline.
 */

export const TTS_ACCENT_OPTIONS = [
  { code: 'en-GB', label: 'British English (UK)', flag: '🇬🇧', langPrefix: 'en-GB' },
  { code: 'en-US', label: 'American English (US)', flag: '🇺🇸', langPrefix: 'en-US' },
  { code: 'en-AU', label: 'Australian English (AU)', flag: '🇦🇺', langPrefix: 'en-AU' },
  { code: 'en-CA', label: 'Canadian English (CA)', flag: '🇨🇦', langPrefix: 'en-CA' },
  { code: 'en-IN', label: 'Indian English (IN)', flag: '🇮🇳', langPrefix: 'en-IN' }
];

export const NEURAL_VOICES = [
  { id: 'en-GB-SoniaNeural', label: 'Sonia (UK Female - BBC Received Pronunciation)', accent: 'en-GB', gender: 'Female' },
  { id: 'en-GB-RyanNeural', label: 'Ryan (UK Male - Oxford Academic)', accent: 'en-GB', gender: 'Male' },
  { id: 'en-US-AriaNeural', label: 'Aria (US Female - Studio Expressive)', accent: 'en-US', gender: 'Female' },
  { id: 'en-US-GuyNeural', label: 'Guy (US Male - Professional Broadcaster)', accent: 'en-US', gender: 'Male' },
  { id: 'en-AU-NatashaNeural', label: 'Natasha (AU Female - ABC Australian)', accent: 'en-AU', gender: 'Female' },
  { id: 'en-AU-WilliamNeural', label: 'William (AU Male - Australian Natural)', accent: 'en-AU', gender: 'Male' },
  { id: 'en-CA-ClaraNeural', label: 'Clara (CA Female - Canadian Neutral)', accent: 'en-CA', gender: 'Female' },
  { id: 'en-IN-NeerjaNeural', label: 'Neerja (IN Female - Clear Indian English)', accent: 'en-IN', gender: 'Female' }
];

export const NEURAL_VOICE_MAP = {
  'en-GB': 'en-GB-SoniaNeural',
  'en-US': 'en-US-AriaNeural',
  'en-AU': 'en-AU-NatashaNeural',
  'en-CA': 'en-CA-ClaraNeural',
  'en-IN': 'en-IN-NeerjaNeural',
  'us-female': 'en-US-AriaNeural',
  'us-male': 'en-US-GuyNeural',
  'uk-female': 'en-GB-SoniaNeural',
  'uk-male': 'en-GB-RyanNeural',
  'au-female': 'en-AU-NatashaNeural',
  'au-male': 'en-AU-WilliamNeural'
};

export function getNeuralVoice(voiceOrAccent = 'en-US') {
  if (!voiceOrAccent) return 'en-GB-SoniaNeural';
  if (voiceOrAccent.includes('Neural')) return voiceOrAccent;
  const mapped = NEURAL_VOICE_MAP[voiceOrAccent] || NEURAL_VOICE_MAP[voiceOrAccent.toLowerCase()];
  return mapped || 'en-GB-SoniaNeural';
}

export function preloadNeuralAudio(text, voiceOrAccent = 'en-US') {
  if (typeof window === 'undefined' || !text) return null;
  const clean = text.replace(/\[BEEP\]/gi, '').trim();
  if (!clean) return null;
  const chosenVoice = getNeuralVoice(voiceOrAccent);
  const url = `/api/tts?text=${encodeURIComponent(clean)}&voice=${encodeURIComponent(chosenVoice)}`;
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  audio.load();
  return audio;
}

// Global active audio instance pointer
let currentAudioInstance = null;
let currentCancelFn = null;

export function getBestVoiceForAccent(accentCode = 'en-US') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const normalized = (accentCode || 'en-US').toLowerCase();
  // Exact lang match
  const exact = voices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-') === normalized);
  if (exact) return exact;

  // Starts with prefix (e.g. en-gb, en-au, en-us)
  const prefixMatch = voices.find(
    (v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(normalized)
  );
  if (prefixMatch) return prefixMatch;

  // Name match heuristic
  if (normalized === 'en-gb') {
    const ukByName = voices.find((v) => /uk|british|daniel|serena|oliver|martha/i.test(v.name));
    if (ukByName) return ukByName;
  }
  if (normalized === 'en-au') {
    const auByName = voices.find((v) => /australia|karen|lee|catherine/i.test(v.name));
    if (auByName) return auByName;
  }
  if (normalized === 'en-us') {
    const usByName = voices.find((v) => /us|united states|samantha|alex|ava|allison/i.test(v.name));
    if (usByName) return usByName;
  }

  return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0];
}

export function playShortBeep(freq = 800, durationSec = 0.3) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // ignore audio context restrictions
  }
}

/**
 * Secondary fallback when server neural TTS is offline or network fails
 */
export function fallbackSpeechSynthesis(cleanText, hasTrailingBeep, onEnd, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (hasTrailingBeep) playShortBeep(920, 0.45);
    if (onEnd) onEnd();
    return () => {};
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  const { accent = 'en-US', rate = 0.95, pitch = 1.0, volume = 1.0 } = options;
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = accent;
  const matchedVoice = getBestVoiceForAccent(accent);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  utterance.onend = () => {
    if (hasTrailingBeep) playShortBeep(920, 0.45);
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis utterance error:', e);
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('speechSynthesis.speak error:', err);
    if (onEnd) onEnd();
  }

  return () => {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  };
}

/**
 * Primary high-fidelity speech synthesizer.
 * Calls /api/tts to stream studio-quality neural voices with authentic accents.
 */
export function speakText(text, onEnd, options = {}) {
  if (typeof window === 'undefined' || !text) {
    if (onEnd) onEnd();
    return () => {};
  }

  // Stop any active audio or speech synthesis
  stopSpeaking();

  const {
    accent = 'en-GB',
    voice = null,
    volume = 1.0
  } = options;

  const hasTrailingBeep = /\[BEEP\]/i.test(text);
  const cleanText = text.replace(/\[BEEP\]/gi, '').trim();

  if (!cleanText) {
    if (hasTrailingBeep) playShortBeep(920, 0.45);
    if (onEnd) onEnd();
    return () => {};
  }

  // Resolve neural voice
  let chosenVoice = voice;
  if (!chosenVoice) {
    chosenVoice = getNeuralVoice(accent);
  }

  let isCancelled = false;

  const handleFinish = () => {
    currentAudioInstance = null;
    currentCancelFn = null;
    if (hasTrailingBeep) {
      playShortBeep(920, 0.45);
    }
    if (onEnd && !isCancelled) {
      onEnd();
    }
  };

  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(chosenVoice)}`;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = audioUrl;
    audio.volume = Math.max(0, Math.min(1, volume));
    currentAudioInstance = audio;

    const cancelPlayback = () => {
      isCancelled = true;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      if (currentAudioInstance === audio) {
        currentAudioInstance = null;
      }
    };
    currentCancelFn = cancelPlayback;

    audio.onended = () => {
      handleFinish();
    };

    audio.onerror = (e) => {
      if (isCancelled) return;
      console.warn('Backend neural TTS load error, falling back to SpeechSynthesis:', e);
      if (options.allowRoboticFallback !== false) {
        currentAudioInstance = null;
        fallbackSpeechSynthesis(cleanText, hasTrailingBeep, onEnd, options);
      } else if (onEnd) {
        onEnd();
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Intentionally paused/cancelled — NEVER trigger robotic fallback!
        if (err.name === 'AbortError' || isCancelled) {
          return;
        }

        if (err.name === 'NotAllowedError') {
          console.warn('Audio play blocked by browser autoplay policy:', err);
          if (options.onAutoplayBlocked) {
            options.onAutoplayBlocked();
            return;
          }
        }

        console.warn('Audio playback exception, checking fallback rules:', err);
        if (!isCancelled && options.allowRoboticFallback) {
          currentAudioInstance = null;
          fallbackSpeechSynthesis(cleanText, hasTrailingBeep, onEnd, options);
        }
      });
    }

    return cancelPlayback;
  } catch (err) {
    console.warn('Exception during neural audio init:', err);
    if (options.allowRoboticFallback) {
      return fallbackSpeechSynthesis(cleanText, hasTrailingBeep, onEnd, options);
    }
    return () => {};
  }
}

/**
 * Immediately stops any currently playing audio stream or speech synthesis utterance.
 */
export function stopSpeaking() {
  if (currentCancelFn) {
    try { currentCancelFn(); } catch {}
    currentCancelFn = null;
  }
  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
    } catch {}
    currentAudioInstance = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
