const assert=require('node:assert/strict'),fs=require('node:fs');
const expected=[['四季','春 夏 秋 冬'],['节日','春节 元宵 端午 中秋 除夕 七夕 重阳 寒食 清明'],['气候','风 雨 雪 云 雷'],['花木','花 草 树 竹 松 柳 梅 桃 荷 菊'],['动物','鸟 鱼 马 蝉 鹤 雁'],['乐器','琴 笛 箫 鼓 钟 筝'],['品格','忠 孝 仁 义 廉 勤 诚 勇']];
(async()=>{
 const pages=await(await fetch('http://127.0.0.1:9224/json')).json();const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r));let id=0;const jobs=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params);if(m.id){const j=jobs.get(m.id);jobs.delete(m.id);m.error?j.reject(m.error):j.resolve(m.result)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{jobs.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 try{
  await send('Runtime.enable');await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});
  await send('Page.navigate',{url:'file:///F:/F-P/sing/index.html'});
  let loaded=false;for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,50));if(await ev('document.readyState==="complete" && typeof chooseMode==="function"')){loaded=true;break}}
  assert(loaded,'Game loads');
  assert.equal(await ev('CHALLENGE_VOLUMES.length'),7,'All seven challenge volumes exist');
  assert.deepEqual(await ev('CHALLENGE_VOLUMES.map(v=>[v.name,v.chapters.map(c=>c.season).join(" ")])'),expected);
  assert.equal(await ev('LEARNING_WORKS.length'),300,'Each learning category has fifty complete works');
  assert.equal(await ev("!!matchChallenge('小荷才露尖尖角，早有蜻蜓立上头。','小池','杨万里',CHALLENGE_VOLUMES[0].chapters[1])"),true,'Original Song poems remain available in summer challenges');
  for(const title of ['池上','池上二绝·其二'])assert.equal(await ev(`!!matchChallenge('小娃撑小艇，偷采白莲回。',${JSON.stringify(title)},'白居易',CHALLENGE_VOLUMES.find(v=>v.id==='plants').chapters.find(c=>c.season==='荷'))`),true,'Known titles for the same learned poem remain valid');
  await ev(`sound=false;window.realTimeout=setTimeout;window.setTimeout=(fn,ms,...args)=>ms===850?(fn(...args),0):realTimeout(fn,ms,...args);
    window.answerNext=()=>{
      const entry=challengeEntries().find(e=>!state.usedVerses.includes(e.title+':'+normalize(e.sentence)));
      if(!entry)throw Error('Chapter has no unused answers: '+currentStage().season);
      $('challengeVerse').value=entry.sentence;$('challengeTitle').value=entry.title;$('challengeAuthor').value=entry.author;attackChallenge();
    };
    window.winTypedBoss=()=>{
      startChallengeBoss();const entries=challengeBossPool(state.challengeBoss.kind);const used=new Set();
      for(const entry of entries){if(used.has(normalize(entry.sentence)))continue;used.add(normalize(entry.sentence));
        $('challengeBossVerse').value=entry.sentence;$('challengeBossTitleInput').value=entry.title;$('challengeBossAuthor').value=entry.author;submitChallengeBoss();
        if(state.challengeBoss.status==='won')break;
      }
      if(state.challengeBoss.status!=='won')throw Error('Boss did not finish');finishChallengeBoss();
    };`);
  const catalog=await ev(`CHALLENGE_VOLUMES.map(v=>({id:v.id,title:v.title,chapters:v.chapters.map(c=>({topic:c.season,count:challengeEntries(c).length,
    damage:challengeEntries(c).reduce((n,e)=>n+normalize(e.sentence).length*2,0),hp:c.hp,
    valid:challengeEntries(c).every(e=>e.title&&e.author&&e.sentence.length<=200&&matchChallenge(e.sentence,e.title,e.author,c)),
    unique:new Set(challengeEntries(c).map(e=>e.title+':'+normalize(e.sentence))).size}))}))`);
  for(const volume of catalog)for(const c of volume.chapters){assert(c.count>=2,volume.title+c.topic);assert(c.valid,volume.title+c.topic);assert.equal(c.unique,c.count);assert(c.hp<=c.damage,'Every chapter has enough damage to advance')}
  assert.equal(await ev("challengeBossPool('七言').some(e=>e.title==='元日' && e.author==='王安石')"),true,'Newly encountered verses are available in matching Boss battles');
  await ev("document.querySelector('[data-entry-mode=challenge]').click()");
  assert.equal(await ev("document.querySelectorAll('[data-challenge-volume]').length"),7);
  assert.equal(await ev("$('challengeVolumeDetails').hidden"),true);
  assert.equal(await ev("[...document.querySelectorAll('[data-challenge-volume]')].every(e=>e.textContent==='进入')"),true);
  for(const width of [1366,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
    assert(await ev('document.documentElement.scrollWidth<=innerWidth'));
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`.browser-check/challenge-volumes-${width}.png`,Buffer.from(shot.data,'base64'));
  }
  for(const [index,volume] of catalog.entries()){
    await ev(`showModeSelection();document.querySelector('[data-entry-mode=challenge]').click();document.querySelector('[data-challenge-volume="${volume.id}"]').click()`);
    assert.equal(await ev("$('volumeTitle').textContent"),volume.title);
    assert.equal(await ev("document.querySelectorAll('.chapter-card').length"),expected[index][1].split(' ').length);
    assert.equal(await ev("$('startChallenge').textContent"),'开始挑战');
    if(volume.id==='plants')for(const width of [1366,320]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
      assert(await ev('document.documentElement.scrollWidth<=innerWidth'));
      assert(await ev("[...document.querySelectorAll('.chapter-card')].every(e=>e.scrollWidth<=e.clientWidth && e.scrollHeight<=e.clientHeight)"));
      const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`.browser-check/challenge-plants-${width}.png`,Buffer.from(shot.data,'base64'));
    }
    await ev("$('startChallenge').click();useHint();useHint();useHint()");
    assert.equal(await ev('state.volumeId'),volume.id);
    assert.equal(await ev("$('challengeVerse').value"),await ev('state.challengeHint.sentence'));
    await ev("$('challengeVerse').value+='错';attackChallenge()");
    assert.equal(await ev('state.challengeCorrect'),0);
    await ev('resetGame()');assert.equal(await ev('state.volumeId'),volume.id);
    assert.equal(await ev('state.challengeCorrect'),0);
    const visited=await ev(`(()=>{const visited=new Set();for(let i=0;i<40;i++){
      visited.add(state.stage);answerNext();if(state.challengeBoss)winTypedBoss();
      if(state.over && i!==39)throw Error('Ended before 40 normal answers');
    }return [...visited]})()`);
    assert.equal(visited.length,volume.chapters.length,'All child chapters are reachable in '+volume.title);
    assert.equal(await ev('state.challengeBossWins'),4);
    assert.equal(await ev('state.challengeCorrect'),40);
    assert.equal(await ev('state.over'),true);
    assert((await ev("$('resultDescription').textContent")).includes(expected[index][0]));
    await ev('resetGame()');assert.equal(await ev('state.stage'),0);assert.equal(await ev('state.volumeId'),volume.id);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 7 volumes / 48 chapters, valid answer pools, explicit entry buttons, responsive lists/slips, hints, reset isolation, all 7 complete 40-answer/four-Boss runs.');
 }finally{ws.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
