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
    await send('Network.setBlockedURLs', {urls:['*fonts.googleapis.com*', '*fonts.gstatic.com*']});
    await load(); await ev('localStorage.clear()'); await load();
    await ev(`window.originalTimeout = window.setTimeout;
      window.setTimeout = (fn, ms, ...args) => ms === 850 ? (fn(...args), 0) : originalTimeout(fn, ms, ...args);
      window.solve = () => {
        for (let i = 0; i < state.selected.length; i++) {
          const tile = state.tiles.find(t => t.char === [...state.question.answer][i] && !state.selected.includes(t.id));
          selectCharacter(tile.id);
        }
        attack();
      };
      window.finishBook = category => {
        startGame('learning', category);
        while (true) {
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
    await ev("finishBook('汉赋')");
    assert.equal(await ev("document.querySelector('.player-card h2').textContent"), '略通诗中韵', 'A whole book promotes the player');
    assert.equal(await ev("$('rankRewardDialog').open"), true);
    assert.equal(await ev("$('rewardRank').textContent"), '略通诗中韵');
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
      assert.equal(await ev("$('playerRank').textContent"), rank);
      assert.equal(await ev("$('rankRewardDialog').open"), true);
      await ev("$('continueLearning').click()");
    }
    await ev("finishBook('唐诗')");
    assert.equal(await ev("$('playerRank').textContent"), '诗中之俊杰');
    assert.equal(await ev("$('rankRewardDialog').open"), false, 'Highest rank is capped');
    await load(); await ev("startGame('challenge')");
    assert.equal(await ev("$('playerRank').textContent"), '诗中之俊杰', 'Rank persists across reload and mode changes');
    assert.equal(await ev("$('rankRewardDialog').open"), false, 'Reload does not replay a reward');
    // A previously saved, completed final work earns its book when opened,
    // but restoring it must not replay a celebration.
    await ev("localStorage.removeItem('poetry-completed-books-v1')");
    await load(); await ev("startGame('learning', '汉赋')");
    assert.equal(await ev("$('playerRank').textContent"), '略通诗中韵', 'Completed legacy saves recover their earned rank');
    assert.equal(await ev("$('rankRewardDialog').open"), false);
    assert.deepEqual(errors, []);
    console.log('PASS: whole books, six ranks, five promotion rewards, persistence, legacy saves, duplicates, cap, modal focus, responsive layout, reduced motion, no browser errors.');
  } finally { ws.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
