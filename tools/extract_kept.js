// Chạy một lần: giữ lại các câu lý thuyết viết tay còn phù hợp trước khi sinh lại ngân hàng.
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', 'data');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['q1_mapping', 'q2_design', 'q3_fd', 'q4_algebra', 'q5_nf', 'q1b_mapping', 'q2b_design', 'q3b_fd', 'q4b_algebra', 'q5b_nf'])
  vm.runInContext('var QB;' + fs.readFileSync(path.join(dir, f + '.js'), 'utf8').replace('window.QB = window.QB || {};', 'window.QB = window.QB || {}; QB = window.QB;'), ctx);
const QB = ctx.window.QB;
const pick = (l, ids) => ids.map(i => l[i]);
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const kept = {
  design: pick(QB.design, [...range(20, 49), ...range(68, 79)]),
  fd: pick(QB.fd, [0, 1, 3, 4, 6, 7, 53, 54]),
  algebra: pick(QB.algebra, [2, 3, 4, 6, 7, 9, 10, 13, 14, 15, 17]),
  nf: QB.nf.filter(q => !q.v || !/^[A-G]+$/.test(q.v.r)),
};
fs.writeFileSync(path.join(__dirname, 'hand_kept.json'), JSON.stringify(kept));
console.log(Object.entries(kept).map(([k, v]) => k + ':' + v.length).join(' '));
