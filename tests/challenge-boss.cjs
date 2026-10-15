const assert = require('node:assert/strict');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const path = require('node:path');

(async () => {
  const pages = await (await fetch('http://127.0.0.1:9224/json')).json();
  const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));
  let id = 0;
  const pending = new Map(), errors = [];
  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params);
    if (msg.id) { const job = pending.get(msg.id); pending.delete(msg.id); msg.error ? job.reject(msg.error) : job.resolve(msg.result); }
  });
  const send = (method, params = {}) => new Promise((resolve,reject) => { pending.set(++id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); });
  const ev = async expression => {
    const result = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  try {
    await send('Runtime.enable'); await send('Network.enable');
    await send('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});
    await send('Page.navigate',{url:pathToFileURL(path.resolve('index.html')).href});
    await new Promise(resolve => setTimeout(resolve,700));
    await ev(`window.realTimeout = window.setTimeout;
      window.setTimeout = (fn,ms,...args) => ms === 850 ? (fn(...args),0) : realTimeout(fn,ms,...args);
      window.normalAnswer = () => {
        const item = LEARNING_WORKS.filter(w => currentStage().titles.includes(w.title))
          .flatMap(w => w.sentences.map(sentence => ({...w,sentence})))
          .find(w => !state.usedVerses.includes(w.title + ':' + normalize(w.sentence)));
        if (!item) throw Error('No available normal answers');
        $('challengeVerse').value=item.sentence; $('challengeTitle').value=item.title; $('challengeAuthor').value=item.author;
        attackChallenge();
      };
      window.bossAnswer = (item) => {
        $('challengeBossVerse').value=item.sentence; $('challengeBossTitleInput').value=item.title; $('challengeBossAuthor').value=item.author;
        $('challengeBossForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      };
      window.answersFor = (kind) => LEARNING_WORKS.flatMap(w => w.sentences.map(sentence => ({...w,sentence}))).filter(w => {
        const lengths = w.sentence.split(/[，,。！？!?；;]/u).map(normalize).filter(Boolean).map(s => [...s].length);
        return kind === '杂言' ? new Set(lengths).size > 1 : lengths.length > 0 && lengths.every(n => n === ({'五言':5,'七言':7,'四言':4})[kind]);
      });
      startGame('challenge'); normalAnswer();
      $('challengeVerse').value=state.lastChallenge.sentence; $('challengeTitle').value=state.lastChallenge.title; $('challengeAuthor').value=state.lastChallenge.author;
      attackChallenge();`);
    assert.equal(await ev('state.challengeCorrect'),1,'Repeated normal answers do not advance the checkpoint');
    await ev('for(let i=0;i<8;i++) normalAnswer()');
    assert.equal(await ev('state.over'),false,'Normal challenges continue beyond the original four chapters');
    assert.equal(await ev('!!state.challengeBoss'),false,'No Boss before the tenth correct answer');
    await ev("$('challengeVerse').value='错误诗句'; $('challengeTitle').value='错误'; $('challengeAuthor').value='错误'; attackChallenge()");
    assert.equal(await ev('state.challengeCorrect'),9,'Wrong normal answers do not advance the checkpoint');
    await ev('normalAnswer()');
    assert.equal(await ev('state.challengeBoss?.kind'),'五言','The tenth answer opens the first Boss');
    for (const [index,kind] of ['五言','七言','四言','杂言'].entries()) {
      assert.equal(await ev('state.challengeCorrect'),(index+1)*10);
      assert.equal(await ev('state.challengeBoss.kind'),kind);
      assert.equal(await ev("$('challengeBossDialog').open"),true);
      await ev("$('challengeBossPause').click(); normalAnswer()");
      assert.equal(await ev('state.challengeCorrect'),(index+1)*10,'Closing the Boss cannot bypass it');
      await ev("$('challengeBossResume').click(); $('challengeBossStart').click()");
      await ev("for(let i=0;i<3;i++) $('challengeBossHintButton').click()");
      assert.equal(await ev('state.challengeBoss.hintStep'),3);
      assert.equal(await ev("$('challengeBossHintButton').disabled"),true);
      assert.equal(await ev("$('challengeBossVerse').value"),await ev('state.challengeBoss.hint.sentence'));
      assert.equal(await ev("$('challengeBossTitleInput').value"),await ev('state.challengeBoss.hint.title'));
      assert.equal(await ev("$('challengeBossAuthor').value"),await ev('state.challengeBoss.hint.author'));
      assert.equal(await ev("$('challengeBossHint')"),null);
      if (index === 0) {
        await ev("bossAnswer(answersFor('七言')[0])");
        assert.equal(await ev('state.challengeBoss.hp'),5,'Wrong verse length loses one heart');
        assert.equal(await ev('state.challengeBoss.index'),0);
        await ev("for(let i=0;i<5;i++) bossAnswer(answersFor('七言')[0])");
        assert.equal(await ev('state.challengeBoss.status'),'lost');
        await ev("$('challengeBossStart').click()");
        assert.equal(await ev('state.challengeBoss.hp'),6);
      }
      await ev(`window.bossExamples=answersFor(${JSON.stringify(kind)}); bossAnswer(bossExamples[0]); bossAnswer(bossExamples[0])`);
      assert.equal(await ev('state.challengeBoss.index'),1,'Duplicate verses do not damage Boss twice');
      assert.equal(await ev('state.challengeBoss.hintStep'),0,'Boss help resets for the next unused sentence');
      assert.equal(await ev('state.challengeBoss.hp'),6,'Duplicate submissions do not lose hearts');
      await ev('bossAnswer(bossExamples[1])');
      assert.equal(await ev('state.challengeBoss.status'),'active','Two answers are insufficient');
      if (index === 0) {
        for(const width of [1366,320]) {
          await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
          assert(await ev('document.documentElement.scrollWidth<=innerWidth'));
          assert(await ev("$('challengeBossDialog').scrollWidth <= $('challengeBossDialog').clientWidth"));
          const shot=await send('Page.captureScreenshot',{format:'png'});
          fs.writeFileSync(`.browser-check/challenge-boss-${width}.png`,Buffer.from(shot.data,'base64'));
        }
      }
      await ev('bossAnswer(bossExamples[2]); bossAnswer(bossExamples[3])');
      assert.equal(await ev('state.challengeBoss.index'),3,'Exactly three correct answers win');
      assert.equal(await ev('state.challengeBoss.status'),'won');
      assert.equal(await ev('state.challengeCorrect'),(index+1)*10,'Boss answers do not count toward the next ten');
      await ev("$('challengeBossContinue').click()");
      assert.equal(await ev('state.challengeBossWins'),index+1);
      if(index<3) {
        await ev('for(let i=0;i<9;i++) normalAnswer()');
        assert.equal(await ev('!!state.challengeBoss'),false);
        await ev('normalAnswer()');
      }
    }
    assert.equal(await ev('state.over'),true);
    assert.equal(await ev("$('resultDialog').open"),true);
    await ev('resetGame()');
    assert.equal(await ev('state.challengeCorrect'),0);
    assert.equal(await ev('state.challengeBossWins'),0);
    assert.equal(await ev('!!state.challengeBoss'),false);
    await ev('for(let i=0;i<10;i++) normalAnswer(); showModeSelection()');
    assert.equal(await ev("$('challengeBossDialog').open"),false);
    assert.equal(await ev('attackEffects.size'),0,'Leaving the mode removes attack effects');
    await ev("startGame('learning','唐诗')");
    assert.equal(await ev('!!state.challengeBoss'),false,'Challenge boss does not leak into learning');
    assert.deepEqual(errors,[]);
    console.log('PASS: normal 10/20/30/40 checkpoints, four verse forms, three-answer wins, wrong/repeated answers, retry, pause gating, responsive Boss, final victory and reset.');
  } finally { ws.close(); }
})().catch(err => {console.error(err);process.exitCode=1;});
