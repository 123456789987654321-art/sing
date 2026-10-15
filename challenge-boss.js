const CHALLENGE_BOSS_KINDS = ['五言', '七言', '四言', '杂言'];

function challengeVerseKind(sentence) {
  const lengths = sentence.split(/[，,。！？!?；;]/u).map(normalize).filter(Boolean).map(text => [...text].length);
  if (!lengths.length) return '';
  if (new Set(lengths).size > 1) return '杂言';
  return ({4:'四言', 5:'五言', 7:'七言'})[lengths[0]] || '';
}

function challengeBossPool(kind) {
  return LEARNING_WORKS.flatMap(work => work.sentences
    .filter(sentence => challengeVerseKind(sentence) === kind)
    .map(sentence => ({title:work.title, author:work.author, sentence})));
}

function advanceChallengeRound() {
  if (!state.enemyHp) {
    state.defeated++;
    state.stage = (state.stage + 1) % VOLUME.chapters.length;
    state.enemyHp = currentStage().hp;
    prepareDeck();
    feedback(`进入${currentStage().chapter}，请按新的主题作答。`, 'success');
  }
  state.busy = false;
  newPuzzle();
  render();
}

function queueChallengeBoss() {
  if (state.mode !== 'challenge' || state.challengeBoss || state.challengeBossWins >= 4
    || state.challengeCorrect !== (state.challengeBossWins + 1) * 10) return;
  state.busy = false;
  state.challengeBoss = {kind:CHALLENGE_BOSS_KINDS[state.challengeBossWins], checkpoint:state.challengeCorrect,
    status:'intro', hp:6, index:0, used:[], hintStep:0};
  $('challengeBossFeedback').textContent = '';
  render();
  openChallengeBoss();
}

function openChallengeBoss() {
  if (!state.challengeBoss || state.mode !== 'challenge') return;
  renderChallengeBoss();
  if (!$('challengeBossDialog').open) $('challengeBossDialog').showModal();
  const status = state.challengeBoss.status;
  $(status === 'active' ? 'challengeBossVerse' : status === 'won' ? 'challengeBossContinue' : 'challengeBossStart').focus({preventScroll:true});
}

function nextChallengeBossHint() {
  const boss = state.challengeBoss;
  boss.hintStep = 0;
  boss.hint = challengeBossPool(boss.kind).find(item => !boss.used.includes(normalize(item.sentence)));
  $('challengeBossForm').reset();
}

function startChallengeBoss() {
  const boss = state.challengeBoss;
  if (!boss || !['intro','lost'].includes(boss.status)) return;
  clearAttackEffects();
  Object.assign(boss, {status:'active', hp:6, index:0, used:[]});
  nextChallengeBossHint();
  $('challengeBossFeedback').textContent = '';
  renderChallengeBoss();
  $('challengeBossVerse').focus({preventScroll:true});
}

function submitChallengeBoss() {
  const boss = state.challengeBoss;
  if (!boss || boss.status !== 'active') return;
  const verse = $('challengeBossVerse').value;
  const title = $('challengeBossTitleInput').value;
  const author = $('challengeBossAuthor').value;
  if (![verse,title,author].every(value => value.trim())) {
    $('challengeBossFeedback').textContent = '请填写完整诗句、诗名和作者。'; return;
  }
  const work = matchChallenge(verse, title, author, {titles:LEARNING_WORKS.map(work => work.title)});
  const sentence = work?.sentences.find(line => cleanSubmission(line) === cleanSubmission(verse)
    || (work.title === '山行' && cleanSubmission(line).replace('白云生处', '白云深处') === cleanSubmission(verse)));
  if (!sentence || challengeVerseKind(sentence) !== boss.kind) {
    boss.hp--;
    $('challengeBossFeedback').textContent = `本场要求${boss.kind}，请核对诗句、诗名和作者。扣一颗心。`;
    if (!boss.hp) boss.status = 'lost';
    renderChallengeBoss();
    if (boss.status === 'lost') $('challengeBossStart').focus({preventScroll:true});
    return;
  }
  const key = normalize(sentence);
  if (boss.used.includes(key)) { $('challengeBossFeedback').textContent = '这句已破过一道墨障，请换一句。'; return; }
  boss.used.push(key);
  boss.index++;
  if (boss.index === 3) boss.status = 'won';
  else nextChallengeBossHint();
  $('challengeBossFeedback').textContent = `诗句无误，已破 ${boss.index} / 3 重墨障！`;
  playTone(boss.status === 'won');
  renderChallengeBoss();
  playAttackEffect($('challengeBossDialog'), $('challengeBossBanner'), 1, '破墨 −1');
  if (boss.status === 'won') $('challengeBossContinue').focus({preventScroll:true});
}

function finishChallengeBoss() {
  if (state.challengeBoss?.status !== 'won') return;
  clearAttackEffects();
  state.challengeBossWins++;
  state.challengeBoss = null;
  $('challengeBossDialog').close();
  if (state.challengeBossWins === 4) { finish(true); return; }
  advanceChallengeRound();
  $('challengeVerse').focus({preventScroll:true});
}

function renderChallengeBoss() {
  const boss = state.challengeBoss;
  if (!boss) return;
  const active = boss.status === 'active', won = boss.status === 'won', lost = boss.status === 'lost';
  $('challengeBossDialog').dataset.phase = boss.status;
  $('challengeBossCheckpoint').textContent = `第 ${boss.checkpoint} 句 · 第 ${state.challengeBossWins + 1} / 4 场`;
  $('challengeBossTitle').textContent = won ? `${boss.kind} · 破阵成功` : lost ? '胜负未定，再试一回' : `${boss.kind} · 强敌来袭`;
  $('challengeBossDescription').textContent = won ? '三句成诗，三重墨障尽破。' : lost ? '本场重新开始，恢复六颗心；普通关卡的十句进度保留。'
    : `不限定季节，写出三句不同的${boss.kind}诗文，并填写诗名与作者，即可击败本场 Boss。`;
  $('challengeBossIntro').hidden = active;
  $('challengeBossCombat').hidden = !active;
  $('challengeBossStart').hidden = won || active;
  $('challengeBossStart').textContent = lost ? '重新迎战 →' : '开始战斗 →';
  $('challengeBossContinue').hidden = !won;
  $('challengeBossContinue').textContent = state.challengeBossWins === 3 ? '四关已破，完成试炼 →' : '破阵成功，继续挑战 →';
  $('challengeBossSeal').textContent = won ? '胜' : boss.kind[0];
  $('challengeBossProgress').textContent = `${boss.index} / 3 句`;
  $('challengeBossHealthText').textContent = `${3 - boss.index} / 3`;
  $('challengeBossHealthBar').style.width = `${(3 - boss.index) / 3 * 100}%`;
  $('challengeBossLives').textContent = '♥'.repeat(boss.hp) + '♡'.repeat(6 - boss.hp);
  $('challengeBossLives').setAttribute('aria-label', `剩余 ${boss.hp} 颗爱心，共 6 颗`);
  $('challengeBossRule').textContent = boss.kind === '杂言' ? '本场杂言：一句内各分句字数不齐；请写完整一句。' : `本场${boss.kind}：每个分句均为${boss.kind[0]}字；请写完整一句。`;
  $('challengeBossHintButton').textContent = `✧ 帮助 ${boss.hintStep}/3`;
  $('challengeBossHintButton').disabled = !active || !boss.hint || boss.hintStep >= 3;
}

$('challengeBossForm').addEventListener('submit', event => { event.preventDefault(); submitChallengeBoss(); });
$('challengeBossStart').addEventListener('click', startChallengeBoss);
$('challengeBossContinue').addEventListener('click', finishChallengeBoss);
$('challengeBossResume').addEventListener('click', openChallengeBoss);
$('challengeBossPause').addEventListener('click', () => $('challengeBossDialog').close());
$('challengeBossHintButton').addEventListener('click', () => {
  const boss = state.challengeBoss;
  if (boss?.status !== 'active' || !boss.hint || boss.hintStep >= 3) return;
  boss.hintStep++;
  fillChallengeHint(boss.hint, boss.hintStep, ['challengeBossVerse', 'challengeBossTitleInput', 'challengeBossAuthor']);
  renderChallengeBoss();
});
$('challengeBossDialog').addEventListener('close', () => {
  clearAttackEffect($('challengeBossDialog'));
  if (state?.mode === 'challenge' && !$('gameScreen').hidden && state.challengeBoss) {
    render(); $('challengeBossResume').focus({preventScroll:true});
  }
});
