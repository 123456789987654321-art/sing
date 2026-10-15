const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const ctx = vm.createContext({});
for (const file of ['poems.js', 'learning-data-shijing-chuci.js', 'learning-data-hanfu.js', 'learning-data-tang-song-yuan.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, {filename:file});
}
const data = vm.runInContext(`({
  original:POEMS, shijing:LEARNING_SHIJING_CHUCI, hanfu:LEARNING_HANFU,
  tang:LEARNING_TANG_SONG_YUAN, corrections:LEARNING_SHIJING_CHUCI_CORRECTIONS,
  shijingSources:LEARNING_SHIJING_CHUCI_SOURCES, hanfuSources:LEARNING_HANFU_SOURCES,
  tangSources:LEARNING_TANG_SONG_YUAN_SOURCES
})`, ctx);
const categories = ['诗经', '楚辞', '汉赋', '唐诗', '宋词', '元曲'];
const key = row => row.slice(0, 3).join('|');
const normalize = text => [...text.normalize('NFKC')].filter(char=>/\p{Script=Han}/u.test(char)).join('');
const original = data.original.filter(row=>categories.includes(row[0]) && !/节选|摘录|片段/.test(row[2])).map(row=>{
  const correction = data.corrections.find(item=>item.category===row[0] && item.title===row[2]);
  return correction ? [row[0], row[1], row[2], correction.text] : [...row];
});
const additions = [...data.shijing, ...data.hanfu, ...data.tang];
const rows = [...original, ...additions];
assert.equal(rows.length, 300, 'Six learning categories must contain exactly 300 works');
const counts = Object.fromEntries(categories.map(category=>[category, rows.filter(row=>row[0]===category).length]));
for (const category of categories) assert.equal(counts[category], 50, `${category} must contain 50 works`);
const seenKeys = new Set(), seenBodies = new Map();
for (const row of rows) {
  assert.equal(row.length, 4, key(row));
  assert.ok(row.every(value=>typeof value==='string' && value.trim()), `Empty field: ${key(row)}`);
  assert.ok(categories.includes(row[0]), `Unexpected category: ${key(row)}`);
  assert.ok(!/节选|摘录|片段/.test(row[2]), `Excerpt: ${key(row)}`);
  assert.ok(!/[�□]|\u0000/.test(row[3]), `Missing/corrupt text: ${key(row)}`);
  assert.ok(!seenKeys.has(key(row)), `Duplicate identity: ${key(row)}`);
  seenKeys.add(key(row));
  const body = normalize(row[3]);
  assert.ok(body, `No Chinese text: ${key(row)}`);
  assert.ok(!seenBodies.has(body), `Duplicate body: ${key(row)} / ${seenBodies.get(body)}`);
  seenBodies.set(body, key(row));
}
function sourceUrls(source) {
  if (typeof source==='string') return [source];
  if (Array.isArray(source)) return source;
  if (source && typeof source==='object') return [source.url, ...(source.sources || [])].filter(Boolean);
  return [];
}
for (const row of additions) {
  const source = data.shijingSources[row[2]] || data.hanfuSources[row[1]+'|'+row[2]] || data.tangSources[key(row)];
  const urls = sourceUrls(source);
  assert.ok(urls.length, `Missing source: ${key(row)}`);
  for (const url of urls) assert.ok(/^https:\/\//.test(url), `Invalid source URL: ${key(row)}`);
}
for (const correction of data.corrections) {
  assert.equal(original.filter(row=>row[0]===correction.category && row[2]===correction.title).length, 1, 'Correction must match exactly one existing work');
  assert.ok(correction.sources?.length, 'Corrections must retain their sources');
}
assert.ok(data.hanfuSources['张衡|归田赋'], 'Existing Han fu must retain its source');
const sentences = rows.flatMap(row=>(row[3].match(/[^。！？!?]+[。！？!?]?/gu)||[]).map(text=>({work:key(row),chars:[...normalize(text)].length,text})));
const longest = sentences.sort((a,b)=>b.chars-a.chars).slice(0,5).map(({work,chars})=>({work,chars}));
console.log(JSON.stringify({works:rows.length,counts,uniqueBodies:seenBodies.size,additionsWithSources:additions.length,existingWorks:original.length,longestSentences:longest},null,2));
