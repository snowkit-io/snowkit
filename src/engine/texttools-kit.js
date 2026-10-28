export const READ_WPM = 238;
export const SPEAK_WPM = 140;

export const SMALL_WORDS = new Set('a an the and but or nor for so yet as at by in of off on per to up via vs'.split(' '));
export const STOP_WORDS = new Set("a about above after again against all also am an and any are aren't as at be because been before being below between both but by can can't could did didn't do does doesn't doing don't down during each few for from further get got had has have having he her here hers herself him himself his how i i'm if in into is isn't it it's its itself just let me more most my myself no nor not now of off on once one only or other our ours ourselves out over own same she should so some such than that that's the their theirs them themselves then there there's these they this those through to too under until up us very was we were what when where which while who whom why will with won't would you you're your yours yourself yourselves".split(' '));
export const SLUG_STOP = new Set('a an the and or but of to in on at for with by from as is are'.split(' '));
export const ABBREVIATIONS = /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e|approx|Inc|Ltd|Co|Corp|Mt|Ave|No|Fig|Vol|a\.m|p\.m|U\.S)\./gi;
export const LATIN = { '\u00DF': 'ss', '\u00E6': 'ae', '\u00F8': 'o', '\u0153': 'oe', '\u0111': 'd', '\u0142': 'l', '\u00FE': 'th', '\u00F0': 'd', '\u0131': 'i', '\u0127': 'h', '\u0167': 't' };
export const MAP = Object.assign({}, LATIN);
for (const pair of '\u0430-a \u0431-b \u0432-v \u0433-g \u0434-d \u0435-e \u0451-yo \u0436-zh \u0437-z \u0438-i \u0439-y \u043A-k \u043B-l \u043C-m \u043D-n \u043E-o \u043F-p \u0440-r \u0441-s \u0442-t \u0443-u \u0444-f \u0445-kh \u0446-ts \u0447-ch \u0448-sh \u0449-shch \u044A- \u044B-y \u044C- \u044D-e \u044E-yu \u044F-ya \u0456-i \u0457-yi \u0454-ye \u0491-g \u03B1-a \u03B2-v \u03B3-g \u03B4-d \u03B5-e \u03B6-z \u03B7-i \u03B8-th \u03B9-i \u03BA-k \u03BB-l \u03BC-m \u03BD-n \u03BE-x \u03BF-o \u03C0-p \u03C1-r \u03C3-s \u03C2-s \u03C4-t \u03C5-y \u03C6-f \u03C7-ch \u03C8-ps \u03C9-o'.split(' ')) {
  const [from, to] = pair.split('-');
  MAP[from] = to;
}
export const SENTENCES = [
  'The morning train was quieter than usual, so most people read or looked out at the fields.',
  'A good recipe tells you what to buy, how long it takes and what the dish should look like.',
  'Our office moved to the third floor, next to the meeting rooms and the small kitchen.',
  'Please bring a pen, a notebook and any questions you have about the new schedule.',
  'The park opens at seven, and the cafe by the pond starts serving coffee an hour later.',
  'Every chapter ends with a short summary and a few exercises to try on your own.',
  'We tested the bike lights in rain, fog and full darkness before choosing the brightest pair.',
  'The library keeps a shelf of local maps, old newspapers and photos of the town square.',
  'If the parcel does not arrive by Friday, write to us and we will send a replacement.',
  'She painted the fence a pale green that matched the leaves of the old apple tree.',
  'The workshop covers basic tools, safe habits and how to plan a small project from start to finish.',
  'Most visitors come in spring, when the hills are bright and the paths are dry.',
  'A clear label on each box saves time when you unpack in a new home.',
  'The team meets every Tuesday to review progress and agree on the next steps.',
  'Fresh bread tastes best on the day it is baked, but it also freezes well.',
  'The guide explains how to set up the device, connect it and keep it up to date.',
  'Our garden club swaps seeds every autumn and shares tips on growing vegetables in small spaces.',
  'The museum added a quiet room where visitors can sit, rest and read about the collection.',
  'Water the plants early in the day so the soil stays cool and damp for longer.',
  'The report shows steady growth, with the biggest change in the last three months.',
  'A short walk after lunch helps many people stay focused for the rest of the afternoon.',
  'The new menu lists every allergen next to each dish, in plain words.',
  'Our support team answers most messages within one working day.',
  'The bridge was repainted last summer and now looks almost new.',
  'Choose a password that is long, unique and easy for you to remember.',
  'The festival brings music, food stalls and craft tables to the main street each July.',
  'Each room has a desk, a reading lamp and a window that faces the courtyard.',
  'The class starts with ten minutes of stretching and ends with a slow cool-down.',
  'Keep your receipt, since you will need it for any return or exchange.',
  'The river rose after a week of rain, but the path along the bank stayed open.',
  'Good notes record what was decided, who will do it and when it is due.',
  'The bakery on the corner sells out of rye loaves before noon on Saturdays.',
  'Our newsletter goes out once a month with news, events and a short interview.',
  'The hiking trail is well marked, with benches at the steepest points.',
  'A simple layout with clear headings makes a long page much easier to read.',
  'The shop repairs shoes, bags and belts, and most jobs are ready the next day.',
  'Volunteers planted forty trees along the school fence over two weekends.',
  'The tour lasts about an hour and ends at the top of the old clock tower.',
  'Store the jars in a cool, dark cupboard and use them within a year.',
  'The town hall clock was fixed in May and has kept good time ever since.',
  'Every invoice shows the date, the amount due and how to pay.',
  'The quiet carriage is at the front of the train, next to the luggage racks.',
  'Learning a few words of the local language goes a long way when you travel.',
  'The new playground has swings, a climbing frame and soft ground under every piece.',
  'The printer on the second floor now prints on both sides unless you change it.'
];

export const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many || `${one}s`}`;

export const graphemes = typeof Intl === 'object' && typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

export function charCount(text) {
  if (!text) return 0;
  if (!graphemes) return Array.from(text).length;
  let n = 0;
  const it = graphemes.segment(text)[Symbol.iterator]();
  while (!it.next().done) n++;
  return n;
}

export const CJK = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g;

export function wordCount(text) {
  const cjk = (text.match(CJK) || []).length;
  let n = 0;
  for (const token of text.replace(CJK, ' ').split(/\s+/)) {
    if (token && /[\p{L}\p{N}]/u.test(token)) n++;
  }
  return n + cjk;
}

export function sentenceCount(text) {
  const marked = text.replace(ABBREVIATIONS, match => match.replace(/\./g, '\u0001'));
  let n = 0;
  for (const part of marked.split(/[.!?\u2026\u3002\uFF01\uFF1F]+["'\u201D\u2019)\]]*(?=\s|$)|\n+/)) {
    if (/[\p{L}\p{N}]/u.test(part)) n++;
  }
  return n;
}

export function duration(words, wpm) {
  if (!words) return '0 s';
  const s = Math.max(1, Math.round((words / wpm) * 60));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m >= 60) return `${Math.floor(m / 60)} h ${m % 60} min`;
  return s % 60 ? `${m} min ${s % 60} s` : `${m} min`;
}

export function stats(text) {
  const t = text.replace(/\r\n?/g, '\n');
  const lines = t ? t.split('\n') : [];
  const words = wordCount(t);
  return {
    words,
    chars: charCount(t),
    nospace: charCount(t.replace(/\s+/g, '')),
    sentences: sentenceCount(t),
    paragraphs: lines.filter(line => line.trim()).length,
    lines: lines.length,
    read: duration(words, READ_WPM),
    speak: duration(words, SPEAK_WPM)
  };
}

export function density(text, phrases, common) {
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)*/gu) || [];
  const words = tokens.map(t => t.replace(/\u2019/g, "'"));
  const skip = w => w.length < 2 || /^\d+$/.test(w) || (common && STOP_WORDS.has(w));
  const counts = new Map();
  let total = 0;
  if (phrases) {
    for (let i = 0; i + 1 < words.length; i++) {
      total++;
      if (skip(words[i]) || skip(words[i + 1])) continue;
      const key = `${words[i]} ${words[i + 1]}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  } else {
    for (const w of words) {
      total++;
      if (skip(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  const top = [...counts].filter(([, n]) => !phrases || n > 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
  return { top, total };
}

export function hasInnerCaps(word) {
  return /\p{Lu}/u.test(word.slice(1)) && /\p{L}/u.test(word);
}

export function capitalize(word) {
  const first = word.search(/\p{L}|\p{N}/u);
  if (first < 0) return word;
  return word.slice(0, first) + word.charAt(first).toUpperCase() + word.slice(first + 1);
}

export function titleCase(text) {
  return text.split('\n').map(line => {
    const source = /\p{Ll}/u.test(line) ? line : line.toLowerCase();
    const parts = source.split(/(\s+)/);
    const wordIdx = parts.map((p, i) => (/[\p{L}\p{N}]/u.test(p) ? i : -1)).filter(i => i >= 0);
    const lastWord = wordIdx[wordIdx.length - 1];
    let newPhrase = true;
    return parts.map((part, i) => {
      if (!/[\p{L}\p{N}]/u.test(part)) {
        if (/[:.!?\u2014\u2013]$/.test(part.trim())) newPhrase = true;
        return part;
      }
      const starts = newPhrase;
      newPhrase = /[:.!?\u2014\u2013]["'\u201D\u2019)]*$/.test(part);
      if (/@|:\/\/|^www\.|\.[a-z]{2,}$/i.test(part) || hasInnerCaps(part.replace(/^[^\p{L}\p{N}]+/u, ''))) return part;
      const pieces = part.split('-');
      return pieces.map((piece, j) => {
        const bare = piece.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();
        const edge = (starts && j === 0) || (i === lastWord && j === pieces.length - 1);
        if (SMALL_WORDS.has(bare) && !edge) return piece.toLowerCase();
        return capitalize(piece.toLowerCase());
      }).join('-');
    }).join('');
  }).join('\n');
}

export function sentenceCase(text) {
  const lowered = text.split(/(\s+)/).map(part => (/^[^\p{L}]*\p{Ll}+\p{Lu}/u.test(part) || /\p{Lu}\p{Ll}+\p{Lu}/u.test(part) ? part : part.toLowerCase())).join('');
  let out = lowered.replace(/(^|[.!?\u2026]["'\u201D\u2019)]*\s+|\n\s*)([^\p{L}\p{N}\s]*)(\p{L})/gu, (m, lead, punct, letter) => lead + punct + letter.toUpperCase());
  out = out.replace(/(^|[^\p{L}\p{N}'])i(?=$|[^\p{L}\p{N}])/gu, (m, lead) => `${lead}I`);
  return out;
}

export function codeWords(line) {
  return line
    .replace(/['\u2019]/g, '')
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function convertCase(text, type) {
  if (type === 'upper') return text.toUpperCase();
  if (type === 'lower') return text.toLowerCase();
  if (type === 'title') return titleCase(text);
  if (type === 'sentence') return sentenceCase(text);
  return text.split('\n').map(line => {
    const words = codeWords(line).map(w => w.toLowerCase());
    if (!words.length) return '';
    if (type === 'camel') return words[0] + words.slice(1).map(capitalize).join('');
    if (type === 'pascal') return words.map(capitalize).join('');
    if (type === 'snake') return words.join('_');
    if (type === 'kebab') return words.join('-');
    return words.join('_').toUpperCase();
  }).join('\n');
}

export function splitLines(text) {
  return text.replace(/\r\n?/g, '\n').split('\n');
}

export function randomInt(n) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / n) * n;
  let v;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % n;
}

export function cleanText(text, o) {
  let t = text.replace(/\r\n?/g, '\n');
  if (o.invisible) t = t.replace(/[\u00A0\u2007\u202F\u2000-\u200A\u3000]/g, ' ').replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, '');
  if (o.tabs) t = t.replace(/\t/g, ' ');
  if (o.spaces) t = t.replace(/[ \t]{2,}/g, match => (match.includes('\t') && !o.tabs ? '\t' : ' '));
  if (o.trim) t = t.split('\n').map(line => line.replace(/^[ \t]+|[ \t]+$/g, '')).join('\n');
  if (o.breaks === 'collapse') t = t.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n');
  else if (o.breaks === 'remove') t = t.split('\n').filter(line => line.trim()).join('\n');
  else if (o.breaks === 'join') {
    t = t.split(/\n[ \t]*\n+/).map(block => block.split('\n').map(line => line.trim()).filter(Boolean).join(' ').replace(/(\p{L})- (\p{Ll})/gu, '$1$2')).filter(Boolean).join('\n\n');
    if (o.spaces) t = t.replace(/ {2,}/g, ' ');
  } else if (o.breaks === 'single') {
    t = t.split('\n').map(line => line.trim()).filter(Boolean).join(' ');
    if (o.spaces) t = t.replace(/ {2,}/g, ' ');
  }
  if (o.breaks !== 'keep') t = t.replace(/^\n+|\n+$/g, '');
  return t;
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function regexError(error) {
  const message = String((error && error.message) || error);
  const reason = message.includes(': ') ? message.slice(message.lastIndexOf(': ') + 2) : message;
  return `That pattern is not a valid regular expression: ${reason.replace(/\.$/, '')}.`;
}

export function dedupeLines(text, o) {
  const seen = new Set();
  const out = [];
  let dupes = 0;
  let empties = 0;
  for (const line of splitLines(text)) {
    if (!line.trim()) {
      if (o.dropEmpty) {
        empties++;
        continue;
      }
      out.push(line);
      continue;
    }
    let key = o.trim ? line.trim() : line;
    if (o.ignoreCase) key = key.toLocaleLowerCase();
    if (seen.has(key)) {
      dupes++;
      continue;
    }
    seen.add(key);
    out.push(line);
  }
  return { out, dupes, empties };
}

export function sortLines(text, o, shuffle) {
  let lines = splitLines(text);
  if (o.dropEmpty) lines = lines.filter(line => line.trim());
  if (o.unique) {
    const seen = new Set();
    lines = lines.filter(line => {
      const key = o.ignoreCase ? line.trim().toLocaleLowerCase() : line.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const plain = new Intl.Collator(undefined, { sensitivity: o.ignoreCase ? 'base' : 'variant', caseFirst: 'upper' });
  const natural = new Intl.Collator(undefined, { sensitivity: o.ignoreCase ? 'base' : 'variant', numeric: true, caseFirst: 'upper' });
  const tie = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  switch (o.order) {
    case 'az': lines.sort((a, b) => plain.compare(a.trim(), b.trim()) || tie(a, b)); break;
    case 'za': lines.sort((a, b) => plain.compare(b.trim(), a.trim()) || tie(b, a)); break;
    case 'natural': lines.sort((a, b) => natural.compare(a.trim(), b.trim()) || tie(a, b)); break;
    case 'short': lines.sort((a, b) => charCount(a) - charCount(b) || plain.compare(a, b)); break;
    case 'long': lines.sort((a, b) => charCount(b) - charCount(a) || plain.compare(a, b)); break;
    case 'reverse': lines.reverse(); break;
    default: lines = shuffle(lines);
  }
  return lines;
}

export function shuffleLines(lines, pick = randomInt) {
  for (let i = lines.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }
  return lines;
}

export function replaceFlags(o) {
  return `g${o.matchCase ? '' : 'i'}${o.regex ? 'm' : ''}`;
}

export function plainReplace(text, o) {
  const flags = replaceFlags(o);
  const core = escapeRegex(o.find);
  let re;
  try {
    re = o.whole ? new RegExp(`(?<![\\p{L}\\p{N}_])${core}(?![\\p{L}\\p{N}_])`, `${flags}u`) : new RegExp(core, flags);
  } catch {
    re = new RegExp(o.whole ? `\\b${core}\\b` : core, flags);
  }
  const found = text.match(re);
  return { result: text.replace(re, () => o.with), count: found ? found.length : 0 };
}

export function regexPattern(o) {
  return o.whole ? `\\b(?:${o.find})\\b` : o.find;
}

export function expandReplacement(text) {
  return text.replace(/\\(n|t|\\)/g, (m, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : '\\'));
}

export function regexReplace(text, pattern, flags, replacement) {
  const re = new RegExp(pattern, flags);
  const found = text.match(re);
  return { result: text.replace(re, replacement), count: found ? found.length : 0 };
}

export function diffSeq(a, b) {
  const ops = [];
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    ops.push(['=', start, start]);
    start++;
  }
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const A = a.slice(start, endA);
  const B = b.slice(start, endB);
  const middle = myers(A, B);
  for (const [type, i, j] of middle) ops.push([type, i < 0 ? -1 : i + start, j < 0 ? -1 : j + start]);
  for (let k = 0; endA + k < a.length; k++) ops.push(['=', endA + k, endB + k]);
  return ops;
}

export function myers(A, B) {
  const N = A.length;
  const M = B.length;
  if (!N) return B.map((_, j) => ['+', -1, j]);
  if (!M) return A.map((_, i) => ['-', i, -1]);
  const MAX = N + M;
  const off = MAX + 1;
  const V = new Int32Array(2 * MAX + 3);
  const trace = [];
  for (let d = 0; d <= MAX; d++) {
    if (d > 2500) return A.map((_, i) => ['-', i, -1]).concat(B.map((_, j) => ['+', -1, j]));
    trace.push({ lo: -d - 1, arr: V.slice(off - d - 1, off + d + 2) });
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && V[off + k - 1] < V[off + k + 1]) ? V[off + k + 1] : V[off + k - 1] + 1;
      let y = x - k;
      while (x < N && y < M && A[x] === B[y]) {
        x++;
        y++;
      }
      V[off + k] = x;
      if (x >= N && y >= M) return backtrack(trace, d, N, M);
    }
  }
  return [];
}

export function backtrack(trace, d, N, M) {
  const ops = [];
  let x = N;
  let y = M;
  for (let dd = d; dd > 0; dd--) {
    const snap = trace[dd];
    const get = k => snap.arr[k - snap.lo];
    const k = x - y;
    const prevK = k === -dd || (k !== dd && get(k - 1) < get(k + 1)) ? k + 1 : k - 1;
    const prevX = get(prevK);
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push(['=', x - 1, y - 1]);
      x--;
      y--;
    }
    if (x === prevX) ops.push(['+', -1, y - 1]);
    else ops.push(['-', x - 1, -1]);
    x = prevX;
    y = prevY;
  }
  while (x > 0 && y > 0) {
    ops.push(['=', x - 1, y - 1]);
    x--;
    y--;
  }
  return ops.reverse();
}

export function tokens(text) {
  return text.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) || [];
}

export function keyOf(text, o) {
  let t = o.ignoreCase ? text.toLocaleLowerCase() : text;
  if (o.ignoreSpace) t = t.replace(/\s+/g, ' ').trim();
  return t;
}

export function wordDiff(a, b, o) {
  const ta = tokens(a);
  const tb = tokens(b);
  const ka = ta.map(t => (o.ignoreSpace && /^\s+$/.test(t) ? ' ' : keyOf(t, o)));
  const kb = tb.map(t => (o.ignoreSpace && /^\s+$/.test(t) ? ' ' : keyOf(t, o)));
  return { ops: diffSeq(ka, kb), ta, tb };
}

export function coalesce(parts) {
  const kinds = parts.map(p => p[0]);
  for (let i = 1; i + 1 < parts.length; i++) {
    if (kinds[i] === '=' && /^\s+$/.test(parts[i][1]) && kinds[i - 1] !== '=' && kinds[i - 1] === kinds[i + 1]) kinds[i] = kinds[i - 1];
  }
  const out = [];
  parts.forEach((p, i) => {
    const last = out[out.length - 1];
    if (last && last[0] === kinds[i]) last[1] += p[1];
    else out.push([kinds[i], p[1]]);
  });
  return out;
}

export function lineParts(a, b, o) {
  const { ops, ta, tb } = wordDiff(a, b, o);
  const same = ops.filter(op => op[0] === '=' && /\S/.test(ta[op[1]])).length;
  const words = Math.max(1, ta.filter(t => /\S/.test(t)).length, tb.filter(t => /\S/.test(t)).length);
  if (same / words < 0.3) return null;
  const left = [];
  const right = [];
  for (const [type, i, j] of ops) {
    if (type === '=') {
      left.push(['=', ta[i]]);
      right.push(['=', tb[j]]);
    } else if (type === '-') left.push(['-', ta[i]]);
    else right.push(['+', tb[j]]);
  }
  return { left, right };
}

export const CONTEXT = 3;

export function buildRows(ops, a, b, o) {
  const rows = [];
  let i = 0;
  while (i < ops.length) {
    if (ops[i][0] === '=') {
      const run = [];
      while (i < ops.length && ops[i][0] === '=') run.push(ops[i++]);
      rows.push({ type: 'same', run });
    } else {
      const dels = [];
      const adds = [];
      while (i < ops.length && ops[i][0] !== '=') {
        if (ops[i][0] === '-') dels.push(ops[i][1]);
        else adds.push(ops[i][2]);
        i++;
      }
      rows.push({ type: 'change', dels, adds });
    }
  }
  return rows;
}

export function unified(diff) {
  const { ops, a, b } = diff;
  const changes = [];
  ops.forEach((op, k) => {
    if (op[0] !== '=') changes.push(k);
  });
  if (!changes.length) return '';
  const hunks = [];
  let from = changes[0];
  let to = changes[0];
  for (const k of changes.slice(1)) {
    if (k - to <= CONTEXT * 2) to = k;
    else {
      hunks.push([from, to]);
      from = to = k;
    }
  }
  hunks.push([from, to]);
  const out = ['--- Original', '+++ Changed'];
  for (const [s, e] of hunks) {
    const lo = Math.max(0, s - CONTEXT);
    const hi = Math.min(ops.length - 1, e + CONTEXT);
    let aLine = 0;
    let bLine = 0;
    for (let k = 0; k < lo; k++) {
      if (ops[k][0] !== '+') aLine++;
      if (ops[k][0] !== '-') bLine++;
    }
    let aCount = 0;
    let bCount = 0;
    const body = [];
    for (let k = lo; k <= hi; k++) {
      const [type, i, j] = ops[k];
      if (type === '=') {
        body.push(` ${a[i]}`);
        aCount++;
        bCount++;
      } else if (type === '-') {
        body.push(`-${a[i]}`);
        aCount++;
      } else {
        body.push(`+${b[j]}`);
        bCount++;
      }
    }
    out.push(`@@ -${aCount ? aLine + 1 : aLine},${aCount} +${bCount ? bLine + 1 : bLine},${bCount} @@`, ...body);
  }
  return `${out.join('\n')}\n`;
}

export function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}

export function sampleText(o) {
  const rand = seeded(o.seed * 2654435761);
  const order = SENTENCES.map((s, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (o.seed === 1) order.sort((x, y) => x - y);
  let at = 0;
  const next = () => SENTENCES[order[at++ % order.length]];
  if (o.unit === 'sentences') {
    const list = [];
    for (let i = 0; i < o.amount; i++) list.push(next());
    return o.html ? `<p>${list.join(' ')}</p>` : list.join(' ');
  }
  if (o.unit === 'words') {
    const words = [];
    while (words.length < o.amount) words.push(...next().replace(/[.,]/g, '').split(' '));
    let text = words.slice(0, o.amount).join(' ');
    text = `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
    return o.html ? `<p>${text}</p>` : text;
  }
  const paragraphs = [];
  for (let p = 0; p < o.amount; p++) {
    const size = 3 + Math.floor(rand() * 3);
    const list = [];
    for (let i = 0; i < size; i++) list.push(next());
    paragraphs.push(list.join(' '));
  }
  return o.html ? paragraphs.map(p => `<p>${p}</p>`).join('\n') : paragraphs.join('\n\n');
}

export function translit(text, keepCase) {
  let out = '';
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const mapped = MAP[lower];
    if (mapped === undefined) out += ch;
    else out += keepCase && ch !== lower ? mapped.charAt(0).toUpperCase() + mapped.slice(1) : mapped;
  }
  return out;
}

export function slugLine(line, o) {
  let s = line.normalize('NFC');
  if (o.ascii) {
    s = translit(s, !o.lower).normalize('NFKD').replace(/[\u0300-\u036F]/g, '');
    s = translit(s, !o.lower);
  }
  s = s.replace(/&/g, ' and ').replace(/['\u2019`]/g, '');
  if (o.lower) s = s.toLowerCase();
  let words = s.split(o.ascii ? /[^A-Za-z0-9]+/ : /[^\p{L}\p{N}]+/u).filter(Boolean);
  if (o.stop) {
    const kept = words.filter(w => !SLUG_STOP.has(w.toLowerCase()));
    if (kept.length) words = kept;
  }
  let slug = words.join(o.sep);
  if (o.max && slug.length > o.max) {
    let cut = slug.slice(0, o.max);
    if (slug.charAt(o.max) !== o.sep) {
      const at = cut.lastIndexOf(o.sep);
      if (at > 0) cut = cut.slice(0, at);
    }
    slug = cut.split(o.sep).filter(Boolean).join(o.sep);
  }
  return slug;
}
