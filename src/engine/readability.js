const EXCEPTIONS = { the: 1, every: 2, people: 2, business: 2, different: 3, area: 3, idea: 3, really: 2, being: 2, poem: 2, science: 2, quiet: 2, real: 1, create: 2, created: 3, recreate: 3, naive: 2, cooperate: 4, simile: 3, recipe: 3, apostrophe: 4, epitome: 4, coyote: 3, guacamole: 4, karate: 3, maybe: 2, someone: 2, sometimes: 2, somewhere: 2, everyone: 3, anyone: 3, lifetime: 2, likely: 2, ion: 2, lion: 2, giant: 2, diet: 2, client: 2, fluid: 2 };

export function syllables(word) {
  let w = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (EXCEPTIONS[w]) return EXCEPTIONS[w];
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = w.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function splitSentences(text) {
  return String(text)
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e|U\.S|Inc|Ltd|No)\./gi, (m) => m.replace(/\./g, "\u2024"))
    .split(/(?<=[.!?\u2026])["'\u201D\u2019)]*\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => /[a-z0-9]/i.test(s));
}

export function words(text) {
  return String(text).match(/[A-Za-z0-9\u00C0-\u024F]+(?:['\u2019\-][A-Za-z0-9\u00C0-\u024F]+)*/g) || [];
}

const round1 = (v) => Math.round(v * 10) / 10;

export function readability(text, { wpm = 238 } = {}) {
  const sentences = splitSentences(text);
  const ws = words(text);
  const nWords = ws.length;
  const nSent = Math.max(1, sentences.length);
  if (!nWords) return null;
  let syl = 0;
  let poly = 0;
  let complex = 0;
  let letters = 0;
  let longWords = 0;
  for (const w of ws) {
    const s = syllables(w);
    syl += s;
    if (s >= 3) {
      poly++;
      if (!/^[A-Z]/.test(w) && !/(es|ed|ing)$/.test(w.toLowerCase())) complex++;
    }
    letters += w.replace(/[^A-Za-z0-9\u00C0-\u024F]/g, "").length;
    if (w.length > 6) longWords++;
  }
  const wps = nWords / nSent;
  const spw = syl / nWords;
  const L = (letters / nWords) * 100;
  const S = (nSent / nWords) * 100;
  const fleschEase = 206.835 - 1.015 * wps - 84.6 * spw;
  const fkGrade = 0.39 * wps + 11.8 * spw - 15.59;
  const fog = 0.4 * (wps + 100 * (complex / nWords));
  const smog = 1.043 * Math.sqrt(poly * (30 / nSent)) + 3.1291;
  const coleman = 0.0588 * L - 0.296 * S - 15.8;
  const ari = 4.71 * (letters / nWords) + 0.5 * wps - 21.43;
  const grades = [fkGrade, fog, smog, coleman, ari];
  const avgGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
  const lens = sentences.map((s) => words(s).length);
  return {
    words: nWords,
    sentences: sentences.length,
    syllables: syl,
    characters: letters,
    paragraphs: String(text).split(/\n\s*\n/).filter((p) => p.trim()).length,
    wordsPerSentence: round1(wps),
    syllablesPerWord: Math.round(spw * 100) / 100,
    complexWords: poly,
    longWords,
    fleschEase: round1(Math.max(0, Math.min(121, fleschEase))),
    fleschKincaid: round1(Math.max(0, fkGrade)),
    gunningFog: round1(Math.max(0, fog)),
    smog: round1(Math.max(0, smog)),
    colemanLiau: round1(Math.max(0, coleman)),
    ari: round1(Math.max(0, ari)),
    averageGrade: round1(Math.max(0, avgGrade)),
    readingMinutes: nWords / wpm,
    speakingMinutes: nWords / 150,
    longSentences: sentences.filter((s, i) => lens[i] > 25),
    longestSentence: Math.max(0, ...lens),
  };
}

export function easeLabel(score) {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Plain English";
  if (score >= 50) return "Fairly hard";
  if (score >= 30) return "Hard";
  return "Very hard";
}

export function gradeLabel(g) {
  if (g < 1) return "Kindergarten";
  if (g <= 12) return "Grade " + Math.round(g);
  if (g <= 16) return "College";
  return "Graduate";
}
