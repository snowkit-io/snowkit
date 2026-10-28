const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALIASES = { "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *", "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0", "@daily": "0 0 * * *", "@midnight": "0 0 * * *", "@hourly": "0 * * * *" };
const FIELDS = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] },
  { name: "day of week", min: 0, max: 7, names: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] },
];

function value(token, f) {
  const t = token.toLowerCase();
  if (f.names) {
    const i = f.names.indexOf(t);
    if (i >= 0) return i + f.min;
  }
  if (!/^\d+$/.test(t)) throw new Error("Unknown value \u201C" + token + "\u201D in the " + f.name + " field");
  const n = +t;
  if (n < f.min || n > f.max) throw new Error(f.name[0].toUpperCase() + f.name.slice(1) + " must be between " + f.min + " and " + f.max + ", not " + n);
  return n;
}

function parseField(text, f) {
  const set = new Set();
  for (const part of text.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText === undefined ? 1 : +stepText;
    if (!Number.isInteger(step) || step < 1) throw new Error("Bad step \u201C" + part + "\u201D in the " + f.name + " field");
    let lo;
    let hi;
    if (range === "*" || range === "?") {
      lo = f.min;
      hi = f.name === "day of week" ? 6 : f.max;
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      lo = value(a, f);
      hi = value(b, f);
      if (lo > hi) throw new Error("Range \u201C" + range + "\u201D runs backwards in the " + f.name + " field");
    } else {
      lo = value(range, f);
      hi = stepText === undefined ? lo : f.name === "day of week" ? 6 : f.max;
    }
    for (let v = lo; v <= hi; v += step) set.add(f.name === "day of week" && v === 7 ? 0 : v);
  }
  return { set, any: text === "*" || text === "?", text };
}

export function parse(expr) {
  const raw = String(expr || "").trim().replace(/\s+/g, " ");
  const full = ALIASES[raw.toLowerCase()] || raw;
  const parts = full.split(" ");
  if (parts.length === 6) parts.shift();
  if (parts.length !== 5) throw new Error("A cron expression has 5 fields: minute, hour, day of month, month and day of week");
  const fields = parts.map((p, i) => parseField(p, FIELDS[i]));
  return { expr: full, minute: fields[0], hour: fields[1], dom: fields[2], month: fields[3], dow: fields[4] };
}

function listWords(nums, map) {
  const words = nums.map(map);
  return words.length <= 2 ? words.join(" and ") : words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
}

const pad = (n) => String(n).padStart(2, "0");

function ordinal(n) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
  return n + s;
}

function clock(h, m) {
  return pad(h) + ":" + pad(m);
}

function stepOf(field, min) {
  const m = field.text.match(/^(\*|\d+)\/(\d+)$/);
  return m && (m[1] === "*" || +m[1] === min) ? +m[2] : null;
}

export function describe(expr) {
  const c = parse(expr);
  const mins = [...c.minute.set].sort((a, b) => a - b);
  const hours = [...c.hour.set].sort((a, b) => a - b);
  let time;
  const mStep = stepOf(c.minute, 0);
  const hStep = stepOf(c.hour, 0);
  if (c.minute.any && c.hour.any) time = "Every minute";
  else if (mStep && c.hour.any) time = "Every " + mStep + " minutes";
  else if (mStep) time = "Every " + mStep + " minutes, " + (hours.length === 1 ? "during the " + pad(hours[0]) + ":00 hour" : "between " + clock(hours[0], 0) + " and " + clock(hours[hours.length - 1], 59));
  else if (c.minute.any) time = "Every minute " + (hours.length === 1 ? "during the " + pad(hours[0]) + ":00 hour" : "of hours " + listWords(hours, (h) => pad(h)));
  else if (c.hour.any) time = mins.length === 1 ? (mins[0] === 0 ? "Every hour, on the hour" : "Every hour at " + mins[0] + " minutes past") : "Every hour at minutes " + listWords(mins, String);
  else if (hStep && mins.length === 1) time = "Every " + hStep + " hours" + (mins[0] ? " at " + mins[0] + " minutes past" : ", on the hour");
  else if (hours.length * mins.length <= 6) time = "At " + listWords(hours.flatMap((h) => mins.map((m) => [h, m])), ([h, m]) => clock(h, m));
  else time = "At minutes " + listWords(mins, String) + " past hours " + listWords(hours, (h) => pad(h));
  const parts = [time];
  const dows = [...c.dow.set].sort((a, b) => a - b);
  const doms = [...c.dom.set].sort((a, b) => a - b);
  if (!c.dom.any) parts.push("on the " + listWords(doms, ordinal) + " of the month");
  if (!c.dow.any) {
    const wk = dows.join(",") === "1,2,3,4,5" ? "on weekdays" : dows.join(",") === "0,6" ? "at weekends" : "on " + listWords(dows, (d) => DAYS[d]);
    parts.push((!c.dom.any ? "or " : "") + wk);
  }
  if (!c.month.any) parts.push("in " + listWords([...c.month.set].sort((a, b) => a - b), (m) => MONTHS[m - 1]));
  return parts.join(", ") + ".";
}

export function next(expr, count = 5, from = new Date(), { utc = false } = {}) {
  const c = parse(expr);
  const g = utc
    ? { mo: (d) => d.getUTCMonth(), dt: (d) => d.getUTCDate(), dw: (d) => d.getUTCDay(), h: (d) => d.getUTCHours(), mi: (d) => d.getUTCMinutes() }
    : { mo: (d) => d.getMonth(), dt: (d) => d.getDate(), dw: (d) => d.getDay(), h: (d) => d.getHours(), mi: (d) => d.getMinutes() };
  const set = utc
    ? { month: (d) => d.setUTCMonth(d.getUTCMonth() + 1, 1) && d.setUTCHours(0, 0, 0, 0), day: (d) => d.setUTCDate(d.getUTCDate() + 1) && d.setUTCHours(0, 0, 0, 0), hour: (d) => d.setUTCHours(d.getUTCHours() + 1, 0, 0, 0), minute: (d) => d.setUTCMinutes(d.getUTCMinutes() + 1, 0, 0) }
    : { month: (d) => d.setMonth(d.getMonth() + 1, 1) && d.setHours(0, 0, 0, 0), day: (d) => d.setDate(d.getDate() + 1) && d.setHours(0, 0, 0, 0), hour: (d) => d.setHours(d.getHours() + 1, 0, 0, 0), minute: (d) => d.setMinutes(d.getMinutes() + 1, 0, 0) };
  const out = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  set.minute(d);
  const domAny = c.dom.any;
  const dowAny = c.dow.any;
  for (let i = 0; i < 366 * 24 * 60 * 5 && out.length < count; i++) {
    if (!c.month.set.has(g.mo(d) + 1)) {
      set.month(d);
      continue;
    }
    const domOk = c.dom.set.has(g.dt(d));
    const dowOk = c.dow.set.has(g.dw(d));
    if (!(domAny && dowAny ? true : domAny ? dowOk : dowAny ? domOk : domOk || dowOk)) {
      set.day(d);
      continue;
    }
    if (!c.hour.set.has(g.h(d))) {
      set.hour(d);
      continue;
    }
    if (!c.minute.set.has(g.mi(d))) {
      set.minute(d);
      continue;
    }
    out.push(new Date(d.getTime()));
    set.minute(d);
  }
  return out;
}

export function build({ minute = "0", hour = "*", dom = "*", month = "*", dow = "*" } = {}) {
  return [minute, hour, dom, month, dow].join(" ");
}
