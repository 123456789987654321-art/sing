const $ = id => document.getElementById(id);
const isHan = char => /\p{Script=Han}/u.test(char);
const normalize = text => [...text].filter(isHan).join('');
const LEARNING_WORKS = POEMS.filter(poem => !poem[2].includes('节选')).map(poem => ({
  category:poem[0], author:poem[1], title:poem[2], text:poem[3],
  sentences:(poem[3].match(/[^。！？!?]+[。！？!?]?/gu) || []).map(text => text.trim()).filter(text => normalize(text))
}));
function categoryWorks(category) { return LEARNING_WORKS.filter(work => work.category === category); }
function learningWorks() {
  const works = categoryWorks(state.category);
  return state.workOrder ? state.workOrder.map(title => works.find(work => work.title === title)) : works;
}
function learningWork() { return learningWorks()[state.workIndex]; }
const QUESTIONS = POEMS.flatMap(poem => {
  const lines = poem[3].split(/[，。！？；、]/).map(normalize).filter(Boolean);
  return lines.flatMap((answer, index) => {
    if (answer.length < 4 || answer.length > 7) return [];
    const next = lines[index + 1];
    return [{answer, source:`${poem[1]} · ${poem[2]}`, clue:next ? `下一句：${next}` : `上一句：${lines[index - 1]}`, category:poem[0], title:poem[2], author:poem[1]}];
  });
});
const DISTRACTORS = [...new Set(POEMS.flatMap(poem => [...normalize(poem[3])]))];
const VOLUME = CHALLENGE_VOLUMES[0];
let selectedMode = 'learning';
let state, sound = false, audioContext, transitionTimer;

function shuffled(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const learningSaveKey = category => `poetry-learning-v1:${category}`;
const PLAYER_RANKS = ['执笔小书生', '略通诗中韵', '能诗亦善对', '出口便成诗', '诗才已出众', '诗中之俊杰'];
const rankSaveKey = 'poetry-completed-books-v1';
const completedBooks = new Set();
try {
  const savedBooks = JSON.parse(localStorage.getItem(rankSaveKey) || '[]');
  if (Array.isArray(savedBooks)) savedBooks.forEach(name => {
    if (LEARNING_CATEGORIES.some(category => category.name === name)) completedBooks.add(name);
  });
} catch { /* Keep rank progress in memory when browser storage is unavailable. */ }

function playerRankIndex() { return Math.min(completedBooks.size, PLAYER_RANKS.length - 1); }

function completeLearningBook(showReward = false) {
  if (state.mode !== 'learning' || !state.poemComplete
    || state.workIndex + 1 !== learningWorks().length || completedBooks.has(state.category)) return;
  const previousRank = playerRankIndex();
  completedBooks.add(state.category);
  try { localStorage.setItem(rankSaveKey, JSON.stringify([...completedBooks])); }
  catch { /* The earned rank remains available for this session. */ }
  if (showReward && playerRankIndex() > previousRank) {
    const rank = playerRankIndex();
    $('rewardRank').textContent = PLAYER_RANKS[rank];
    $('rewardPreviousRank').textContent = PLAYER_RANKS[previousRank];
    $('rewardBook').textContent = `《${state.category}》全卷学完`;
    $('rewardMessage').textContent = rank === PLAYER_RANKS.length - 1
      ? '胸藏文墨，诗意自成。你已登上诗途最高等级！'
      : '一字一句的用心，化作此刻的进阶。下一卷，也有好风景。';
    $('rewardLevel').textContent = `第 ${rank + 1} / ${PLAYER_RANKS.length} 级`;
    $('rewardSteps').innerHTML = PLAYER_RANKS.map((name, index) => `<span class="reward-step${index <= rank ? ' earned' : ''}" title="${name}"></span>`).join('');
    $('rankRewardDialog').showModal();
  }
}

function renderPlayerRank() {
  const rank = playerRankIndex();
  $('playerRank').textContent = PLAYER_RANKS[rank];
  $('playerRankLevel').textContent = `第 ${rank + 1} / ${PLAYER_RANKS.length} 级`;
  $('playerRankProgress').textContent = `已学完 ${completedBooks.size} 本 · ${rank === PLAYER_RANKS.length - 1 ? '已达最高等级' : '再学完一本，晋升一级'}`;
}

function freshLearningOrder(category) {
  const order = shuffled(categoryWorks(category).map(work => work.title));
  try {
    const key = `poetry-last-order:${category}`;
    const previous = JSON.parse(localStorage.getItem(key) || 'null');
    if (order.length > 1 && JSON.stringify(previous) === JSON.stringify(order)) order.push(order.shift());
    localStorage.setItem(key, JSON.stringify(order));
  } catch { /* Private browsing may disable storage; learning still works. */ }
  return order;
}

function saveLearningProgress() {
  if (state.mode !== 'learning' || state.busy || state.over) return;
  const save = {version:2, category:state.category, order:state.workOrder,
    workIndex:state.workIndex, sentenceIndex:state.sentenceIndex, poemComplete:state.poemComplete,
    sentence:state.question.sentence, tiles:state.tiles.map(tile => tile.char), selected:state.selected,
    assisted:[...state.assisted], wrongSlots:[...state.wrongSlots], score:state.score,
    defeated:state.defeated, enemyHp:state.enemyHp, hp:state.hp, helpStreak:state.helpStreak};
  try {
    localStorage.setItem(learningSaveKey(state.category), JSON.stringify(save));
    feedback('进度已保存在此浏览器，下次进入这一类会按原顺序继续。', 'success');
  } catch {
    feedback('浏览器未能保存进度，请检查是否允许网站存储。', 'error');
  }
}

function restoreLearningProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(learningSaveKey(state.category)) || 'null');
    if (!saved) return;
    const works = categoryWorks(state.category);
    const inRange = (value, max) => Number.isInteger(value) && value >= 0 && value < max;
    if (![1,2].includes(saved.version) || saved.category !== state.category || !Array.isArray(saved.order)
      || saved.order.length !== works.length || new Set(saved.order).size !== works.length
      || !saved.order.every(title => works.some(work => work.title === title))
      || !inRange(saved.workIndex, works.length)) return;
    const work = works.find(work => work.title === saved.order[saved.workIndex]);
    if (!inRange(saved.sentenceIndex, work.sentences.length)
      || saved.sentence !== work.sentences[saved.sentenceIndex]) return;
    const answer = [...normalize(saved.sentence)];
    if (!Array.isArray(saved.tiles) || saved.tiles.length !== Math.max(18, answer.length + 4)
      || !saved.tiles.every(char => typeof char === 'string' && [...char].length === 1 && isHan(char))
      || !answer.every(char => saved.tiles.filter(c => c === char).length >= answer.filter(c => c === char).length)
      || !Array.isArray(saved.selected) || saved.selected.length !== answer.length
      || !saved.selected.every(id => id === null || inRange(id, saved.tiles.length))) return;
    const used = saved.selected.filter(id => id !== null);
    if (new Set(used).size !== used.length || !Array.isArray(saved.assisted) || !Array.isArray(saved.wrongSlots)
      || !saved.assisted.every(index => inRange(index, answer.length) && saved.tiles[saved.selected[index]] === answer[index])
      || !saved.wrongSlots.every(index => inRange(index, answer.length) && saved.selected[index] !== null && saved.tiles[saved.selected[index]] !== answer[index])) return;
    if (typeof saved.poemComplete !== 'boolean' || (saved.poemComplete && (saved.sentenceIndex !== work.sentences.length - 1
      || !answer.every((char,index) => saved.tiles[saved.selected[index]] === char)))) return;
    if (![saved.score, saved.defeated, saved.enemyHp].every(value => Number.isSafeInteger(value) && value >= 0)
      || saved.enemyHp > currentStage().hp) return;
    const savedHp = saved.version === 1 ? 6 : saved.hp;
    const savedStreak = saved.version === 1 ? 0 : saved.helpStreak;
    if (!Number.isInteger(savedHp) || savedHp < 1 || savedHp > 6 || !inRange(savedStreak, 3)) return;
    state.hp = savedHp;
    state.helpStreak = savedStreak;
    state.workOrder = saved.order;
    state.workIndex = saved.workIndex;
    state.sentenceIndex = saved.sentenceIndex;
    state.poemComplete = saved.poemComplete;
    state.completedWorks = saved.workIndex + Number(saved.poemComplete);
    state.confirmedSentences = saved.sentenceIndex + Number(saved.poemComplete);
    state.solved = learningWorks().slice(0, saved.workIndex).reduce((sum,item) => sum + item.sentences.length, 0)
      + saved.sentenceIndex + Number(saved.poemComplete);
    state.score = saved.score;
    state.defeated = saved.defeated;
    state.enemyHp = saved.enemyHp;
    newPuzzle();
    state.tiles = saved.tiles.map((char,id) => ({id,char}));
    state.selected = saved.selected;
    state.assisted = new Set(saved.assisted);
    state.wrongSlots = new Set(saved.wrongSlots);
    completeLearningBook();
    feedback('已接着上次保存的位置学习，作品顺序和已填文字均已恢复。', 'success');
    render();
  } catch { /* Ignore unavailable or outdated saves and start a fresh round. */ }
}

function currentStage() {
  if (state.mode === 'challenge') return VOLUME.chapters[state.stage];
  const category = LEARNING_CATEGORIES.find(item => item.name === state.category);
  return {chapter:category.name, name:'伴读小妖', description:category.note,
    hp:24, color:category.color, speech:'慢慢想，拼错了也可以再试！'};
}

function questionPool() {
  return QUESTIONS.filter(question => state.mode === 'learning'
    ? question.category === state.category : currentStage().titles.includes(question.title));
}

function prepareDeck() {
  state.chapterStart = {score:state.score, solved:state.solved, defeated:state.defeated};
  state.usedVerses = [];
  state.lastChallenge = null;
  const pool = questionPool();
  const opening = pool.find(question => question.answer === (state.mode === 'challenge'
    ? currentStage().opening : state.category === '唐诗' ? '床前明月光' : pool[0]?.answer));
  state.deck = opening ? [opening, ...shuffled(pool.filter(question => question !== opening))] : shuffled(pool);
}

function newPuzzle() {
  if (state.mode === 'learning') {
    const work = learningWork();
    const sentence = work.sentences[state.sentenceIndex];
    state.question = {answer:normalize(sentence), sentence, source:`${work.author} · ${work.title}`, author:work.author,
      title:work.title, category:work.category, clue:`第 ${state.workIndex + 1} / ${learningWorks().length} 篇 · 第 ${state.sentenceIndex + 1} / ${work.sentences.length} 句`};
  } else {
    if (!state.deck.length) state.deck = shuffled(questionPool());
    state.question = state.deck.shift();
  }
  if (state.mode === 'challenge') $('challengeForm').reset();
  const answer = [...state.question.answer];
  // Each occurrence of a repeated character needs its own tile.
  const extras = shuffled(DISTRACTORS.filter(char => !answer.includes(char))).slice(0, Math.max(4, 18 - answer.length));
  state.tiles = shuffled([...answer, ...extras]).map((char, id) => ({id, char}));
  state.selected = Array(answer.length).fill(null);
  state.assisted = new Set();
  state.wrongSlots = new Set();
}

function chooseMode(mode) {
  selectedMode = mode;
  $('modeTitle').textContent = mode === 'learning' ? '学习模式' : '挑战模式';
  $('modeDescription').textContent = mode === 'learning' ? '从六卷诗文中，选一卷慢慢读。' : '循着四季的诗句，开启你的江湖。';
  $('learningPanel').hidden = mode !== 'learning';
  $('challengePanel').hidden = mode !== 'challenge';
}

function showModeSelection() {
  clearTimeout(transitionTimer);
  $('rankRewardDialog').close();
  if (state) state.busy = true;
  $('resultDialog').close();
  $('gameScreen').hidden = true;
  $('modeSelection').hidden = true;
  $('entryScreen').hidden = false;
  document.querySelector('[data-entry-mode="' + selectedMode + '"]').focus({preventScroll:true});
  window.scrollTo(0, 0);
}

function startGame(mode, category = '唐诗') {
  selectedMode = mode;
  state = {mode, category};
  $('entryScreen').hidden = true;
  $('modeSelection').hidden = true;
  $('gameScreen').hidden = false;
  resetGame();
  if (mode === 'learning') restoreLearningProgress();
  $('gameScreen').setAttribute('tabindex', '-1');
  $('gameScreen').focus({preventScroll:true});
  window.scrollTo(0, 0);
}

function resetGame() {
  clearTimeout(transitionTimer);
  $('rankRewardDialog').close();
  state = {mode:state?.mode || 'learning', category:state?.category || '唐诗',
    workOrder:null, workIndex:0, sentenceIndex:0, confirmedSentences:0, readPoems:{}, helpStreak:0, completedWorks:0, poemComplete:false, stage:0, hp:6, enemyHp:24, score:0, defeated:0, solved:0, busy:false, over:false, deck:[]};
  state.enemyHp = currentStage().hp;
  if (state.mode === 'learning') state.workOrder = freshLearningOrder(state.category);
  if (state.mode === 'challenge') prepareDeck();
  newPuzzle();
  $('resultDialog').close();
  $('monster').classList.remove('hit');
  $('damage').classList.remove('show');
  feedback('');
  render();
}

function renderModeSelection() {
  $('categoryGrid').replaceChildren();
  LEARNING_CATEGORIES.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-card';
    button.style.setProperty('--category-color', category.color);
    const count = LEARNING_WORKS.filter(work => work.category === category.name).length;
    button.innerHTML = `<span class="category-mark">${category.mark}</span><strong>${category.name}</strong><span>${category.note}</span><small>${count} 篇完整作品 <b>↗</b></small>`;
    button.addEventListener('click', () => startGame('learning', category.name));
    $('categoryGrid').append(button);
  });
  $('volumeTitle').textContent = VOLUME.title;
  $('volumeDescription').textContent = VOLUME.description;
  $('chapterPreview').innerHTML = VOLUME.chapters.map(chapter => `<div class="chapter-card" style="--category-color:${chapter.color}"><span>${chapter.season}</span><h3>${chapter.chapter}</h3><p>${chapter.description}</p></div>`).join('');
  chooseMode(selectedMode);
}

function selectedCharacter(index) {
  return state.selected[index] === null ? '' : state.tiles[state.selected[index]].char;
}
function pendingHelpIndex() {
  return [...state.question.answer].findIndex((char, index) => selectedCharacter(index) !== char);
}
function potentialDamage() {
  return ([...state.question.answer].length - state.assisted.size) * 2;
}
function controlsLocked() { return state.busy || state.over || state.poemComplete; }

function render() {
  const stage = currentStage();
  const learning = state.mode === 'learning';
  renderPlayerRank();
  $('saveLearning').hidden = !learning;
  $('saveLearning').disabled = state.busy || state.over;
  $('resetButton').textContent = learning ? '↻ 新一轮' : '↻ 重来';
  $('volumeLabel').textContent = learning ? '学习模式' : VOLUME.title;
  $('enemyHealthLabel').textContent = learning ? '练习' : '妖气';
  $('chapter').textContent = stage.chapter;
  $('enemyName').innerHTML = `${stage.name} <span>${learning ? '学' : ['壹','贰','叁','肆'][state.stage]}</span>`;
  $('enemyDescription').textContent = stage.description;
  $('enemyHpText').textContent = `${state.enemyHp} / ${stage.hp}`;
  $('enemyHpBar').style.width = `${state.enemyHp / stage.hp * 100}%`;
  $('playerHpText').textContent = `${state.hp} / 6`;
  const hearts = $('playerHearts') || $('playerStars');
  hearts.setAttribute('aria-label', `剩余 ${state.hp} 颗爱心，共 6 颗`);
  hearts.innerHTML = Array.from({length:6}, (_,index) => `<span class="life-heart${index < state.hp ? '' : ' lost'}" aria-hidden="true">♥</span>`).join('');
  $('defeated').textContent = state.defeated;
  $('monster').style.setProperty('--monster', stage.color);
  $('stageProgress').hidden = learning;
  $('stageProgress').innerHTML = VOLUME.chapters.map((_,i) => `${i ? '<span class="stage-line"></span>' : ''}<span class="stage-node ${i === state.stage ? 'current' : i < state.stage ? 'completed' : ''}">${i < state.stage ? '✓' : i + 1}</span>`).join('');
  $('comboText').textContent = learning ? `已学完 ${state.completedWorks} 篇 · 已拼对 ${state.solved} 句` : state.solved ? `已成诗 ${state.solved} 句` : '点选文字，拼出第一句诗';
  renderLearning();
  renderReading();
  if (!state.busy) $('enemySpeech').textContent = learning ? stage.speech : '请写一句关于' + stage.season + '的诗，别忘了诗名和作者！';
  renderPuzzle();
}

function renderLearning() {
  const learning = state.mode === 'learning';
  $('gameScreen').classList.toggle('learning-game', learning);
  $('learningSummary').hidden = !learning || !state.poemComplete;
  $('answerSlots').hidden = learning && state.poemComplete;
  $('characterBank').hidden = learning && state.poemComplete;
  $('tileActions').hidden = learning && state.poemComplete;
  if (!learning) return;
  const work = learningWork();
  if (state.poemComplete) {
    $('completedPoemTitle').textContent = `《${work.title}》学完了`;
    renderPoemLines($('completedPoemText'), work.sentences);
    $('nextPoem').textContent = state.workIndex + 1 < learningWorks().length ? '下一篇 →' : '本卷学完，返回入口';
  }
}

function nextLearningWork() {
  if (state.mode !== 'learning' || !state.poemComplete) return;
  if (state.workIndex + 1 === learningWorks().length) { showModeSelection(); return; }
  state.workIndex++;
  state.sentenceIndex = 0;
  state.confirmedSentences = 0;
  state.poemComplete = false;
  state.enemyHp = currentStage().hp;
  newPuzzle();
  feedback('');
  render();
}

function renderPoemLines(container, sentences) {
  container.replaceChildren();
  sentences.forEach((sentence, index) => {
    if (index) container.append(document.createTextNode('\n'));
    const line = document.createElement('span');
    line.className = 'reading-line';
    line.style.setProperty('--line-chars', [...sentence].length);
    line.textContent = sentence;
    container.append(line);
  });
}

function renderReading() {
  if (state.mode === 'challenge') {
    $('readingTitle').textContent = state.lastChallenge ? `《${state.lastChallenge.title}》` : '已答对的诗句';
    $('readingAuthor').textContent = state.lastChallenge?.author || '';
    renderPoemLines($('readingText'), state.lastChallenge ? [state.lastChallenge.sentence] : []);
    return;
  }
  const work = state.mode === 'learning' ? learningWork() : state.question;
  $('readingTitle').textContent = `《${work.title}》`;
  $('readingAuthor').textContent = work.author;
  const sentences = state.mode === 'learning'
    ? work.sentences.slice(0, state.confirmedSentences)
    : (state.readPoems[state.question.title] || []);
  renderPoemLines($('readingText'), sentences);
  $('readingText').scrollTop = $('readingText').scrollHeight;
}

function renderPuzzle() {
  const locked = controlsLocked();
  const challenge = state.mode === 'challenge';
  $('challengeForm').hidden = !challenge;
  $('answerSlots').hidden = challenge || state.poemComplete;
  $('characterBank').hidden = challenge || state.poemComplete;
  $('tileActions').hidden = challenge || state.poemComplete;
  document.querySelector('.help-tooltip-wrap').hidden = challenge;
  document.querySelector('.puzzle-stats').hidden = challenge;
  document.querySelector('.puzzle-heading h3').textContent = challenge ? '✦ 提笔应题' : '✦ 选字成诗';
  document.querySelector('.tile-guide').hidden = challenge;
  $('gameScreen').classList.toggle('challenge-game', challenge);
  document.querySelector('.battle-footer > span').textContent = challenge ? '答错扣一颗心 · 耗尽后本章重来' : '每个自行选出的字 · 2 点伤害';
  if (challenge) {
    $('verseClue').textContent = `请写出关于「${currentStage().season}」的完整一句诗，并填写诗名和作者。`;
    $('comboText').textContent = `已答对 ${state.solved} 句 · 每个字造成 2 点伤害`;
    [...$('challengeForm').elements].forEach(element => element.disabled = locked);
    return;
  }
  $('poemSource').textContent = state.question.source;
  $('verseClue').textContent = state.question.clue;
  $('hintCount').textContent = `${state.assisted.size} 次`;
  $('potentialDamage').textContent = `${potentialDamage()} 点`;
  $('answerSlots').style.setProperty('--slots', state.selected.length);
  $('answerSlots').classList.toggle('sentence-answer', state.mode === 'learning');
  $('answerSlots').replaceChildren();
  state.selected.forEach((tileId, index) => {
    const button = document.createElement('button');
    const assisted = state.assisted.has(index);
    const incorrect = state.wrongSlots.has(index);
    button.type = 'button';
    button.className = `answer-slot ${tileId === null ? 'empty' : 'filled'}${assisted ? ' assisted' : ''}${incorrect ? ' incorrect' : ''}`;
    button.textContent = tileId === null ? '·' : state.tiles[tileId].char;
    button.disabled = locked || assisted || tileId === null;
    button.setAttribute('aria-label', `第 ${index + 1} 字${tileId === null ? '待选' : `：${state.tiles[tileId].char}`}${assisted ? '，帮助补字，不计伤害' : '，点击撤回'}`);
    button.setAttribute('aria-invalid', String(incorrect));
    if (incorrect) button.setAttribute('aria-label', button.getAttribute('aria-label') + '，错误');
    button.addEventListener('click', () => removeCharacter(index));
    $('answerSlots').append(button);
  });
  if (state.mode === 'learning') {
    const buttons = [...$('answerSlots').children];
    $('answerSlots').replaceChildren();
    let index = 0, segment = document.createElement('span');
    segment.className = 'sentence-segment';
    for (const char of state.question.sentence) {
      if (isHan(char)) { segment.append(buttons[index++]); }
      else if (char.trim()) {
        const punctuation = document.createElement('span');
        punctuation.className = 'sentence-punctuation';
        punctuation.textContent = char;
        segment.append(punctuation);
        $('answerSlots').append(segment);
        segment = document.createElement('span');
        segment.className = 'sentence-segment';
      }
    }
    if (segment.childNodes.length) $('answerSlots').append(segment);
  }
  $('characterBank').replaceChildren();
  state.tiles.forEach(tile => {
    const button = document.createElement('button');
    const used = state.selected.includes(tile.id);
    button.type = 'button';
    button.className = `character-tile${used ? ' used' : ''}`;
    button.textContent = tile.char;
    button.dataset.tileId = tile.id;
    button.disabled = locked || used || !state.selected.includes(null);
    button.setAttribute('aria-label', `${tile.char}${used ? '，已选' : '，选入诗句'}`);
    button.addEventListener('click', () => selectCharacter(tile.id));
    $('characterBank').append(button);
  });
  $('attackButton').disabled = locked || state.selected.includes(null);
  $('clearButton').disabled = locked || !state.selected.some((id,index) => id !== null && !state.assisted.has(index));
  document.querySelectorAll('[data-hint]').forEach(button => {
    button.disabled = locked || pendingHelpIndex() === -1;
  });
}

function selectCharacter(tileId) {
  if (controlsLocked() || state.selected.includes(tileId) || !state.tiles[tileId]) return;
  const index = state.selected.indexOf(null);
  if (index === -1) return;
  state.selected[index] = tileId;
  state.wrongSlots.delete(index);
  feedback('');
  renderPuzzle();
}
function removeCharacter(index) {
  if (controlsLocked() || state.assisted.has(index)) return;
  state.selected[index] = null;
  state.wrongSlots.delete(index);
  feedback('');
  renderPuzzle();
}
function clearSelection() {
  if (controlsLocked()) return;
  state.selected = state.selected.map((id,index) => state.assisted.has(index) ? id : null);
  state.wrongSlots.clear();
  feedback(state.assisted.size ? '自行选择的字已退回，帮助补出的字继续保留。' : '');
  renderPuzzle();
}

function useHint() {
  if (controlsLocked()) return;
  const index = pendingHelpIndex();
  if (index === -1) return;
  const char = [...state.question.answer][index];
  let tile = state.tiles.find(item => item.char === char && !state.selected.includes(item.id));
  if (!tile) {
    // A needed duplicate may have been placed in the wrong slot; move only a manual tile.
    const donor = state.selected.findIndex((id,slot) => id !== null && !state.assisted.has(slot) && selectedCharacter(slot) === char && selectedCharacter(slot) !== [...state.question.answer][slot]);
    if (donor === -1) return;
    tile = state.tiles[state.selected[donor]];
    state.selected[donor] = null;
    state.wrongSlots.delete(donor);
  }
  state.selected[index] = tile.id;
  state.assisted.add(index);
  state.wrongSlots.delete(index);
  feedback(`补上「${char}」，本句伤害 −2，剩余 ${potentialDamage()} 点。`);
  renderPuzzle();
}

function feedback(message, type = '') {
  $('feedback').textContent = message;
  $('feedback').className = `feedback ${type}`;
}

function attack() {
  if (state.mode === 'challenge') { attackChallenge(); return; }
  if (controlsLocked()) return;
  if (state.selected.includes(null)) { feedback('先把空位填满，再以诗出招。', 'error'); return; }
  const answer = state.selected.map(id => state.tiles[id].char).join('');
  if (answer !== state.question.answer) {
    state.wrongSlots = new Set([...state.question.answer].flatMap((char,index) => selectedCharacter(index) !== char ? [index] : []));
    state.hp = Math.max(0, state.hp - 1);
    render();
    feedback('红色字块有误，扣 1 颗爱心。点错字撤回重选。', 'error');
    if (state.hp === 0) finish(false);
    return;
  }
  state.wrongSlots.clear();
  state.helpStreak = state.assisted.size ? state.helpStreak + 1 : 0;
  const helpMajority = state.assisted.size > state.selected.length - state.assisted.size;
  const helpSequence = state.helpStreak >= 3;
  const helpPenalty = helpMajority || helpSequence;
  if (helpPenalty) state.hp = Math.max(0, state.hp - 1);
  if (helpSequence) state.helpStreak = 0;
  if (state.mode === 'learning') state.confirmedSentences = state.sentenceIndex + 1;
  else {
    const read = state.readPoems[state.question.title] ||= [];
    if (!read.includes(answer)) read.push(answer);
  }
  const damage = potentialDamage();
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.score += damage;
  state.solved++;
  state.busy = true;
  $('damage').textContent = damage ? `−${damage}` : '0';
  $('damage').classList.remove('show'); void $('damage').offsetWidth; $('damage').classList.add('show');
  if (damage) { $('monster').classList.remove('hit'); void $('monster').offsetWidth; $('monster').classList.add('hit'); }
  feedback(`「${answer}」拼对了！${state.assisted.size ? `帮助 ${state.assisted.size} 字，` : ''}造成 ${damage} 点伤害。${helpPenalty ? ` ${helpMajority ? '本句帮助字数超过自行填写' : '连续三句使用帮助'}，扣 1 颗爱心。` : ''}`, helpPenalty ? 'error' : 'success');
  $('enemySpeech').textContent = state.enemyHp ? (damage ? '哎哟！这句诗，有点厉害…' : '这句学会啦，下句自己来！') : '好诗好诗！小妖甘拜下风…';
  playTone(state.enemyHp === 0);
  render();
  transitionTimer = setTimeout(() => {
    $('monster').classList.remove('hit');
    if (state.hp === 0) { finish(false); return; }
    if (state.mode === 'learning') {
      if (state.enemyHp === 0) { state.defeated++; state.enemyHp = currentStage().hp; }
      const work = learningWork();
      state.busy = false;
      if (state.sentenceIndex + 1 === work.sentences.length) {
        state.poemComplete = true;
        state.completedWorks++;
        feedback(`《${work.title}》已完整学完，回顾后再进入下一篇。`, 'success');
        completeLearningBook(true);
      } else {
        state.sentenceIndex++;
        newPuzzle();
        feedback('这一句拼对了，继续同一篇的下一句。', 'success');
      }
      render();
      return;
    }
    if (state.enemyHp === 0) {
      state.defeated++;
      if (state.mode === 'challenge') {
        if (state.stage === VOLUME.chapters.length - 1) { finish(true); return; }
        state.stage++;
        prepareDeck();
        feedback('✦ 小妖已降服，进入' + currentStage().chapter + '！', 'success');
      } else {
        feedback('✦ 又完成一轮练习！继续读这一类诗文吧。', 'success');
      }
      state.enemyHp = currentStage().hp;
    }
    state.busy = false;
    newPuzzle();
    render();
  }, 850);
}


// Ignore punctuation and spacing, but never discard incorrect letters or digits.
const cleanSubmission = text => text.trim().replace(/[\s\p{P}]/gu, '');
function matchChallenge(verse, title, author, stage = currentStage()) {
  const text = cleanSubmission(verse);
  return LEARNING_WORKS.find(work => stage.titles.includes(work.title)
    && cleanSubmission(work.title) === cleanSubmission(title)
    && cleanSubmission(work.author) === cleanSubmission(author)
    && work.sentences.some(sentence => {
      const canonical = cleanSubmission(sentence);
      return canonical === text || (work.title === '山行'
        && canonical.replace('白云生处', '白云深处') === text);
    }));
}
function restartChapter() {
  clearTimeout(transitionTimer);
  Object.assign(state, state.chapterStart, {hp:6, enemyHp:currentStage().hp, busy:false, over:false});
  prepareDeck();
  newPuzzle();
  render();
  feedback('爱心已耗尽，本章从头开始，已恢复 6 颗爱心。', 'error');
}
function attackChallenge() {
  if (controlsLocked()) return;
  const verse = $('challengeVerse').value;
  const title = $('challengeTitle').value;
  const author = $('challengeAuthor').value;
  if (![verse,title,author].every(value => value.trim())) {
    feedback('请先填写完整诗句、诗名和作者。', 'error'); return;
  }
  const work = matchChallenge(verse, title, author);
  const sentence = work?.sentences.find(line => cleanSubmission(line) === cleanSubmission(verse)
    || (work.title === '山行' && cleanSubmission(line).replace('白云生处', '白云深处') === cleanSubmission(verse)));
  const key = work && `${work.title}:${normalize(sentence)}`;
  if (work && state.usedVerses.includes(key)) {
    feedback('这句本章已经答过，请换一句。', 'error'); return;
  }
  if (!work) {
    state.hp--;
    render();
    feedback('诗句不符合本章主题，或诗句、诗名、作者有误，扣 1 颗爱心。', 'error');
    if (!state.hp) {
      state.busy = true;
      render();
      transitionTimer = setTimeout(restartChapter, 1000);
    }
    return;
  }
  state.usedVerses.push(key);
  state.lastChallenge = {title:work.title, author:work.author, sentence};
  const damage = normalize(sentence).length * 2;
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.score += damage;
  state.solved++;
  state.busy = true;
  feedback(`答对了！造成 ${damage} 点伤害。`, 'success');
  playTone(state.enemyHp === 0);
  render();
  transitionTimer = setTimeout(() => {
    if (!state.enemyHp) {
      state.defeated++;
      if (state.stage === VOLUME.chapters.length - 1) { finish(true); return; }
      state.stage++;
      state.enemyHp = currentStage().hp;
      prepareDeck();
      feedback(`进入${currentStage().chapter}，请按新的主题作答。`, 'success');
    }
    state.busy = false;
    newPuzzle();
    render();
  }, 850);
}
$('challengeForm').addEventListener('submit', event => { event.preventDefault(); attackChallenge(); });

function finish(won) {
  state.over = true;
  state.busy = false;
  render();
  $('resultTitle').textContent = won ? '诗出有名，名满诗圈！' : '爱心用完了，再来一轮吧';
  $('resultDescription').textContent = `你拼对了 ${state.solved} 句诗，降服 ${state.defeated} 只小妖，造成 ${state.score} 点伤害。${won ? '四季篇四章已过，每一个字都有力量。' : '填错、连续三句使用帮助或帮助字数过半会扣爱心。重新开始可恢复 6 颗爱心。'}`;
  $('resultDialog').showModal();
}

function playTone(victory = false) {
  if (!sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    (victory ? [392,494,587,784] : [440,659]).forEach((freq,i) => {
      const osc = audioContext.createOscillator(), gain = audioContext.createGain(), t = audioContext.currentTime + i * .09;
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(.08,t); gain.gain.exponentialRampToValueAtTime(.001,t + .35);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(t); osc.stop(t + .35);
    });
  } catch { /* Sound is optional. */ }
}

$('saveLearning').addEventListener('click', saveLearningProgress);
$('nextPoem').addEventListener('click', nextLearningWork);
$('attackButton').addEventListener('click', attack);
$('clearButton').addEventListener('click', clearSelection);
document.querySelectorAll('[data-hint]').forEach(button => button.addEventListener('click', useHint));
$('resetButton').addEventListener('click', resetGame);
$('playAgain').addEventListener('click', resetGame);
$('continueLearning').addEventListener('click', () => $('rankRewardDialog').close());
$('closeRankReward').addEventListener('click', () => $('rankRewardDialog').close());
$('rankRewardDialog').addEventListener('close', () => {
  if (state?.mode === 'learning' && state.poemComplete && !$('gameScreen').hidden) $('nextPoem').focus({preventScroll:true});
});
$('helpButton').addEventListener('click', () => $('helpDialog').showModal());
document.querySelectorAll('.dialog-close,.dialog-close-action').forEach(button => button.addEventListener('click', () => $('helpDialog').close()));
$('soundButton').addEventListener('click', () => {
  sound = !sound;
  $('soundButton').innerHTML = sound ? '♪' : '♪<span class="sound-off">/</span>';
  $('soundButton').title = sound ? '关闭音效' : '开启音效';
  $('soundButton').setAttribute('aria-label', $('soundButton').title);
  if (sound) playTone();
});
document.querySelectorAll('[data-entry-mode]').forEach(button => {
  button.addEventListener('click', () => {
    chooseMode(button.dataset.entryMode);
    $('entryScreen').hidden = true;
    $('modeSelection').hidden = false;
    $('entryBack').focus({preventScroll:true});
    window.scrollTo(0, 0);
  });
});
$('entryBack').addEventListener('click', showModeSelection);
$('startChallenge').addEventListener('click', () => startGame('challenge'));
$('modeButton').addEventListener('click', showModeSelection);
$('resultModeButton').addEventListener('click', showModeSelection);
renderModeSelection();
