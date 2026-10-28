export const DELIMS = { comma: ',', semicolon: ';', tab: '\t', pipe: '|' };
export const DELIM_NAMES = { ',': 'commas', ';': 'semicolons', '\t': 'tabs', '|': 'pipes' };
export const SEPARATORS = { hyphen: '-', space: ' ', dot: '.', underscore: '_', none: '' };
export const HASHES = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~'
};
export const SIMILAR = new Set('Il1|O0o');
export const WORDS = [...new Set((
  'able acid acorn actor adapt add admit adult after again agent agree ahead aim air alarm album alert alike alive alley allow alpha amber ample angle ankle answer apple apron arch arena argue arm army aroma arrow art ash aside ask asset atlas atom attic audio aunt autumn avoid awake award away axis ' +
  'baby back bacon badge bag bake baker ball bamboo banana band bank barn barrel base basil basin basket bath beach bead beam bean bear beard beat bed bee beef begin bell belt bench berry best bike bird birth black blade blank blaze blend bless blink block bloom blue blush board boat body boil bold bolt bone bonus book boost boot border boss both bottle bounce bowl box brain brake branch brass brave bread break breeze brick bride brief bright bring brisk broad brook broom brown brush bubble bucket buddy budget build bulb bulk bunch bundle burst bus bush busy butter button buyer buzz ' +
  'cabin cable cactus cage cake calm camel camera camp canal candle candy canoe canvas cape car card care cargo carpet carry cart case cash castle cat catch cause cave cedar cell cello cent cereal chain chair chalk champ chance change chant charm chart chase cheap check cheek cheer cheese chef cherry chess chest chew chick chief child chili chill chin chip choice chord chorus cider cinema circle city civic claim clap class clay clean clear clerk click cliff climb clinic clip clock close cloth cloud club clue coach coast coat cocoa code coffee coin cold color comb comet comic common cook cool copper copy coral cord core corn corner cost cotton couch count couple course court cousin cover cow cozy crab craft crane crate crawl crayon cream credit creek crew crisp crop cross crowd crown crumb crust cube cup curb curl curve cycle ' +
  'daily dairy daisy dance dash data date dawn day deal debate decade deck decor deep deer delay delta denim depth desert design desk detail dial diary dice diet dig dinner dip dish disk diver dock doctor dog doll dolphin dome donkey door dose double dough dove down draft dragon drama draw dream dress drift drill drink drive drop drum dry duck dune dust duty ' +
  'eager eagle early earn earth easel east easy echo edge edit effort egg eight elbow elder elect elm ember empty end energy engine enjoy enter entry equal era essay even event exact exit expert extra eye ' +
  'fabric face fact fade fair fairy faith fall family fancy farm fast favor feast feather feed fence ferry fiber field fig film final find fine finger fire firm first fish fit five fix flag flame flash flat flavor fleet flight flip float flock floor flour flow flower fluid flute fly foam focus fog fold folk food foot force forest fork form fort forum fossil fox frame fresh friend frog front frost fruit fuel fun funny fur ' +
  'gadget gain galaxy game garage garden garlic gate gather gauge gear gecko gem gentle giant gift ginger give glad glass globe glove glow glue goal goat gold golf good goose grab grace grain grand grape graph grass gravel gravy great green grid grill grin grip ground group grove grow guard guess guest guide guitar gulf gum ' +
  'habit hair half hall hammer hand handle happy harbor hard harp harvest hat hatch hawk hay head health heap heart heat hedge height hello helmet help hen herb hero hidden high hike hill hint hobby hockey hold hole holiday hollow home honey hood hook hope horn horse host hotel hour house hover hub hug human humor hurry husky hut ' +
  'ice icon idea igloo image inch index indoor ink inner input insect inside invite iron island item ivory ivy ' +
  'jacket jam jar jazz jeans jelly jewel job jog join joke jolly journey joy judge juice jump jungle junior jury just ' +
  'kale kayak keen keep kettle key kick kind king kiosk kit kite kitten kiwi knee knock knot koala ' +
  'label lace ladder lake lamb lamp land lane laptop large laser latch late laugh lava lawn layer lead leaf lean learn least leave ledge left legal lemon lens level lever lid life lift light lilac lily limb lime limit line linen link lion lip liquid list little live lizard load loaf lobby local lock lodge loft logic long loop lotus loud lounge love loyal lucky lunar lunch ' +
  'machine magic magnet mail main major maker mango manor map maple marble march margin market mask mat match math matter maze meadow meal medal media melon member memo menu merit mesh metal meter middle mild mile milk mill mind mineral mint minute mirror mist mix mobile model modern moment money monkey month moon moose more morning moss motor mount mouse mouth move movie much mud muffin mug mule museum music mustard ' +
  'nail name napkin narrow nation native nature near neat neck needle nest net never new news next nice night noble noise noodle normal north nose note notice novel number nurse nut ' +
  'oak oasis object ocean odd offer office often oil okay old olive omelet onion open opera option orange orbit orchard order organ origin other otter outer oval oven owl owner oxygen oyster ' +
  'pace pack paddle page pail paint pair palace palm pan panda panel paper parade parcel park parrot part party pass past pasta paste patch path patio pause paw peace peach peak peanut pear pearl pebble pedal pencil penny people pepper perch person pet phone photo piano pick picnic pie piece pier pig pigeon pile pillow pilot pine pink pipe pitch pizza place plain plan planet plant plate play plaza plenty plot plum plus pocket poem poet point polar pole polish pond pony pool poppy porch port post pot potato pouch powder power press price pride prime print prize proof proud pulse pump pumpkin pupil puppy purple purse push puzzle ' +
  'quail quart queen query quest quick quiet quilt quite quiz quote ' +
  'rabbit race rack radar radio raft rail rain rainbow raise rake ramp ranch range rapid rare raven raw reach read ready real recipe record red reef relax relay remote rent repair reply rescue rest return rhythm rib ribbon rice rich ride ridge right ring rinse ripple rise river road roast robin robot rock rocket roll roof room root rope rose rotate rough round route royal rubber ruby rug rule ruler run rural rush ' +
  'saddle safe sail salad salmon salt same sample sand sauce save scale scarf scene school science scoop score scout screen scroll sea seal season seat second secret seed select self sell send sense series serve set seven shade shadow shake shape share shark sharp shed sheep shelf shell shield shift shine ship shirt shoe shop shore short shovel show shower shrimp shrub side sign signal silk silver simple sing sink siren sister sit six size skate sketch ski skill skin skirt sky slate sled sleep sleeve slice slide slim slope slow small smart smile smooth snack snail snake snow soap soccer sock sofa soft soil solar solid song soon sort sound soup south space spare spark speak speed spell spend spice spider spin spirit split spoon sport spot spray spring sprout square squid stable stack staff stage stair stamp stand star start state station stay steady steam steel stem step stew stick still stone stool stop store storm story stove straw stream street strong studio study style sugar suit summer sun sunny super supply surf swan sweet swift swim swing switch syrup ' +
  'table tablet taco tail take tale talent talk tall tank tape target task taste taxi tea teach team tell tempo ten tennis tent term test text thank theme thick thin thing three thumb ticket tide tidy tiger tile timber time tiny tip title toast today toe token tomato tone tool tooth top topic torch total touch tour towel tower town toy track trade trail train tray treat tree trend trial tribe trick trip trophy truck true trunk trust truth tulip tuna tune tunnel turkey turn turtle twin twist type ' +
  'umbrella uncle under union unit unite upper urban usage use useful usual ' +
  'valley value van vapor vase vault vector velvet vendor venue verb verse very vest video view villa vine violin visit visual vital vivid voice volume vote voyage ' +
  'wafer wagon waist wait wake walk wall walnut wander warm wash watch water wave wax way wealth weave web wedge week weight well west whale wheat wheel whisk white whole wide width wild willow win wind window wing winter wire wise wish wolf wonder wood wool word work world worm wrap wren wrist write ' +
  'yacht yard yarn year yellow yes yoga yogurt young youth zebra zero zest zigzag zinc zipper zone zoo'
).split(' '))];

export const subtle = typeof crypto === 'object' && crypto.subtle ? crypto.subtle : null;

export class Raw {
  constructor(text) {
    this.text = text;
  }
}

export class ParseError extends Error {
  constructor(message, pos) {
    super(message);
    this.pos = pos;
  }
}

export const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many || `${one}s`}`;

export const short = (s, max = 40) => (s.length > max ? `${s.slice(0, max - 3)}...` : s);

export function sizeLabel(n) {
  if (n < 1024) return plural(n, 'byte');
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;
  return `${(n / 1073741824).toFixed(2)} GB`;
}

export function lineCount(text) {
  let n = 1;
  for (let k = text.indexOf('\n'); k !== -1; k = text.indexOf('\n', k + 1)) n++;
  return n;
}

export function lineCol(src, pos) {
  let line = 1;
  let start = 0;
  for (let k = src.indexOf('\n'); k !== -1 && k < pos; k = src.indexOf('\n', k + 1)) {
    line++;
    start = k + 1;
  }
  return { line, col: pos - start + 1, start };
}

export function caretAt(src, line, col) {
  const all = src.split('\n');
  let text = (all[line - 1] || '').replace(/\t/g, ' ').replace(/\r$/, '');
  let caret = Math.max(0, col - 1);
  if (text.length > 72) {
    const from = Math.max(0, Math.min(caret - 36, text.length - 72));
    text = `${from > 0 ? '...' : ''}${text.slice(from, from + 72)}`;
    caret = caret - from + (from > 0 ? 3 : 0);
  }
  return `${text}\n${' '.repeat(caret)}^`;
}

export function parseJson(input) {
  const src = input;
  const n = src.length;
  let i = 0;
  let depth = 0;
  let maxDepth = 0;
  let keys = 0;
  const dupes = [];
  const big = [];
  const ESC = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
  const isDigit = c => c >= '0' && c <= '9';

  function fail(message, at) {
    throw new ParseError(message, at === undefined ? i : at);
  }

  function describe(at) {
    if (at >= n) return 'the end of the text';
    const ch = src[at];
    if (ch === '\n' || ch === '\r') return 'a line break';
    return `"${ch}"`;
  }

  function ws() {
    while (i < n) {
      const c = src.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13) i++;
      else break;
    }
  }

  function enter() {
    depth++;
    if (depth > maxDepth) maxDepth = depth;
    if (depth > 2000) fail('The JSON is nested more than 2,000 levels deep, which is too deep to check here.');
  }

  function word() {
    const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 40));
    return m ? m[0] : src[i];
  }

  function value() {
    ws();
    if (i >= n) fail('The JSON ends too early. A value is missing.');
    const c = src[i];
    if (c === '{') return object();
    if (c === '[') return array();
    if (c === '"') return string();
    if (c === '-' || isDigit(c)) return number();
    if (src.startsWith('true', i)) { i += 4; return true; }
    if (src.startsWith('false', i)) { i += 5; return false; }
    if (src.startsWith('null', i)) { i += 4; return null; }
    if (c === "'") fail('Text must be in double quotes, not single quotes.');
    if (c === '/') fail('Comments are not allowed in JSON.');
    if (c === '}' || c === ']' || c === ',') fail(`Unexpected ${describe(i)}. A value is missing here.`);
    if (c === '.' || c === '+') fail('Numbers must start with a digit or a minus sign, such as 0.5 or -1.');
    if (/[A-Za-z_$]/.test(c)) {
      const w = word();
      if (w === 'True' || w === 'False') fail(`Write ${w.toLowerCase()} in lower case. JSON is case sensitive.`);
      if (w === 'None' || w === 'undefined' || w === 'NULL' || w === 'Null') fail(`"${w}" is not JSON. Use null for an empty value.`);
      if (w === 'NaN' || w === 'Infinity') fail(`${w} is not allowed in JSON. Use null or a number instead.`);
      fail(`Unexpected word "${short(w, 20)}". Text values need double quotes.`);
    }
    fail(`Unexpected ${describe(i)}.`);
  }

  function object() {
    const start = i;
    enter();
    i++;
    const out = new Map();
    ws();
    if (src[i] === '}') {
      i++;
      depth--;
      return out;
    }
    let comma = -1;
    for (;;) {
      ws();
      if (src[i] !== '"') {
        if (src[i] === '}' && comma >= 0) fail('Trailing commas are not allowed in JSON. Remove the comma before }.', comma);
        if (src[i] === "'") fail('Keys must be in double quotes, not single quotes.');
        if (i >= n) fail('The JSON ends inside an object. A closing } is missing.', start);
        if (/[A-Za-z_$]/.test(src[i])) fail(`The key ${short(word(), 20)} needs double quotes around it.`);
        fail(`Expected a key in double quotes, found ${describe(i)}.`);
      }
      const keyAt = i;
      const key = string();
      keys++;
      if (out.has(key)) dupes.push([key, keyAt]);
      ws();
      if (src[i] !== ':') {
        if (src[i] === '=') fail('Use a colon, not =, between a key and its value.');
        fail(`Expected a colon after the key "${short(key, 30)}", found ${describe(i)}.`);
      }
      i++;
      out.set(key, value());
      ws();
      if (src[i] === ',') {
        comma = i;
        i++;
        continue;
      }
      if (src[i] === '}') {
        i++;
        depth--;
        return out;
      }
      if (i >= n) fail('The JSON ends inside an object. A closing } is missing.', start);
      if (src[i] === '"') fail('A comma is missing between two entries.');
      if (src[i] === ']') fail('This ] closes an object that was opened with {. Use } instead.');
      fail(`Expected a comma or } after the value, found ${describe(i)}.`);
    }
  }

  function array() {
    const start = i;
    enter();
    i++;
    const out = [];
    ws();
    if (src[i] === ']') {
      i++;
      depth--;
      return out;
    }
    let comma = -1;
    for (;;) {
      ws();
      if (src[i] === ']' && comma >= 0) fail('Trailing commas are not allowed in JSON. Remove the comma before ].', comma);
      out.push(value());
      ws();
      if (src[i] === ',') {
        comma = i;
        i++;
        continue;
      }
      if (src[i] === ']') {
        i++;
        depth--;
        return out;
      }
      if (i >= n) fail('The JSON ends inside a list. A closing ] is missing.', start);
      if (src[i] === '}') fail('This } closes a list that was opened with [. Use ] instead.');
      fail(`Expected a comma or ] after the value, found ${describe(i)}. A comma may be missing.`);
    }
  }

  function string() {
    const start = i;
    i++;
    let out = '';
    let from = i;
    for (;;) {
      if (i >= n) fail('A text value is not closed. A closing double quote is missing.', start);
      const c = src.charCodeAt(i);
      if (c === 34) {
        out += src.slice(from, i);
        i++;
        return out;
      }
      if (c === 92) {
        out += src.slice(from, i);
        const e = src[i + 1];
        if (e === 'u') {
          const hex = src.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail('A \\u escape needs exactly four hex digits, such as \\u00e9.');
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
        } else if (e !== undefined && Object.prototype.hasOwnProperty.call(ESC, e)) {
          out += ESC[e];
          i += 2;
        } else {
          fail(e === undefined ? 'A text value ends with a backslash.' : `\\${e} is not a valid escape. Write a backslash as \\\\.`);
        }
        from = i;
        continue;
      }
      if (c < 32) fail(c === 10 || c === 13 ? 'A text value runs onto a new line. Write line breaks inside text as \\n.' : 'A text value contains a control character, such as a tab. Write tabs as \\t.');
      i++;
    }
  }

  function number() {
    const start = i;
    if (src[i] === '-') i++;
    if (src[i] === '0') {
      i++;
      if (isDigit(src[i] || '')) fail('Numbers cannot have leading zeros, such as 007. Put them in quotes to keep them as text.', start);
    } else if (isDigit(src[i] || '')) {
      while (isDigit(src[i] || '')) i++;
    } else {
      fail('A minus sign must be followed by a digit.');
    }
    if (src[i] === '.') {
      i++;
      if (!isDigit(src[i] || '')) fail('A decimal point must be followed by a digit, such as 1.0.');
      while (isDigit(src[i] || '')) i++;
    }
    if (src[i] === 'e' || src[i] === 'E') {
      i++;
      if (src[i] === '+' || src[i] === '-') i++;
      if (!isDigit(src[i] || '')) fail('An exponent needs at least one digit, such as 1e5.');
      while (isDigit(src[i] || '')) i++;
    }
    const text = src.slice(start, i);
    const v = Number(text);
    const digits = text.replace(/^-/, '').replace(/[eE].*$/, '').replace('.', '').replace(/^0+/, '').length;
    if (!Number.isFinite(v) || (/^-?\d+$/.test(text) && !Number.isSafeInteger(v)) || digits > 17) big.push(text);
    return new Raw(text);
  }

  const result = value();
  ws();
  if (i < n) {
    if (src[i] === ',') fail('Unexpected comma after the end of the JSON. Only one top-level value is allowed; wrap several values in [ ].');
    fail(`Unexpected ${describe(i)} after the end of the JSON. Only one top-level value is allowed.`);
  }
  return { value: result, depth: maxDepth, keys, dupes, big };
}

export function stringify(value, indent, sort) {
  const out = [];
  const nl = indent ? '\n' : '';
  const colon = indent ? ': ' : ':';
  function write(v, pad) {
    if (v === null || v === undefined) out.push('null');
    else if (v instanceof Raw) out.push(v.text);
    else if (typeof v === 'number') out.push(Number.isFinite(v) ? String(v) : 'null');
    else if (typeof v === 'boolean') out.push(v ? 'true' : 'false');
    else if (typeof v === 'string') out.push(JSON.stringify(v));
    else if (Array.isArray(v)) {
      if (!v.length) {
        out.push('[]');
        return;
      }
      const inner = pad + indent;
      out.push('[', nl);
      for (let k = 0; k < v.length; k++) {
        out.push(inner);
        write(v[k], inner);
        out.push(k < v.length - 1 ? ',' : '', nl);
      }
      out.push(pad, ']');
    } else {
      let keys = [...v.keys()];
      if (!keys.length) {
        out.push('{}');
        return;
      }
      if (sort) keys = keys.sort();
      const inner = pad + indent;
      out.push('{', nl);
      keys.forEach((key, k) => {
        out.push(inner, JSON.stringify(key), colon);
        write(v.get(key), inner);
        out.push(k < keys.length - 1 ? ',' : '', nl);
      });
      out.push(pad, '}');
    }
  }
  write(value, '');
  return out.join('');
}

export function kindOf(v) {
  if (v === null) return 'null';
  if (v instanceof Raw || typeof v === 'number') return 'a number';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return 'a text value';
  if (Array.isArray(v)) return `a list of ${plural(v.length, 'item')}`;
  return `an object with ${plural(v.size, 'key')}`;
}

export const stripBom = s => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

export function sortDeep(v) {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v instanceof Map) return new Map([...v.keys()].sort().map(k => [k, sortDeep(v.get(k))]));
  return v;
}

export function cellText(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Raw) return v.text;
  return String(v);
}

export function flatten(v, prefix, out, arrays) {
  if (v instanceof Map) {
    if (!v.size) {
      if (!prefix) out.set('value', '{}');
      return;
    }
    for (const [k, x] of v) flatten(x, prefix ? `${prefix}.${k}` : k, out, arrays);
    return;
  }
  if (Array.isArray(v)) {
    if (arrays === 'json' || (!v.length && !prefix)) {
      out.set(prefix || 'value', stringify(v, ''));
      return;
    }
    v.forEach((x, k) => flatten(x, prefix ? `${prefix}.${k}` : String(k), out, arrays));
    return;
  }
  out.set(prefix || 'value', cellText(v));
}

export function tableFromJson(value, arrays) {
  let list = value;
  let note = '';
  if (value instanceof Map) {
    const lists = [...value].filter(([, x]) => Array.isArray(x));
    if (value.size === 1 && lists.length === 1) {
      list = lists[0][1];
      note = `Used the list under "${short(lists[0][0], 30)}".`;
    } else {
      list = [value];
    }
  } else if (!Array.isArray(value)) {
    list = [value];
  }
  const columns = new Map();
  const flat = list.map(row => {
    const out = new Map();
    flatten(row, '', out, arrays);
    for (const k of out.keys()) if (!columns.has(k)) columns.set(k, columns.size);
    return out;
  });
  const header = [...columns.keys()];
  const data = flat.map(row => header.map(h => (row.has(h) ? row.get(h) : '')));
  return { header, data, note };
}

export const PLAIN_NUMBER = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;

export function csvCell(s, delim, guard) {
  let v = s;
  if (guard && (/^[=@\t\r]/.test(v) || (/^[+-]/.test(v) && !PLAIN_NUMBER.test(v)))) v = `'${v}`;
  if (v.includes(delim) || /["\r\n]/.test(v) || /^\s|\s$/.test(v)) v = `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function detectDelimiter(text) {
  const cands = [',', ';', '\t', '|'];
  const counts = { ',': [], ';': [], '\t': [], '|': [] };
  let line = { ',': 0, ';': 0, '\t': 0, '|': 0 };
  let has = false;
  let quoted = false;
  let lines = 0;
  for (let k = 0; k < text.length && lines < 40; k++) {
    const c = text[k];
    if (c === '"') {
      quoted = !quoted;
      has = true;
      continue;
    }
    if (quoted) continue;
    if (c === '\n' || c === '\r') {
      if (has) {
        for (const d of cands) counts[d].push(line[d]);
        lines++;
      }
      line = { ',': 0, ';': 0, '\t': 0, '|': 0 };
      has = false;
      continue;
    }
    has = true;
    if (Object.prototype.hasOwnProperty.call(line, c)) line[c]++;
  }
  if (has && lines < 40) for (const d of cands) counts[d].push(line[d]);
  let best = ',';
  let bestScore = -1;
  for (const d of cands) {
    const list = counts[d];
    if (!list.length || !list[0]) continue;
    const same = list.filter(x => x === list[0]).length / list.length;
    const score = same * 1000 + Math.min(list[0], 999);
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

export function parseCsv(text, delim) {
  const out = [];
  let row = [];
  let field = '';
  let quoted = false;
  let wasQuoted = false;
  let quoteAt = 0;
  const n = text.length;
  let i = 0;
  while (i < n) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"' && field === '' && !wasQuoted) {
      quoted = true;
      wasQuoted = true;
      quoteAt = i;
      i++;
      continue;
    }
    if (c === delim) {
      row.push(field);
      field = '';
      wasQuoted = false;
      i++;
      continue;
    }
    if (c === '\n' || c === '\r') {
      row.push(field);
      out.push(row);
      row = [];
      field = '';
      wasQuoted = false;
      if (c === '\r' && text[i + 1] === '\n') i++;
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (quoted) throw new ParseError('A quoted cell is never closed. A closing double quote is missing.', quoteAt);
  if (field !== '' || row.length || wasQuoted) {
    row.push(field);
    out.push(row);
  }
  return out.filter(r => !(r.length === 1 && r[0] === ''));
}

export const JSON_NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

export function typed(s) {
  if (s === '' || s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (JSON_NUMBER.test(s)) {
    const v = Number(s);
    if (!Number.isFinite(v)) return s;
    if (/^-?\d+$/.test(s) && !Number.isSafeInteger(v)) return s;
    return new Raw(s);
  }
  return s;
}

export function arrayify(v) {
  if (!(v instanceof Map)) return v;
  const out = new Map();
  for (const [k, x] of v) out.set(k, arrayify(x));
  const keys = [...out.keys()];
  if (keys.length && keys.every((k, idx) => k === String(idx))) return [...out.values()];
  return out;
}

export function nest(entries) {
  const root = new Map();
  for (const [key, value] of entries) {
    const parts = key.split('.');
    if (parts.length < 2 || parts.some(p => p === '')) {
      if (!root.has(key)) root.set(key, value);
      continue;
    }
    let node = root;
    let ok = true;
    for (let k = 0; k < parts.length - 1; k++) {
      let next = node.get(parts[k]);
      if (next === undefined) {
        next = new Map();
        node.set(parts[k], next);
      } else if (!(next instanceof Map)) {
        ok = false;
        break;
      }
      node = next;
    }
    const last = parts[parts.length - 1];
    if (ok && !node.has(last)) node.set(last, value);
    else root.set(key, value);
  }
  return arrayify(root);
}

export function uniqueHeaders(row, width) {
  const seen = new Map();
  const out = [];
  for (let k = 0; k < width; k++) {
    let name = (row[k] === undefined ? '' : row[k]).trim() || `column_${k + 1}`;
    if (seen.has(name)) {
      let m = seen.get(name) + 1;
      while (seen.has(`${name}_${m}`)) m++;
      seen.set(name, m);
      name = `${name}_${m}`;
    }
    seen.set(name, 1);
    out.push(name);
  }
  return out;
}

export const YAML_RISKY_START = /^[-?:,[\]{}#&*!|>'"%@`]/;

export function yamlNeedsQuotes(s) {
  if (s === '') return true;
  if (YAML_RISKY_START.test(s) || /^\s|\s$/.test(s)) return true;
  if (/: |:$| #|\t|[\u0000-\u001f\u007f-\u009f\u2028\u2029\ufeff]/.test(s)) return true;
  if (/^(?:~|null|true|false|yes|no|on|off|y|n)$/i.test(s)) return true;
  if (/^[-+]?(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][-+]?\d+)?$/.test(s)) return true;
  if (/^[-+]?(?:0x[\da-fA-F_]+|0o[0-7_]+|0b[01_]+)$/.test(s)) return true;
  if (/^[-+]?\.(?:inf|nan)$/i.test(s)) return true;
  if (/^\d{4}-\d\d?-\d\d?(?:[Tt\s]|$)/.test(s)) return true;
  if (/^[-+]?\d+(?::[0-5]?\d)+(?:\.\d*)?$/.test(s)) return true;
  if (s === '<<' || s === '=') return true;
  return false;
}

export function yamlQuote(s) {
  return JSON.stringify(s).replace(/[\u007f-\u009f\u2028\u2029\ufeff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

export function yamlLiteral(s) {
  if (!s.includes('\n') || s.length > 100000) return null;
  if (/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029\ufeff]/.test(s)) return null;
  const lines = s.split('\n');
  const firstText = lines.findIndex(l => l.trim() !== '');
  if (firstText === -1) return null;
  if (/^[ \t]/.test(lines[firstText])) return null;
  if (lines.slice(0, firstText).some(l => l !== '')) return null;
  let chomp = '';
  let body = s;
  if (!s.endsWith('\n')) chomp = '-';
  else if (s.endsWith('\n\n')) {
    chomp = '+';
    body = s.slice(0, -1);
  } else body = s.slice(0, -1);
  return { header: `|${chomp}`, lines: body.split('\n') };
}

export function yamlScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (v instanceof Raw) return v.text;
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '.nan';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return yamlNeedsQuotes(v) ? yamlQuote(v) : v;
}

export const yamlKey = k => (yamlNeedsQuotes(k) || k.includes('\n') ? yamlQuote(k) : k);

export function toYaml(value) {
  const out = [];
  const isFull = v => (Array.isArray(v) && v.length > 0) || (v instanceof Map && v.size > 0);
  const inline = v => (Array.isArray(v) ? '[]' : v instanceof Map ? '{}' : yamlScalar(v));
  function scalarLines(prefix, v, pad) {
    const lit = typeof v === 'string' ? yamlLiteral(v) : null;
    if (!lit) {
      out.push(`${prefix}${inline(v)}`);
      return;
    }
    out.push(`${prefix}${lit.header}`);
    for (const line of lit.lines) out.push(line === '' ? '' : `${pad}${line}`);
  }
  function block(v, pad) {
    if (Array.isArray(v)) {
      for (const item of v) {
        if (isFull(item)) {
          const start = out.length;
          block(item, `${pad}  `);
          out[start] = `${pad}- ${out[start].slice(pad.length + 2)}`;
        } else scalarLines(`${pad}- `, item, `${pad}  `);
      }
      return;
    }
    for (const [k, x] of v) {
      const key = yamlKey(k);
      if (isFull(x)) {
        out.push(`${pad}${key}:`);
        block(x, `${pad}  `);
      } else scalarLines(`${pad}${key}: `, x, `${pad}  `);
    }
  }
  if (isFull(value)) block(value, '');
  else scalarLines('', value, '  ');
  return `${out.join('\n')}\n`;
}

export class YamlError extends Error {
  constructor(message, line, col) {
    super(message);
    this.line = line;
    this.col = col;
  }
}

export function parseYaml(input) {
  let src = stripBom(input).replace(/\r\n?/g, '\n');
  const raw = src.split('\n');
  if (src.endsWith('\n')) raw.pop();
  src = raw.join('\n');
  const starts = [];
  let acc = 0;
  for (const line of raw) {
    starts.push(acc);
    acc += line.length + 1;
  }
  const warnings = new Set();
  let anchors = new Map();
  let L = [];
  let p = 0;
  let limit = 0;

  const fail = (message, num, col) => {
    throw new YamlError(message, num + 1, (col || 0) + 1);
  };
  const content = line => line.raw.slice(line.col);
  const blankText = t => t.trim() === '' || /^\s*#/.test(t);
  const isBlank = line => blankText(content(line));
  const isDash = c => c === '-' || c.startsWith('- ') || c.startsWith('-\t');

  function where(offset) {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { num: lo, col: offset - starts[lo] };
  }

  function failAt(message, offset) {
    const w = where(offset);
    fail(message, w.num, w.col);
  }

  function skip() {
    while (p < L.length && isBlank(L[p])) p++;
  }

  function resolve(s) {
    if (s === '' || s === '~' || s === 'null' || s === 'Null' || s === 'NULL') return null;
    if (s === 'true' || s === 'True' || s === 'TRUE') return true;
    if (s === 'false' || s === 'False' || s === 'FALSE') return false;
    if (/^[-+]?[0-9]+$/.test(s)) {
      const neg = s[0] === '-';
      const digits = s.replace(/^[-+]/, '').replace(/^0+(?=\d)/, '');
      return new Raw(`${neg ? '-' : ''}${digits}`);
    }
    if (/^0o[0-7]+$/.test(s)) return new Raw(BigInt(`0o${s.slice(2)}`).toString());
    if (/^0x[0-9a-fA-F]+$/.test(s)) return new Raw(BigInt(s).toString());
    if (/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?$/.test(s)) {
      const v = Number(s);
      if (!Number.isFinite(v)) {
        warnings.add(`The number ${short(s, 24)} is too large for JSON and became null.`);
        return null;
      }
      const t = s.replace(/^\+/, '');
      return new Raw(JSON_NUMBER.test(t) ? t : String(v));
    }
    if (/^[-+]?\.(?:inf|Inf|INF)$/.test(s) || /^\.(?:nan|NaN|NAN)$/.test(s)) {
      warnings.add(`JSON has no way to write ${s}, so it became null.`);
      return null;
    }
    if (/^(?:yes|no|on|off|y|n)$/i.test(s)) warnings.add(`"${s}" is read as text, as YAML 1.2 does. Older YAML 1.1 tools read yes, no, on and off as true and false, so quote such values to be clear.`);
    return s;
  }

  function applyTag(v, tag, plainText) {
    if (!tag) return v;
    if (tag === '!!str') return plainText !== undefined ? plainText : v === null ? '' : typeof v === 'string' ? v : v instanceof Raw ? v.text : String(v);
    if (tag === '!!int' || tag === '!!float') {
      const t = plainText !== undefined ? plainText : v;
      if (typeof t === 'string') {
        const r = resolve(t.trim());
        if (r instanceof Raw) return r;
      }
      return v;
    }
    if (tag === '!!bool') {
      const t = String(plainText !== undefined ? plainText : v).toLowerCase();
      if (t === 'true') return true;
      if (t === 'false') return false;
      return v;
    }
    if (tag === '!!null') return null;
    if (!/^!!(map|seq|binary|timestamp|omap|set|pairs)$/.test(tag)) warnings.add(`Tags such as ${short(tag, 20)} have no meaning in JSON, so they were dropped and the values kept.`);
    return v;
  }

  function readProps(line) {
    let c = content(line);
    let col = line.col;
    let anchor = '';
    let tag = '';
    for (let k = 0; k < 2; k++) {
      let m = /^&([^\s,[\]{}]+)[ \t]*/.exec(c);
      if (m && !anchor) {
        anchor = m[1];
      } else {
        m = /^(!(?:<[^>]*>|[^\s,[\]{}]*))[ \t]*/.exec(c);
        if (m && !tag) tag = m[1];
        else break;
      }
      col += m[0].length;
      c = c.slice(m[0].length);
    }
    return { anchor, tag, col, has: Boolean(anchor || tag), rest: c };
  }

  function remember(props, v) {
    if (props && props.anchor) anchors.set(props.anchor, v);
    return v;
  }

  function keyAt(line) {
    const c = content(line);
    if (!c || isDash(c)) return null;
    let key;
    let end;
    let quoted = false;
    if (c[0] === '"' || c[0] === "'") {
      const q = c[0];
      let k = 1;
      let text = '';
      for (;;) {
        if (k >= c.length) return null;
        if (q === "'" && c[k] === "'") {
          if (c[k + 1] === "'") {
            text += "'";
            k += 2;
            continue;
          }
          break;
        }
        if (q === '"' && c[k] === '\\') {
          k += 2;
          continue;
        }
        if (q === '"' && c[k] === '"') break;
        text += c[k];
        k++;
      }
      end = k + 1;
      const after = c.slice(end).match(/^[ \t]*/)[0].length;
      if (c[end + after] !== ':' || !(end + after + 1 === c.length || /[ \t]/.test(c[end + after + 1]))) return null;
      key = q === '"' ? decodeDouble(c.slice(0, end), line) : text;
      end += after;
      quoted = true;
    } else {
      if (/^[[{&*!|>%@`#?]/.test(c)) return null;
      let found = -1;
      for (let k = 0; k < c.length; k++) {
        if (c[k] === ':' && (k + 1 === c.length || c[k + 1] === ' ' || c[k + 1] === '\t')) {
          found = k;
          break;
        }
        if (c[k] === '#' && k > 0 && /[ \t]/.test(c[k - 1])) return null;
      }
      if (found <= 0) return null;
      key = c.slice(0, found).replace(/[ \t]+$/, '');
      end = found;
    }
    const rest = c.slice(end + 1);
    const spaces = rest.match(/^[ \t]*/)[0].length;
    return { key, quoted, valueCol: line.col + end + 1 + spaces };
  }

  function decodeDouble(text, line) {
    const r = readDouble(starts[line.num] + line.col, starts[line.num] + line.col + text.length);
    return r.value;
  }

  function readDouble(offset, hardEnd) {
    const stop = hardEnd === undefined ? limit : hardEnd;
    let i = offset + 1;
    let out = '';
    let keep = 0;
    const ESC = { '0': '\0', a: '\x07', b: '\b', t: '\t', '\t': '\t', n: '\n', v: '\v', f: '\f', r: '\r', e: '\x1b', ' ': ' ', '"': '"', '/': '/', '\\': '\\', N: '\u0085', _: '\u00a0', L: '\u2028', P: '\u2029' };
    for (;;) {
      if (i >= stop) failAt('A double-quoted value is never closed. A closing " is missing.', offset);
      const c = src[i];
      if (c === '"') return { value: out, end: i + 1 };
      if (c === '\\') {
        const e = src[i + 1];
        if (e === '\n') {
          i += 2;
          while (src[i] === ' ' || src[i] === '\t') i++;
          keep = out.length;
          continue;
        }
        const len = e === 'x' ? 2 : e === 'u' ? 4 : e === 'U' ? 8 : 0;
        if (len) {
          const hex = src.slice(i + 2, i + 2 + len);
          if (!new RegExp(`^[0-9a-fA-F]{${len}}$`).test(hex)) failAt(`\\${e} needs ${len} hex digits.`, i);
          const code = parseInt(hex, 16);
          if (code > 0x10ffff) failAt('That escape is beyond the last Unicode character.', i);
          out += String.fromCodePoint(code);
          i += 2 + len;
        } else if (e !== undefined && Object.prototype.hasOwnProperty.call(ESC, e)) {
          out += ESC[e];
          i += 2;
        } else {
          failAt(`\\${e === undefined ? '' : e} is not a valid escape in a double-quoted value.`, i);
        }
        keep = out.length;
        continue;
      }
      if (c === '\n') {
        let t = out.length;
        while (t > keep && (out[t - 1] === ' ' || out[t - 1] === '\t')) t--;
        out = out.slice(0, t);
        let breaks = 0;
        i++;
        for (;;) {
          while (src[i] === ' ' || src[i] === '\t') i++;
          if (src[i] === '\n' && i < stop) {
            breaks++;
            i++;
            continue;
          }
          break;
        }
        out += breaks ? '\n'.repeat(breaks) : ' ';
        keep = out.length;
        continue;
      }
      out += c;
      i++;
    }
  }

  function readSingle(offset) {
    let i = offset + 1;
    let out = '';
    for (;;) {
      if (i >= limit) failAt("A single-quoted value is never closed. A closing ' is missing.", offset);
      const c = src[i];
      if (c === "'") {
        if (src[i + 1] === "'") {
          out += "'";
          i += 2;
          continue;
        }
        return { value: out, end: i + 1 };
      }
      if (c === '\n') {
        out = out.replace(/[ \t]+$/, '');
        let breaks = 0;
        i++;
        for (;;) {
          while (src[i] === ' ' || src[i] === '\t') i++;
          if (src[i] === '\n' && i < limit) {
            breaks++;
            i++;
            continue;
          }
          break;
        }
        out += breaks ? '\n'.repeat(breaks) : ' ';
        continue;
      }
      out += c;
      i++;
    }
  }

  function readFlow(offset) {
    let i = offset;
    const flowStart = offset;
    function ws() {
      for (;;) {
        const c = src[i];
        if (i < limit && (c === ' ' || c === '\t' || c === '\n')) i++;
        else if (i < limit && c === '#' && (i === 0 || /\s/.test(src[i - 1]))) {
          while (i < limit && src[i] !== '\n') i++;
        } else break;
      }
    }
    function plain(asKey) {
      const start = i;
      while (i < limit) {
        const c = src[i];
        if (c === ',' || c === ']' || c === '}' || c === '[' || c === '{') break;
        if (c === ':' && (i + 1 >= limit || /[\s,[\]{}]/.test(src[i + 1]))) break;
        if (c === '#' && /\s/.test(src[i - 1])) break;
        i++;
      }
      const text = src.slice(start, i).replace(/[ \t]*\n[ \t]*/g, ' ').trim();
      if (i === start) failAt(`Unexpected "${src[i] === undefined ? 'end of text' : src[i]}" inside a [ ] or { } collection.`, i);
      return asKey ? text : resolve(text);
    }
    function node(asKey) {
      ws();
      let anchor = '';
      let tag = '';
      for (let k = 0; k < 2; k++) {
        const rest = src.slice(i, i + 200);
        let m = /^&([^\s,[\]{}]+)/.exec(rest);
        if (m) {
          anchor = m[1];
          i += m[0].length;
          ws();
          continue;
        }
        m = /^!(?:<[^>]*>|[^\s,[\]{}]*)/.exec(rest);
        if (m) {
          tag = m[0];
          i += m[0].length;
          ws();
          continue;
        }
        break;
      }
      const c = src[i];
      let v;
      let text;
      if (c === '[') v = seq();
      else if (c === '{') v = map();
      else if (c === '"') {
        const r = readDouble(i);
        v = r.value;
        i = r.end;
      } else if (c === "'") {
        const r = readSingle(i);
        v = r.value;
        i = r.end;
      } else if (c === '*') {
        const m = /^\*([^\s,[\]{}]+)/.exec(src.slice(i, i + 200));
        if (!m || !anchors.has(m[1])) failAt(`The alias *${m ? m[1] : ''} has no matching anchor above it.`, i);
        i += m[0].length;
        v = anchors.get(m[1]);
      } else {
        text = plain(true);
        v = asKey ? text : tag ? applyTag(resolve(text), tag, text) : resolve(text);
      }
      if (tag && text === undefined) v = applyTag(v, tag);
      if (asKey && typeof v !== 'string') v = keyText(v);
      if (anchor) anchors.set(anchor, v);
      return v;
    }
    function seq() {
      i++;
      const out = [];
      for (;;) {
        ws();
        if (i >= limit) failAt('A [ list is never closed. A closing ] is missing.', flowStart);
        if (src[i] === ']') {
          i++;
          return out;
        }
        if (src[i] === ',') failAt('There is an empty entry in this list.', i);
        let v = node(false);
        ws();
        if (src[i] === ':') {
          i++;
          ws();
          const k = typeof v === 'string' ? v : keyText(v);
          const val = src[i] === ',' || src[i] === ']' ? null : node(false);
          v = new Map([[k, val]]);
        }
        out.push(v);
        ws();
        if (src[i] === ',') {
          i++;
          continue;
        }
        if (src[i] === ']') {
          i++;
          return out;
        }
        failAt(i >= limit ? 'A [ list is never closed. A closing ] is missing.' : 'Expected a comma or ] in this list.', i >= limit ? flowStart : i);
      }
    }
    function map() {
      i++;
      const out = new Map();
      for (;;) {
        ws();
        if (i >= limit) failAt('A { mapping is never closed. A closing } is missing.', flowStart);
        if (src[i] === '}') {
          i++;
          return out;
        }
        if (src[i] === ',') failAt('There is an empty entry in this mapping.', i);
        const key = node(true);
        ws();
        let v = null;
        if (src[i] === ':') {
          i++;
          ws();
          if (src[i] !== ',' && src[i] !== '}') v = node(false);
        }
        if (out.has(key)) warnings.add(`The key "${short(key, 30)}" appears more than once in a mapping. The last value is used.`);
        out.set(key, v);
        ws();
        if (src[i] === ',') {
          i++;
          continue;
        }
        if (src[i] === '}') {
          i++;
          return out;
        }
        failAt(i >= limit ? 'A { mapping is never closed. A closing } is missing.' : 'Expected a comma or } in this mapping.', i >= limit ? flowStart : i);
      }
    }
    const value = src[i] === '[' ? seq() : map();
    return { value, end: i };
  }

  function keyText(v) {
    if (v === null) return 'null';
    if (v instanceof Raw) return v.text;
    if (typeof v === 'string') return v;
    if (typeof v === 'boolean') return String(v);
    return stringify(v, '');
  }

  function finishLine(end, what) {
    const w = where(end);
    const rest = raw[w.num].slice(w.col);
    if (!blankText(rest)) fail(`Unexpected text after ${what}.`, w.num, w.col + rest.match(/^[ \t]*/)[0].length);
    p = w.num - L[0].num + 1;
  }

  function blockScalar(line, parentInd) {
    const c = content(line);
    const m = /^([|>])([1-9])?([+-])?([1-9])?(?:[ \t]+#.*|[ \t]*)$/.exec(c);
    if (!m) fail('This block header is not valid. Use | or > with an optional + or - and an optional indent digit.', line.num, line.col);
    const folded = m[1] === '>';
    const digit = m[2] || m[4];
    const chomp = m[3] || '';
    p++;
    let indent = digit ? Math.max(parentInd, 0) + Number(digit) : -1;
    if (indent < 0) {
      for (let q = p; q < L.length; q++) {
        if (L[q].raw.trim() === '') continue;
        indent = L[q].raw.match(/^ */)[0].length;
        break;
      }
    }
    const body = [];
    if (indent > parentInd) {
      while (p < L.length) {
        const r = L[p].raw;
        if (r.trim() === '') {
          body.push('');
          p++;
          continue;
        }
        if (r.match(/^ */)[0].length < indent) break;
        body.push(r.slice(indent));
        p++;
      }
    }
    let end = body.length;
    while (end > 0 && body[end - 1] === '') end--;
    const lines = body.slice(0, end);
    const trailing = body.length - end;
    let text;
    if (!folded) text = lines.join('\n');
    else {
      text = '';
      let prevNormal = false;
      let pending = 0;
      let started = false;
      for (const l of lines) {
        if (l === '') {
          pending++;
          continue;
        }
        const normal = !/^[ \t]/.test(l);
        if (!started) {
          text += '\n'.repeat(pending) + l;
          started = true;
        } else if (normal && prevNormal) text += (pending ? '\n'.repeat(pending) : ' ') + l;
        else text += '\n'.repeat(pending + 1) + l;
        pending = 0;
        prevNormal = normal;
      }
      if (!started) text = '\n'.repeat(Math.max(0, pending - 1));
    }
    if (chomp === '-') return text;
    if (chomp === '+') return lines.length ? `${text}\n${'\n'.repeat(trailing)}` : '\n'.repeat(trailing);
    return lines.length ? `${text}\n` : '';
  }

  function inline(line, parentInd, props) {
    const c = content(line);
    const ch = c[0];
    const tag = props ? props.tag : '';
    if (ch === '|' || ch === '>') return applyTag(blockScalar(line, parentInd), tag);
    if (ch === '*') {
      const m = /^\*([^\s,[\]{}]+)/.exec(c);
      if (!m || !anchors.has(m[1])) fail(`The alias *${m ? m[1] : ''} has no matching anchor above it.`, line.num, line.col);
      const rest = c.slice(m[0].length);
      if (!blankText(rest)) fail('Unexpected text after the alias.', line.num, line.col + m[0].length);
      p++;
      return anchors.get(m[1]);
    }
    if (ch === '"' || ch === "'" || ch === '[' || ch === '{') {
      const offset = starts[line.num] + line.col;
      const r = ch === '"' ? readDouble(offset) : ch === "'" ? readSingle(offset) : readFlow(offset);
      finishLine(r.end, ch === '[' ? 'the closing ]' : ch === '{' ? 'the closing }' : 'the closing quote');
      return applyTag(r.value, tag);
    }
    if (ch === '%' || ch === '@' || ch === '`') fail(`A value cannot start with ${ch} unless it is in quotes.`, line.num, line.col);
    let text = c;
    const hashAt = text.search(/[ \t]#/);
    if (hashAt >= 0) text = text.slice(0, hashAt);
    text = text.replace(/[ \t]+$/, '');
    const colon = text.search(/:(?:[ \t]|$)/);
    if (colon >= 0) fail('A value cannot contain a colon followed by a space unless it is in quotes. If this is meant to be a nested key, put it on its own line, indented.', line.num, line.col + colon);
    p++;
    let q = p;
    let pending = 0;
    while (q < L.length) {
      const nx = L[q];
      const r = nx.raw;
      if (r.trim() === '') {
        pending++;
        q++;
        continue;
      }
      if (nx.ind <= parentInd || /^\s*#/.test(r)) break;
      if (keyAt(nx)) fail('This line is indented more than expected.', nx.num, nx.col);
      let more = content(nx);
      const h = more.search(/[ \t]#/);
      if (h >= 0) more = more.slice(0, h);
      more = more.replace(/[ \t]+$/, '');
      if (/:(?:[ \t]|$)/.test(more)) fail('A value cannot contain a colon followed by a space unless it is in quotes.', nx.num, nx.col);
      text += pending ? '\n'.repeat(pending) : ' ';
      text += more;
      pending = 0;
      q++;
      p = q;
    }
    return tag ? applyTag(resolve(text), tag, text) : resolve(text);
  }

  function nested(ind) {
    skip();
    if (p >= L.length) return null;
    const line = L[p];
    if (line.ind > ind) return orNull(block(ind + 1));
    if (line.ind === ind && isDash(content(line))) return seq(ind);
    return null;
  }

  const orNull = v => (v === undefined ? null : v);

  function block(min) {
    skip();
    if (p >= L.length) return undefined;
    const line = L[p];
    if (line.ind < min) return undefined;
    const c = content(line);
    if (isDash(c)) return seq(line.ind);
    if (c === '?' || c.startsWith('? ')) fail('Complex keys that start with ? are not supported here.', line.num, line.col);
    const props = readProps(line);
    if (props.has && blankText(props.rest)) {
      p++;
      const v = orNull(block(min));
      return remember(props, props.tag ? applyTag(v, props.tag) : v);
    }
    if (keyAt(line)) return map(line.ind);
    if (props.has) {
      line.col = props.col;
      if (keyAt(line)) return remember(props, map(line.ind));
    }
    return remember(props, inline(line, min - 1, props));
  }

  function seq(ind) {
    const out = [];
    for (;;) {
      skip();
      if (p >= L.length) break;
      const line = L[p];
      const c = content(line);
      if (line.ind !== ind || !isDash(c)) {
        if (line.ind > ind) fail('This line is indented more than expected.', line.num, line.col);
        if (line.ind === ind && keyAt(line)) fail('A key cannot follow list items at the same indentation. Check the indentation.', line.num, line.col);
        break;
      }
      const rest = c.slice(1);
      const spaces = rest.match(/^[ \t]*/)[0].length;
      if (blankText(rest)) {
        p++;
        out.push(orNull(block(ind + 1)));
      } else {
        line.col += 1 + spaces;
        line.ind = line.col;
        out.push(orNull(block(ind + 1)));
      }
    }
    return out;
  }

  function map(ind) {
    const out = new Map();
    const merges = [];
    for (;;) {
      skip();
      if (p >= L.length) break;
      const line = L[p];
      if (line.ind !== ind) {
        if (line.ind > ind) fail('This line is indented more than expected.', line.num, line.col);
        break;
      }
      const k = keyAt(line);
      if (!k) {
        const c = content(line);
        if (isDash(c)) fail('A list item cannot appear here. Check the indentation.', line.num, line.col);
        fail('Expected a key followed by a colon and a space.', line.num, line.col);
      }
      line.col = k.valueCol;
      let value;
      const rest = content(line);
      if (blankText(rest)) {
        p++;
        value = nested(ind);
      } else {
        const props = readProps(line);
        if (props.has && blankText(props.rest)) {
          p++;
          value = remember(props, props.tag ? applyTag(nested(ind), props.tag) : nested(ind));
        } else {
          if (props.has) line.col = props.col;
          value = remember(props, inline(line, ind, props));
        }
      }
      if (k.key === '<<' && !k.quoted) {
        merges.push([value, line]);
        continue;
      }
      if (out.has(k.key)) warnings.add(`The key "${short(k.key, 30)}" appears more than once in a mapping. The last value is used.`);
      out.set(k.key, value);
    }
    for (const [value, line] of merges) {
      const sources = Array.isArray(value) ? value : [value];
      for (const source of sources) {
        if (!(source instanceof Map)) fail('A << merge key needs a mapping or a list of mappings, usually an alias such as *defaults.', line.num, line.col);
        for (const [key, v] of source) if (!out.has(key)) out.set(key, v);
      }
    }
    return out;
  }

  const docs = [];
  let current = [];
  let explicit = false;
  const flush = () => {
    if (explicit || current.some(line => !isBlank(line))) docs.push(current);
    current = [];
  };
  for (let k = 0; k < raw.length; k++) {
    const r = raw[k];
    if (/^---(?=\s|$)/.test(r)) {
      flush();
      explicit = true;
      const rest = r.slice(3);
      const lead = rest.match(/^[ \t]*/)[0].length;
      if (!blankText(rest)) current.push({ num: k, raw: r, col: 3 + lead, ind: 3 + lead });
      continue;
    }
    if (/^\.\.\.(?=\s|$)/.test(r)) {
      flush();
      explicit = false;
      continue;
    }
    if (/^%/.test(r) && !current.some(line => !isBlank(line))) continue;
    const lead = r.match(/^ */)[0].length;
    if (r[lead] === '\t' && !blankText(r)) fail('Tabs cannot be used for indentation in YAML. Use spaces.', k, lead);
    current.push({ num: k, raw: r, col: lead, ind: lead });
  }
  flush();

  const values = [];
  for (const lines of docs) {
    anchors = new Map();
    L = lines;
    p = 0;
    if (!L.length) {
      values.push(null);
      continue;
    }
    const last = L[L.length - 1].num;
    limit = starts[last] + raw[last].length;
    const v = block(0);
    skip();
    if (p < L.length) {
      const line = L[p];
      fail(line.ind > 0 ? 'This line is indented more than expected.' : 'Unexpected content. Check the indentation of this line.', line.num, line.col);
    }
    values.push(orNull(v));
  }
  return { value: values.length > 1 ? values : values.length ? values[0] : null, docs: values.length, warnings: [...warnings] };
}

export function bytesToBase64(bytes) {
  let s = '';
  for (let k = 0; k < bytes.length; k += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
  return btoa(s);
}

export function base64ToBytes(input) {
  let s = input.trim().replace(/^data:[^,]*;base64,/i, '').replace(/\s+/g, '');
  if (!s) return new Uint8Array(0);
  const bad = s.search(/[^A-Za-z0-9+/=_-]/);
  if (bad >= 0) throw new Error(`"${s[bad]}" is not a Base64 character. Base64 uses only A to Z, a to z, 0 to 9, + and / (or - and _), with = at the end.`);
  if (/[-_]/.test(s) && /[+/]/.test(s)) throw new Error('The text mixes standard Base64 (+ and /) with URL-safe Base64 (- and _).');
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const body = s.replace(/=+$/, '');
  if (body.includes('=')) throw new Error('The = padding sign can only appear at the end.');
  if (body.length % 4 === 1) throw new Error('The length is not valid for Base64: one character is missing or extra.');
  const bin = atob(body + '='.repeat((4 - (body.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k);
  return out;
}

export function sniff(bytes) {
  const b = k => bytes[k];
  const ascii = (from, text) => [...text].every((c, k) => bytes[from + k] === c.charCodeAt(0));
  if (b(0) === 0x89 && ascii(1, 'PNG')) return ['PNG image', 'png', 'image/png'];
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return ['JPEG image', 'jpg', 'image/jpeg'];
  if (ascii(0, 'GIF8')) return ['GIF image', 'gif', 'image/gif'];
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return ['WebP image', 'webp', 'image/webp'];
  if (ascii(4, 'ftypavif')) return ['AVIF image', 'avif', 'image/avif'];
  if (b(0) === 0 && b(1) === 0 && b(2) === 1 && b(3) === 0) return ['icon file', 'ico', 'image/x-icon'];
  if (ascii(0, '%PDF')) return ['PDF document', 'pdf', 'application/pdf'];
  if (ascii(0, 'PK') && b(2) === 3 && b(3) === 4) return ['ZIP archive, or a file built on ZIP such as DOCX', 'zip', 'application/zip'];
  if (b(0) === 0x1f && b(1) === 0x8b) return ['gzip archive', 'gz', 'application/gzip'];
  if (ascii(0, 'wOF2')) return ['WOFF2 font', 'woff2', 'font/woff2'];
  if (ascii(0, 'wOFF')) return ['WOFF font', 'woff', 'font/woff'];
  if (ascii(0, 'ID3') || (b(0) === 0xff && (b(1) & 0xe0) === 0xe0)) return ['MP3 audio', 'mp3', 'audio/mpeg'];
  if (ascii(4, 'ftyp')) return ['MP4 or QuickTime video', 'mp4', 'video/mp4'];
  return null;
}

export function hexDump(bytes) {
  const lines = [];
  const max = Math.min(bytes.length, 4096);
  for (let k = 0; k < max; k += 16) {
    const chunk = bytes.subarray(k, Math.min(k + 16, max));
    const hex = [...chunk].map(x => x.toString(16).padStart(2, '0')).join(' ');
    const text = [...chunk].map(x => (x >= 32 && x < 127 ? String.fromCharCode(x) : '.')).join('');
    lines.push(`${k.toString(16).padStart(8, '0')}  ${hex.padEnd(47, ' ')}  ${text}`);
  }
  if (bytes.length > max) lines.push(`... ${sizeLabel(bytes.length - max)} more`);
  return lines.join('\n');
}

const BASIC_NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00A0' };

export function decodeEntities(s, namedEntity = name => (Object.prototype.hasOwnProperty.call(BASIC_NAMED, name) ? BASIC_NAMED[name] : null)) {
  let count = 0;
  const out = s.replace(/&(?:#(\d{1,8})|#[xX]([0-9a-fA-F]{1,7})|([A-Za-z][A-Za-z0-9]{1,31}));?/g, (m, dec, hex, name) => {
    if (name) {
      if (!m.endsWith(';')) return m;
      const v = namedEntity(name);
      if (v === null) return m;
      count++;
      return v;
    }
    const code = dec ? parseInt(dec, 10) : parseInt(hex, 16);
    count++;
    if (!code || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return '\ufffd';
    return String.fromCodePoint(code);
  });
  return { out, count };
}

export function encodeEntities(s, all) {
  const basic = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  let out = '';
  for (const ch of s) {
    if (basic[ch]) out += basic[ch];
    else if (all && ch.codePointAt(0) > 126) out += `&#${ch.codePointAt(0)};`;
    else out += ch;
  }
  return out;
}

export function badPercent(s) {
  const lone = s.search(/%(?![0-9a-fA-F]{2})/);
  if (lone >= 0) return `A % must be followed by two hex digits, as in %20. The one at position ${lone + 1} is not.`;
  const re = /(?:%[0-9a-fA-F]{2})+/g;
  let m;
  while ((m = re.exec(s))) {
    try {
      decodeURIComponent(m[0]);
    } catch {
      return `The % codes at position ${m.index + 1} (${short(m[0], 24)}) are not valid UTF-8 text.`;
    }
  }
  return 'The text has % codes that cannot be decoded.';
}

export function urlParts(text) {
  let u;
  try {
    if (!/^[a-z][a-z0-9+.-]*:\/\/\S+$/i.test(text.trim())) return null;
    u = new URL(text.trim());
  } catch {
    return null;
  }
  const list = [
    { label: 'Scheme', value: u.protocol.replace(/:$/, '') },
    { label: 'Host', value: u.port ? `${u.hostname}:${u.port}` : u.hostname }
  ];
  if (u.username) list.push({ label: 'User', value: decodeSafe(u.username) });
  list.push({ label: 'Path', value: decodeSafe(u.pathname) || '/' });
  for (const [k, v] of u.searchParams) list.push({ label: `Query: ${short(k, 40)}`, value: v || '(empty)' });
  if (u.hash) list.push({ label: 'Fragment', value: decodeSafe(u.hash.slice(1)) });
  return list;
}

export function decodeSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export const localZone = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
})();
export const zoneOf = z => (z === 'local' ? localZone : z);
export const formatters = new Map();

export function partsIn(ms, zone) {
  const z = zoneOf(zone);
  let f = formatters.get(z);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: z, hourCycle: 'h23', era: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    formatters.set(z, f);
  }
  const p = {};
  for (const part of f.formatToParts(ms)) p[part.type] = part.value;
  let y = Number(p.year);
  if (p.era && /^B/i.test(p.era)) y = 1 - y;
  return { y, mo: Number(p.month), d: Number(p.day), h: Number(p.hour) % 24, mi: Number(p.minute), s: Number(p.second) };
}

export function utcMs(y, mo, d, h, mi, s, ms) {
  const t = new Date(Date.UTC(2000, 0, 1, h, mi, s, ms));
  t.setUTCFullYear(y, mo - 1, d);
  return t.getTime();
}

export function offsetIn(ms, zone) {
  if (zone === 'UTC') return 0;
  const base = Math.floor(ms / 1000) * 1000;
  const p = partsIn(base, zone);
  return utcMs(p.y, p.mo, p.d, p.h, p.mi, p.s, 0) - base;
}

export function wallToMs(f, zone) {
  const guess = utcMs(f.y, f.mo, f.d, f.h, f.mi, f.s, f.ms);
  if (zone === 'UTC') return { ms: guess };
  const first = offsetIn(guess, zone);
  const t1 = guess - first;
  const second = offsetIn(t1, zone);
  if (second === first) return { ms: t1 };
  const t2 = guess - second;
  if (offsetIn(t2, zone) === second) return { ms: Math.min(t1, t2) };
  return { ms: Math.max(t1, t2), skipped: true };
}

export const pad2 = n => String(n).padStart(2, '0');

export function yearText(y) {
  if (y >= 0 && y <= 9999) return String(y).padStart(4, '0');
  return `${y < 0 ? '-' : '+'}${String(Math.abs(y)).padStart(6, '0')}`;
}

export function offsetText(min) {
  const sign = min < 0 ? '-' : '+';
  const a = Math.abs(min);
  return `${sign}${pad2(Math.floor(a / 60))}:${pad2(a % 60)}`;
}

export function isoIn(ms, zone) {
  const p = partsIn(ms, zone);
  const frac = ((ms % 1000) + 1000) % 1000;
  const off = Math.round(offsetIn(ms, zone) / 60000);
  const tail = zone === 'UTC' ? 'Z' : offsetText(off);
  return `${yearText(p.y)}-${pad2(p.mo)}-${pad2(p.d)}T${pad2(p.h)}:${pad2(p.mi)}:${pad2(p.s)}${frac ? `.${String(frac).padStart(3, '0')}` : ''}${tail}`;
}

export function wallText(ms, zone) {
  const p = partsIn(ms, zone);
  const frac = ((ms % 1000) + 1000) % 1000;
  return `${yearText(p.y)}-${pad2(p.mo)}-${pad2(p.d)} ${pad2(p.h)}:${pad2(p.mi)}:${pad2(p.s)}${frac ? `.${String(frac).padStart(3, '0')}` : ''}`;
}

export const rtf = typeof Intl.RelativeTimeFormat === 'function' ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }) : null;

export function relative(ms) {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units = [['year', 31557600000], ['month', 2629800000], ['week', 604800000], ['day', 86400000], ['hour', 3600000], ['minute', 60000], ['second', 1000]];
  for (const [unit, size] of units) {
    if (abs >= size || unit === 'second') {
      const v = Math.round(diff / size);
      if (rtf) return rtf.format(v, unit);
      return v < 0 ? `${plural(-v, unit)} ago` : `in ${plural(v, unit)}`;
    }
  }
  return '';
}

export function isoWeek(y, mo, d) {
  const t = new Date(utcMs(y, mo, d, 0, 0, 0, 0));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = utcMs(t.getUTCFullYear(), 1, 1, 0, 0, 0, 0);
  return { week: Math.ceil(((t.getTime() - yearStart) / 86400000 + 1) / 7), year: t.getUTCFullYear() };
}

export const MAX_MS = 8.64e15;

export function readStamp(text, unitSetting = 'auto') {
  const t = text.trim().replace(/[_,\s]/g, '');
  if (!t) return { ms: null };
  if (!/^[-+]?\d+(\.\d+)?$/.test(t)) return { error: 'A Unix timestamp is a number of seconds or milliseconds, such as 1767225600.' };
  const value = Number(t);
  let unit = unitSetting;
  if (unit === 'auto') {
    const a = Math.abs(value);
    unit = a >= 1e17 ? 'ns' : a >= 1e14 ? 'us' : a >= 1e11 ? 'ms' : 's';
  }
  const factor = { s: 1000, ms: 1, us: 0.001, ns: 0.000001 }[unit];
  const ms = Math.round(value * factor * 1000) / 1000;
  if (Math.abs(ms) > MAX_MS) return { error: 'That moment is outside the range of dates that can be shown, about 270,000 years either side of 1970.' };
  return { ms: Math.floor(ms), unit };
}

export function readDate(text, zone = 'local') {
  const t = text.trim();
  if (!t) return { ms: null };
  const m = /^([+-]?\d{4,6})-(\d{1,2})-(\d{1,2})(?:[Tt ]+(\d{1,2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,9}))?)?)?\s*(Z|z|UTC|GMT|[+-]\d{2}(?::?\d{2})?)?$/.exec(t);
  if (m) {
    const f = { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]), h: Number(m[4] || 0), mi: Number(m[5] || 0), s: Number(m[6] || 0), ms: m[7] ? Math.floor(Number(`0.${m[7]}`) * 1000) : 0 };
    if (f.mo < 1 || f.mo > 12 || f.d < 1 || f.d > 31 || f.h > 23 || f.mi > 59 || f.s > 60) return { error: 'That date or time is out of range. Check the month, day, hours and minutes.' };
    const check = new Date(utcMs(f.y, f.mo, f.d, 0, 0, 0, 0));
    if (check.getUTCDate() !== f.d) return { error: `That month does not have ${f.d} days.` };
    if (f.s === 60) f.s = 59;
    const zoneText = m[8];
    if (zoneText) {
      let off = 0;
      if (!/^(Z|z|UTC|GMT)$/.test(zoneText)) {
        const z = /^([+-])(\d{2}):?(\d{2})?$/.exec(zoneText);
        off = (z[1] === '-' ? -1 : 1) * (Number(z[2]) * 60 + Number(z[3] || 0));
      }
      return { ms: utcMs(f.y, f.mo, f.d, f.h, f.mi, f.s, f.ms) - off * 60000, fixed: true };
    }
    return wallToMs(f, zone);
  }
  const parsed = Date.parse(t);
  if (!Number.isNaN(parsed)) return { ms: parsed, fixed: /(?:GMT|UTC|Z|[+-]\d{2}:?\d{2})\s*$/i.test(t), loose: true };
  return { error: 'That date was not recognized. Use a format such as 2026-10-20 14:30 or 2026-10-20T14:30:00Z.' };
}

export function zoneLabel(zone) {
  return zone === 'local' ? `your time zone, ${localZone}` : zone;
}

export const hexOf = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');

export let lastV7 = -1;
export let v7seq = 0;

export function uuidBytes(version) {
  const b = crypto.getRandomValues(new Uint8Array(16));
  if (version === 'v7') {
    const now = Date.now();
    if (now > lastV7) {
      lastV7 = now;
      v7seq = ((b[6] & 0x07) << 8) | b[7];
    } else {
      v7seq++;
      if (v7seq > 0xfff) {
        lastV7++;
        v7seq = ((b[6] & 0x07) << 8) | b[7];
      }
    }
    const t = lastV7;
    b[0] = Math.floor(t / 1099511627776) & 0xff;
    b[1] = Math.floor(t / 4294967296) & 0xff;
    b[2] = (t >>> 24) & 0xff;
    b[3] = (t >>> 16) & 0xff;
    b[4] = (t >>> 8) & 0xff;
    b[5] = t & 0xff;
    b[6] = 0x70 | (v7seq >> 8);
    b[7] = v7seq & 0xff;
  } else {
    b[6] = (b[6] & 0x0f) | 0x40;
  }
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

export function formatUuid(bytes, upper, bare) {
  const h = hexOf(bytes);
  let s = bare ? h : `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  if (upper) s = s.toUpperCase();
  return s;
}

export const MD5_K = Array.from({ length: 64 }, (_, k) => Math.floor(Math.abs(Math.sin(k + 1)) * 4294967296) >>> 0);
export const MD5_S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

export class Md5 {
  constructor() {
    this.h = new Int32Array([0x67452301, 0xefcdab89 | 0, 0x98badcfe | 0, 0x10325476]);
    this.buf = new Uint8Array(64);
    this.view = new DataView(this.buf.buffer);
    this.fill = 0;
    this.length = 0;
    this.x = new Int32Array(16);
  }

  block(view, offset) {
    const x = this.x;
    for (let k = 0; k < 16; k++) x[k] = view.getInt32(offset + k * 4, true);
    let a = this.h[0];
    let b = this.h[1];
    let c = this.h[2];
    let d = this.h[3];
    for (let k = 0; k < 64; k++) {
      let f;
      let g;
      if (k < 16) {
        f = (b & c) | (~b & d);
        g = k;
      } else if (k < 32) {
        f = (d & b) | (~d & c);
        g = (5 * k + 1) & 15;
      } else if (k < 48) {
        f = b ^ c ^ d;
        g = (3 * k + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        g = (7 * k) & 15;
      }
      const t = d;
      d = c;
      c = b;
      const sum = (a + f + MD5_K[k] + x[g]) | 0;
      b = (b + ((sum << MD5_S[k]) | (sum >>> (32 - MD5_S[k])))) | 0;
      a = t;
    }
    this.h[0] = (this.h[0] + a) | 0;
    this.h[1] = (this.h[1] + b) | 0;
    this.h[2] = (this.h[2] + c) | 0;
    this.h[3] = (this.h[3] + d) | 0;
  }

  update(bytes) {
    let k = 0;
    this.length += bytes.length;
    if (this.fill) {
      const take = Math.min(64 - this.fill, bytes.length);
      this.buf.set(bytes.subarray(0, take), this.fill);
      this.fill += take;
      k = take;
      if (this.fill < 64) return;
      this.block(this.view, 0);
      this.fill = 0;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (; k + 64 <= bytes.length; k += 64) this.block(view, k);
    if (k < bytes.length) {
      this.buf.set(bytes.subarray(k), 0);
      this.fill = bytes.length - k;
    }
  }

  digest() {
    const bits = this.length * 8;
    const tail = new Uint8Array(((this.fill < 56 ? 56 : 120) - this.fill) + 8);
    tail[0] = 0x80;
    const view = new DataView(tail.buffer);
    view.setUint32(tail.length - 8, bits >>> 0, true);
    view.setUint32(tail.length - 4, Math.floor(bits / 4294967296), true);
    const length = this.length;
    this.update(tail);
    this.length = length;
    const out = new Uint8Array(16);
    const outView = new DataView(out.buffer);
    for (let k = 0; k < 4; k++) outView.setInt32(k * 4, this.h[k], true);
    return out;
  }
}

export const pause = () => new Promise(resolve => setTimeout(resolve, 0));

export async function digestAll(bytes, progress) {
  const out = new Map();
  const md5 = new Md5();
  const CHUNK = 4194304;
  for (let k = 0; k < bytes.length; k += CHUNK) {
    md5.update(bytes.subarray(k, k + CHUNK));
    if (bytes.length > CHUNK) {
      if (progress) progress(Math.min(1, (k + CHUNK) / bytes.length));
      await pause();
    }
  }
  out.set('MD5', md5.digest());
  if (subtle) {
    for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) out.set(algo, new Uint8Array(await subtle.digest(algo, bytes)));
  }
  return out;
}

export function hashText(bytes, format) {
  if (format === 'base64') return bytesToBase64(bytes);
  const h = hexOf(bytes);
  return format === 'upper' ? h.toUpperCase() : h;
}

export function checksumMatches(bytes, compare) {
  return Boolean(compare) && (hexOf(bytes) === compare.toLowerCase() || bytesToBase64(bytes).replace(/=+$/, '') === compare.replace(/=+$/, ''));
}

export function passwordPools(o) {
  const pools = [];
  for (const name of ['lower', 'upper', 'digits', 'symbols']) {
    if (!o[name]) continue;
    const pool = o.similar ? [...SETS[name]].filter(c => !SIMILAR.has(c)).join('') : SETS[name];
    if (pool) pools.push(pool);
  }
  return pools;
}

export function passwordBits(o, pools) {
  if (o.kind === 'password') return o.length * Math.log2(new Set(pools.join('')).size);
  return o.words * Math.log2(WORDS.length) + (o.number ? Math.log2(100) + Math.log2(o.words) : 0);
}

export function strengthLevel(bits) {
  return bits < 45 ? ['Weak', 'is-weak'] : bits < 64 ? ['Fair', 'is-fair'] : bits < 80 ? ['Strong', 'is-strong'] : ['Very strong', 'is-strong'];
}

export function uuidInfo(text) {
  const m = /^(?:urn:uuid:)?\{?([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})\}?$/i.exec(text);
  if (!m) return null;
  const hex = m.slice(1).join('').toLowerCase();
  const canonical = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  if (/^0+$/.test(hex) || /^f+$/.test(hex)) return { canonical, special: hex[0] === '0' ? 'nil' : 'max' };
  const version = parseInt(hex[12], 16);
  const variantBits = parseInt(hex[16], 16);
  const variant = variantBits < 8 ? 'NCS, a pre-standard format' : variantBits < 12 ? 'RFC 9562, the standard variant' : variantBits < 14 ? 'Microsoft GUID, legacy' : 'reserved';
  const names = { 1: 'time and node', 2: 'DCE security', 3: 'name, MD5', 4: 'random', 5: 'name, SHA-1', 6: 'reordered time', 7: 'Unix time and random', 8: 'custom' };
  const standard = variantBits >= 8 && variantBits < 12;
  let ms = null;
  if (standard) {
    if (version === 7) ms = parseInt(hex.slice(0, 12), 16);
    if (version === 1 || version === 6) {
      const t = version === 1 ? BigInt(`0x${hex.slice(13, 16)}${hex.slice(8, 12)}${hex.slice(0, 8)}`) : BigInt(`0x${hex.slice(0, 12)}${hex.slice(13, 16)}`);
      ms = Number(t / 10000n) - 12219292800000;
    }
  }
  return { canonical, special: '', version, versionName: names[version] || '', variant, standard, ms };
}

export function decodeJwtPart(part, name) {
  let bytes;
  try {
    bytes = b64urlBytes(part);
  } catch {
    throw new Error(`The ${name} is not valid Base64url.`);
  }
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`The ${name} is not UTF-8 text.`);
  }
  try {
    return { text, value: parseJson(text).value };
  } catch {
    return { text, value: null };
  }
}

export function randomInt(n) {
  const limit = Math.floor(4294967296 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % n;
  }
}

export function makePassword(o, pools) {
  const all = [...new Set(pools.join(''))];
  const chars = pools.map(pool => pool[randomInt(pool.length)]);
  while (chars.length < o.length) chars.push(all[randomInt(all.length)]);
  for (let k = chars.length - 1; k > 0; k--) {
    const j = randomInt(k + 1);
    [chars[k], chars[j]] = [chars[j], chars[k]];
  }
  return chars.join('');
}

export function makePhrase(o) {
  const words = [];
  for (let k = 0; k < o.words; k++) {
    let w = WORDS[randomInt(WORDS.length)];
    if (o.caps) w = w[0].toUpperCase() + w.slice(1);
    words.push(w);
  }
  if (o.number) words[randomInt(words.length)] += String(randomInt(100));
  return words.join(SEPARATORS[o.sep]);
}

export function crackTime(bits) {
  const seconds = 2 ** (bits - 1) / 1e10;
  if (seconds < 1) return 'less than a second';
  const steps = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [31557600, 'day'], [Infinity, 'year']];
  let size = 1;
  for (const [next, unit] of steps) {
    if (seconds < next) {
      const v = seconds / size;
      if (unit === 'year' && v >= 1e12) return 'more than a trillion years';
      if (unit === 'year' && v >= 1e6) return `about ${Math.round(v / 1e6).toLocaleString()} million years`;
      return `about ${plural(Math.max(1, Math.round(v)), unit)}`;
    }
    size = next;
  }
  return '';
}

export function b64urlBytes(part) {
  if (!/^[A-Za-z0-9_=-]*$/.test(part)) throw new Error('not base64url');
  return base64ToBytes(part);
}

export const timeClaims = { exp: 'Expires', nbf: 'Not valid before', iat: 'Issued at', auth_time: 'Signed in at', updated_at: 'Updated at' };
export const claimNames = { iss: 'Issuer', sub: 'Subject', aud: 'Audience', jti: 'Token ID', scope: 'Scope', azp: 'Authorized party', nonce: 'Nonce' };

export function regexError(error) {
  const message = String((error && error.message) || error);
  const reason = message.includes(': ') ? message.slice(message.lastIndexOf(': ') + 2) : message;
  return `Not a valid regular expression: ${reason.replace(/\.$/, '')}.`;
}
