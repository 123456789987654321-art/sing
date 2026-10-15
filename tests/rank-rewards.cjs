const assert = require('node:assert/strict');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const path = require('node:path');

// Run against a disposable browser profile with remote debugging on port 9224.
(async () => {
  const pages = await (await fetch('http://127.0.0.1:9224/json')).json();
  const ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));
  let id = 0;
  const jobs = new Map(), errors = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
    if (message.id) {
      const job = jobs.get(message.id); jobs.delete(message.id);
      message.error ? job.reject(message.error) : job.resolve(message.result);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    jobs.set(++id, {resolve, reject}); ws.send(JSON.stringify({id, method, params}));
  });
  const ev = async expression => {
    const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const load = async () => {
    await send('Page.navigate', {url:pathToFileURL(path.resolve('index.html')).href});
    for (let i = 0; i < 100; i++) {
      if (await ev('document.readyState === "complete" && typeof startGame === "function"')) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw Error('Page did not load');
  };
  try {
    await send('Runtime.enable'); await send('Network.enable');
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await send('Network.setBlockedURLs', {urls:['*fonts.googleapis.com*', '*fonts.gstatic.com*']});
    await load(); await ev('localStorage.clear()'); await load();
    assert.equal(await ev('LEARNING_WORKS.length'), 300, 'Six learning books contain 300 complete works');
    assert.deepEqual(await ev('LEARNING_CATEGORIES.map(category => categoryWorks(category.name).length)'), [50,50,50,50,50,50]);
    assert.deepEqual(await ev('Array.from(document.querySelectorAll("[data-entry-mode]"), button => button.dataset.entryMode).sort()'), ['challenge','learning']);
    await ev("startGame('learning', '唐诗')");
    assert.equal(await ev('state.learningPreview'), true, 'Learning starts with the complete work to memorize');
    assert.equal(await ev("$('previewText').textContent"), (await ev('learningWork().sentences')).join('\n'));
    assert.equal(await ev("$('answerSlots').hidden"), true);
    await ev('attack(); saveLearningProgress()');
    assert.equal(await ev('state.solved'), 0, 'Preview cannot be submitted as an answer');
    assert.equal(await ev("learnedWorkCount('唐诗')"), 0, 'Previewing does not count a learned work');
    const previewTitle = await ev('learningWork().title');
    await ev("startGame('learning', '唐诗')");
    assert.equal(await ev('state.learningPreview'), true);
    assert.equal(await ev('learningWork().title'), previewTitle, 'Preview saves preserve the selected poem');
    for (const width of [1366, 320]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:false});
      assert(await ev('document.documentElement.scrollWidth <= innerWidth'));
      const shot = await send('Page.captureScreenshot', {format:'png'});
      fs.writeFileSync(`.browser-check/learning-preview-${width}.png`, Buffer.from(shot.data, 'base64'));
    }
    await ev("$('startLearningChallenge').click()");
    assert.equal(await ev('state.learningPreview'), false);
    assert.equal(await ev("$('readingText').textContent"), '');
    await ev("saveLearningProgress(); startGame('learning', '唐诗')");
    assert.equal(await ev('state.learningPreview'), false, 'Puzzle saves do not revert to preview');
    await ev(`window.originalTimeout = window.setTimeout;
      window.setTimeout = (fn, ms, ...args) => ms === 850 ? (fn(...args), 0) : originalTimeout(fn, ms, ...args);
      window.solve = () => {
        if (state.learningPreview) $('startLearningChallenge').click();
        for (let i = 0; i < state.selected.length; i++) {
          const tile = state.tiles.find(t => t.char === [...state.question.answer][i] && !state.selected.includes(t.id));
          selectCharacter(tile.id);
        }
        attack();
      };
      // Exercise the real final three works and the checkpoint at 48, while
      // seeding the already-tested earlier chapters instead of solving 300 works.
      window.prepareBookFinale = category => {
        startGame('learning', category);
        if (state.poemComplete && state.workIndex + 1 === learningWorks().length) return;
        const ordered = categoryWorks(category).slice().sort((a, b) => b.text.length - a.text.length);
        state.workOrder = ordered.map(work => work.title);
        ordered.slice(0, 47).forEach(work => markLearningWorkComplete(category, work.title));
        Object.assign(state, {workIndex:47, sentenceIndex:0, confirmedSentences:0,
          completedWorks:47, poemComplete:false, learningPreview:true,
          boss:null, bossClearedAt:44, hp:6, busy:false, over:false,
          solved:ordered.slice(0, 47).reduce((sum, work) => sum + work.sentences.length, 0)});
        newPuzzle(); render(); saveLearningProgress(true);
      };
      window.finishBook = category => {
        prepareBookFinale(category);
        while (true) {
          if (state.boss) finishBossTest();
          if (state.poemComplete) {
            if (state.workIndex + 1 === learningWorks().length) break;
            nextLearningWork();
          }
          solve();
        }
      };
      startGame('learning', '唐诗');
      while (!state.poemComplete) solve();`);
    assert.equal(await ev("document.querySelector('.player-card h2').textContent"), '执笔小书生', 'One poem is not a whole book');
    assert.equal(await ev("document.querySelectorAll('.scene .attack-fx').length"), 1, 'A correct learning attack plays a hit effect');
    assert.equal(await ev("learnedWorkCount('唐诗')"), 1, 'Completing a real work updates the category count');
    await ev('markLearningWorkComplete(state.category, learningWork().title)');
    assert.equal(await ev("learnedWorkCount('唐诗')"), 1, 'A learned title counts only once');
    await ev(`window.fillBossTest = () => {
      const boss = state.boss;
      for (const char of [...normalize(boss.questions[boss.index].sentence)]) {
        const tile = boss.tiles.findIndex((value, id) => value === char && !boss.selected.includes(id));
        selectBossTile(tile);
      }
    };
    window.finishBossTest = () => {
      if (state.boss.status === 'intro' || state.boss.status === 'lost') startBossBattle();
      while (state.boss.status === 'active') { fillBossTest(); submitBossAnswer(); }
      if (state.boss.status === 'won') finishBossBattle();
    };
    while (state.completedWorks < 3) {
      if (state.poemComplete) nextLearningWork();
      solve();
    }`);
    assert.equal(await ev('Boolean(state.boss)'), false, 'Three poems do not trigger a Boss');
    await ev('nextLearningWork(); while (!state.poemComplete) solve();');
    assert.equal(await ev('state.boss?.status'), 'intro', 'The fourth completed poem triggers a Boss');
    assert.equal(await ev("$('bossDialog').open"), true);
    assert.equal(await ev('state.boss.questions.length'), 8);
    assert.deepEqual(await ev('Object.values(state.boss.questions.reduce((out,q)=>(out[q.title]=(out[q.title]||0)+1,out),{}))'), [2,2,2,2]);
    assert.equal(await ev('new Set(state.boss.questions.map(q => q.title + q.sentence)).size'), 8);
    assert.equal(await ev('state.boss.questions.every(q => learningWorks().slice(0,4).some(w=>w.title===q.title && w.sentences.includes(q.sentence)))'), true);
    for (const width of [1366, 320]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:false});
      await ev("Promise.all($('bossDialog').getAnimations().map(animation => animation.finished))");
      assert(await ev("$('bossDialog').scrollWidth <= $('bossDialog').clientWidth"));
      const shot = await send('Page.captureScreenshot', {format:'png'});
      fs.writeFileSync(`.browser-check/boss-intro-${width}.png`, Buffer.from(shot.data, 'base64'));
    }
    await ev('startBossBattle(); fillBossTest(); submitBossAnswer(); submitBossAnswer();');
    assert.equal(await ev('state.boss.index'), 1, 'Repeated submit cannot answer the next question');
    assert(await ev("$('bossQuestionClue').textContent.startsWith('原诗第 ')"));
    assert.equal(await ev('state.completedWorks'), 4, 'Boss review is not another learned poem');
    for (const width of [1366, 320]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:false});
      assert(await ev("$('bossDialog').scrollWidth <= $('bossDialog').clientWidth"));
      const shot = await send('Page.captureScreenshot', {format:'png'});
      fs.writeFileSync(`.browser-check/boss-combat-${width}.png`, Buffer.from(shot.data, 'base64'));
    }
    await ev('selectBossTile(0); saveLearningProgress()');
    const savedBoss = await ev('JSON.stringify(state.boss)');
    const helpers = await ev('Object.fromEntries(["solve","prepareBookFinale","finishBook","fillBossTest","finishBossTest"].map(name=>[name,window[name].toString()]))');
    await load();
    await ev(Object.entries(helpers).map(([name,body]) => `window.${name}=${body};`).join('\n'));
    await ev(`window.originalTimeout = window.setTimeout;
      window.setTimeout = (fn, ms, ...args) => ms === 850 ? (fn(...args), 0) : originalTimeout(fn, ms, ...args);
      startGame('learning', '唐诗');`);
    assert.equal(await ev('JSON.stringify(state.boss)'), savedBoss, 'Boss answer, lives, and order restore');
    assert.equal(await ev("learnedWorkCount('唐诗')"), 4, 'Category learning totals survive a reload');
    await ev(`state.boss.selected.fill(null);
      window.wrongBossTest = () => {
        state.boss.selected.fill(null);
        const answer = normalize(state.boss.questions[state.boss.index].sentence);
        const wrong = state.boss.tiles.findIndex(char => char !== answer[0]);
        selectBossTile(wrong);
        while (state.boss.selected.includes(null)) selectBossTile(state.boss.tiles.findIndex((_, id) => !state.boss.selected.includes(id)));
        submitBossAnswer();
      };
      for (let i=0; i<6; i++) wrongBossTest();`);
    assert.equal(await ev('state.boss.status'), 'lost');
    assert.equal(await ev('state.completedWorks'), 4);
    await ev('startBossBattle()');
    assert.equal(await ev('state.boss.hp'), 6);
    assert.equal(await ev('state.boss.index'), 0);
    await ev('while (state.boss.status === "active") { fillBossTest(); submitBossAnswer(); }');
    assert.equal(await ev('state.boss.status'), 'won');
    assert.equal(await ev('state.boss.index'), 8);
    const winShot = await send('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync('.browser-check/boss-victory-320.png', Buffer.from(winShot.data, 'base64'));
    await ev('finishBossBattle()');
    assert.equal(await ev('state.boss'), null);
    await ev('nextLearningWork()');
    assert.equal(await ev('state.workIndex'), 4);
    assert.equal(await ev('state.learningPreview'), true);
    await ev('while (state.completedWorks < 8) { if (state.poemComplete) nextLearningWork(); solve(); }');
    assert.equal(await ev('state.boss.checkpoint'), 8, 'Every fourth poem triggers another Boss');
    assert.equal(await ev('state.boss.questions.every(q => learningWorks().slice(4,8).some(w=>w.title===q.title && w.sentences.includes(q.sentence)))'), true);
    await ev(`const brokenSave = JSON.parse(localStorage.getItem(learningSaveKey(state.category)));
      brokenSave.boss.tiles = null; localStorage.setItem(learningSaveKey(state.category), JSON.stringify(brokenSave)); startGame('learning', '唐诗');`);
    assert.equal(await ev('state.boss.status'), 'intro', 'Invalid Boss saves regenerate the due encounter safely');
    assert.equal(await ev('state.completedWorks'), 8);
    await ev('finishBossTest()');
    await ev("prepareBookFinale('汉赋'); while (!state.poemComplete) solve();");
    assert.equal(await ev('state.completedWorks'), 48);
    assert.equal(await ev('state.boss?.checkpoint'), 48, 'The final four-work checkpoint still requires a Boss');
    assert.equal(await ev('state.boss.questions.length'), 8);
    assert.equal(await ev('state.boss.questions.every(q => learningWorks().slice(44,48).some(w => w.title === q.title && w.sentences.includes(q.sentence)))'), true);
    assert.equal(await ev('completedBooks.has("汉赋")'), false, 'Forty-eight works do not complete a fifty-work book');
    assert.equal(await ev("$('rankRewardDialog').open"), false);
    await ev('nextLearningWork()');
    assert.equal(await ev('state.workIndex'), 47, 'The pending Boss prevents skipping to work 49');
    await ev('finishBossTest(); nextLearningWork(); while (!state.poemComplete) solve();');
    assert.equal(await ev("learnedWorkCount('汉赋')"), 49);
    assert.equal(await ev('completedBooks.has("汉赋")'), false, 'Forty-nine works still do not promote');
    await ev('nextLearningWork(); while (!state.poemComplete) solve();');
    assert.equal(await ev("learnedWorkCount('汉赋')"), 50);
    assert.equal(await ev("document.querySelector('.player-card h2').textContent"), '略通诗中韵', 'A whole book promotes the player');
    assert.equal(await ev("$('rankRewardDialog').open"), true);
    assert.equal(await ev("$('rewardRank').textContent"), '略通诗中韵');
    assert.equal(await ev("$('rewardLevel').textContent"), '略通诗中韵', 'Promotion shows old title to new title');
    assert.equal(await ev("document.activeElement.id"), 'continueLearning');
    await ev("Promise.all($('rankRewardDialog').getAnimations().map(animation => animation.finished))");
    for (const width of [1366, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:false});
      assert(await ev(`(() => { const r = $('rankRewardDialog').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; })()`));
      assert(await ev("$('rankRewardDialog').scrollWidth <= $('rankRewardDialog').clientWidth"));
      const shot = await send('Page.captureScreenshot', {format:'png'});
      fs.mkdirSync('.browser-check', {recursive:true});
      fs.writeFileSync(`.browser-check/rank-reward-${width}.png`, Buffer.from(shot.data, 'base64'));
    }
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    assert.equal(await ev("getComputedStyle($('rankRewardDialog')).animationName"), 'none');
    await ev("$('continueLearning').click(); saveLearningProgress(); finishBook('汉赋');");
    assert.equal(await ev("$('rankRewardDialog').open"), false, 'Repeated book earns no duplicate reward');
    assert.equal(await ev("$('playerRank').textContent"), '略通诗中韵');
    const cases = [['诗经','能诗亦善对'], ['楚辞','出口便成诗'], ['宋词','诗才已出众'], ['元曲','诗中之俊杰']];
    for (const [category, rank] of cases) {
      await ev(`finishBook(${JSON.stringify(category)})`);
      assert.equal(await ev(`learnedWorkCount(${JSON.stringify(category)})`), 50);
      assert.equal(await ev("$('playerRank').textContent"), rank);
      assert.equal(await ev("$('rankRewardDialog').open"), true);
      await ev("$('continueLearning').click()");
    }
    await ev("finishBook('唐诗')");
    assert.equal(await ev("$('playerRank').textContent"), '诗中之俊杰');
    assert.equal(await ev("$('rankRewardDialog').open"), false, 'Highest rank is capped');
    assert.deepEqual(await ev('LEARNING_CATEGORIES.map(category => learnedWorkCount(category.name))'), [50,50,50,50,50,50]);
    await load(); await ev("startGame('challenge')");
    assert.equal(await ev("$('playerRank').textContent"), '诗中之俊杰', 'Rank persists across reload and mode changes');
    assert.equal(await ev("$('rankRewardDialog').open"), false, 'Reload does not replay a reward');
    assert.deepEqual(await ev('LEARNING_CATEGORIES.map(category => learnedWorkCount(category.name))'), [50,50,50,50,50,50]);
    // A previously saved, completed final work earns its book when opened,
    // but restoring it must not replay a celebration.
    await ev("localStorage.removeItem('poetry-completed-books-v1')");
    await load(); await ev("startGame('learning', '汉赋')");
    assert.equal(await ev("$('playerRank').textContent"), '略通诗中韵', 'Completed legacy saves recover their earned rank');
    assert.equal(await ev("$('rankRewardDialog').open"), false);
    await ev('localStorage.clear()'); await load();
    await ev(`window.originalTimeout = window.setTimeout;
      window.setTimeout = (fn, ms, ...args) => ms === 850 ? (fn(...args), 0) : originalTimeout(fn, ms, ...args);
      startGame('challenge');`);
    assert.equal(await ev('document.querySelector(".help-tooltip-wrap").hidden'), false, 'Challenge has a help button');
    const challengeHint = await ev('state.challengeHint');
    await ev('useHint()');
    assert.equal(await ev("$('challengeTitle').value"), challengeHint.title);
    assert.equal(await ev("$('challengeAuthor').value"), challengeHint.author);
    assert.equal(await ev("$('challengeVerse').value"), '');
    assert.equal(await ev("$('challengeHint')"), null, 'Help is entered in the form without an extra panel');
    await ev('useHint()');
    const hintComma = challengeHint.sentence.search(/[，,]/u);
    assert.equal(await ev("$('challengeVerse').value"), hintComma < 0 ? challengeHint.sentence : challengeHint.sentence.slice(0, hintComma + 1));
    await ev('useHint()');
    assert.equal(await ev("$('challengeVerse').value"), challengeHint.sentence);
    assert.equal(await ev('document.querySelector("[data-hint]").disabled'), false, 'A complete hint can be replaced with another verse');
    assert.equal(await ev('document.querySelector("[data-hint]").textContent'), '✧ 换一句');
    for (const width of [1366, 320]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:false});
      assert(await ev('document.documentElement.scrollWidth <= innerWidth'));
      const shot = await send('Page.captureScreenshot', {format:'png'});
      fs.writeFileSync(`.browser-check/challenge-help-${width}.png`, Buffer.from(shot.data, 'base64'));
    }
    await send('Emulation.setDeviceMetricsOverride', {width:1366, height:844, deviceScaleFactor:1, mobile:false});
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await ev('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    // Use a short known answer so this effect/attribution check stays in the
    // current chapter; a randomly selected long hint can defeat its monster.
    await ev(`$('challengeVerse').value = '春眠不觉晓，处处闻啼鸟。';
      $('challengeTitle').value = '春晓'; $('challengeAuthor').value = '孟浩然'; attackChallenge();`);
    assert.equal(await ev("getComputedStyle(document.querySelector('.attack-fx')).pointerEvents"), 'none', 'Attack art never blocks input');
    // Pause both CSS animation and the cleanup timer while inspecting the frame.
    // Screenshot latency must not race the production effect's 760 ms lifetime.
    await ev("for(const active of attackEffects.values()) clearTimeout(active.timer); for(const a of document.querySelector('.attack-fx').getAnimations({subtree:true})) {a.pause();a.currentTime=130}");
    const attackShot = await send('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync('.browser-check/attack-effect.png', Buffer.from(attackShot.data, 'base64'));
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    assert.equal(await ev("getComputedStyle(document.querySelector('.attack-slash')).display"), 'none', 'Reduced motion omits the slash');
    assert.equal(await ev("getComputedStyle($('monster')).animationName"), 'none', 'Reduced motion omits impact shaking');
    assert.equal(await ev("$('readingText').textContent"), '春眠不觉晓，处处闻啼鸟。《春晓》—孟浩然');
    assert.equal(await ev("$('readingAuthor').hidden"), true);
    assert.equal(await ev("$('challengeVerse').value"), '', 'Help resets after correct answer');
    assert.equal(await ev("$('challengeTitle').value"), '');
    await ev('useHint()');
    assert.equal(await ev('state.challengeHintStep'), 1);
    await ev('showModeSelection()');
    assert.equal(await ev('attackEffects.size'), 0, 'Leaving removes attack effects and their timers');
    assert.equal(await ev('document.querySelectorAll("[data-entry-mode=test]").length'), 0, 'Retired test mode has no entry');
    assert.deepEqual(await ev('Array.from(document.querySelectorAll("[data-entry-mode]"), button => button.dataset.entryMode).sort()'), ['challenge','learning']);
    const beforeInvalidMode = await ev('JSON.stringify(state)');
    await ev("startGame('test')");
    assert.equal(await ev('JSON.stringify(state)'), beforeInvalidMode, 'The retired mode cannot alter game state');
    assert.equal(await ev("$('entryScreen').hidden"), false, 'An unsupported mode cannot enter the game');
    for (const width of [1366, 320]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:false});
      assert(await ev('document.documentElement.scrollWidth <= innerWidth'));
      const shot = await send('Page.captureScreenshot', {format:'png'});
      fs.writeFileSync(`.browser-check/two-mode-entry-${width}.png`, Buffer.from(shot.data, 'base64'));
      assert(await ev('document.querySelector(".entry-content").getBoundingClientRect().top - document.querySelector(".topbar").getBoundingClientRect().bottom < 65'), 'Entry content sits close to the header');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: six 50-work books, Boss checkpoints 4/8/48, eight unique two-per-poem questions, reload resume, wrong answers/retry/victory, whole-book ranks, previews, hints, two entry modes, retired-mode rejection, responsive/reduced-motion UI, no browser errors.');
  } finally { ws.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
