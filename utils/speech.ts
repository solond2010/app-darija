// Text-to-speech for Darija written in "chat" transliteration (with numerals:
// 3=ع, 7=ح, 5=خ/kh, 9=ق, 2=ء, 8=غ, 6=ط). Browsers can't pronounce that as-is, so
// we map it to a Spanish-phonetic approximation and speak it with a Spanish voice
// (always available on the user's iPhone and acoustically close to Arabic vowels +
// the guttural "j" = خ/ح). Not a native accent, but a genuinely useful guide.

let voices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

/** Turn chat-script Darija into something a Spanish voice reads acceptably. */
function toSpeakable(input: string): string {
  let s = " " + input.toLowerCase() + " ";
  // Digraphs first.
  s = s.replace(/kh/g, "j").replace(/gh/g, "g").replace(/sh/g, "ch");
  // Arabic-chat numerals → closest Spanish-readable sound.
  s = s
    .replace(/7/g, "j") // ح  (guttural h ≈ Spanish j)
    .replace(/5/g, "j") // خ  (kh ≈ Spanish j)
    .replace(/3/g, "a") // ع  (ayn ≈ a vowel)
    .replace(/9/g, "k") // ق
    .replace(/8/g, "g") // غ
    .replace(/6/g, "t") // ط
    .replace(/2/g, "") // ء  (glottal stop → drop)
    .replace(/4/g, ""); // rare → drop
  // Strip anything that isn't a letter/space/basic mark, collapse spaces.
  s = s.replace(/[_\-]/g, " ").replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
  return s;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (!voices.length) refreshVoices();
  // Prefer a Spanish voice (we romanize to Spanish phonetics); then Arabic; then
  // whatever the system default is.
  return (
    voices.find((v) => /^es(-|_|$)/i.test(v.lang)) ||
    voices.find((v) => /^ar(-|_|$)/i.test(v.lang)) ||
    undefined
  );
}

/** Speak a Darija chat-script word/phrase. Must be called from a user gesture on iOS. */
export function speak(text: string, opts?: { rate?: number }) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const spoken = toSpeakable(text);
  if (!spoken) return;
  try {
    window.speechSynthesis.cancel(); // stop any in-flight utterance
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = "es-ES";
    u.rate = opts?.rate ?? 0.8; // a touch slow, good for learning
    u.pitch = 1;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* TTS unsupported — silently no-op */
  }
}

/** Whether speech synthesis is usable in this environment. */
export function canSpeak(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
