const MAX_NODES = 5000;
const MAX_DEPTH = 24;

function textOf(value) {
  if (value && typeof value.decodeText === 'function') return value.decodeText();
  if (value && typeof value.asString === 'function') return value.asString();
  return '';
}

function nameTreeFind(lib, node, key, depth) {
  const { PDFName, PDFArray, PDFDict } = lib;
  if (!(node instanceof PDFDict) || depth > 12) return null;
  const names = node.lookup(PDFName.of('Names'));
  if (names instanceof PDFArray) {
    for (let i = 0; i + 1 < names.size(); i += 2) {
      if (textOf(names.lookup(i)) === key) return names.lookup(i + 1);
    }
  }
  const kids = node.lookup(PDFName.of('Kids'));
  if (kids instanceof PDFArray) {
    for (let i = 0; i < kids.size(); i++) {
      const found = nameTreeFind(lib, kids.lookup(i), key, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function namedDestination(lib, doc, value) {
  const { PDFName, PDFDict } = lib;
  const key = value instanceof PDFName ? value.decodeText() : textOf(value);
  if (!key) return null;
  const legacy = doc.catalog.lookup(PDFName.of('Dests'));
  if (legacy instanceof PDFDict) {
    const hit = legacy.lookup(PDFName.of(key));
    if (hit) return hit;
  }
  const names = doc.catalog.lookup(PDFName.of('Names'));
  if (names instanceof PDFDict) {
    return nameTreeFind(lib, names.lookup(PDFName.of('Dests')), key, 0);
  }
  return null;
}

function targetPage(lib, doc, item, pageIndex) {
  const { PDFName, PDFArray, PDFDict } = lib;
  let dest = item.lookup(PDFName.of('Dest'));
  if (!dest) {
    const action = item.lookup(PDFName.of('A'));
    if (action instanceof PDFDict) dest = action.lookup(PDFName.of('D'));
  }
  if (dest && !(dest instanceof PDFArray)) dest = namedDestination(lib, doc, dest);
  if (dest instanceof PDFDict) dest = dest.lookup(PDFName.of('D'));
  if (!(dest instanceof PDFArray) || !dest.size()) return -1;
  const ref = dest.get(0);
  const at = pageIndex.get(ref && ref.toString());
  return at === undefined ? -1 : at;
}

export function readOutline(lib, doc) {
  const { PDFName, PDFDict } = lib;
  const root = doc.catalog.lookup(PDFName.of('Outlines'));
  if (!(root instanceof PDFDict)) return [];
  const pageIndex = new Map(doc.getPages().map((page, i) => [page.ref.toString(), i]));
  let seen = 0;
  const walk = (first, depth) => {
    const list = [];
    let item = first;
    const visited = new Set();
    while (item instanceof PDFDict && !visited.has(item) && seen < MAX_NODES) {
      visited.add(item);
      seen++;
      const title = textOf(item.lookup(PDFName.of('Title'))).trim();
      const kids = depth < MAX_DEPTH ? walk(item.lookup(PDFName.of('First')), depth + 1) : [];
      list.push({ title, page: targetPage(lib, doc, item, pageIndex), kids });
      item = item.lookup(PDFName.of('Next'));
    }
    return list;
  };
  return walk(root.lookup(PDFName.of('First')), 0);
}

export function mapOutline(nodes, pageFor) {
  const out = [];
  for (const node of nodes) {
    const kids = mapOutline(node.kids, pageFor);
    const page = node.page >= 0 ? pageFor(node.page) : null;
    if (page && node.title) out.push({ title: node.title, page, kids });
    else out.push(...kids);
  }
  return out;
}

function countAll(nodes) {
  return nodes.reduce((sum, node) => sum + 1 + countAll(node.kids), 0);
}

export function writeOutline(lib, out, nodes) {
  if (!nodes.length) return false;
  const { PDFName, PDFHexString, PDFNumber } = lib;
  const ctx = out.context;
  const rootRef = ctx.nextRef();
  const build = (list, parentRef) => {
    const refs = list.map(() => ctx.nextRef());
    list.forEach((node, i) => {
      const dict = ctx.obj({});
      dict.set(PDFName.of('Title'), PDFHexString.fromText(node.title));
      dict.set(PDFName.of('Parent'), parentRef);
      if (i > 0) dict.set(PDFName.of('Prev'), refs[i - 1]);
      if (i < list.length - 1) dict.set(PDFName.of('Next'), refs[i + 1]);
      dict.set(PDFName.of('Dest'), ctx.obj([node.page.ref, PDFName.of('Fit')]));
      if (node.kids.length) {
        const inner = build(node.kids, refs[i]);
        dict.set(PDFName.of('First'), inner[0]);
        dict.set(PDFName.of('Last'), inner[inner.length - 1]);
        dict.set(PDFName.of('Count'), PDFNumber.of(countAll(node.kids)));
      }
      ctx.assign(refs[i], dict);
    });
    return refs;
  };
  const top = build(nodes, rootRef);
  const root = ctx.obj({});
  root.set(PDFName.of('Type'), PDFName.of('Outlines'));
  root.set(PDFName.of('First'), top[0]);
  root.set(PDFName.of('Last'), top[top.length - 1]);
  root.set(PDFName.of('Count'), PDFNumber.of(countAll(nodes)));
  ctx.assign(rootRef, root);
  out.catalog.set(PDFName.of('Outlines'), rootRef);
  return true;
}
