const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const Q1 = "\u201C";
const Q2 = "\u201D";

export function pathJoin(base, key) {
  if (typeof key === "number") return base + "[" + key + "]";
  return IDENT.test(key) ? base + "." + key : base + "['" + String(key).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "']";
}

function lineCol(text, pos) {
  const before = text.slice(0, pos);
  const line = before.split("\n").length;
  return { line, column: pos - before.lastIndexOf("\n") };
}

function locate(text) {
  let i = 0;
  const fail = (msg, at = i) => {
    const e = new Error(msg);
    e.pos = Math.min(at, text.length);
    throw e;
  };
  const ws = () => {
    while (i < text.length && " \t\n\r".includes(text[i])) i++;
  };
  const describe = () => (i >= text.length ? "Unexpected end of input" : "Unexpected character " + Q1 + text[i] + Q2);
  function value() {
    ws();
    const c = text[i];
    if (c === "{") {
      i++;
      ws();
      if (text[i] === "}") return i++;
      for (;;) {
        ws();
        if (text[i] !== '"') fail(text[i] === "}" ? "Trailing comma before }" : text[i] === "'" ? "Property names need double quotes" : "Expected a property name in double quotes");
        string();
        ws();
        if (text[i] !== ":") fail("Expected : after the property name");
        i++;
        value();
        ws();
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "}") return i++;
        fail(i >= text.length ? "Unexpected end of input, a } is missing" : "Expected , or } after a value");
      }
    }
    if (c === "[") {
      i++;
      ws();
      if (text[i] === "]") return i++;
      for (;;) {
        ws();
        if (text[i] === "]") fail("Trailing comma before ]");
        value();
        ws();
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "]") return i++;
        fail(i >= text.length ? "Unexpected end of input, a ] is missing" : "Expected , or ] after a value");
      }
    }
    if (c === '"') return string();
    if (c === "'") fail("Strings need double quotes, not single quotes");
    if (c === "-" || (c >= "0" && c <= "9")) {
      const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
      if (!m) fail("Invalid number");
      i += m[0].length;
      return;
    }
    for (const w of ["true", "false", "null"]) {
      if (text.startsWith(w, i)) {
        i += w.length;
        return;
      }
    }
    if (text.startsWith("//", i) || text.startsWith("/*", i)) fail("Comments are not allowed in JSON");
    fail(describe());
  }
  function string() {
    const start = i;
    i++;
    while (i < text.length) {
      const c = text[i];
      if (c === '"') return i++;
      if (c === "\\") {
        const n = text[i + 1];
        if (n === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) fail("Bad \\u escape in a string");
          i += 6;
          continue;
        }
        if (!'"\\/bfnrt'.includes(n)) fail("Bad escape \\" + (n || "") + " in a string");
        i += 2;
        continue;
      }
      if (c === "\n") fail("Unterminated string (strings can't contain line breaks)", start);
      if (c < " ") fail("Control characters must be escaped in strings");
      i++;
    }
    fail("Unterminated string", start);
  }
  value();
  ws();
  if (i < text.length) fail("Unexpected content after the end of the JSON value");
  return null;
}

export function parseJsonText(text) {
  if (!String(text).trim()) {
    const e = new Error("Nothing to parse yet");
    e.line = 1;
    e.column = 1;
    throw e;
  }
  try {
    return JSON.parse(text);
  } catch (first) {
    let msg = first.message;
    let pos = text.length;
    try {
      locate(text);
    } catch (e) {
      if (e.pos !== undefined) {
        msg = e.message;
        pos = e.pos;
      }
    }
    const { line, column } = lineCol(text, pos);
    const err = new Error("Line " + line + ", column " + column + ": " + msg);
    err.line = line;
    err.column = column;
    err.reason = msg;
    throw err;
  }
}

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v;
}

function isType(v, t) {
  const a = typeOf(v);
  return a === t || (t === "number" && a === "integer");
}

export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}

function validDate(y, m, d) {
  if (m < 1 || m > 12 || d < 1) return false;
  const days = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d <= days[m - 1];
}

const FORMATS = {
  email: (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  "idn-email": (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  uri: (s) => /^[A-Za-z][A-Za-z0-9+.-]*:[^\s]*$/.test(s),
  "uri-reference": (s) => !/\s/.test(s),
  url: (s) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(s),
  uuid: (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s),
  date: (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    return !!m && validDate(+m[1], +m[2], +m[3]);
  },
  time: (s) => {
    const m = /^(\d{2}):(\d{2}):(\d{2})(\.\d+)?([Zz]|[+-]\d{2}:\d{2})?$/.exec(s);
    return !!m && +m[1] < 24 && +m[2] < 60 && +m[3] <= 60;
  },
  "date-time": (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2}):(\d{2})(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/.exec(s);
    return !!m && validDate(+m[1], +m[2], +m[3]) && +m[4] < 24 && +m[5] < 60 && +m[6] <= 60;
  },
  ipv4: (s) => /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(s),
  ipv6: (s) => /^[0-9a-f:.]+$/i.test(s) && s.includes(":") && (s.match(/::/g) || []).length <= 1 && s.split(":").every((p) => p.length <= 4 || p.includes(".")),
  hostname: (s) => s.length <= 253 && /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/.test(s),
};

const FORMAT_NAMES = { email: "email address", "idn-email": "email address", uri: "URI", "uri-reference": "URI reference", url: "URL", uuid: "UUID", date: "date (YYYY-MM-DD)", time: "time (HH:MM:SS)", "date-time": "date-time (RFC 3339)", ipv4: "IPv4 address", ipv6: "IPv6 address", hostname: "hostname" };

function show(v) {
  const s = JSON.stringify(v);
  return s.length > 40 ? s.slice(0, 37) + "..." : s;
}

function listTypes(t) {
  const a = Array.isArray(t) ? t : [t];
  return a.length > 1 ? a.slice(0, -1).join(", ") + " or " + a[a.length - 1] : a[0];
}

function decodePointer(seg) {
  return decodeURIComponent(seg).replace(/~1/g, "/").replace(/~0/g, "~");
}

export function resolvePointer(root, ref) {
  if (ref === "#" || ref === "") return root;
  if (!ref.startsWith("#/")) return undefined;
  let node = root;
  for (const raw of ref.slice(2).split("/")) {
    const k = decodePointer(raw);
    if (node === null || typeof node !== "object" || !Object.prototype.hasOwnProperty.call(node, k)) return undefined;
    node = node[k];
  }
  return node;
}

export function validateJson(data, schema) {
  const errors = [];
  if (schema === null || (typeof schema !== "object" && typeof schema !== "boolean")) {
    return [{ path: "$", message: "The schema must be a JSON object or a boolean" }];
  }
  const root = schema;
  const chars = (s) => [...s].length;

  function check(v, s, path, out, depth) {
    if (s === true || s === undefined) return;
    if (s === false) {
      out.push({ path, message: "No value is allowed here" });
      return;
    }
    if (s === null || typeof s !== "object") return;
    if (depth > 120) {
      out.push({ path, message: "Schema nesting is too deep (a circular $ref?)" });
      return;
    }
    if (typeof s.$ref === "string") {
      const target = resolvePointer(root, s.$ref);
      if (target === undefined) out.push({ path, message: "Can't resolve $ref " + Q1 + s.$ref + Q2 + " (only local refs like #/$defs/name work)" });
      else check(v, target, path, out, depth + 1);
    }
    if (s.type !== undefined) {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      if (!types.some((t) => isType(v, t))) {
        out.push({ path, message: "Expected " + listTypes(types) + ", got " + typeOf(v) });
        return;
      }
    }
    if (s.enum && !s.enum.some((e) => deepEqual(e, v))) out.push({ path, message: "Must be one of " + s.enum.map(show).join(", ") });
    if ("const" in s && !deepEqual(s.const, v)) out.push({ path, message: "Must equal " + show(s.const) });

    if (typeof v === "number") {
      if (typeof s.minimum === "number") {
        if (s.exclusiveMinimum === true ? v <= s.minimum : v < s.minimum) out.push({ path, message: (s.exclusiveMinimum === true ? "Must be greater than " : "Must be at least ") + s.minimum });
      }
      if (typeof s.maximum === "number") {
        if (s.exclusiveMaximum === true ? v >= s.maximum : v > s.maximum) out.push({ path, message: (s.exclusiveMaximum === true ? "Must be less than " : "Must be at most ") + s.maximum });
      }
      if (typeof s.exclusiveMinimum === "number" && v <= s.exclusiveMinimum) out.push({ path, message: "Must be greater than " + s.exclusiveMinimum });
      if (typeof s.exclusiveMaximum === "number" && v >= s.exclusiveMaximum) out.push({ path, message: "Must be less than " + s.exclusiveMaximum });
      if (typeof s.multipleOf === "number" && s.multipleOf > 0) {
        const q = v / s.multipleOf;
        if (Math.abs(q - Math.round(q)) > 1e-9) out.push({ path, message: "Must be a multiple of " + s.multipleOf });
      }
    }

    if (typeof v === "string") {
      if (typeof s.minLength === "number" && chars(v) < s.minLength) out.push({ path, message: "Must be at least " + s.minLength + (s.minLength === 1 ? " character" : " characters") + " long" });
      if (typeof s.maxLength === "number" && chars(v) > s.maxLength) out.push({ path, message: "Must be at most " + s.maxLength + (s.maxLength === 1 ? " character" : " characters") + " long" });
      if (typeof s.pattern === "string") {
        let re = null;
        try {
          re = new RegExp(s.pattern, "u");
        } catch (e) {
          out.push({ path, message: "The schema pattern " + Q1 + s.pattern + Q2 + " is not a valid regular expression" });
        }
        if (re && !re.test(v)) out.push({ path, message: "Doesn't match the pattern " + s.pattern });
      }
      if (typeof s.format === "string" && FORMATS[s.format] && !FORMATS[s.format](v)) out.push({ path, message: "Not a valid " + FORMAT_NAMES[s.format] });
    }

    if (Array.isArray(v)) {
      if (typeof s.minItems === "number" && v.length < s.minItems) out.push({ path, message: "Must have at least " + s.minItems + (s.minItems === 1 ? " item" : " items") });
      if (typeof s.maxItems === "number" && v.length > s.maxItems) out.push({ path, message: "Must have at most " + s.maxItems + (s.maxItems === 1 ? " item" : " items") });
      let start = 0;
      const tuple = Array.isArray(s.prefixItems) ? s.prefixItems : Array.isArray(s.items) ? s.items : null;
      if (tuple) {
        tuple.forEach((sub, i) => {
          if (i < v.length) check(v[i], sub, pathJoin(path, i), out, depth + 1);
        });
        start = tuple.length;
      }
      const rest = Array.isArray(s.items) ? s.additionalItems : s.items;
      if (rest !== undefined && !(Array.isArray(s.items) && Array.isArray(s.prefixItems))) {
        for (let i = start; i < v.length; i++) {
          if (rest === false) {
            out.push({ path: pathJoin(path, i), message: "No more than " + start + (start === 1 ? " item is" : " items are") + " allowed" });
            break;
          }
          check(v[i], rest, pathJoin(path, i), out, depth + 1);
        }
      }
      if (s.uniqueItems === true) {
        outer: for (let i = 0; i < v.length; i++) {
          for (let j = i + 1; j < v.length; j++) {
            if (deepEqual(v[i], v[j])) {
              out.push({ path, message: "Items must be unique, but items " + i + " and " + j + " are equal" });
              break outer;
            }
          }
        }
      }
      if (s.contains !== undefined) {
        const hits = v.filter((x) => {
          const tmp = [];
          check(x, s.contains, path, tmp, depth + 1);
          return !tmp.length;
        }).length;
        const min = typeof s.minContains === "number" ? s.minContains : 1;
        if (hits < min) out.push({ path, message: min === 1 ? "Must contain at least one item that matches the contains schema" : "Must contain at least " + min + " matching items" });
        if (typeof s.maxContains === "number" && hits > s.maxContains) out.push({ path, message: "Must contain at most " + s.maxContains + " matching items" });
      }
    }

    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      const keys = Object.keys(v);
      if (Array.isArray(s.required)) {
        for (const k of s.required) if (!Object.prototype.hasOwnProperty.call(v, k)) out.push({ path, message: "Missing required property " + Q1 + k + Q2 });
      }
      if (typeof s.minProperties === "number" && keys.length < s.minProperties) out.push({ path, message: "Must have at least " + s.minProperties + (s.minProperties === 1 ? " property" : " properties") });
      if (typeof s.maxProperties === "number" && keys.length > s.maxProperties) out.push({ path, message: "Must have at most " + s.maxProperties + (s.maxProperties === 1 ? " property" : " properties") });
      const props = s.properties && typeof s.properties === "object" ? s.properties : {};
      const pats = s.patternProperties && typeof s.patternProperties === "object" ? Object.entries(s.patternProperties).map(([p, sub]) => {
        try {
          return [new RegExp(p, "u"), sub];
        } catch (e) {
          return [null, sub];
        }
      }) : [];
      for (const k of keys) {
        const at = pathJoin(path, k);
        let known = false;
        if (Object.prototype.hasOwnProperty.call(props, k)) {
          known = true;
          check(v[k], props[k], at, out, depth + 1);
        }
        for (const [re, sub] of pats) {
          if (re && re.test(k)) {
            known = true;
            check(v[k], sub, at, out, depth + 1);
          }
        }
        if (!known && s.additionalProperties !== undefined) {
          if (s.additionalProperties === false) out.push({ path: at, message: "Property " + Q1 + k + Q2 + " is not allowed" });
          else check(v[k], s.additionalProperties, at, out, depth + 1);
        }
        if (s.propertyNames !== undefined) {
          const tmp = [];
          check(k, s.propertyNames, at, tmp, depth + 1);
          if (tmp.length) out.push({ path: at, message: "Property name " + Q1 + k + Q2 + " is not allowed: " + tmp[0].message.charAt(0).toLowerCase() + tmp[0].message.slice(1) });
        }
      }
      const deps = s.dependentRequired || (s.dependencies && typeof s.dependencies === "object" ? s.dependencies : null);
      if (deps) {
        for (const [k, need] of Object.entries(deps)) {
          if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
          if (Array.isArray(need)) {
            for (const n of need) if (!Object.prototype.hasOwnProperty.call(v, n)) out.push({ path, message: "Property " + Q1 + k + Q2 + " requires " + Q1 + n + Q2 });
          } else if (need && typeof need === "object") check(v, need, path, out, depth + 1);
        }
      }
      if (s.dependentSchemas) {
        for (const [k, sub] of Object.entries(s.dependentSchemas)) if (Object.prototype.hasOwnProperty.call(v, k)) check(v, sub, path, out, depth + 1);
      }
    }

    if (Array.isArray(s.allOf)) for (const sub of s.allOf) check(v, sub, path, out, depth + 1);
    if (Array.isArray(s.anyOf)) {
      const tries = s.anyOf.map((sub) => {
        const tmp = [];
        check(v, sub, path, tmp, depth + 1);
        return tmp;
      });
      if (!tries.some((t) => !t.length)) {
        const best = tries.reduce((a, b) => (b.length < a.length ? b : a));
        out.push({ path, message: "Doesn't match any of the anyOf options" + (best.length === 1 && tries.length === 1 ? ": " + best[0].message : "") });
      }
    }
    if (Array.isArray(s.oneOf)) {
      const ok = s.oneOf.filter((sub) => {
        const tmp = [];
        check(v, sub, path, tmp, depth + 1);
        return !tmp.length;
      }).length;
      if (ok === 0) out.push({ path, message: "Doesn't match any of the oneOf options" });
      else if (ok > 1) out.push({ path, message: "Matches " + ok + " of the oneOf options, but exactly one is allowed" });
    }
    if (s.not !== undefined) {
      const tmp = [];
      check(v, s.not, path, tmp, depth + 1);
      if (!tmp.length) out.push({ path, message: "Must not match the schema in not" });
    }
    if (s.if !== undefined) {
      const tmp = [];
      check(v, s.if, path, tmp, depth + 1);
      if (!tmp.length) {
        if (s.then !== undefined) check(v, s.then, path, out, depth + 1);
      } else if (s.else !== undefined) check(v, s.else, path, out, depth + 1);
    }
  }

  check(data, schema, "$", errors, 0);
  return errors;
}

function parseFilter(src) {
  let i = 0;
  const err = (m) => {
    throw new Error("Filter: " + m);
  };
  const ws = () => {
    while (src[i] === " " || src[i] === "\t") i++;
  };
  function relPath() {
    const segs = [];
    for (;;) {
      if (src[i] === "." && src[i + 1] !== ".") {
        i++;
        const m = /^[A-Za-z_$][\w$-]*/.exec(src.slice(i));
        if (!m) err("expected a name after the dot");
        segs.push(m[0]);
        i += m[0].length;
      } else if (src[i] === "[") {
        i++;
        ws();
        if (src[i] === "'" || src[i] === '"') segs.push(str());
        else {
          const m = /^-?\d+/.exec(src.slice(i));
          if (!m) err("expected an index or quoted name inside [ ]");
          segs.push(+m[0]);
          i += m[0].length;
        }
        ws();
        if (src[i] !== "]") err("expected ]");
        i++;
      } else break;
    }
    return segs;
  }
  function str() {
    const q = src[i++];
    let out = "";
    while (i < src.length && src[i] !== q) {
      if (src[i] === "\\" && i + 1 < src.length) {
        out += src[i + 1];
        i += 2;
      } else out += src[i++];
    }
    if (src[i] !== q) err("unterminated string");
    i++;
    return out;
  }
  function operand() {
    ws();
    const c = src[i];
    if (c === "@" || c === "$") {
      i++;
      return { k: c === "@" ? "cur" : "root", segs: relPath() };
    }
    if (c === "'" || c === '"') return { k: "lit", v: str() };
    if (c === "/") {
      const m = /^\/((?:\\.|[^/\\])+)\/([a-z]*)/.exec(src.slice(i));
      if (!m) err("bad regular expression");
      i += m[0].length;
      try {
        return { k: "lit", v: new RegExp(m[1], m[2]) };
      } catch (e) {
        err("bad regular expression");
      }
    }
    const num = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) {
      i += num[0].length;
      return { k: "lit", v: +num[0] };
    }
    for (const [w, v] of [["true", true], ["false", false], ["null", null]]) {
      if (src.startsWith(w, i)) {
        i += w.length;
        return { k: "lit", v };
      }
    }
    err("unexpected " + (i < src.length ? Q1 + src[i] + Q2 : "end of filter"));
  }
  function comparison() {
    const left = operand();
    ws();
    const m = /^(==|!=|<=|>=|<|>|=~)/.exec(src.slice(i));
    if (!m) return { k: "exists", left };
    i += m[0].length;
    const right = operand();
    return { k: "cmp", op: m[0], left, right };
  }
  function unary() {
    ws();
    if (src[i] === "!" && src[i + 1] !== "=") {
      i++;
      return { k: "not", a: unary() };
    }
    if (src[i] === "(") {
      i++;
      const e = or();
      ws();
      if (src[i] !== ")") err("missing )");
      i++;
      return e;
    }
    return comparison();
  }
  function and() {
    let a = unary();
    for (;;) {
      ws();
      if (!src.startsWith("&&", i)) return a;
      i += 2;
      a = { k: "and", a, b: unary() };
    }
  }
  function or() {
    let a = and();
    for (;;) {
      ws();
      if (!src.startsWith("||", i)) return a;
      i += 2;
      a = { k: "or", a, b: and() };
    }
  }
  const tree = or();
  ws();
  if (i < src.length) err("unexpected " + Q1 + src.slice(i, i + 10) + Q2);
  return tree;
}

const MISSING = Symbol("missing");

function walkRel(v, segs) {
  for (const s of segs) {
    if (v === null || typeof v !== "object") {
      if (s === "length" && typeof v === "string") {
        v = v.length;
        continue;
      }
      return MISSING;
    }
    if (Array.isArray(v)) {
      if (s === "length") v = v.length;
      else if (typeof s === "number") {
        const idx = s < 0 ? v.length + s : s;
        if (idx < 0 || idx >= v.length) return MISSING;
        v = v[idx];
      } else return MISSING;
    } else {
      if (!Object.prototype.hasOwnProperty.call(v, s)) return MISSING;
      v = v[s];
    }
  }
  return v;
}

function evalFilter(t, cur, root) {
  const val = (o) => (o.k === "lit" ? o.v : walkRel(o.k === "cur" ? cur : root, o.segs));
  switch (t.k) {
    case "exists": {
      const v = val(t.left);
      return t.left.k === "lit" ? !!v : v !== MISSING;
    }
    case "not":
      return !evalFilter(t.a, cur, root);
    case "and":
      return evalFilter(t.a, cur, root) && evalFilter(t.b, cur, root);
    case "or":
      return evalFilter(t.a, cur, root) || evalFilter(t.b, cur, root);
    case "cmp": {
      const a = val(t.left);
      const b = val(t.right);
      if (t.op === "=~") return a !== MISSING && b instanceof RegExp && typeof a === "string" && b.test(a);
      if (t.op === "==") return a !== MISSING && b !== MISSING && deepEqual(a, b);
      if (t.op === "!=") return !(a !== MISSING && b !== MISSING && deepEqual(a, b));
      if (a === MISSING || b === MISSING) return false;
      if (!((typeof a === "number" && typeof b === "number") || (typeof a === "string" && typeof b === "string"))) return false;
      if (t.op === "<") return a < b;
      if (t.op === "<=") return a <= b;
      if (t.op === ">") return a > b;
      return a >= b;
    }
  }
  return false;
}

function findClose(expr, i) {
  let depth = 0;
  let q = null;
  for (; i < expr.length; i++) {
    const c = expr[i];
    if (q) {
      if (c === "\\") i++;
      else if (c === q) q = null;
      continue;
    }
    if (c === "'" || c === '"') q = c;
    else if (c === "[" || c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "]") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

export function parseJsonPath(input) {
  let expr = String(input).trim();
  if (!expr) throw new Error("Type a path such as $.store.book[*].title");
  if (expr[0] !== "$") expr = expr[0] === "." || expr[0] === "[" ? "$" + expr : "$." + expr;
  const segs = [];
  let i = 1;
  const nameAt = () => {
    const m = /^[A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF-]*/.exec(expr.slice(i));
    return m ? m[0] : null;
  };
  while (i < expr.length) {
    const c = expr[i];
    if (c === " ") {
      i++;
      continue;
    }
    let desc = false;
    if (expr.startsWith("..", i)) {
      desc = true;
      i += 2;
    } else if (c === ".") i++;
    else if (c !== "[") throw new Error("Unexpected " + Q1 + c + Q2 + " at position " + (i + 1));
    if (expr[i] === "[") {
      const end = findClose(expr, i + 1);
      if (end < 0) throw new Error("Missing ] for the bracket at position " + (i + 1));
      segs.push({ desc, sel: parseBracket(expr.slice(i + 1, end), i + 2) });
      i = end + 1;
    } else if (expr[i] === "*") {
      segs.push({ desc, sel: [{ k: "wild" }] });
      i++;
    } else {
      const n = nameAt();
      if (!n) throw new Error("Expected a name or * at position " + (i + 1));
      segs.push({ desc, sel: [{ k: "name", v: n }] });
      i += n.length;
    }
  }
  return segs;
}

function parseBracket(body, at) {
  const parts = [];
  let i = 0;
  const b = body;
  while (i < b.length) {
    while (b[i] === " ") i++;
    if (b[i] === "?") {
      i++;
      while (b[i] === " ") i++;
      let src = b.slice(i).trim();
      if (src.startsWith("(")) {
        let depth = 0;
        let end = -1;
        let q = null;
        for (let j = 0; j < src.length; j++) {
          const c = src[j];
          if (q) {
            if (c === "\\") j++;
            else if (c === q) q = null;
            continue;
          }
          if (c === "'" || c === '"') q = c;
          else if (c === "(") depth++;
          else if (c === ")" && --depth === 0) {
            end = j;
            break;
          }
        }
        if (end === src.length - 1) src = src.slice(1, -1);
      }
      parts.push({ k: "filter", tree: parseFilter(src) });
      return parts;
    }
    if (b[i] === "'" || b[i] === '"') {
      const q = b[i++];
      let s = "";
      while (i < b.length && b[i] !== q) {
        if (b[i] === "\\") {
          s += b[i + 1];
          i += 2;
        } else s += b[i++];
      }
      if (b[i] !== q) throw new Error("Unterminated string inside [ ] at position " + at);
      i++;
      parts.push({ k: "name", v: s });
    } else if (b[i] === "*") {
      parts.push({ k: "wild" });
      i++;
    } else {
      const m = /^(-?\d*)\s*(?::\s*(-?\d*)\s*(?::\s*(-?\d*))?)?/.exec(b.slice(i));
      if (!m || !m[0].trim()) throw new Error("Can't read " + Q1 + b.slice(i) + Q2 + " inside [ ]");
      if (m[0].includes(":")) {
        parts.push({ k: "slice", start: m[1] === "" ? null : +m[1], end: m[2] === "" || m[2] === undefined ? null : +m[2], step: m[3] === "" || m[3] === undefined ? 1 : +m[3] });
      } else parts.push({ k: "index", v: +m[1] });
      i += m[0].length;
    }
    while (b[i] === " ") i++;
    if (i < b.length) {
      if (b[i] !== ",") throw new Error("Expected , between items inside [ ]");
      i++;
    }
  }
  if (!parts.length) throw new Error("Empty [ ] at position " + at);
  return parts;
}

function children(node) {
  const v = node.value;
  if (Array.isArray(v)) return v.map((x, i) => ({ path: pathJoin(node.path, i), value: x }));
  if (v !== null && typeof v === "object") return Object.keys(v).map((k) => ({ path: pathJoin(node.path, k), value: v[k] }));
  return [];
}

function applySel(node, sel, root, out) {
  const v = node.value;
  if (sel.k === "wild") {
    out.push(...children(node));
  } else if (sel.k === "name") {
    if (v !== null && typeof v === "object" && !Array.isArray(v) && Object.prototype.hasOwnProperty.call(v, sel.v)) out.push({ path: pathJoin(node.path, sel.v), value: v[sel.v] });
    else if (Array.isArray(v) && sel.v === "length") out.push({ path: node.path + ".length", value: v.length });
  } else if (sel.k === "index") {
    if (Array.isArray(v)) {
      const idx = sel.v < 0 ? v.length + sel.v : sel.v;
      if (idx >= 0 && idx < v.length) out.push({ path: pathJoin(node.path, idx), value: v[idx] });
    }
  } else if (sel.k === "slice") {
    if (!Array.isArray(v) || sel.step === 0) return;
    const n = v.length;
    const norm = (x, d) => (x === null ? d : x < 0 ? Math.max(n + x, sel.step > 0 ? 0 : -1) : Math.min(x, n));
    if (sel.step > 0) {
      for (let i = norm(sel.start, 0); i < norm(sel.end, n); i += sel.step) out.push({ path: pathJoin(node.path, i), value: v[i] });
    } else {
      for (let i = sel.start === null ? n - 1 : Math.min(norm(sel.start, n - 1), n - 1); i > (sel.end === null ? -1 : norm(sel.end, -1)); i += sel.step) out.push({ path: pathJoin(node.path, i), value: v[i] });
    }
  } else if (sel.k === "filter") {
    for (const c of children(node)) if (evalFilter(sel.tree, c.value, root)) out.push(c);
  }
}

export function queryJsonPath(data, expr, limit = 100000) {
  const segs = parseJsonPath(expr);
  let nodes = [{ path: "$", value: data }];
  for (const seg of segs) {
    let pool = nodes;
    if (seg.desc) {
      pool = [];
      const stack = [...nodes].reverse();
      while (stack.length) {
        const n = stack.pop();
        pool.push(n);
        if (pool.length > limit) throw new Error("Too many matches to show");
        const kids = children(n);
        for (let k = kids.length - 1; k >= 0; k--) stack.push(kids[k]);
      }
    }
    const next = [];
    for (const n of pool) for (const sel of seg.sel) applySel(n, sel, data, next);
    if (next.length > limit) throw new Error("Too many matches to show");
    nodes = next;
  }
  return nodes;
}

function hashSeed(s) {
  const str = String(s);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

export function makeRng(seed) {
  let a = hashSeed(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(next() * arr.length)];
  return { next, int, pick };
}

const FIRST = ["Olivia", "Liam", "Amara", "Noah", "Sofia", "Mateo", "Priya", "Lucas", "Yuki", "Ethan", "Zara", "Omar", "Chloe", "Diego", "Hannah", "Kenji", "Isla", "Arjun", "Maya", "Leo", "Fatima", "Jonas", "Elena", "Samuel", "Aisha", "Felix", "Grace", "Ravi", "Nora", "Hugo", "Lina", "Theo", "Mei", "Oscar", "Ines", "Kwame", "Freya", "Tomas", "Leila", "Daniel"];
const LAST = ["Nguyen", "Garcia", "Smith", "Kowalski", "Okafor", "Silva", "Tanaka", "Martin", "Patel", "Johansson", "Rossi", "Kim", "Murphy", "Dubois", "Haddad", "Novak", "Fischer", "Lopez", "Brown", "Mensah", "Cohen", "Sato", "Andersen", "Moreau", "Ivanova", "Walker", "Costa", "Reyes", "Schmidt", "Ali", "Bennett", "Larsen", "Chen", "Hughes", "Ortiz", "Baker", "Yilmaz", "Clarke", "Sousa", "Wright"];
const CITIES = [["Lisbon", "Portugal", "PT"], ["Toronto", "Canada", "CA"], ["Osaka", "Japan", "JP"], ["Austin", "United States", "US"], ["Lyon", "France", "FR"], ["Melbourne", "Australia", "AU"], ["Nairobi", "Kenya", "KE"], ["Hamburg", "Germany", "DE"], ["Bogota", "Colombia", "CO"], ["Dublin", "Ireland", "IE"], ["Seoul", "South Korea", "KR"], ["Krakow", "Poland", "PL"], ["Porto Alegre", "Brazil", "BR"], ["Manchester", "United Kingdom", "GB"], ["Pune", "India", "IN"], ["Oslo", "Norway", "NO"], ["Valencia", "Spain", "ES"], ["Denver", "United States", "US"], ["Auckland", "New Zealand", "NZ"], ["Accra", "Ghana", "GH"]];
const STREETS = ["Maple Street", "Harbor Road", "Oak Avenue", "Station Lane", "Mill Road", "Cedar Drive", "Park Terrace", "River Walk", "Elm Court", "Hillside Way", "Bridge Street", "Garden Row"];
const COMPANY_A = ["North", "Blue", "Bright", "Copper", "Silver", "Green", "Summit", "Harbor", "Pine", "Atlas", "Lumen", "Cobalt", "Willow", "Granite", "Swift"];
const COMPANY_B = ["Labs", "Works", "Systems", "Studio", "Logistics", "Foods", "Health", "Analytics", "Supply", "Media", "Energy", "Partners", "Robotics", "Goods", "Cloud"];
const JOBS = ["Software Engineer", "Product Manager", "Data Analyst", "Designer", "Account Manager", "Support Specialist", "Marketing Lead", "Operations Manager", "QA Engineer", "Sales Representative", "Nurse", "Teacher", "Accountant", "Copywriter", "DevOps Engineer"];
const WORDS = ["quick", "simple", "fresh", "quiet", "bright", "solid", "handy", "light", "smart", "steady", "modern", "classic", "warm", "clear", "bold", "compact", "daily", "honest", "local", "gentle"];
const NOUNS = ["lamp", "notebook", "backpack", "kettle", "chair", "bottle", "jacket", "speaker", "planner", "mug", "blanket", "charger", "desk", "garden kit", "headphones", "bike light", "cookbook", "sneakers", "wallet", "tea set"];
const SENT = ["the", "team", "shipped", "a", "new", "update", "for", "our", "customers", "every", "order", "arrives", "on", "time", "with", "care", "and", "clear", "notes", "about", "next", "steps", "this", "week", "we", "plan", "to", "improve", "search", "results", "users", "love", "fast", "pages", "simple", "tools", "that", "just", "work", "today"];
const STATUS = ["active", "pending", "inactive", "archived"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "JPY", "AUD"];
const TAGS = ["new", "sale", "popular", "eco", "limited", "gift", "featured", "bundle"];
const LANGS = ["en", "fr", "es", "de", "pt", "ja", "it", "nl"];
const DOMAINS = ["example.com", "example.org", "example.net"];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

function uuid(r) {
  const h = (n) => Array.from({ length: n }, () => r.int(0, 15).toString(16)).join("");
  return h(8) + "-" + h(4) + "-4" + h(3) + "-" + "89ab"[r.int(0, 3)] + h(3) + "-" + h(12);
}

function dateParts(r) {
  const t = Date.UTC(2019, 0, 1) + Math.floor(r.next() * (Date.UTC(2026, 9, 1) - Date.UTC(2019, 0, 1)));
  return new Date(t);
}

function isoDate(d) {
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}

function isoDateTime(d) {
  return isoDate(d) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "Z";
}

function sentence(r, min = 6, max = 12) {
  const n = r.int(min, max);
  const w = Array.from({ length: n }, () => r.pick(SENT));
  const s = w.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function person(ctx) {
  if (!ctx.person) {
    const r = ctx.r;
    const first = r.pick(FIRST);
    const last = r.pick(LAST);
    const place = r.pick(CITIES);
    ctx.person = { first, last, place, handle: (first + "." + last).toLowerCase() + (r.next() < 0.5 ? r.int(1, 99) : "") };
  }
  return ctx.person;
}

function norm(key) {
  return String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isIdKey(key) {
  const k = String(key || "");
  return /^id$/i.test(k) || /[_-]id$/i.test(k) || /[a-z0-9](Id|ID)$/.test(k);
}

const NUMBER_KEYS = /^age$|(user|person|customer|patient|member)age$|rating|stars|score|percent|progress|year|month|day|hour|minute|second|qty|quantity|count|stock|units|salary|income|price|amount|cost|total|balance|fee|^lat|latitude|^lng|^lon|longitude|weight|discount/;

function stringFor(key, format, ctx) {
  const r = ctx.r;
  const k = norm(key);
  const f = format || "";
  if (f === "email" || f === "idn-email" || /email/.test(k)) {
    const p = person(ctx);
    return p.handle + "@" + DOMAINS[(p.first.length + p.last.length) % DOMAINS.length];
  }
  if (f === "uuid" || /uuid|guid/.test(k)) return uuid(r);
  if (f === "date-time") return isoDateTime(dateParts(r));
  if (f === "date") return isoDate(dateParts(r));
  if (f === "time") return pad(r.int(0, 23)) + ":" + pad(r.int(0, 59)) + ":" + pad(r.int(0, 59));
  if (f === "ipv4" || k === "ip" || /ipaddress|ipv4/.test(k)) return r.pick(["192.0.2.", "198.51.100.", "203.0.113."]) + r.int(1, 254);
  if (f === "ipv6") return "2001:db8::" + r.int(1, 65535).toString(16);
  if (f === "hostname" || /hostname|domain/.test(k)) return slugify(r.pick(COMPANY_A) + r.pick(COMPANY_B)) + "." + r.pick(DOMAINS);
  if (/avatar|image|photo|picture|thumbnail/.test(k)) return "https://" + r.pick(DOMAINS) + "/images/" + r.int(1000, 9999) + ".jpg";
  if (f === "uri" || f === "url" || f === "uri-reference" || /url|website|homepage|link|href/.test(k)) return "https://" + r.pick(DOMAINS) + "/" + slugify(r.pick(WORDS) + " " + r.pick(NOUNS));
  if (/^(createdat|updatedat|deletedat|modifiedat|publishedat|timestamp|lastlogin|lastseen)$/.test(k) || (/(at|time|timestamp)$/.test(k) && !/(format|seat|cat|lat|flat|chat|boat|stat|heat|beat|threat)$/.test(k))) return isoDateTime(dateParts(r));
  if (/date|birthday|dob|since|expires|expiry|duedate/.test(k)) return isoDate(dateParts(r));
  if (/^(id|key|ref|reference|sku|code)$/.test(k) || isIdKey(key)) {
    if (/sku|code/.test(k)) return r.pick(["A", "B", "C", "K", "M", "T"]) + r.pick(["X", "R", "L", "P"]) + "-" + r.int(1000, 9999);
    return uuid(r);
  }
  if (/firstname|givenname|forename/.test(k)) return person(ctx).first;
  if (/lastname|surname|familyname/.test(k)) return person(ctx).last;
  if (/username|login|handle|nickname/.test(k)) return person(ctx).handle;
  if (/^(name|fullname|displayname|customer|customername|author|owner|contact|contactname|user)$/.test(k)) {
    const p = person(ctx);
    return p.first + " " + p.last;
  }
  if (/phone|mobile|tel|fax/.test(k)) return "+1 555-01" + pad(r.int(0, 99));
  if (/countrycode/.test(k)) return person(ctx).place[2];
  if (/country|nation/.test(k)) return person(ctx).place[1];
  if (/city|town/.test(k)) return person(ctx).place[0];
  if (/zip|postcode|postalcode/.test(k)) return String(r.int(10000, 99999));
  if (/address|street/.test(k)) return r.int(1, 999) + " " + r.pick(STREETS);
  if (/company|organization|organisation|employer|business|brand|vendor|supplier/.test(k)) return r.pick(COMPANY_A) + " " + r.pick(COMPANY_B);
  if (/jobtitle|role|position|occupation|job/.test(k)) return r.pick(JOBS);
  if (/product|item|title|subject|headline/.test(k)) {
    const s = r.pick(WORDS) + " " + r.pick(NOUNS);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  if (/slug/.test(k)) return slugify(r.pick(WORDS) + " " + r.pick(NOUNS));
  if (/description|bio|summary|notes?|comment|body|message|content|text|about|details/.test(k)) return sentence(r);
  if (/colou?r/.test(k)) return "#" + r.int(0, 0xffffff).toString(16).padStart(6, "0");
  if (/currency/.test(k)) return r.pick(CURRENCIES);
  if (/status|state/.test(k)) return r.pick(STATUS);
  if (/lang|locale/.test(k)) return r.pick(LANGS);
  if (/tag|category|label|type|kind/.test(k)) return r.pick(TAGS);
  if (/password|secret|token/.test(k)) return Array.from({ length: 16 }, () => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[r.int(0, 55)]).join("");
  return null;
}

function numberFor(key, ctx, integer, lo, hi) {
  const r = ctx.r;
  const k = norm(key);
  let min = lo;
  let max = hi;
  let dec = integer ? 0 : 2;
  if (min === undefined || max === undefined) {
    let dmin = 0;
    let dmax = 1000;
    if (isIdKey(key) && integer) return ctx.index + 1;
    if (/^age$|(user|person|customer|patient|member)age$/.test(k)) [dmin, dmax] = [18, 80];
    else if (/rating|stars/.test(k)) [dmin, dmax, dec] = integer ? [1, 5, 0] : [1, 5, 1];
    else if (/score|percent|progress/.test(k)) [dmin, dmax] = [0, 100];
    else if (/year/.test(k)) [dmin, dmax] = [1990, 2026];
    else if (/month/.test(k)) [dmin, dmax] = [1, 12];
    else if (/day/.test(k)) [dmin, dmax] = [1, 28];
    else if (/hour/.test(k)) [dmin, dmax] = [0, 23];
    else if (/minute|second/.test(k)) [dmin, dmax] = [0, 59];
    else if (/qty|quantity|count|stock|items|units/.test(k)) [dmin, dmax] = [1, 50];
    else if (/salary|income/.test(k)) [dmin, dmax] = [32000, 180000];
    else if (/price|amount|cost|total|balance|fee|subtotal/.test(k)) [dmin, dmax] = [1, 500];
    else if (/lat/.test(k)) [dmin, dmax, dec] = [-60, 70, 5];
    else if (/lng|lon/.test(k)) [dmin, dmax, dec] = [-170, 170, 5];
    else if (/weight/.test(k)) [dmin, dmax] = [1, 120];
    else if (/discount/.test(k)) [dmin, dmax] = [0, 50];
    if (min === undefined && max === undefined) {
      min = dmin;
      max = dmax;
    } else if (min === undefined) min = Math.min(dmin, max);
    else max = Math.max(dmax, min);
    if (max < min) max = min;
  }
  if (integer) return r.int(Math.ceil(min), Math.floor(max));
  const f = Math.pow(10, dec);
  return Math.min(max, Math.max(min, Math.round((min + r.next() * (max - min)) * f) / f));
}

function boolFor(key, ctx) {
  const k = norm(key);
  const p = /deleted|archived|banned|blocked|disabled/.test(k) ? 0.15 : /active|enabled|verified|available|instock|published/.test(k) ? 0.8 : 0.5;
  return ctx.r.next() < p;
}

function fromPattern(pattern, r) {
  let src = pattern.replace(/^\^/, "").replace(/\$$/, "");
  let out = "";
  let i = 0;
  const classes = { d: "0123456789", w: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_", s: " " };
  while (i < src.length) {
    let set = null;
    const c = src[i];
    if (c === "[") {
      const end = src.indexOf("]", i + 1);
      if (end < 0) return null;
      const body = src.slice(i + 1, end);
      if (body.startsWith("^")) return null;
      set = "";
      for (let j = 0; j < body.length; j++) {
        if (body[j] === "\\" && classes[body[j + 1]]) {
          set += classes[body[j + 1]];
          j++;
        } else if (body[j + 1] === "-" && j + 2 < body.length) {
          for (let x = body.charCodeAt(j); x <= body.charCodeAt(j + 2); x++) set += String.fromCharCode(x);
          j += 2;
        } else set += body[j];
      }
      i = end + 1;
    } else if (c === "\\") {
      const n = src[i + 1];
      set = classes[n] || n;
      i += 2;
    } else if (c === "(" || c === ")" || c === "|" || c === "*" || c === "+" || c === "?" || c === "{") {
      return null;
    } else if (c === ".") {
      set = classes.w;
      i++;
    } else {
      set = c;
      i++;
    }
    let lo = 1;
    let hi = 1;
    const q = /^(\{(\d+)(,(\d*))?\}|\?|\+|\*)/.exec(src.slice(i));
    if (q) {
      if (q[0] === "?") [lo, hi] = [0, 1];
      else if (q[0] === "+") [lo, hi] = [1, 4];
      else if (q[0] === "*") [lo, hi] = [0, 4];
      else {
        lo = +q[2];
        hi = q[3] === undefined ? lo : q[4] === "" ? lo + 4 : +q[4];
      }
      i += q[0].length;
    }
    const n = r.int(lo, Math.min(hi, lo + 50));
    for (let k = 0; k < n; k++) out += set.length === 1 ? set : set[r.int(0, set.length - 1)];
  }
  try {
    return new RegExp(pattern, "u").test(out) ? out : null;
  } catch (e) {
    return null;
  }
}

function mergeAllOf(s, root) {
  const out = { ...s };
  delete out.allOf;
  for (let sub of s.allOf) {
    if (sub && sub.$ref) sub = resolvePointer(root, sub.$ref) || {};
    if (!sub || typeof sub !== "object") continue;
    for (const [k, v] of Object.entries(sub)) {
      if (k === "properties") out.properties = { ...(out.properties || {}), ...v };
      else if (k === "required") out.required = [...new Set([...(out.required || []), ...v])];
      else if (!(k in out)) out[k] = v;
    }
  }
  return out;
}

function guessType(s) {
  if (s.type) return Array.isArray(s.type) ? s.type.find((t) => t !== "null") || "null" : s.type;
  if (s.properties || s.additionalProperties || s.required) return "object";
  if (s.items || s.prefixItems) return "array";
  if (s.minimum !== undefined || s.maximum !== undefined || s.multipleOf !== undefined) return "number";
  if (s.minLength !== undefined || s.pattern || s.format) return "string";
  return "string";
}

function genSchema(s, key, ctx, depth) {
  const r = ctx.r;
  if (s === true || s === undefined || s === null) return stringFor(key, "", ctx) ?? r.pick(WORDS);
  if (s === false) return null;
  if (depth > 12) return null;
  if (s.$ref) {
    const t = resolvePointer(ctx.root, s.$ref);
    if (t === undefined) throw new Error("Can't resolve $ref " + Q1 + s.$ref + Q2 + " (only local refs like #/$defs/name work)");
    const rest = { ...s };
    delete rest.$ref;
    return genSchema(Object.keys(rest).length ? { ...t, ...rest } : t, key, ctx, depth + 1);
  }
  if (s.allOf) return genSchema(mergeAllOf(s, ctx.root), key, ctx, depth + 1);
  if ("const" in s) return s.const;
  if (Array.isArray(s.enum) && s.enum.length) return r.pick(s.enum);
  if (Array.isArray(s.examples) && s.examples.length && r.next() < 0.3) return r.pick(s.examples);
  const alts = s.oneOf || s.anyOf;
  if (Array.isArray(alts) && alts.length) {
    const base = { ...s };
    delete base.oneOf;
    delete base.anyOf;
    const pick = r.pick(alts);
    return genSchema(pick && typeof pick === "object" ? { ...base, ...pick } : pick, key, ctx, depth + 1);
  }
  const type = guessType(s);
  if (type === "null") return null;
  if (type === "boolean") return boolFor(key, ctx);
  if (type === "integer" || type === "number") {
    let lo = typeof s.minimum === "number" ? s.minimum : typeof s.exclusiveMinimum === "number" ? s.exclusiveMinimum + (type === "integer" ? 1 : 0.01) : undefined;
    let hi = typeof s.maximum === "number" ? s.maximum : typeof s.exclusiveMaximum === "number" ? s.exclusiveMaximum - (type === "integer" ? 1 : 0.01) : undefined;
    let v = numberFor(key, ctx, type === "integer", lo, hi);
    if (typeof s.multipleOf === "number" && s.multipleOf > 0) {
      v = Math.round(v / s.multipleOf) * s.multipleOf;
      if (hi !== undefined && v > hi) v -= s.multipleOf;
      if (lo !== undefined && v < lo) v += s.multipleOf;
      v = +v.toFixed(10);
    }
    return v;
  }
  if (type === "array") {
    const min = typeof s.minItems === "number" ? s.minItems : 1;
    const max = typeof s.maxItems === "number" ? s.maxItems : Math.max(min, 3);
    const n = r.int(min, Math.max(min, Math.min(max, min + 4)));
    const tuple = s.prefixItems || (Array.isArray(s.items) ? s.items : null);
    const item = Array.isArray(s.items) ? s.additionalItems : s.items;
    const out = [];
    const singular = String(key || "").replace(/(ies)$/, "y").replace(/s$/, "");
    let guard = 0;
    while (out.length < (tuple ? Math.max(n, tuple.length) : n) && guard++ < n * 10) {
      const i = out.length;
      const sub = tuple && i < tuple.length ? tuple[i] : item;
      if (tuple && i >= tuple.length && (item === undefined || item === false)) break;
      const v = genSchema(sub === undefined ? { type: "string" } : sub, singular, { ...ctx, person: null, index: i }, depth + 1);
      if (s.uniqueItems && out.some((x) => deepEqual(x, v))) continue;
      out.push(v);
    }
    return out;
  }
  if (type === "object") {
    const out = {};
    const props = s.properties || {};
    const req = new Set(s.required || []);
    for (const [k, sub] of Object.entries(props)) {
      if (!req.has(k) && ctx.optional === "some" && r.next() < 0.2) continue;
      out[k] = genSchema(sub, k, ctx, depth + 1);
    }
    for (const k of req) if (!(k in out)) out[k] = genSchema(true, k, ctx, depth + 1);
    return out;
  }
  if (typeof s.pattern === "string") {
    const v = fromPattern(s.pattern, r);
    if (v !== null) return v;
  }
  let v = stringFor(key, s.format, ctx);
  if (v === null) v = s.maxLength !== undefined && s.maxLength < 12 ? r.pick(WORDS) : r.pick(WORDS) + " " + r.pick(NOUNS);
  if (typeof s.maxLength === "number" && v.length > s.maxLength) v = v.slice(0, s.maxLength);
  if (typeof s.minLength === "number") while (v.length < s.minLength) v += r.pick(SENT).slice(0, s.minLength - v.length);
  return v;
}

function detectFormat(v) {
  for (const f of ["uuid", "email", "date-time", "date", "time", "ipv4"]) if (FORMATS[f](v)) return f;
  if (/^https?:\/\//i.test(v)) return "uri";
  return undefined;
}

export function inferSchema(sample, key) {
  const t = typeOf(sample);
  if (t === "null") return { type: "null" };
  if (t === "boolean") return { type: "boolean" };
  if (t === "integer" || t === "number") {
    const s = { type: t };
    if (!isIdKey(key) && !NUMBER_KEYS.test(norm(key))) {
      const a = Math.abs(sample);
      s.minimum = sample < 0 ? -Math.max(10, a * 2) : 0;
      s.maximum = Math.max(10, a * 2);
    }
    return s;
  }
  if (t === "string") {
    const s = { type: "string" };
    const f = detectFormat(sample);
    if (f) s.format = f;
    else if (!/\s/.test(sample) && sample.length < 16) s.maxLength = Math.max(sample.length, 8);
    if (/^#[0-9a-f]{6}$/i.test(sample)) s.pattern = "^#[0-9a-f]{6}$";
    return s;
  }
  if (t === "array") {
    const s = { type: "array", minItems: Math.min(sample.length, 1), maxItems: Math.max(sample.length, 3) };
    if (sample.length) {
      const objs = sample.filter((x) => x !== null && typeof x === "object" && !Array.isArray(x));
      if (objs.length === sample.length) {
        const merged = {};
        for (const o of objs) for (const [k, v] of Object.entries(o)) if (!(k in merged)) merged[k] = v;
        s.items = inferSchema(merged, key);
      } else s.items = inferSchema(sample[0], key);
    }
    return s;
  }
  const props = {};
  for (const [k, v] of Object.entries(sample)) props[k] = inferSchema(v, k);
  return { type: "object", properties: props, required: Object.keys(props) };
}

export function mockFromSchema(schema, count = 10, seed = 1, opts = {}) {
  const r = makeRng(seed);
  const n = Math.max(0, Math.min(10000, Math.floor(count)));
  const out = [];
  let record = schema;
  if (record && typeof record === "object" && record.type === "array" && record.items && typeof record.items === "object" && !Array.isArray(record.items)) record = record.items;
  for (let i = 0; i < n; i++) out.push(genSchema(record, opts.key || "", { r, root: schema, index: i, person: null, optional: opts.optional || "all" }, 0));
  return out;
}

export function mockFromSample(sample, count = 10, seed = 1) {
  let shape = sample;
  if (Array.isArray(sample)) {
    if (!sample.length) throw new Error("The sample array is empty");
    const objs = sample.filter((x) => x !== null && typeof x === "object" && !Array.isArray(x));
    if (objs.length === sample.length) {
      shape = {};
      for (const o of objs) for (const [k, v] of Object.entries(o)) if (!(k in shape)) shape[k] = v;
    } else shape = sample[0];
  }
  const schema = inferSchema(shape, "");
  return mockFromSchema(schema, count, seed);
}

export function looksLikeSchema(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  if (v.$schema || v.$defs || v.definitions) return true;
  if (typeof v.type === "string" && ["object", "array", "string", "number", "integer", "boolean", "null"].includes(v.type) && (v.properties || v.items || Object.keys(v).length <= 4)) {
    if (v.properties && typeof v.properties === "object") return Object.values(v.properties).every((p) => p === true || p === false || (p && typeof p === "object" && !Array.isArray(p)));
    return true;
  }
  return false;
}

export function toCsv(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const cols = [];
  const flat = rows.map((r) => {
    const o = {};
    const walk = (v, p) => {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) for (const [k, x] of Object.entries(v)) walk(x, p ? p + "." + k : k);
      else o[p || "value"] = Array.isArray(v) ? JSON.stringify(v) : v;
    };
    walk(r, "");
    for (const k of Object.keys(o)) if (!cols.includes(k)) cols.push(k);
    return o;
  });
  const cell = (v) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.map(cell).join(","), ...flat.map((o) => cols.map((c) => cell(o[c])).join(","))].join("\n");
}
