/**
 * P0.5E.4B — Client-safe voice playback helpers (browser SpeechSynthesis).
 */

export type VoicePlaybackProfile = {
  pitch: number;
  rate: number;
  voiceIndex: number;
  providerVoiceId: string;
};

export function speakWithProfile(spokenCopy: string, profile: VoicePlaybackProfile | null | undefined): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenCopy);
  if (profile) {
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
    const femaleVoices = voices.filter((v) => /female|samantha|victoria|karen|moira|fiona|tessa|zira/i.test(v.name));
    const pool = femaleVoices.length > 0 ? femaleVoices : voices;
    if (pool.length > 0) {
      utterance.voice = pool[profile.voiceIndex % pool.length] ?? pool[0]!;
    }
  }
  window.speechSynthesis.speak(utterance);
}

export function stopVoicePlayback(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function preloadSpeechVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
}
