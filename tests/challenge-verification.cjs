const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const pages=await(await fetch('http://127.0.0.1:9224/json')).json();
 const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
 let id=0;const jobs=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params);if(m.id){const j=jobs.get(m.id);jobs.delete(m.id);m.error?j.reject(m.error):j.resolve(m.result)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{jobs.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 try{
  await send('Runtime.enable');await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});
  await send('Page.navigate',{url:'file:///F:/F-P/sing/index.html'});await new Promise(r=>setTimeout(r,800));
  await ev(`sound=false;startGame('challenge');window.realTimeout=setTimeout;window.setTimeout=(fn,ms,...args)=>ms===850?(fn(...args),0):realTimeout(fn,ms,...args);
    window.fillUnknown=()=>{$('challengeVerse').value='胜日寻芳泗水滨，无边光景一时新。';$('challengeTitle').value='春日';$('challengeAuthor').value='朱熹'};
    window.externalCalls=0;window.lookupExternalPoem=async()=>{externalCalls++;return {status:'unavailable'}};
  `);
  await ev(`state.usedVerses.push(state.challengeHint.title+':'+normalize(state.challengeHint.sentence));useHint()`);
  assert(await ev('!challengeVerseUsed(state.challengeHint.sentence)'),'Help skips a stale already-used candidate');
  await ev('useHint();useHint();window.previousHint=state.challengeHint.sentence;useHint()');
  assert.equal(await ev('state.challengeHintStep'),1);
  assert(await ev('state.challengeHint.sentence!==previousHint'),'A completed hint can switch to another unused verse');
  await ev('fillUnknown();attackChallenge()');
  assert.equal(await ev('state.hp'),6);assert.equal(await ev('state.challengeCorrect'),0);
  assert.equal(await ev("$('challengeTitle').value"),'春日');
  assert(await ev("$('feedback').textContent.includes('不扣爱心')"));
  await ev("lookupExternalPoem=async()=>({status:'verified',entry:{title:'春日',author:'朱熹',sentence:'胜日寻芳泗水滨，无边光景一时新。',source:'https://zh.wikisource.org/wiki/春日_(朱熹)'}});attackChallenge()");
  assert.equal(await ev('state.challengeCorrect'),1,'A verified verse outside the curated stage is accepted');
  await ev("resetGame();lookupExternalPoem=async()=>({status:'mismatch',reason:'author'});fillUnknown();attackChallenge()");
  assert.equal(await ev('state.hp'),5,'An explicit source mismatch costs one heart');
  await ev("resetGame();externalCalls=0;lookupExternalPoem=()=>{externalCalls++;return new Promise(r=>window.resolveVerification=r)};fillUnknown();void attackChallenge();void attackChallenge()");
  assert.equal(await ev('externalCalls'),1,'Repeated clicks cannot submit concurrent lookups');
  assert.equal(await ev("$('challengeVerse').disabled"),true);
  await ev("resetGame();resolveVerification({status:'verified',entry:{title:'春日',author:'朱熹',sentence:'胜日寻芳泗水滨，无边光景一时新。'}});Promise.resolve()");
  assert.equal(await ev('state.challengeCorrect'),0,'A lookup from an abandoned round cannot affect its replacement');
  await ev("state.challengeCorrect=10;queueChallengeBoss();lookupExternalPoem=async()=>({status:'unavailable'});$('challengeBossVerse').value='未知完整诗句';$('challengeBossTitleInput').value='未收录';$('challengeBossAuthor').value='作者';submitChallengeBoss()");
  assert.equal(await ev('state.challengeBoss.hp'),6);assert.equal(await ev('state.challengeBoss.index'),0);
  assert(await ev("$('challengeBossFeedback').textContent.includes('不扣爱心')"));
  assert.equal(await ev("document.querySelectorAll('dialog[open]').length"),0);
  for(const width of [1366,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    assert(await ev('document.documentElement.scrollWidth<=innerWidth'));
    assert(await ev("$('challengeTip').getBoundingClientRect().bottom<document.querySelector('.reading-card').getBoundingClientRect().top"),'Tip sits above the correct-verse card');
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`.browser-check/inline-challenge-${width}.png`,Buffer.from(shot.data,'base64'));
  }
  await ev("showModeSelection();localStorage.removeItem(learningSaveKey('唐诗'));startGame('learning','唐诗');state.workOrder=state.workOrder.slice(0,3);state.workIndex=1;newPuzzle();window.savedTitle=learningWork().title;saveLearningProgress(true);startGame('learning','唐诗')");
  assert.equal(await ev('state.workOrder.length'),50,'An older smaller book appends newly added works');
  assert.equal(await ev('state.workIndex'),1);assert(await ev('learningWork().title===savedTitle'));
  await ev("localStorage.removeItem(learningSaveKey('唐诗'));showModeSelection();localStorage.removeItem(learningSaveKey('汉赋'));startGame('learning','汉赋');state.workIndex=state.workOrder.indexOf('羽猎赋');state.sentenceIndex=learningWork().sentences.map(s=>normalize(s).length).indexOf(149);state.learningPreview=false;newPuzzle();render()");
  for(const width of [1366,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    assert(await ev('document.documentElement.scrollWidth<=innerWidth'),'Long fu sentences stay within the viewport');
    assert(await ev("$('attackButton').getBoundingClientRect().bottom<=document.documentElement.scrollHeight"));
  }
  assert.deepEqual(errors,[]);console.log('PASS: unused/cycling hints, verified external answers, unknown/no-penalty and mismatch paths, double-submit and stale-response guards, inline Boss, sidebar tips, old book saves, long fu layout.');
 }finally{ws.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
