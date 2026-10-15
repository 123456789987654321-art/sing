const CHALLENGE_BOSS_KINDS = ['五言', '七言', '四言', '杂言'];

function challengeVerseKind(sentence) {
  const lengths = sentence.split(/[，,。！？!?；;]/u).map(normalize).filter(Boolean).map(text => [...text].length);
  if (!lengths.length) return '';
  if (new Set(lengths).size > 1) return '杂言';
  return ({4:'四言', 5:'五言', 7:'七言'})[lengths[0]] || '';
}

function challengeBossPool(kind) {
  return allChallengeEntries().filter(entry => challengeVerseKind(entry.sentence) === kind);
}

function advanceChallengeRound() {
  if (!state.enemyHp) {
    state.defeated++;
    state.stage = (state.stage + 1) % currentChallengeVolume().chapters.length;
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
  startChallengeBoss();
}

function openChallengeBoss() {
  if (!state.challengeBoss || state.mode !== 'challenge') return;
  render();
  const status = state.challengeBoss.status;
  $(status === 'active' ? 'challengeBossVerse' : status === 'won' ? 'challengeBossContinue' : 'challengeBossStart').focus({preventScroll:true});
}

function nextChallengeBossHint(change = false) {
  const boss = state.challengeBoss;
  boss.hintStep = 0;
  const available = challengeBossPool(boss.kind).filter(item => !boss.used.includes(normalize(item.sentence)));
  const alternatives = available.filter(item => normalize(item.sentence) !== normalize(boss.hint?.sentence || ''));
  boss.hint = shuffled(change && alternatives.length ? alternatives : available)[0];
  $('challengeBossForm').reset();
}

function startChallengeBoss() {
  const boss = state.challengeBoss;
  if (!boss || !['intro','lost'].includes(boss.status)) return;
  clearAttackEffects();
  Object.assign(boss, {status:'active', hp:6, index:0, used:[]});
  nextChallengeBossHint();
  $('challengeBossFeedback').textContent = '';
  render();
  $('challengeBossVerse').focus({preventScroll:true});
}

async function submitChallengeBoss() {
  const boss = state.challengeBoss;
  if (!boss || boss.status !== 'active' || state.busy) return;
  const verse = $('challengeBossVerse').value;
  const title = $('challengeBossTitleInput').value;
  const author = $('challengeBossAuthor').value;
  if (![verse,title,author].every(value => value.trim())) {
    $('challengeBossFeedback').textContent = '请填写完整诗句、诗名和作者。'; return;
  }
  let work = matchChallenge(verse, title, author, {verses:allChallengeEntries()});
  if (!work) {
    const result = await verifyUnknownChallenge(verse,title,author,boss);
    if (!result) return;
    if (result.status === 'verified') work = {...result.entry,sentences:[result.entry.sentence]};
    else if (result.status !== 'mismatch') { $('challengeBossFeedback').textContent = verificationMessage(result); return; }
  }
  const sentence = work?.sentence || work?.sentences[0];
  if (!sentence || challengeVerseKind(sentence) !== boss.kind) {
    boss.hp--;
    $('challengeBossFeedback').textContent = `本场要求${boss.kind}，请核对诗句、诗名和作者。扣一颗心。`;
    if (!boss.hp) boss.status = 'lost';
    render();
    if (boss.status === 'lost') $('challengeBossStart').focus({preventScroll:true});
    return;
  }
  const key = normalize(sentence);
  if (boss.used.includes(key)) { $('challengeBossFeedback').textContent = '这句已破过一道墨障，请换一句。'; return; }
  boss.used.push(key);
  boss.index++;
  state.lastChallenge = {sentence, title:work.title, author:work.author};
  if (boss.index === 3) boss.status = 'won';
  else nextChallengeBossHint();
  $('challengeBossFeedback').textContent = `诗句无误，已破 ${boss.index} / 3 重墨障！`;
  playTone(boss.status === 'won');
  render();
  playAttackEffect($('scene'), $('monster'), 1);
  if (boss.status === 'won') $('challengeBossContinue').focus({preventScroll:true});
}

function finishChallengeBoss() {
  if (state.challengeBoss?.status !== 'won') return;
  clearAttackEffects();
  state.challengeBossWins++;
  state.challengeBoss = null;
  $('challengeBossPanel').hidden = true;
  if (state.challengeBossWins === 4) { finish(true); return; }
  advanceChallengeRound();
  $('challengeVerse').focus({preventScroll:true});
}

function renderChallengeBoss() {
  const boss = state.challengeBoss;
  if (!boss) return;
  const active = boss.status === 'active', won = boss.status === 'won', lost = boss.status === 'lost';
  $('challengeBossPanel').dataset.phase = boss.status;
  $('enemyName').textContent = `${boss.kind}墨魇`;
  const badge = document.createElement('span'); badge.textContent = 'Boss'; $('enemyName').append(badge);
  $('enemyHealthLabel').textContent = '墨障';
  $('enemyHpText').textContent = `${3 - boss.index} / 3`;
  $('enemyHpBar').style.width = `${(3 - boss.index) / 3 * 100}%`;
  $('monster').style.setProperty('--monster', '#929880');
  $('enemySpeech').textContent = won ? '好诗！这回算我输了……' : lost ? '嘿嘿，再读几卷书来试试？' : ['三重墨障，你的诗能破得开吗？','才破一重，可别得意太早！','竟能逼我至此……再来！'][boss.index];
  $('playerHpText').textContent = `${boss.hp} / 6`;
  const hearts = $('playerHearts') || $('playerStars');
  hearts.setAttribute('aria-label', `剩余 ${boss.hp} 颗爱心，共 6 颗`);
  hearts.innerHTML = Array.from({length:6}, (_,index) => `<span class="life-heart${index < boss.hp ? '' : ' lost'}" aria-hidden="true">♥</span>`).join('');
  $('challengeBossDescription').textContent = won ? '三句成诗，三重墨障尽破。' : lost ? '本场重新开始，恢复六颗心；普通关卡的十句进度保留。'
    : `不限定主题，写出三句不同的${boss.kind}诗文，并填写诗名与作者，即可击败本场 Boss。`;
  $('challengeBossDescription').hidden = active;
  $('challengeBossForm').hidden = !active;
  [...$('challengeBossForm').elements].forEach(element => element.disabled = state.busy);
  $('challengeBossStart').hidden = won || active;
  $('challengeBossStart').textContent = lost ? '重新迎战 →' : '开始战斗 →';
  $('challengeBossContinue').hidden = !won;
  $('challengeBossContinue').textContent = state.challengeBossWins === 3 ? '四关已破，完成试炼 →' : '破阵成功，继续挑战 →';
  $('challengeTipText').textContent = (boss.kind === '杂言' ? '本场要求杂言：一句内各分句字数不齐。' : `本场要求${boss.kind}：每个分句均为${boss.kind[0]}字。`) + '写出三句不同的完整诗句，并填写诗名与作者。';
  $('challengeBossHintButton').textContent = boss.hintStep >= 3 ? '✧ 换一句' : `✧ 帮助 ${boss.hintStep}/3`;
  $('challengeBossHintButton').disabled = !active || !boss.hint || state.busy;
}

$('challengeBossForm').addEventListener('submit', event => { event.preventDefault(); submitChallengeBoss(); });
$('challengeBossStart').addEventListener('click', startChallengeBoss);
$('challengeBossContinue').addEventListener('click', finishChallengeBoss);
$('challengeBossHintButton').addEventListener('click', () => {
  const boss = state.challengeBoss;
  if (boss?.status !== 'active' || !boss.hint || state.busy) return;
  if (boss.hintStep >= 3 || boss.used.includes(normalize(boss.hint.sentence))) nextChallengeBossHint(true);
  boss.hintStep++;
  fillChallengeHint(boss.hint, boss.hintStep, ['challengeBossVerse', 'challengeBossTitleInput', 'challengeBossAuthor']);
  renderChallengeBoss();
});
