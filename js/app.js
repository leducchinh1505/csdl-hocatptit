(function () {
'use strict';
var SECTIONS = [
  { id: 'mapping', title: 'Ánh xạ ER/EER sang quan hệ', desc: '1–N, M–N, đa trị, 3 ngôi, kế thừa ISA' },
  { id: 'design', title: 'Thiết kế & tình huống thực tế', desc: 'Liên kết lặp theo thời gian, chọn khóa, ràng buộc' },
  { id: 'fd', title: 'Phụ thuộc hàm & Armstrong', desc: 'Suy dẫn, bao đóng X⁺, khóa ứng viên' },
  { id: 'algebra', title: 'Đại số quan hệ', desc: 'σ, π, ρ, ⋈, phép trừ, phép chia' },
  { id: 'nf', title: 'Dạng chuẩn', desc: '1NF, 2NF, 3NF, BCNF, phân rã' }
];
var KEY = 'luyenthi_csdl_v1';
var app = document.getElementById('app');
var LETTERS = 'ABCD';

// ---- Lưu trạng thái ----
var st = { instant: true, quiz: {}, best: {}, sql: {} };
var BANK = 2; // tăng khi ngân hàng câu hỏi thay đổi: lượt làm cũ không còn khớp số câu, tiến độ SQL vẫn giữ
try {
  var raw = localStorage.getItem(KEY);
  if (raw) {
    var saved = JSON.parse(raw);
    for (var k in st) if (saved[k] !== undefined) st[k] = saved[k];
    if (saved.bank !== BANK) { st.quiz = {}; st.best = {}; }
  }
} catch (e) {}
st.bank = BANK;
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

// ---- Tiện ích ----
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmt(s) { return esc(s).replace(/_\{([^}]*)\}/g, '<sub>$1</sub>'); }
function shuffled(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

// ---- Sơ đồ ER ký hiệu Chen ----
function erd(d) {
  var W = 560, cy = 100, H = d.c ? 232 : 142, cx = W / 2, ink = 'var(--ink)', line = '#7b8798', out = '';
  function entity(x, y, label) { return '<rect x="' + (x - 62) + '" y="' + (y - 21) + '" width="124" height="42" rx="4" fill="#fdf0c4" stroke="#b58a12" stroke-width="1.4"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="14" fill="' + ink + '" font-weight="600">' + esc(label) + '</text>'; }
  function card(x, y, t) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="14" font-weight="700" fill="#2c5fb8">' + esc(t) + '</text>'; }
  var ax = 76, bx = W - 76;
  out += '<line x1="' + (ax + 62) + '" y1="' + cy + '" x2="' + (cx - 68) + '" y2="' + cy + '" stroke="' + line + '" stroke-width="1.4"/>';
  out += '<line x1="' + (cx + 68) + '" y1="' + cy + '" x2="' + (bx - 62) + '" y2="' + cy + '" stroke="' + line + '" stroke-width="1.4"/>';
  if (d.c) out += '<line x1="' + cx + '" y1="' + (cy + 32) + '" x2="' + cx + '" y2="186" stroke="' + line + '" stroke-width="1.4"/>';
  (d.attrs || []).forEach(function (a, i, arr) {
    var x = cx + (i - (arr.length - 1) / 2) * 130, y = 26;
    out += '<line x1="' + x + '" y1="' + (y + 16) + '" x2="' + cx + '" y2="' + (cy - 32) + '" stroke="' + line + '" stroke-width="1.2"/>';
    out += '<ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="17" fill="#fff" stroke="' + line + '" stroke-width="1.2"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" fill="' + ink + '">' + esc(a) + '</text>';
  });
  out += entity(ax, cy, d.a) + entity(bx, cy, d.b);
  out += '<polygon points="' + (cx - 68) + ',' + cy + ' ' + cx + ',' + (cy - 32) + ' ' + (cx + 68) + ',' + cy + ' ' + cx + ',' + (cy + 32) + '" fill="#e4edfb" stroke="#2c5fb8" stroke-width="1.4"/><text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="14" fill="' + ink + '" font-weight="600">' + esc(d.r) + '</text>';
  out += card(ax + 80, cy - 8, d.ac) + card(bx - 80, cy - 8, d.bc);
  if (d.c) { out += entity(cx, 207, d.c) + card(cx + 14, 174, d.cc); }
  return '<svg class="erd" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sơ đồ ER">' + out + '</svg>';
}

// ---- Trắc nghiệm ----
function newAttempt(id, subset) {
  var list = QB[id], order = shuffled(subset || range(list.length)), perm = {};
  order.forEach(function (i) {
    var p = shuffled([0, 1, 2, 3]);
    if (list[i].v && list[i].v.nf) p.sort(function (a, b) { return list[i].o[a] < list[i].o[b] ? -1 : 1; });
    perm[i] = p;
  });
  st.quiz[id] = { order: order, perm: perm, ans: {}, sub: false, cur: 0, result: false, warned: false };
  save();
  return st.quiz[id];
}
function attempt(id) { return st.quiz[id] || newAttempt(id); }
function tally(a) { var c = 0, d = 0; a.order.forEach(function (i) { if (a.ans[i] !== undefined) { d++; if (a.ans[i] === 0) c++; } }); return { correct: c, done: d, total: a.order.length }; }

function renderHome() {
  var totalPass = 0, totalParts = 0;
  SQLX.forEach(function (ex, n) { ex.parts.forEach(function (p, i) { totalParts++; if ((st.sql[n + '.' + i] || {}).ok) totalPass++; }); });
  var rows = SECTIONS.map(function (s, n) {
    var a = st.quiz[s.id], t = a ? tally(a) : null, best = st.best[s.id];
    var size = QB[s.id].length;
    var status = t ? '<b>' + t.done + '/' + t.total + '</b> đã làm' : size + ' câu';
    if (best !== undefined) status += '<br>Tốt nhất <b>' + best + '/' + size + '</b>';
    return '<a class="row" href="#/quiz/' + s.id + '"><span class="n">' + (n + 1) + '</span><span><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></span><span class="st">' + status + '</span></a>';
  }).join('');
  app.innerHTML = '<div class="wrap"><div class="hero"><h1>Luyện thi Cơ sở dữ liệu</h1><p>' + SECTIONS.reduce(function (n, s) { return n + QB[s.id].length; }, 0) + ' câu trắc nghiệm theo 5 phần và ' + SQLX.length + ' bài truy vấn SQL chấm tự động. Tiến độ được lưu trên trình duyệt này.</p></div>' +
    '<div class="sec-title">Trắc nghiệm</div><div class="list">' + rows + '</div>' +
    '<div class="sec-title">Thực hành</div><div class="list"><a class="row" href="#/sql"><span class="n">SQL</span><span><h3>' + SQLX.length + ' bài truy vấn</h3><p>Viết câu lệnh, chạy thử trên dữ liệu thật và nộp để chấm</p></span><span class="st"><b>' + totalPass + '/' + totalParts + '</b> phần đạt</span></a></div></div>';
}

function renderQuiz(id) {
  var sec = SECTIONS.filter(function (s) { return s.id === id; })[0];
  if (!sec) { location.hash = '#/'; return; }
  var a = attempt(id), list = QB[id];
  if (a.result) return renderResult(sec, a, list);
  var idx = a.order[a.cur], q = list[idx], chosen = a.ans[idx], reveal = a.sub || (st.instant && chosen !== undefined), t = tally(a);
  var dots = a.order.map(function (qi, n) {
    var c = 'dot', v = a.ans[qi];
    if (a.sub || (st.instant && v !== undefined)) { if (v === 0) c += ' ok'; else if (v !== undefined) c += ' bad'; }
    else if (v !== undefined) c += ' ans';
    if (n === a.cur) c += ' cur';
    return '<button class="' + c + '" data-go="' + n + '" aria-label="Câu ' + (n + 1) + '">' + (n + 1) + '</button>';
  }).join('');
  var opts = a.perm[idx].map(function (orig, n) {
    var c = 'opt';
    if (reveal) { if (orig === 0) c += ' right'; else if (orig === chosen) c += ' wrong'; }
    else if (orig === chosen) c += ' sel';
    return '<button class="' + c + '" data-pick="' + orig + '"' + (reveal ? ' disabled' : '') + '><span class="l">' + LETTERS[n] + '</span><span class="r"></span><span class="t">' + fmt(q.o[orig]) + '</span></button>';
  }).join('');
  var explain = '';
  if (reveal) {
    var status = chosen === undefined ? '<b class="bad">Chưa trả lời.</b> ' : chosen === 0 ? '<b class="ok">Chính xác.</b> ' : '<b class="bad">Chưa đúng.</b> ';
    explain = '<div class="explain">' + status + fmt(q.e) + '</div>';
  }
  var submitLabel = a.warned ? 'Còn ' + (t.total - t.done) + ' câu trống, nhấn lần nữa để nộp' : 'Nộp bài';
  app.innerHTML = '<div class="wrap"><div class="top"><a class="back" href="#/">← Trang chủ</a><h1>' + esc(sec.title) + '</h1></div>' +
    '<div class="progress"><i style="width:' + (t.done / t.total * 100) + '%"></i></div>' +
    '<div class="card"><div class="dots">' + dots + '</div></div>' +
    '<div class="bar"><span>Đã làm ' + t.done + '/' + t.total + '</span><span class="sp"></span>' +
    (a.sub ? '<button class="btn sm" data-act="show-result">Xem kết quả</button>' : '<label class="switch"><input type="checkbox" id="instant"' + (st.instant ? ' checked' : '') + '>Hiện đáp án ngay</label>') +
    '<button class="btn sm" data-act="restart">Làm lại</button></div>' +
    '<div class="q-head"><span class="pill">Trắc nghiệm một đáp án</span><span class="h">Chọn 1 đáp án đúng</span></div>' +
    '<p class="qtext">' + fmt(q.q) + '</p>' + (q.d ? erd(q.d) : '') +
    '<div class="opts">' + opts + '</div>' + explain +
    '<div class="foot"><button class="btn" data-act="prev"' + (a.cur === 0 ? ' disabled' : '') + '>Câu trước</button><button class="btn" data-act="next"' + (a.cur === a.order.length - 1 ? ' disabled' : '') + '>Câu sau</button><span class="sp"></span>' +
    (a.sub ? '' : '<button class="btn pri" data-act="submit">' + submitLabel + '</button>') + '</div></div>';
  var box = document.getElementById('instant');
  if (box) box.onchange = function () { st.instant = box.checked; save(); renderQuiz(id); };
  bindQuiz(id);
}

function renderResult(sec, a, list) {
  var t = tally(a), wrong = a.order.filter(function (i) { return a.ans[i] !== 0; });
  var dots = a.order.map(function (qi, n) { var v = a.ans[qi]; return '<button class="dot ' + (v === 0 ? 'ok' : 'bad') + '" data-review="' + n + '">' + (n + 1) + '</button>'; }).join('');
  var pct = Math.round(t.correct / t.total * 100);
  app.innerHTML = '<div class="wrap"><div class="top"><a class="back" href="#/">← Trang chủ</a><h1>' + esc(sec.title) + '</h1></div><div class="card score"><div class="big">' + t.correct + '/' + t.total + '</div><div class="sub">Đúng ' + pct + '%, chưa làm ' + (t.total - t.done) + ' câu</div>' +
    '<div class="dots">' + dots + '</div><div class="legend">Nhấn vào một câu để xem lại đáp án và lời giải</div>' +
    '<div class="foot">' + (wrong.length ? '<button class="btn pri" data-act="retry-wrong">Làm lại ' + wrong.length + ' câu sai</button>' : '') + '<button class="btn" data-act="restart">Làm lại từ đầu</button></div></div></div>';
  bindQuiz(sec.id);
}

function bindQuiz(id) {
  var a = attempt(id);
  app.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { a.cur = +b.dataset.go; a.warned = false; save(); renderQuiz(id); }; });
  app.querySelectorAll('[data-review]').forEach(function (b) { b.onclick = function () { a.cur = +b.dataset.review; a.result = false; save(); renderQuiz(id); }; });
  app.querySelectorAll('[data-pick]').forEach(function (b) { b.onclick = function () { a.ans[a.order[a.cur]] = +b.dataset.pick; a.warned = false; save(); renderQuiz(id); }; });
  app.querySelectorAll('[data-act]').forEach(function (b) {
    b.onclick = function () {
      var act = b.dataset.act;
      if (act === 'prev') { a.cur--; a.warned = false; }
      else if (act === 'next') { a.cur++; a.warned = false; }
      else if (act === 'restart') { newAttempt(id); return renderQuiz(id); }
      else if (act === 'show-result') { a.result = true; }
      else if (act === 'retry-wrong') { newAttempt(id, a.order.filter(function (i) { return a.ans[i] !== 0; })); return renderQuiz(id); }
      else if (act === 'submit') {
        var t = tally(a);
        if (t.done < t.total && !a.warned) { a.warned = true; save(); return renderQuiz(id); }
        a.sub = true; a.result = true;
        if (t.total === QB[id].length && (st.best[id] === undefined || t.correct > st.best[id])) st.best[id] = t.correct;
      }
      save(); renderQuiz(id);
    };
  });
}

document.addEventListener('keydown', function (e) {
  var m = location.hash.match(/^#\/quiz\/(\w+)/);
  if (!m || /TEXTAREA|INPUT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  var a = st.quiz[m[1]]; if (!a || a.result) return;
  var pick = 'abcd'.indexOf(e.key.toLowerCase());
  if (e.key === 'ArrowLeft' && a.cur > 0) { a.cur--; save(); renderQuiz(m[1]); }
  else if (e.key === 'ArrowRight' && a.cur < a.order.length - 1) { a.cur++; save(); renderQuiz(m[1]); }
  else if (pick >= 0 && e.key.length === 1) { var b = app.querySelectorAll('[data-pick]')[pick]; if (b && !b.disabled) b.click(); }
});

// ---- SQL ----
var SQL = null, sqlError = null;
initSqlJs().then(function (s) { SQL = s; route(); }).catch(function (e) { sqlError = e; route(); });

function makeDB(ex, hidden) {
  var db = new SQL.Database();
  var slice = function (from, n) { return function (d) { var v = parseInt(String(d).slice(from, from + n), 10); return isNaN(v) ? null : v; }; };
  db.create_function('YEAR', slice(0, 4)); db.create_function('MONTH', slice(5, 2)); db.create_function('DAY', slice(8, 2));
  db.create_function('LEN', function (s) { return s === null ? null : String(s).length; });
  db.create_function('GETDATE', function () { return new Date().toISOString().slice(0, 19).replace('T', ' '); });
  db.create_function('DATEDIFF', function (unit, a, b) {
    var x = new Date(a), y = new Date(b);
    if (unit === 'day') return Math.round((y - x) / 864e5);
    var months = (y.getFullYear() - x.getFullYear()) * 12 + y.getMonth() - x.getMonth();
    return unit === 'month' ? months : y.getFullYear() - x.getFullYear();
  });
  db.run(ex.schema); db.run(ex.seed); if (hidden) db.run(ex.hidden);
  return db;
}
function dialect(s) {
  s = s.replace(/;\s*$/, '').replace(/\bN'/g, "'").replace(/\bISNULL\s*\(/gi, 'IFNULL(').replace(/DATEDIFF\s*\(\s*(day|month|year)\s*,/gi, function (_, u) { return "DATEDIFF('" + u.toLowerCase() + "',"; });
  var m = s.match(/^\s*SELECT\s+(DISTINCT\s+)?TOP\s+(\d+)\s+/i);
  if (m) s = s.replace(m[0], 'SELECT ' + (m[1] || '')) + ' LIMIT ' + m[2];
  return s;
}
function run(db, code) { var r = db.exec(dialect(code)); return r.length ? r[r.length - 1] : { columns: [], values: [] }; }
function norm(v) { if (v === null) return '∅'; if (typeof v === 'number') return String(Math.round(v * 100) / 100); var s = String(v).trim(); return /^-?\d+(\.\d+)?$/.test(s) ? String(Math.round(parseFloat(s) * 100) / 100) : s; }
function normRows(r) { return r.values.map(function (row) { return row.map(norm); }); }
function rowsEqual(a, b, ordered) {
  var x = a.map(function (r) { return r.join('\u0001'); }), y = b.map(function (r) { return r.join('\u0001'); });
  if (!ordered) { x.sort(); y.sort(); }
  for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}
// So khớp có cho phép đổi thứ tự cột. Trả về 'ok', 'columns', 'rows', 'order', 'values'.
function compare(exp, got, ordered) {
  var E = normRows(exp), G = normRows(got);
  if (!E.length && !G.length) return 'ok';
  if (exp.columns.length && got.columns.length && exp.columns.length !== got.columns.length) return 'columns';
  if (E.length !== G.length) return 'rows';
  var n = exp.columns.length;
  function fp(M, c) { return M.map(function (r) { return r[c]; }).sort().join('\u0001'); }
  var used = [], perm = [], matchedAny = false, sameAsSet = false;
  function attempt(c) {
    if (c === n) {
      var P = G.map(function (r) { return perm.map(function (p) { return r[p]; }); });
      matchedAny = true;
      if (rowsEqual(E, P, !!ordered)) return true;
      if (ordered && rowsEqual(E, P, false)) sameAsSet = true;
      return false;
    }
    for (var i = 0; i < n; i++) if (!used[i] && fp(E, c) === fp(G, i)) { used[i] = true; perm[c] = i; if (attempt(c + 1)) return true; used[i] = false; }
    return false;
  }
  if (attempt(0)) return 'ok';
  return sameAsSet ? 'order' : 'values';
}
var FAIL = {
  columns: function (e, g) { return 'Sai số cột: yêu cầu ' + e.columns.length + ' cột, bài làm có ' + g.columns.length + ' cột.'; },
  rows: function (e, g) { return 'Sai số dòng: yêu cầu ' + e.values.length + ' dòng, bài làm có ' + g.values.length + ' dòng.'; },
  order: function () { return 'Dữ liệu đúng nhưng thứ tự sắp xếp chưa đúng.'; },
  values: function () { return 'Đúng số dòng và số cột nhưng giá trị chưa khớp.'; }
};
function table(r) {
  if (!r.columns.length) return '<div class="caption">Không có dòng nào.</div>';
  return '<div class="tbl-wrap"><table class="res"><thead><tr>' + r.columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    r.values.map(function (row) { return '<tr>' + row.map(function (v) { return v === null ? '<td class="null">NULL</td>' : '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
}
function renderSqlList() {
  var rows = SQLX.map(function (ex, n) {
    var pass = ex.parts.filter(function (p, i) { return (st.sql[n + '.' + i] || {}).ok; }).length;
    return '<a class="row" href="#/sql/' + n + '"><span class="n">' + (n + 1) + '</span><span><h3>' + esc(ex.title) + '</h3><p>' + esc(ex.story) + '</p></span><span class="st"><b>' + pass + '/' + ex.parts.length + '</b> phần đạt</span></a>';
  }).join('');
  app.innerHTML = '<div class="wrap"><div class="top"><a class="back" href="#/">← Trang chủ</a><h1>Thực hành truy vấn SQL</h1></div>' +
    '<p class="note">Bài làm chạy trên SQLite ngay trong trình duyệt và được chấm cả trên dữ liệu mẫu lẫn dữ liệu ẩn. Có thể dùng cú pháp SQL chuẩn; hỗ trợ thêm TOP, YEAR, MONTH, DAY, LEN, ISNULL, GETDATE, DATEDIFF. Không phân biệt thứ tự cột, chỉ xét thứ tự dòng khi đề yêu cầu sắp xếp.</p><br><div class="list">' + rows + '</div></div>';
}
function renderSql(n) {
  var ex = SQLX[n];
  if (!ex) { location.hash = '#/sql'; return; }
  if (!SQL) { app.innerHTML = '<div class="wrap"><div class="msg ' + (sqlError ? 'bad' : 'info') + '">' + (sqlError ? 'Không tải được engine SQL: ' + esc(sqlError.message || sqlError) : 'Đang tải engine SQL...') + '</div></div>'; return; }
  var db = makeDB(ex, false);
  var names = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map(function (r) { return r[0]; });
  var tables = names.map(function (t) {
    var cols = db.exec('PRAGMA table_info(' + t + ')')[0].values.map(function (c) { return (c[5] ? c[1] + ' 🔑' : c[1]); });
    var data = db.exec('SELECT * FROM ' + t)[0] || { columns: [], values: [] };
    return '<div><h4>' + esc(t) + '</h4>' + table({ columns: cols, values: data.values }) + '</div>';
  }).join('');
  db.close();
  var parts = ex.parts.map(function (p, i) {
    var s = st.sql[n + '.' + i] || {};
    return '<div class="card part' + (s.ok ? ' pass' : '') + '" id="p' + i + '"><div class="part-h"><span class="tag">' + 'abcde'[i] + '</span><p>' + esc(p.t) + '</p></div>' +
      '<textarea class="sql" spellcheck="false" placeholder="SELECT ..." data-code="' + i + '">' + esc(s.code || '') + '</textarea>' +
      '<div class="acts"><button class="btn sm" data-run="' + i + '">Chạy thử</button><button class="btn sm pri" data-sub="' + i + '">Nộp bài</button><button class="btn sm" data-hint="' + i + '">Gợi ý</button><button class="btn sm" data-sol="' + i + '">Đáp án</button></div><div class="out" id="out' + i + '">' + (s.ok ? '<div class="msg ok">Đã đạt phần này.</div>' : '') + '</div></div>';
  }).join('');
  var prev = n > 0 ? '<a class="btn" href="#/sql/' + (n - 1) + '" style="text-decoration:none">Bài trước</a>' : '', next = n < SQLX.length - 1 ? '<a class="btn" href="#/sql/' + (n + 1) + '" style="text-decoration:none">Bài sau</a>' : '';
  app.innerHTML = '<div class="wrap"><div class="top"><a class="back" href="#/sql">← Danh sách bài</a><h1>Bài ' + (n + 1) + '. ' + esc(ex.title) + '</h1></div><p class="story">' + esc(ex.story) + '</p>' +
    '<details class="data" open><summary>Lược đồ và dữ liệu mẫu</summary><div class="tables">' + tables + '</div></details>' + parts + '<div class="foot">' + prev + '<span class="sp"></span>' + next + '</div></div>';
  function setOut(i, html) { document.getElementById('out' + i).innerHTML = html; }
  function codeOf(i) { return app.querySelector('[data-code="' + i + '"]').value; }
  function persist(i, patch) { var key = n + '.' + i, cur = st.sql[key] || {}; for (var k in patch) cur[k] = patch[k]; st.sql[key] = cur; save(); }
  function exec(ex2, hidden, code) { var d = makeDB(ex2, hidden); try { return run(d, code); } finally { d.close(); } }
  app.querySelectorAll('[data-code]').forEach(function (t) {
    t.oninput = function () { persist(+t.dataset.code, { code: t.value }); };
    t.onkeydown = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); app.querySelector('[data-run="' + t.dataset.code + '"]').click(); }
      if (e.key === 'Tab') { e.preventDefault(); var a = t.selectionStart; t.setRangeText('  ', a, t.selectionEnd, 'end'); t.oninput(); }
    };
  });
  app.querySelectorAll('[data-run]').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.run, code = codeOf(i);
      if (!code.trim()) return setOut(i, '<div class="msg info">Hãy nhập câu lệnh trước.</div>');
      try { var r = exec(ex, false, code); setOut(i, '<div class="caption">Kết quả chạy thử (' + r.values.length + ' dòng)</div>' + table(r)); }
      catch (e) { setOut(i, '<div class="msg bad">Lỗi SQL: ' + esc(e.message) + '</div>'); }
    };
  });
  app.querySelectorAll('[data-sub]').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.sub, code = codeOf(i), p = ex.parts[i], card = document.getElementById('p' + i);
      if (!code.trim()) return setOut(i, '<div class="msg info">Hãy nhập câu lệnh trước.</div>');
      var g1;
      try {
        g1 = exec(ex, false, code);
        var e1 = exec(ex, false, p.sql), c1 = compare(e1, g1, p.ord);
        if (c1 !== 'ok') { persist(i, { ok: false, code: code }); card.classList.remove('pass'); return setOut(i, '<div class="msg bad">Chưa đúng trên dữ liệu mẫu. ' + FAIL[c1](e1, g1) + '</div><div class="caption">Kết quả của bạn (' + g1.values.length + ' dòng)</div>' + table(g1)); }
        var g2 = exec(ex, true, code), e2 = exec(ex, true, p.sql), c2 = compare(e2, g2, p.ord);
        if (c2 !== 'ok') { persist(i, { ok: false, code: code }); card.classList.remove('pass'); return setOut(i, '<div class="msg bad">Đúng trên dữ liệu mẫu nhưng sai trên dữ liệu ẩn. ' + FAIL[c2](e2, g2) + ' Hãy kiểm tra các trường hợp biên như đồng hạng, chưa có dữ liệu, trùng lặp.</div>' + table(g1)); }
        persist(i, { ok: true, code: code }); card.classList.add('pass');
        setOut(i, '<div class="msg ok">Chính xác, đạt trên cả dữ liệu mẫu và dữ liệu ẩn.</div>' + table(g1));
      } catch (e) { setOut(i, '<div class="msg bad">Lỗi SQL: ' + esc(e.message) + '</div>'); }
    };
  });
  app.querySelectorAll('[data-hint]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.hint; setOut(i, '<div class="msg info">Gợi ý: ' + esc(ex.parts[i].h) + '</div>'); }; });
  app.querySelectorAll('[data-sol]').forEach(function (b) {
    b.onclick = function () { var i = +b.dataset.sol, p = ex.parts[i], r = exec(ex, false, p.sql); setOut(i, '<div class="caption">Một lời giải tham khảo</div><pre class="ans">' + esc(p.sql) + '</pre><div class="caption">Kết quả mong đợi trên dữ liệu mẫu</div>' + table(r)); };
  });
}

// ---- Điều hướng ----
function route() {
  var h = location.hash, m;
  window.scrollTo(0, 0);
  if ((m = h.match(/^#\/quiz\/(\w+)/))) renderQuiz(m[1]);
  else if ((m = h.match(/^#\/sql\/(\d+)/))) renderSql(+m[1]);
  else if (h.indexOf('#/sql') === 0) renderSqlList();
  else renderHome();
}
window.addEventListener('hashchange', route);
route();
})();
