// Learning checkpoints review two distinct sentences from each of the last four works.
function queueLearningBoss() {
  if (state.mode !== 'learning' || !state.poemComplete || state.completedWorks % 4
    || state.completedWorks <= (state.bossClearedAt || 0) || state.boss) return;
  const works = learningWorks().slice(state.completedWorks - 4, state.completedWorks);
  const questions = shuffled(works.flatMap(work => shuffled(work.sentences).slice(0, 2)
    .map(sentence => ({title:work.title, author:work.author, sentence}))));
  state.boss = {checkpoint:state.completedWorks, status:'intro', questions, index:0, hp:6, tiles:[], selected:[], wrong:[]};
  prepareBossQuestion();
}

function prepareBossQuestion() {
  const boss = state.boss;
  const answer = [...normalize(boss.questions[boss.index].sentence)];
  const extras = shuffled(DISTRACTORS.filter(char => !answer.includes(char))).slice(0, Math.max(4, 18 - answer.length));
  boss.tiles = shuffled([...answer, ...extras]);
  boss.selected = Array(answer.length).fill(null);
  boss.wrong = [];
}

function restoreLearningBoss(saved) {
  const completed = state.completedWorks;
  // Pre-Boss saves keep their completed checkpoints; new saves cannot skip a pending fight.
  state.bossClearedAt = saved.version < 3 ? Math.floor(completed / 4) * 4 : 0;
  if (saved.version >= 3 && Number.isInteger(saved.bossClearedAt) && saved.bossClearedAt >= 0
    && saved.bossClearedAt <= completed && saved.bossClearedAt % 4 === 0) state.bossClearedAt = saved.bossClearedAt;
  const boss = saved.boss;
  if (boss && state.poemComplete && completed > 0 && completed % 4 === 0 && boss.checkpoint === completed) {
    const works = learningWorks().slice(completed - 4, completed);
    const validQuestions = Array.isArray(boss.questions) && boss.questions.length === 8
      && works.every(work => boss.questions.filter(q => q?.title === work.title && q.author === work.author && work.sentences.includes(q.sentence)).length === 2)
      && new Set(boss.questions.map(q => q.title + '\n' + q.sentence)).size === 8;
    const validState = ['intro','active','lost','won'].includes(boss.status) && Number.isInteger(boss.index)
      && boss.index >= 0 && boss.index <= 8 && Number.isInteger(boss.hp) && boss.hp >= 0 && boss.hp <= 6
      && (boss.status === 'won' ? boss.index === 8 && boss.hp > 0 : boss.index < 8)
      && (boss.status === 'lost' ? boss.hp === 0 : boss.hp > 0)
      && (boss.status !== 'intro' || (boss.index === 0 && boss.hp === 6));
    if (validQuestions && validState) {
      const answer = [...normalize(boss.questions[Math.min(boss.index, 7)].sentence)];
      const validTiles = Array.isArray(boss.tiles) && boss.tiles.length === Math.max(18, answer.length + 4)
        && boss.tiles.every(char => typeof char === 'string' && [...char].length === 1 && isHan(char))
        && answer.every(char => boss.tiles.filter(value => value === char).length >= answer.filter(value => value === char).length);
      const validSelection = validTiles && Array.isArray(boss.selected) && boss.selected.length === answer.length
        && boss.selected.every(id => id === null || Number.isInteger(id) && id >= 0 && id < boss.tiles.length)
        && new Set(boss.selected.filter(id => id !== null)).size === boss.selected.filter(id => id !== null).length;
      if (validTiles && validSelection) {
        state.boss = {checkpoint:completed, status:boss.status, questions:boss.questions, index:boss.index, hp:boss.hp,
          tiles:boss.tiles, selected:boss.selected, wrong:Array.isArray(boss.wrong) ? boss.wrong.filter(i => Number.isInteger(i) && i >= 0 && i < answer.length) : []};
        return;
      }
    }
    state.bossClearedAt = Math.min(state.bossClearedAt, completed - 4);
  }
  queueLearningBoss();
}

function openBossBattle() {
  if (!state.boss || state.mode !== 'learning') return;
  renderBossBattle();
  if (!$('bossDialog').open) $('bossDialog').showModal();
  if (state.boss.status === 'intro' || state.boss.status === 'lost') $('bossStart').focus({preventScroll:true});
  else if (state.boss.status === 'won') $('bossContinue').focus({preventScroll:true});
  else $('bossBank').querySelector('button')?.focus({preventScroll:true});
}

function startBossBattle() {
  if (!state.boss || !['intro','lost'].includes(state.boss.status)) return;
  state.boss.status = 'active';
  state.boss.hp = 6;
  state.boss.index = 0;
  prepareBossQuestion();
  $('bossFeedback').textContent = '';
  saveLearningProgress(true);
  renderBossBattle();
  $('bossBank').querySelector('button')?.focus({preventScroll:true});
}

function selectBossTile(id) {
  const boss = state.boss;
  if (!boss || boss.status !== 'active' || !Number.isInteger(id) || !boss.tiles[id] || boss.selected.includes(id)) return;
  const slot = boss.selected.indexOf(null);
  if (slot === -1) return;
  boss.selected[slot] = id;
  boss.wrong = boss.wrong.filter(index => index !== slot);
  $('bossFeedback').textContent = '';
  saveLearningProgress(true);
  renderBossBattle();
}

function removeBossTile(index) {
  const boss = state.boss;
  if (!boss || boss.status !== 'active' || !Number.isInteger(index) || index < 0 || index >= boss.selected.length) return;
  boss.selected[index] = null;
  boss.wrong = boss.wrong.filter(slot => slot !== index);
  saveLearningProgress(true);
  renderBossBattle();
}

function submitBossAnswer() {
  const boss = state.boss;
  if (!boss || boss.status !== 'active' || boss.selected.includes(null)) return;
  const answer = [...normalize(boss.questions[boss.index].sentence)];
  boss.wrong = answer.flatMap((char,index) => boss.tiles[boss.selected[index]] === char ? [] : [index]);
  if (boss.wrong.length) {
    boss.hp--;
    $('bossFeedback').textContent = '红色位置还需想一想，扣一颗心。点击已选文字即可修改。';
    if (!boss.hp) boss.status = 'lost';
  } else {
    boss.index++;
    if (boss.index === 8) {
      boss.status = 'won';
      state.bossClearedAt = boss.checkpoint;
      state.defeated++;
      playTone(true);
    } else {
      prepareBossQuestion();
      $('bossFeedback').textContent = '诗句无误，破除一重墨障！';
      playTone();
    }
  }
  saveLearningProgress(true);
  renderBossBattle();
  if (boss.status === 'won') $('bossContinue').focus({preventScroll:true});
  if (boss.status === 'lost') $('bossStart').focus({preventScroll:true});
}

function finishBossBattle() {
  if (state.boss?.status !== 'won') return;
  state.boss = null;
  $('bossDialog').close();
  saveLearningProgress(true);
  render();
  completeLearningBook(true);
  renderPlayerRank();
  if (!$('rankRewardDialog').open) $('nextPoem').focus({preventScroll:true});
}

function renderBossBattle() {
  const boss = state.boss;
  if (!boss) return;
  const active = boss.status === 'active';
  const won = boss.status === 'won';
  const lost = boss.status === 'lost';
  $('bossDialog').dataset.phase = boss.status;
  $('bossTitle').textContent = won ? '墨障已破' : lost ? '胜负未定，再试一回' : active ? '墨魇 · 守卷之战' : '强敌来袭';
  $('bossCheckpoint').textContent = `第 ${boss.checkpoint} 首 · 诗关试炼`;
  $('bossDescription').textContent = won ? '四首诗，八句意。你记住的每一句，都化作了破敌的力量。'
    : lost ? '这四首诗仍然学完了。重新迎战，恢复六颗心，再破八重墨障。'
    : '刚学过的四首诗，各抽两句，打乱顺序。凭记忆拼对八句，击败守卷妖。';
  $('bossIntro').hidden = active;
  $('bossCombat').hidden = !active;
  $('bossStart').hidden = won || active;
  $('bossStart').textContent = lost ? '重新迎战 ↗' : '开始战斗 ↗';
  $('bossContinue').hidden = !won;
  $('bossPause').textContent = won ? '稍后继续' : '稍后再战';
  $('bossSeal').textContent = won ? '胜' : '魇';
  $('bossProgress').textContent = `${boss.index} / 8 句`;
  $('bossHealthText').textContent = `${8 - boss.index} / 8`;
  $('bossHealthBar').style.width = `${(8 - boss.index) / 8 * 100}%`;
  $('bossLives').textContent = '♥'.repeat(boss.hp) + '♡'.repeat(6 - boss.hp);
  $('bossLives').setAttribute('aria-label', `剩余 ${boss.hp} 颗爱心，共 6 颗`);
  if (!active) return;
  const question = boss.questions[boss.index];
  const work = learningWorks().find(item => item.title === question.title);
  $('bossQuestionTitle').textContent = `《${question.title}》—${question.author}`;
  $('bossQuestionClue').textContent = `原诗第 ${work.sentences.indexOf(question.sentence) + 1} / ${work.sentences.length} 句 · 答错扣一颗心，耗尽可重试本场`;
  $('bossSlots').replaceChildren();
  let index = 0;
  for (const char of question.sentence) {
    if (!isHan(char)) {
      const punctuation = document.createElement('span');
      punctuation.className = 'boss-punctuation'; punctuation.textContent = char;
      $('bossSlots').append(punctuation); continue;
    }
    const slot = index++;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'boss-slot' + (boss.wrong.includes(slot) ? ' incorrect' : '');
    button.textContent = boss.selected[slot] === null ? '' : boss.tiles[boss.selected[slot]];
    button.setAttribute('aria-label', `第 ${slot + 1} 字${button.textContent ? '，' + button.textContent + '，点击撤回' : '，待填'}`);
    button.addEventListener('click', () => removeBossTile(slot));
    $('bossSlots').append(button);
  }
  $('bossBank').replaceChildren();
  boss.tiles.forEach((char,id) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'boss-tile'; button.textContent = char;
    button.disabled = boss.selected.includes(id);
    button.setAttribute('aria-label', `${char}，选入诗句`);
    button.addEventListener('click', () => selectBossTile(id));
    $('bossBank').append(button);
  });
  $('bossSubmit').disabled = boss.selected.includes(null);
}

$('bossStart').addEventListener('click', startBossBattle);
$('bossSubmit').addEventListener('click', submitBossAnswer);
$('bossContinue').addEventListener('click', finishBossBattle);
$('bossPause').addEventListener('click', () => $('bossDialog').close());
$('bossDialog').addEventListener('close', () => {
  if (state?.mode === 'learning' && !$('gameScreen').hidden) { render(); $('nextPoem').focus({preventScroll:true}); }
});
