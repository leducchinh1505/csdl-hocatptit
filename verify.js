// Kiểm chứng ngân hàng câu hỏi. Chạy: node verify.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = __dirname, ctx = { window: {} }; ctx.QB = undefined; vm.createContext(ctx);
for (const f of ['q1_mapping', 'q2_design', 'q3_fd', 'q4_algebra', 'q5_nf', 'q1b_mapping', 'q2b_design', 'q3b_fd', 'q4b_algebra', 'q5b_nf', 'sql_exercises', 'sql_exercises2']) {
  let src = fs.readFileSync(path.join(dir, 'data', f + '.js'), 'utf8');
  vm.runInContext('var QB=window.QB;' + src.replace('window.QB = window.QB || {};', 'window.QB = window.QB || {}; QB = window.QB;'), ctx, { filename: f });
}
const QB = ctx.window.QB, SQLX = ctx.window.SQLX;
let errors = 0; const err = (...a) => { errors++; console.log('LỖI:', ...a); };

// ---- Thuật toán phụ thuộc hàm ----
const parseF = s => s ? s.split(',').map(x => { const [l, r] = x.split('>'); return [[...l], [...r]]; }) : [];
const closure = (x, F) => { const c = new Set(x); let ch = true; while (ch) { ch = false; for (const [l, r] of F) if (l.every(a => c.has(a)) && r.some(a => !c.has(a))) { r.forEach(a => c.add(a)); ch = true; } } return c; };
const implies = (F, l, r) => { const c = closure(l, F); return r.every(a => c.has(a)); };
const equalSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
const subsets = arr => { const out = []; for (let m = 1; m < 1 << arr.length; m++) out.push(arr.filter((_, i) => m >> i & 1)); return out.sort((a, b) => a.length - b.length); };
const keysOf = (r, F) => { const R = [...r], ks = []; for (const s of subsets(R)) { if (ks.some(k => k.every(a => s.includes(a)))) continue; if (closure(s, F).size === R.length) ks.push(s); } return ks; };
const fdOf = t => { const m = t.match(/([A-Z]+)\s*→\s*([A-Z]+)/); return [[...m[1]], [...m[2]]]; };
const allFDs = t => [...t.matchAll(/([A-Z]+)→([A-Z]+)/g)].map(m => [[...m[1]], [...m[2]]]);
const letters = t => [...t.matchAll(/\b[A-Z]\b/g)].map(m => m[0]);
const keyToks = t => [...t.matchAll(/\b[A-Z]+\b/g)].map(m => [...m[0]].sort().join('')).sort();
function highestNF(r, F) {
  const R = [...r], ks = keysOf(r, F), prime = new Set(ks.flat()), isSK = x => closure(x, F).size === R.length;
  let two = true;
  for (const k of ks) for (const s of subsets(k)) if (s.length < k.length) for (const a of closure(s, F)) if (!prime.has(a) && !s.includes(a)) two = false;
  if (!two) return '1NF';
  let three = true, bc = true;
  for (const [l, rr] of F) for (const a of rr) { if (l.includes(a)) continue; if (!isSK(l)) { bc = false; if (!prime.has(a)) three = false; } }
  return !three ? '2NF' : !bc ? '3NF' : 'BCNF';
}
const eqF = (a, b) => a.every(([l, r]) => implies(b, l, r)) && b.every(([l, r]) => implies(a, l, r));
function checkV(q, label) {
  const v = q.v, o = q.o;
  if (v.x && !v.cls) { const c = [...closure([...v.x], parseF(v.f))]; if (!equalSet(letters(o[0]), c)) err(label, 'bao đóng', c.join(''), o[0]); o.slice(1).forEach(w => { if (equalSet(letters(w), c)) err(label, 'distractor trùng', w); }); return; }
  if (v.imp) { const F = parseF(v.f); if (!implies(F, ...fdOf(o[0]))) err(label, 'o0 không suy ra', o[0]); o.slice(1).forEach(w => { if (implies(F, ...fdOf(w))) err(label, 'distractor suy ra được', w); }); return; }
  if (v.nimp) { const F = parseF(v.f); if (implies(F, ...fdOf(o[0]))) err(label, 'o0 suy ra được', o[0]); o.slice(1).forEach(w => { if (!implies(F, ...fdOf(w))) err(label, 'distractor không suy ra', w); }); return; }
  if (v.keys) { const ks = keysOf(v.r, parseF(v.f)).map(k => [...k].sort().join('')).sort(); if (ks.join() !== keyToks(o[0]).join()) err(label, 'khóa', ks.join(), o[0]); o.slice(1).forEach(w => { if (ks.join() === keyToks(w).join()) err(label, 'distractor trùng', w); }); return; }
  if (v.cls) { const F = parseF(v.f), ks = keysOf(v.r, F).map(k => [...k].sort().join('')), x = [...v.x].sort().join(''); const c = ks.includes(x) ? 'ck' : closure([...v.x], F).size === v.r.length ? 'sk' : 'no'; if (c !== v.cls) err(label, 'phân loại', c, v.cls); return; }
  if (v.core) { const ks = keysOf(v.r, parseF(v.f)); const i = [...v.r].filter(a => ks.every(k => k.includes(a))); if (!equalSet(i, letters(o[0]))) err(label, 'core', i.join(''), o[0]); o.slice(1).forEach(w => { if (i.includes(w)) err(label, 'distractor core', w); }); return; }
  if (v.never) { const ks = keysOf(v.r, parseF(v.f)).flat(); const n = [...v.r].filter(a => !ks.includes(a)); if (!equalSet(n, letters(o[0]))) err(label, 'never', n.join(''), o[0]); o.slice(1).forEach(w => { if (n.includes(w)) err(label, 'distractor never', w); }); return; }
  if (v.eq) { const a = parseF(v.f1), b = parseF(v.f2), ab = b.every(([l, r]) => implies(a, l, r)), ba = a.every(([l, r]) => implies(b, l, r)); const c = ab && ba ? '=' : ab ? '>' : ba ? '<' : 'x'; if (c !== v.eq) err(label, 'tương đương', c, v.eq); return; }
  if (v.nf) { const c = highestNF(v.r, parseF(v.f)); if (c !== v.nf || !o[0].endsWith(v.nf)) err(label, 'dạng chuẩn', c, v.nf, o[0]); return; }
  if (v.bv) { const F = parseF(v.f), bad = fd => { return closure(fd[0], F).size !== v.r.length; }; if (!bad(fdOf(o[0]))) err(label, 'o0 không vi phạm', o[0]); o.slice(1).forEach(w => { if (bad(fdOf(w))) err(label, 'distractor vi phạm', w); }); return; }
  if (v.cover) { const F = parseF(v.f), C = allFDs(o[0]);
    const minimal = C.every(([l, r], i) => r.length === 1 && !(l.length > 1 && l.some(a => implies(C, l.filter(x => x !== a), r))) && !implies(C.filter((_, j) => j !== i), l, r));
    if (!eqF(F, C) || !minimal) err(label, 'phủ tối thiểu', o[0]);
    o.slice(1).forEach(w => { const D = allFDs(w); const m = D.every(([l, r], i) => !(l.length > 1 && l.some(a => implies(D, l.filter(x => x !== a), r))) && !implies(D.filter((_, j) => j !== i), l, r)); if (eqF(F, D) && m) err(label, 'distractor cũng là phủ', w); }); return; }
  if (v.red) { const F = parseF(v.f), red = t => { const fd = fdOf(t), G = F.filter(([l, r]) => !(l.join('') === fd[0].join('') && r.join('') === fd[1].join(''))); return G.length === F.length - 1 && implies(G, ...fd); }; if (!red(o[0])) err(label, 'o0 không dư', o[0]); o.slice(1).forEach(w => { if (red(w)) err(label, 'distractor dư', w); }); return; }
  err(label, 'v không nhận dạng', JSON.stringify(v));
}

// ---- Cấu trúc câu hỏi ----
const EXPECT = { mapping: 150, design: 100, fd: 100, algebra: 100, nf: 100 }; const seenQ = new Set();
let verified = 0; const stats = {}; const seen = new Set();
for (const [k, list] of Object.entries(QB)) {
  stats[k] = list.length;
  if (list.length !== EXPECT[k]) err(k, 'số câu =', list.length);
  list.forEach((q, i) => {
    const label = `${k}#${i + 1}`;
    if (!q.q || !q.e) err(label, 'thiếu nội dung');
    if (!Array.isArray(q.o) || q.o.length !== 4) err(label, 'phải có 4 lựa chọn');
    if (new Set(q.o).size !== 4) err(label, 'lựa chọn trùng');
    if (q.o.some(x => /cả [AB]\b|Tất cả đều|Cả hai đáp án/.test(x))) err(label, 'lựa chọn phụ thuộc thứ tự', q.o);
    const sig = q.q + '|' + q.o[0]; if (seen.has(sig)) err(label, 'trùng câu'); seen.add(sig); const qk = q.q + JSON.stringify(q.d || '') + JSON.stringify(q.v || ''); if (seenQ.has(qk)) err(label, 'trùng đề bài'); seenQ.add(qk); if (Math.max(...q.o.map(x => x.length)) === q.o[0].length && q.o[0].length > 1.6 * Math.max(...q.o.slice(1).map(x => x.length))) console.log('  dài bất thường:', label, q.o[0].slice(0, 50));
    if (q.v) { checkV(q, label); verified++; }
  });
}

// ---- SQL ----
(async () => {
  const initSqlJs = require(path.join(dir, 'lib', 'sql-asm.js'));
  const SQL = await initSqlJs();
  const summary = [];
  if (SQLX.length !== 14) err('Số bài SQL =', SQLX.length);
  SQLX.forEach((ex, n) => {
    const a = new SQL.Database(), b = new SQL.Database();
    a.run(ex.schema); a.run(ex.seed); b.run(ex.schema); b.run(ex.seed); b.run(ex.hidden);
    ex.parts.forEach((p, i) => {
      const ra = a.exec(p.sql)[0], rb = b.exec(p.sql)[0];
      if (!ra) err(`SQL ${n + 1}.${i + 1} rỗng trên dữ liệu mẫu`);
      const ca = ra ? ra.values.length : 0, cb = rb ? rb.values.length : 0;
      if (JSON.stringify(ra) === JSON.stringify(rb)) console.log(`  lưu ý: SQL ${n + 1}.${i + 1} có kết quả giống nhau trên dữ liệu ẩn`);
      summary.push(`${n + 1}.${i + 1}:${ca}/${cb}`);
    });
  });
  console.log('Số câu:', JSON.stringify(stats), '| câu có kiểm chứng thuật toán:', verified);
  console.log('SQL dòng (mẫu/ẩn):', summary.join(' '));
  console.log(errors ? `THẤT BẠI: ${errors} lỗi` : 'ĐẠT: không có lỗi');
  process.exit(errors ? 1 : 0);
})();
