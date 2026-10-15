const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const modulePath = path.join(__dirname, '..', 'external-poetry.js');
assert.ok(fs.existsSync(modulePath), 'The external poetry verifier must exist');
const {evaluateRecord, verseKind, topicEvidence, createLookup} = require(modulePath);

const poem = {title:'春晓', authors:['孟浩然'], sentences:['春眠不觉晓，处处闻啼鸟。','夜来风雨声，花落知多少。'], source:'https://zh.wikisource.org/?curid=187779'};
const input = {verse:'春眠不觉晓，处处闻啼鸟',title:'春晓',author:'孟浩然',topic:'春'};
function result(overrides = {}, record = poem) { return evaluateRecord(record, {...input,...overrides}); }
assert.equal(result().status,'verified','A complete original sentence with matching attribution is accepted');
const traditional={...poem,title:'春曉',sentences:['春眠不覺曉，處處聞啼鳥。','夜來風雨聲，花落知多少。']};
assert.equal(result({},traditional).status,'verified','The actual API preserves traditional content despite variant=zh-cn');
assert.equal(result({verse:'春眠不覺曉，處處聞啼鳥',title:'春曉'},traditional).entry.sentence,'春眠不觉晓，处处闻啼鸟。');
assert.equal(result({author:'干隆'}, {...poem,authors:['乾隆']}).status,'mismatch','Phrase conversion must not corrupt the author 乾隆');
assert.equal(result({title:'《春晓》（孟浩然）'}).status,'verified','Author disambiguation suffix is allowed');
assert.equal(result({title:'春晓（李白）'}).status,'mismatch','A false author in the title must not disappear during normalization');
assert.equal(result({verse:'春眠不觉晓'}).status,'mismatch','A half sentence is not a complete original sentence');
assert.equal(result({verse:'春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。'}).status,'mismatch','Multiple full sentences cannot bypass the single-sentence contract');
assert.equal(result({verse:'春眠不觉晓，处处闻飞鸟。'}).status,'mismatch','A one-character fabricated variant is rejected');
assert.equal(result({author:'李白'}).status,'mismatch','The author must agree with original metadata');
const qinGuanSpring={title:'春日',authors:['秦观'],sentences:['一夕轻雷落万丝，霁光浮瓦碧参差。','有情芍药含春泪，无力蔷薇卧晓枝。'],source:'https://zh.wikisource.org/wiki/春日_(秦观)'};
assert.deepEqual(evaluateRecord(qinGuanSpring,{title:'春日',author:'朱熹',verse:'胜日寻芳泗水滨，无边光景一时新。',topic:'春'}),{status:'unverified',reason:'different-work'},'A different author and different verse identify a different same-title work, not a wrong answer');
assert.equal(evaluateRecord(qinGuanSpring,{title:'春日',author:'朱熹',verse:'一夕轻雷落万丝，霁光浮瓦碧参差。',topic:'春'}).reason,'author','An exact original sentence establishes the wrong-author mismatch');
assert.equal(result({title:'春望'}).status,'unverified','An unrelated search hit is not proof that the submission is false');
assert.equal(result({}, {...poem,authors:[]}).status,'unverified','No author metadata means no verification');
assert.equal(result({topic:'秋'}).status,'unverified','No topic evidence is uncertainty, not a false-verse judgment');
assert.equal(result({kind:'五言',topic:undefined}).status,'verified');
assert.equal(result({kind:'七言',topic:undefined}).status,'mismatch','Boss kind is measured on original punctuation');
assert.equal(result({kind:'五言',verse:'春眠，不觉晓处处闻，啼鸟',topic:undefined}).status,'verified','User punctuation cannot change source meter');
assert.equal(verseKind('关关雎鸠，在河之洲。'),'四言');
assert.equal(verseKind('明月几时有，把酒问青天。'),'五言');
assert.equal(verseKind('春蚕到死丝方尽，蜡炬成灰泪始干。'),'七言');
assert.equal(verseKind('大江东去，浪淘尽，千古风流人物。'),'杂言');
assert.equal(verseKind('一二三，一二三。'),'');

// Each literal is a recognizable lexical signal; removing a topic family should break these checks.
const topicExamples = {
  春:'春风',夏:'夏日',秋:'秋风',冬:'冬雪',春节:'元日',元宵:'上元',端午:'端阳',中秋:'八月十五',除夕:'守岁',七夕:'乞巧',重阳:'九日',寒食:'禁火',清明:'清明',
  风:'东风',雨:'夜雨',雪:'飞雪',云:'白云',雷:'雷声',花:'落英',草:'芳草',树:'梧桐',竹:'幽篁',松:'青松',柳:'杨柳',梅:'梅花',桃:'桃花',荷:'菡萏',菊:'黄花',
  鸟:'杜鹃',鱼:'鲈鱼',马:'骐骥',蝉:'寒蜩',鹤:'仙鹤',雁:'鸿雁',琴:'瑶琴',笛:'羌笛',箫:'洞箫',鼓:'鸣鼓',钟:'钟声',筝:'银筝',
  忠:'报国',孝:'慈母',仁:'仁心',义:'取义',廉:'清廉',勤:'勤学',诚:'诚信',勇:'勇毅'
};
for (const [topic,example] of Object.entries(topicExamples)) assert.equal(topicEvidence(example,'',topic),true,topic+' synonyms are supported');
assert.equal(Object.keys(topicExamples).length,48);
assert.equal(topicEvidence('春风','','unknown'),null,'Unknown topics fail closed');
assert.equal(topicEvidence('夜来风雨声','秋夜','春'),false);
assert.equal(topicEvidence('信是人间有别离','','诚'),false,'The adverb 信 is not evidence of the virtue 诚');
assert.equal(topicEvidence('岂敢言君子','','勇'),false,'An isolated 敢 does not establish bravery');

(async () => {
  const calls = [];
  const fetch = async (url, options) => {
    calls.push({url:new URL(url),options});
    const p = new URL(url).searchParams;
    // Live Wikisource returns the correct traditional title for unquoted simplified Chinese,
    // but an exact phrase query for "春晓" misses it. Final attribution is still exact below.
    if (p.get('action') === 'query') return {ok:true,json:async()=>({query:{search:p.get('srsearch').includes('"')?[]:[{ns:0,pageid:187779,title:'春曉 (孟浩然)'}]}})};
    return {ok:true,json:async()=>({parse:{title:'春曉 (孟浩然)',pageid:187779,text:'fixture'}})};
  };
  const lookup = createLookup({fetch,parsePage:()=>poem,minimumIntervalMs:0,timeoutMs:1000,cacheLimit:2});
  assert.equal((await lookup(input)).status,'verified');
  assert.ok(calls.every(c=>c.url.origin==='https://zh.wikisource.org' && c.url.searchParams.get('origin')==='*' && c.options.credentials==='omit'),'Only the fixed CORS endpoint is used');
  assert.equal(calls[1].url.searchParams.get('variant'),'zh-cn');
  assert.equal(calls[1].url.searchParams.get('uselang'),'zh-cn','Variant conversion needs a Chinese base language, independent of browser locale');
  const before = calls.length;
  assert.equal((await lookup({...input,verse:'夜来风雨声，花落知多少',topic:'雨'})).status,'verified');
  assert.equal(calls.length,before,'A cached original is reused but each submitted sentence is rechecked');
  assert.equal((await lookup({...input,verse:'春眠不觉晓'})).status,'mismatch','Cache never turns a later half-line into success');
  const unavailable = createLookup({fetch:async()=>{throw Error('offline')},minimumIntervalMs:0});
  assert.equal((await unavailable(input)).status,'unavailable');
  const limited = createLookup({fetch:async()=>({ok:false,status:429}),minimumIntervalMs:0});
  assert.equal((await limited(input)).status,'unavailable');
  assert.equal((await limited({...input,title:'春望'})).reason,'rate-limit','An upstream 429 cools down further lookups');
  const noHit = createLookup({fetch:async()=>({ok:true,json:async()=>({query:{search:[]}})}),minimumIntervalMs:0});
  assert.equal((await noHit(input)).status,'unverified');
  const unsafeHit = createLookup({fetch:async()=>({ok:true,json:async()=>({query:{search:[{ns:0,pageid:'https://evil.invalid',title:'春晓'}]}})}),minimumIntervalMs:0});
  assert.equal((await unsafeHit(input)).status,'unverified');
  const abort = new AbortController(); abort.abort();
  assert.equal((await lookup({...input,signal:abort.signal})).status,'unavailable','A cached response does not defeat cancellation');
  assert.equal((await lookup({...input,verse:'x'.repeat(3000)})).status,'unverified');
  const slow=createLookup({fetch:(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true})),timeoutMs:15,minimumIntervalMs:0});
  assert.equal((await slow(input)).reason,'timeout','The whole lookup has a finite deadline');
  const activeAbort=new AbortController();
  const waiting=slow({...input,signal:activeAbort.signal});
  activeAbort.abort();
  assert.equal((await waiting).reason,'aborted','In-flight work respects the caller cancellation signal');
  let cachedRequests=0;
  const fixtures={春晓:poem,春望:{...poem,title:'春望',authors:['杜甫'],sentences:['国破山河在，城春草木深。']},静夜思:{...poem,title:'静夜思',authors:['李白'],sentences:['床前明月光，疑是地上霜。']}};
  const bounded=createLookup({minimumIntervalMs:0,cacheLimit:2,fetch:async url=>{
    cachedRequests++;const p=new URL(url).searchParams;
    if(p.get('action')==='query'){const name=p.get('srsearch').split(' ')[0];return{ok:true,json:async()=>({query:{search:[{ns:0,pageid:Object.keys(fixtures).indexOf(name)+1}]}})};}
    return{ok:true,json:async()=>({parse:{text:Object.keys(fixtures)[Number(p.get('pageid'))-1]}})};
  },parsePage:name=>fixtures[name]});
  for(const record of Object.values(fixtures)) assert.equal((await bounded({title:record.title,author:record.authors[0],verse:record.sentences[0]})).status,'verified');
  const filled=cachedRequests;
  assert.equal((await bounded(input)).status,'verified');
  assert.equal(cachedRequests,filled+2,'The oldest work is evicted when the session cache reaches its limit');
  if (process.argv.includes('--browser')) await browserChecks();
  console.log('external-poetry: strict attribution, whole sentences, 48 themes, meter, network uncertainty, cache and cancellation checks passed');
})().catch(error=>{console.error(error);process.exitCode=1;});

async function browserChecks() {
  const endpoint = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9224';
  const browser = await (await global.fetch(endpoint+'/json/version')).json();
  const ws = new WebSocket(browser.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  let id=0; const pending=new Map();
  ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(msg.error):p.resolve(msg.result);}});
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  try {
    const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
    await run(fs.readFileSync(modulePath,'utf8'));
    const fixture = '<div class="mw-parser-output"><div id="headerContainer"><table><tr><td><b>春晓</b><br>作者：<a href="/wiki/Author:孟浩然">孟浩然</a> 唐</td></tr></table></div><div class="poem"><p>春眠不觉晓，处处闻啼鸟。<br>夜来风雨声<sup class="reference">[1]</sup>，花落知多少。</p></div><div class="reflist">伪造句子，伪造下句。</div><script>window.injected=true</script></div>';
    const extracted=await run('ExternalPoetry.extractPage('+JSON.stringify(fixture)+',{pageid:187779})');
    assert.equal(extracted.title,'春晓');
    assert.deepEqual(extracted.authors,['孟浩然']);
    assert.deepEqual(extracted.sentences,['春眠不觉晓，处处闻啼鸟。','夜来风雨声，花落知多少。']);
    assert.equal(await run('Boolean(window.injected)'),false,'Remote scripts are never inserted into the live document');
    const noPoem=fixture.replace('class="poem"','class="commentary"');
    assert.equal(await run('ExternalPoetry.extractPage('+JSON.stringify(noPoem)+',{pageid:1})'),null,'Commentary-only pages cannot establish original verse');
    const translated=fixture.replace('孟浩然</a> 唐','孟浩然</a> 唐 译者：<a href="/wiki/Author:李白">李白</a>');
    assert.deepEqual(await run('ExternalPoetry.extractPage('+JSON.stringify(translated)+',{pageid:187779}).authors'),['孟浩然'],'A translator in the metadata is not the original author');
    // A self-contained representation of the observed API's traditional markup.
    // Keep browser regression tests independent of ignored download caches and live networking.
    const apiFixture=fixture.replaceAll('春晓','春曉').replace('春眠不觉晓，处处闻啼鸟。','春眠不覺曉，處處聞啼鳥。').replace('夜来风雨声','夜來風雨聲');
    const real=await run('ExternalPoetry.extractPage('+JSON.stringify(apiFixture)+',{pageid:187779})');
    assert.equal(real.title,'春晓');
    assert.deepEqual(real.authors,['孟浩然']);
    assert.deepEqual(real.sentences,['春眠不觉晓，处处闻啼鸟。','夜来风雨声，花落知多少。']);
    assert.equal(evaluateRecord(real,input).status,'verified','Traditional API markup verifies a simplified submission');
    console.log('external-poetry: real browser DOM extraction, footnotes and inert remote HTML checks passed');
  } finally {await send('Target.closeTarget',{targetId});ws.close();}
}
