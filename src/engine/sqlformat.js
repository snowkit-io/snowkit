const KEYWORDS = new Set(
  (
    "SELECT FROM WHERE AND OR NOT IN IS NULL LIKE ILIKE BETWEEN EXISTS AS ON USING JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL LATERAL APPLY " +
    "GROUP BY ORDER HAVING LIMIT OFFSET FETCH FIRST NEXT ROWS ROW ONLY UNION ALL INTERSECT EXCEPT MINUS DISTINCT INSERT INTO VALUES UPDATE SET " +
    "DELETE CREATE TABLE VIEW INDEX UNIQUE PRIMARY FOREIGN KEY REFERENCES CONSTRAINT DEFAULT CHECK ALTER ADD DROP COLUMN RENAME TO TRUNCATE IF " +
    "CASCADE RESTRICT WITH RECURSIVE CASE WHEN THEN ELSE END ASC DESC NULLS TRUE FALSE OVER PARTITION WINDOW RETURNING CONFLICT DO NOTHING " +
    "DUPLICATE TEMPORARY TEMP REPLACE MERGE MATCHED BEGIN COMMIT ROLLBACK TRANSACTION GRANT REVOKE AUTO_INCREMENT AUTOINCREMENT IDENTITY ANY SOME " +
    "QUALIFY FILTER WITHIN COLLATE ESCAPE SIMILAR INTERVAL TOP SCHEMA DATABASE TRIGGER PROCEDURE FUNCTION RETURNS LANGUAGE EXPLAIN ANALYZE " +
    "PRECEDING FOLLOWING UNBOUNDED RANGE FOR SHOW DESCRIBE USE EXEC EXECUTE DECLARE " +
    "COUNT SUM AVG MIN MAX COALESCE NULLIF CAST CONVERT UPPER LOWER LENGTH SUBSTRING SUBSTR TRIM ROUND NOW CURRENT_DATE CURRENT_TIMESTAMP " +
    "CURRENT_TIME EXTRACT ROW_NUMBER RANK DENSE_RANK LAG LEAD CONCAT IFNULL ISNULL NVL DATE_TRUNC STRING_AGG ARRAY_AGG GROUP_CONCAT ABS FLOOR CEIL " +
    "CEILING FIRST_VALUE LAST_VALUE NTILE GREATEST LEAST " +
    "INT INTEGER BIGINT SMALLINT TINYINT VARCHAR NVARCHAR CHAR TEXT BOOLEAN BOOL DECIMAL NUMERIC FLOAT DOUBLE REAL SERIAL BIGSERIAL TIMESTAMP " +
    "TIMESTAMPTZ JSONB BLOB PRECISION VARYING UNSIGNED"
  ).split(" ")
);

const FUNCLIKE = new Set(
  (
    "COUNT SUM AVG MIN MAX COALESCE NULLIF CAST CONVERT UPPER LOWER LENGTH SUBSTRING SUBSTR TRIM ROUND NOW EXTRACT ROW_NUMBER RANK DENSE_RANK LAG " +
    "LEAD CONCAT IFNULL ISNULL NVL DATE_TRUNC STRING_AGG ARRAY_AGG GROUP_CONCAT ABS FLOOR CEIL CEILING FIRST_VALUE LAST_VALUE NTILE GREATEST LEAST " +
    "INT INTEGER BIGINT SMALLINT TINYINT VARCHAR NVARCHAR CHAR DECIMAL NUMERIC FLOAT DOUBLE TIMESTAMP REPLACE LEFT RIGHT IF VALUES CURRENT_TIMESTAMP"
  ).split(" ")
);

const PHRASES = [
  ["ON DUPLICATE KEY UPDATE", "inline"],
  ["CREATE TABLE IF NOT EXISTS", "create"],
  ["CREATE TEMPORARY TABLE", "create"],
  ["CREATE TEMP TABLE", "create"],
  ["CREATE OR REPLACE VIEW", "inline"],
  ["IS NOT DISTINCT FROM", "plain"],
  ["WITHOUT TIME ZONE", "plain"],
  ["WITH TIME ZONE", "plain"],
  ["CREATE UNIQUE INDEX", "inline"],
  ["LEFT OUTER JOIN", "join"],
  ["RIGHT OUTER JOIN", "join"],
  ["FULL OUTER JOIN", "join"],
  ["IS DISTINCT FROM", "plain"],
  ["DROP TABLE IF EXISTS", "inline"],
  ["DO UPDATE SET", "clause"],
  ["SELECT DISTINCT", "clause"],
  ["WITH RECURSIVE", "with"],
  ["INSERT INTO", "inline"],
  ["INSERT IGNORE INTO", "inline"],
  ["REPLACE INTO", "inline"],
  ["MERGE INTO", "inline"],
  ["DELETE FROM", "inline"],
  ["GROUP BY", "clause"],
  ["ORDER BY", "clause"],
  ["UNION ALL", "setop"],
  ["UNION DISTINCT", "setop"],
  ["EXCEPT ALL", "setop"],
  ["INTERSECT ALL", "setop"],
  ["INNER JOIN", "join"],
  ["LEFT JOIN", "join"],
  ["RIGHT JOIN", "join"],
  ["FULL JOIN", "join"],
  ["CROSS JOIN", "join"],
  ["NATURAL JOIN", "join"],
  ["CROSS APPLY", "join"],
  ["OUTER APPLY", "join"],
  ["CREATE TABLE", "create"],
  ["CREATE VIEW", "inline"],
  ["CREATE INDEX", "inline"],
  ["ALTER TABLE", "inline"],
  ["DROP TABLE", "inline"],
  ["TRUNCATE TABLE", "inline"],
  ["ON CONFLICT", "inline"],
  ["DO NOTHING", "plain"],
  ["SELECT", "clause"],
  ["FROM", "clause"],
  ["WHERE", "clause"],
  ["HAVING", "clause"],
  ["VALUES", "values"],
  ["SET", "set"],
  ["RETURNING", "clause"],
  ["WINDOW", "clause"],
  ["QUALIFY", "clause"],
  ["LIMIT", "inline"],
  ["OFFSET", "inline"],
  ["FETCH", "inline"],
  ["UNION", "setop"],
  ["INTERSECT", "setop"],
  ["EXCEPT", "setop"],
  ["MINUS", "setop"],
  ["UPDATE", "stmt"],
  ["DELETE", "stmt"],
  ["INSERT", "stmt"],
  ["WITH", "with"],
  ["JOIN", "join"],
  ["CASE", "case"],
  ["WHEN", "when"],
  ["ELSE", "when"],
  ["END", "end"],
  ["AND", "and"],
  ["OR", "and"],
  ["BETWEEN", "between"],
]
  .map(([p, role]) => ({ words: p.split(" "), text: p, role }))
  .sort((a, b) => b.words.length - a.words.length);

const INDENTED = new Set(["SELECT", "SELECT DISTINCT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "VALUES", "SET", "DO UPDATE SET", "RETURNING", "WINDOW", "QUALIFY"]);
const TABLE_PARENS = new Set(["INSERT INTO", "INSERT IGNORE INTO", "INSERT", "REPLACE INTO", "MERGE INTO", "CREATE TABLE", "CREATE VIEW", "CREATE OR REPLACE VIEW", "WITH", "WITH RECURSIVE", "CREATE INDEX", "CREATE UNIQUE INDEX"]);
const INSERTS = new Set(["INSERT INTO", "INSERT IGNORE INTO", "INSERT", "REPLACE INTO"]);

const RULES = [
  ["ws", /\s+/y],
  ["comment", /--[^\n]*/y],
  ["comment", /\/\*[\s\S]*?(?:\*\/|$)/y],
  ["string", /[Ee]'(?:[^'\\]|\\[\s\S]|'')*'?/y],
  ["string", /(?:[NnBbXx]|[Uu]&)?'(?:[^']|'')*'?/y],
  ["string", /\$([A-Za-z_]\w*)?\$[\s\S]*?\$\1\$/y],
  ["qident", /"(?:[^"]|"")*"?/y],
  ["qident", /`(?:[^`]|``)*`?/y],
  ["qident", /\[[A-Za-z_ #$@][^\]\n]*\]/y],
  ["number", /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/y],
  ["op", /::/y],
  ["param", /\$\d+|\?\d*|:[A-Za-z_]\w*|@@?[A-Za-z_][\w$]*/y],
  ["word", /[A-Za-z_\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*/y],
  ["open", /\(/y],
  ["close", /\)/y],
  ["comma", /,/y],
  ["semi", /;/y],
  ["dot", /\./y],
  ["op", /<=>|<>|!=|<=|>=|\|\||->>|->|=>|:=|#>>|#>|@>|<@|[-+*/%=<>!~&|^#@:]/y],
  ["op", /[\s\S]/y],
];

export function tokenizeSql(sql) {
  const src = String(sql);
  const out = [];
  let i = 0;
  while (i < src.length) {
    for (const [t, re] of RULES) {
      re.lastIndex = i;
      const m = re.exec(src);
      if (m && m[0].length) {
        out.push({ t, v: m[0] });
        i += m[0].length;
        break;
      }
    }
  }
  return out;
}

function caser(mode) {
  return (w) => (mode === "lower" ? w.toLowerCase() : mode === "preserve" ? w : w.toUpperCase());
}

export function formatSql(sql, opts = {}) {
  const kc = caser(opts.keywordCase || "upper");
  const IND = opts.indent === undefined ? "  " : opts.indent;
  const perLine = opts.columnsPerLine !== false;
  const S = [];
  let sawNl = false;
  for (const t of tokenizeSql(sql)) {
    if (t.t === "ws") {
      if (t.v.includes("\n")) sawNl = true;
      continue;
    }
    t.nl = sawNl;
    sawNl = false;
    S.push(t);
  }
  const lines = [];
  let cur = "";
  let lineLevel = 0;
  let pending = null;
  let blank = false;
  let prev = null;
  const root = () => ({ kind: "root", base: 0, clause: null, count: 0 });
  let frames = [root()];
  const block = () => {
    for (let i = frames.length - 1; i >= 0; i--) if (frames[i].kind !== "case") return frames[i];
    return frames[0];
  };
  const top = () => frames[frames.length - 1];
  const startLine = (level) => {
    if (cur.trim()) {
      lines.push(cur.replace(/\s+$/, ""));
      if (blank) lines.push("");
    }
    blank = false;
    cur = IND.repeat(level);
    lineLevel = level;
  };
  const put = (text, space) => {
    if (pending !== null) {
      startLine(pending);
      pending = null;
    } else if (cur.trim() && space) cur += " ";
    cur += text;
  };
  const tableParen = () => TABLE_PARENS.has(block().clause) && block().kind !== "inline";
  const spaceBefore = (tok) => {
    if (!prev) return false;
    if (tok.t === "comma" || tok.t === "semi" || tok.t === "close" || tok.t === "dot") return false;
    if (prev.t === "open" || prev.t === "dot" || prev.unary) return false;
    if ((tok.t === "op" && tok.v === "::") || (prev.t === "op" && prev.v === "::")) return false;
    if (tok.t === "open") {
      if (prev.t === "word" && !prev.kw) return tableParen();
      if (prev.t === "word" && FUNCLIKE.has(prev.up)) return false;
      if (prev.t === "qident") return tableParen();
    }
    return true;
  };
  const matchPhrase = (k) => {
    const words = [];
    for (let j = k; j < S.length && words.length < 5 && S[j].t === "word"; j++) words.push(S[j].v.toUpperCase());
    for (const p of PHRASES) {
      if (p.words.length <= words.length && p.words.every((w, n) => w === words[n])) return p;
    }
    return null;
  };

  for (let k = 0; k < S.length; k++) {
    const tok = S[k];
    const B = block();
    const T = top();
    const flat = B.kind === "inline" || B.kind === "defs";
    if (tok.t === "comment") {
      const text = tok.v.startsWith("/*") ? tok.v : tok.v.replace(/\s+$/, "");
      const lineComment = !tok.v.startsWith("/*");
      if (!tok.nl && cur.trim()) cur += " " + text;
      else {
        if (pending === null && cur.trim()) pending = lineLevel;
        put(text, true);
      }
      if (lineComment && pending === null) pending = lineLevel;
      continue;
    }
    if (tok.t === "word") {
      const up = tok.v.toUpperCase();
      const ident = (prev && prev.t === "dot") || (S[k + 1] && S[k + 1].t === "dot");
      let p = ident ? null : matchPhrase(k);
      let role = p ? p.role : "plain";
      if (flat && role !== "case" && role !== "when" && role !== "end" && role !== "plain") role = "word";
      if (role === "set" && !(B.clause === "UPDATE" || B.clause === "ON DUPLICATE KEY UPDATE" || B.clause === "MERGE INTO")) role = "word";
      if (role === "values" && !(INSERTS.has(B.clause) || B.count === 0)) role = "word";
      if (role === "with" && B.count !== 0) role = "word";
      if (role === "stmt" && prev && prev.t === "word" && ["FOR", "ON", "KEY", "DO", "THEN"].includes(prev.up)) role = "word";
      if ((role === "and" || role === "between") && T.kind === "case") role = role === "between" ? "between" : "word";
      const text = p && role !== "word" ? S.slice(k, k + p.words.length).map((x) => kc(x.v)).join(" ") :KEYWORDS.has(up) && !ident ? kc(tok.v) : tok.v;
      if (p && role !== "word") k += p.words.length - 1;
      switch (role) {
        case "clause":
          pending = B.base;
          put(text, true);
          B.clause = p.text === "DO UPDATE SET" ? "SET" : p.text;
          pending = B.base + 1;
          break;
        case "set":
        case "values":
          pending = B.base;
          put(text, true);
          B.clause = p.text;
          pending = B.base + 1;
          break;
        case "inline":
        case "create":
        case "stmt":
        case "with":
          pending = B.base;
          put(text, true);
          B.clause = role === "create" ? "CREATE TABLE" : role === "with" ? "WITH" : p.text;
          B.defsUsed = false;
          break;
        case "setop":
          pending = B.base;
          put(text, true);
          B.clause = p.text;
          pending = B.base;
          break;
        case "join":
          pending = B.base + 1;
          put(text, true);
          B.clause = "FROM";
          break;
        case "and":
          if (B.between) {
            B.between = false;
            put(text, true);
          } else if (B.clause === "WHERE" || B.clause === "HAVING" || B.clause === "QUALIFY") {
            pending = B.base + 1;
            put(text, true);
          } else if (B.clause === "FROM") {
            pending = B.base + 2;
            put(text, true);
          } else put(text, true);
          break;
        case "between":
          B.between = true;
          put(text, true);
          break;
        case "case":
          put(text, spaceBefore(tok));
          frames.push(flat ? { kind: "case", flat: true } : { kind: "case", base: lineLevel + 1, endLevel: lineLevel });
          break;
        case "when":
          if (T.kind === "case" && !T.flat) pending = T.base;
          put(text, true);
          break;
        case "end":
          if (T.kind === "case") {
            if (!T.flat) pending = T.endLevel;
            frames.pop();
          }
          put(text, true);
          break;
        default:
          put(text, spaceBefore(tok));
      }
      B.count++;
      prev = { t: "word", v: tok.v, up, kw: KEYWORDS.has(up) || !!(p && role !== "word") };
      continue;
    }
    if (tok.t === "open") {
      let n = k + 1;
      while (n < S.length && S[n].t === "comment") n++;
      const nx = S[n];
      const sub = nx && nx.t === "word" && /^(SELECT|WITH)$/i.test(nx.v);
      const defs = !sub && !flat && B.clause === "CREATE TABLE" && !B.defsUsed;
      if (defs) B.defsUsed = true;
      put("(", spaceBefore(tok));
      B.count++;
      if (sub || defs) {
        frames.push({ kind: sub ? "sub" : "defs", base: lineLevel + 1, closeLevel: lineLevel, clause: null, count: 0 });
        pending = lineLevel + 1;
      } else frames.push({ kind: "inline", count: 0 });
      prev = { t: "open", v: "(" };
      continue;
    }
    if (tok.t === "close") {
      let f = null;
      while (frames.length > 1) {
        f = frames.pop();
        if (f.kind !== "case") break;
        f = null;
      }
      if (f && (f.kind === "sub" || f.kind === "defs")) pending = f.closeLevel;
      else if (pending !== null && !cur.trim()) pending = null;
      put(")", false);
      prev = { t: "close", v: ")" };
      continue;
    }
    if (tok.t === "comma") {
      put(",", false);
      if (T.kind !== "case") {
        if (B.kind === "defs") pending = B.base;
        else if (B.kind !== "inline") {
          if (B.clause === "WITH") pending = B.base;
          else if (B.clause === "VALUES") pending = B.base + 1;
          else if (perLine && INDENTED.has(B.clause)) pending = B.base + 1;
        }
      }
      prev = { t: "comma", v: "," };
      continue;
    }
    if (tok.t === "semi") {
      pending = null;
      put(";", false);
      frames = [root()];
      pending = 0;
      blank = true;
      prev = null;
      continue;
    }
    if (tok.t === "dot") {
      put(".", false);
      prev = { t: "dot", v: "." };
      continue;
    }
    const unary = tok.t === "op" && (tok.v === "-" || tok.v === "+") && (!prev || prev.t === "op" || prev.t === "open" || prev.t === "comma" || (prev.t === "word" && prev.kw && !FUNCLIKE.has(prev.up)));
    put(tok.v, spaceBefore(tok));
    B.count++;
    prev = { t: tok.t, v: tok.v, unary };
  }
  if (cur.trim()) lines.push(cur.replace(/\s+$/, ""));
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return lines.join("\n");
}

export function minifySql(sql, opts = {}) {
  const kc = caser(opts.keywordCase || "upper");
  const toks = tokenizeSql(sql).filter((t) => t.t !== "ws" && t.t !== "comment");
  const wordish = (t) => t.t === "word" || t.t === "number" || t.t === "param" || t.t === "qident";
  let out = "";
  let prev = null;
  toks.forEach((t, k) => {
    const ident = (prev && prev.t === "dot") || (toks[k + 1] && toks[k + 1].t === "dot");
    const text = t.t === "word" && KEYWORDS.has(t.v.toUpperCase()) && !ident ? kc(t.v) : t.v;
    if (prev) {
      let gap = false;
      if (wordish(prev) && wordish(t)) gap = true;
      else if ((prev.t === "word" && t.t === "string") || (prev.t === "string" && t.t === "word")) gap = true;
      else if (prev.t === "op" && t.t === "op") {
        const a = prev.v[prev.v.length - 1];
        const b = t.v[0];
        gap = (a === "-" && b === "-") || (a === "/" && b === "*") || (a === "*" && b === "/") || (a === "<" || a === ">" || a === "=" || a === "!" || a === "|" || a === ":");
      } else if ((prev.t === "number" && t.t === "dot") || (prev.t === "close" && (t.t === "word" || t.t === "number"))) gap = true;
      if (gap) out += " ";
    }
    out += text;
    prev = t;
  });
  return out;
}

export function sqlStats(sql) {
  let statements = 0;
  let open = false;
  let tokens = 0;
  for (const t of tokenizeSql(sql)) {
    if (t.t === "ws") continue;
    tokens++;
    if (t.t === "semi") {
      if (open) statements++;
      open = false;
    } else if (t.t !== "comment") open = true;
  }
  if (open) statements++;
  return { statements, tokens };
}
