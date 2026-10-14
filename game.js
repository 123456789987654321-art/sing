const $ = id => document.getElementById(id);
const normalize = text => text.replace(/[^\u3400-\u9fff]/g, '');
const QUESTIONS = POEMS.flatMap(poem => {
  const lines = poem[3].split(/[，。！？；、]/).map(normalize).filter(Boolean);
  return lines.flatMap((answer, index) => {
    if (answer.length < 4 || answer.length > 7) return [];
    const next = lines[index + 1];
    return [{answer, source:`${poem[1]} · ${poem[2]}`, clue:next ? `下一句：${next}` : `上一句：${lines[index - 1]}`, category:poem[0], title:poem[2]}];
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
  const pool = questionPool();
  const opening = pool.find(question => question.answer === (state.mode === 'challenge'
    ? currentStage().opening : state.category === '唐诗' ? '床前明月光' : pool[0]?.answer));
  state.deck = opening ? [opening, ...shuffled(pool.filter(question => question !== opening))] : shuffled(pool);
}

function newPuzzle() {
  if (!state.deck.length) state.deck = shuffled(questionPool());
  state.question = state.deck.shift();
  const answer = [...state.question.answer];
  // Each occurrence of a repeated character needs its own tile.
  const extras = shuffled(DISTRACTORS.filter(char => !answer.includes(char))).slice(0, 18 - answer.length);
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
  $('modeButton').focus({preventScroll:true});
  window.scrollTo(0, 0);
}

function resetGame() {
  clearTimeout(transitionTimer);
  state = {mode:state?.mode || 'learning', category:state?.category || '唐诗',
    stage:0, hp:100, enemyHp:24, score:0, defeated:0, solved:0, busy:false, over:false, deck:[]};
  state.enemyHp = currentStage().hp;
  prepareDeck();
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
    const count = QUESTIONS.filter(question => question.category === category.name).length;
    button.innerHTML = `<span class="category-mark">${category.mark}</span><strong>${category.name}</strong><span>${category.note}</span><small>${count} 句可练习 <b>↗</b></small>`;
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
  return (state.question.answer.length - state.assisted.size) * 2;
}
function controlsLocked() { return state.busy || state.over; }

function render() {
  const stage = currentStage();
  const learning = state.mode === 'learning';
  $('volumeLabel').textContent = learning ? '学习模式' : VOLUME.title;
  $('enemyHealthLabel').textContent = learning ? '练习' : '妖气';
  $('chapter').textContent = stage.chapter;
  $('enemyName').innerHTML = `${stage.name} <span>${learning ? '学' : ['壹','贰','叁','肆'][state.stage]}</span>`;
  $('enemyDescription').textContent = stage.description;
  $('enemyHpText').textContent = `${state.enemyHp} / ${stage.hp}`;
  $('enemyHpBar').style.width = `${state.enemyHp / stage.hp * 100}%`;
  $('playerHpText').textContent = `${state.hp} / 100`;
  $('playerHpBar').style.width = `${state.hp}%`;
  $('defeated').textContent = state.defeated;
  $('monster').style.setProperty('--monster', stage.color);
  $('stageProgress').hidden = learning;
  $('stageProgress').innerHTML = VOLUME.chapters.map((_,i) => `${i ? '<span class="stage-line"></span>' : ''}<span class="stage-node ${i === state.stage ? 'current' : i < state.stage ? 'completed' : ''}">${i < state.stage ? '✓' : i + 1}</span>`).join('');
  $('comboText').textContent = state.solved ? `已成诗 ${state.solved} 句` : '点选文字，拼出第一句诗';
  if (!state.busy) $('enemySpeech').textContent = stage.speech;
  renderPuzzle();
}

function renderPuzzle() {
  const locked = controlsLocked();
  $('poemSource').textContent = state.question.source;
  $('verseClue').textContent = state.question.clue;
  $('hintCount').textContent = `${state.assisted.size} 次`;
  $('potentialDamage').textContent = `${potentialDamage()} 点`;
  $('answerSlots').style.setProperty('--slots', state.selected.length);
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
  $('characterBank').replaceChildren();
  state.tiles.forEach(tile => {
    const button = document.createElement('button');
    const used = state.selected.includes(tile.id);
    button.type = 'button';
    const incorrect = state.wrongSlots.has(state.selected.indexOf(tile.id));
    button.className = `character-tile${used ? ' used' : ''}${incorrect ? ' incorrect' : ''}`;
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
  const char = state.question.answer[index];
  let tile = state.tiles.find(item => item.char === char && !state.selected.includes(item.id));
  if (!tile) {
    // A needed duplicate may have been placed in the wrong slot; move only a manual tile.
    const donor = state.selected.findIndex((id,slot) => id !== null && !state.assisted.has(slot) && selectedCharacter(slot) === char && selectedCharacter(slot) !== state.question.answer[slot]);
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
  if (controlsLocked()) return;
  if (state.selected.includes(null)) { feedback('先把空位填满，再以诗出招。', 'error'); return; }
  const answer = state.selected.map(id => state.tiles[id].char).join('');
  if (answer !== state.question.answer) {
    state.wrongSlots = new Set([...state.question.answer].flatMap((char,index) => selectedCharacter(index) !== char ? [index] : []));
    renderPuzzle();
    feedback('红色字块有误，点它撤回重选，或用帮助补正一字。', 'error');
    return;
  }
  state.wrongSlots.clear();
  const damage = potentialDamage();
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.score += damage;
  state.solved++;
  state.busy = true;
  $('damage').textContent = damage ? `−${damage}` : '0';
  $('damage').classList.remove('show'); void $('damage').offsetWidth; $('damage').classList.add('show');
  if (damage) { $('monster').classList.remove('hit'); void $('monster').offsetWidth; $('monster').classList.add('hit'); }
  feedback(`「${answer}」拼对了！${state.assisted.size ? `帮助 ${state.assisted.size} 字，` : ''}造成 ${damage} 点伤害。`, 'success');
  $('enemySpeech').textContent = state.enemyHp ? (damage ? '哎哟！这句诗，有点厉害…' : '这句学会啦，下句自己来！') : '好诗好诗！小妖甘拜下风…';
  playTone(state.enemyHp === 0);
  render();
  transitionTimer = setTimeout(() => {
    $('monster').classList.remove('hit');
    if (state.enemyHp === 0) {
      state.defeated++;
      state.hp = Math.min(100, state.hp + 20);
      if (state.mode === 'challenge') {
        if (state.stage === VOLUME.chapters.length - 1) { finish(true); return; }
        state.stage++;
        prepareDeck();
        feedback('✦ 小妖已降服，恢复 20 点元气。进入' + currentStage().chapter + '！', 'success');
      } else {
        feedback('✦ 又完成一轮练习！继续读这一类诗文吧。', 'success');
      }
      state.enemyHp = currentStage().hp;
    } else if (state.mode === 'challenge') {
      state.hp = Math.max(0, state.hp - 4);
      if (state.hp === 0) { finish(false); return; }
    }
    state.busy = false;
    newPuzzle();
    render();
  }, 850);
}

function finish(won) {
  state.over = true;
  state.busy = false;
  render();
  $('resultTitle').textContent = won ? '诗出有名，名满诗圈！' : '歇一歇，再来拼诗';
  $('resultDescription').textContent = `你拼对了 ${state.solved} 句诗，降服 ${state.defeated} 只小妖，造成 ${state.score} 点伤害。${won ? '四季篇四章已过，每一个字都有力量。' : '少用一次帮助，就能多造成 2 点伤害。'}`;
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

$('attackButton').addEventListener('click', attack);
$('clearButton').addEventListener('click', clearSelection);
document.querySelectorAll('[data-hint]').forEach(button => button.addEventListener('click', useHint));
$('resetButton').addEventListener('click', resetGame);
$('playAgain').addEventListener('click', resetGame);
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
