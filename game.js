const POEMS = [
  ['唐诗','李白','静夜思','床前明月光，疑是地上霜。举头望明月，低头思故乡。'],
  ['唐诗','李白','望庐山瀑布','日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。'],
  ['唐诗','李白','行路难','金樽清酒斗十千，玉盘珍羞直万钱。停杯投箸不能食，拔剑四顾心茫然。欲渡黄河冰塞川，将登太行雪满山。闲来垂钓碧溪上，忽复乘舟梦日边。行路难，行路难，多歧路，今安在。长风破浪会有时，直挂云帆济沧海。'],
  ['唐诗','王维','山居秋暝','空山新雨后，天气晚来秋。明月松间照，清泉石上流。竹喧归浣女，莲动下渔舟。随意春芳歇，王孙自可留。'],
  ['唐诗','孟浩然','春晓','春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。'],
  ['唐诗','杜甫','春望','国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。'],
  ['唐诗','王之涣','登鹳雀楼','白日依山尽，黄河入海流。欲穷千里目，更上一层楼。'],
  ['唐诗','柳宗元','江雪','千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。'],
  ['唐诗','王昌龄','出塞','秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。'],
  ['唐诗','李白','早发白帝城','朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。'],
  ['唐诗','杜牧','山行','远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。'],
  ['唐诗','白居易','赋得古原草送别','离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。远芳侵古道，晴翠接荒城。又送王孙去，萋萋满别情。'],
  ['唐诗','李白','赠汪伦','李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。'],
  ['唐诗','杜牧','清明','清明时节雨纷纷，路上行人欲断魂。借问酒家何处有，牧童遥指杏花村。'],
  ['唐诗','李白','将进酒','君不见黄河之水天上来，奔流到海不复回。君不见高堂明镜悲白发，朝如青丝暮成雪。人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。'],
  ['唐诗','李绅','悯农','锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。'],
  ['宋词','苏轼','水调歌头','明月几时有，把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆。人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。'],
  ['宋词','苏轼','念奴娇·赤壁怀古','大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。人生如梦，一尊还酹江月。'],
  ['宋词','李清照','如梦令','常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。'],
  ['宋词','辛弃疾','青玉案·元夕','东风夜放花千树，更吹落，星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。'],
  ['宋词','辛弃疾','西江月·夜行黄沙道中','明月别枝惊鹊，清风半夜鸣蝉。稻花香里说丰年，听取蛙声一片。七八个星天外，两三点雨山前。旧时茅店社林边，路转溪桥忽见。'],
  ['宋词','岳飞','满江红','怒发冲冠，凭栏处，潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切。'],
  ['元曲','马致远','天净沙·秋思','枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。'],
  ['元曲','白朴','天净沙·秋','孤村落日残霞，轻烟老树寒鸦，一点飞鸿影下。青山绿水，白草红叶黄花。'],
  ['元曲','张养浩','山坡羊·潼关怀古','峰峦如聚，波涛如怒，山河表里潼关路。望西都，意踌躇。伤心秦汉经行处，宫阙万间都做了土。兴，百姓苦。亡，百姓苦。'],
  ['元曲','关汉卿','大德歌·春','子规啼，不如归，道是春归人未归。几日添憔悴，虚飘飘柳絮飞。一春鱼雁无消息，则见双燕斗衔泥。'],
  ['宋词','李清照','一剪梅','红藕香残玉簟秋，轻解罗裳，独上兰舟。云中谁寄锦书来，雁字回时，月满西楼。花自飘零水自流，一种相思，两处闲愁。此情无计可消除，才下眉头，却上心头。'],
  ['唐诗','王维','相思','红豆生南国，春来发几枝。愿君多采撷，此物最相思。']
];
const STAGES = [
  { chapter:'第一章 · 山林初逢', name:'墨墨小妖', description:'偷吃诗书的小妖，最怕朗朗读书声。', hp:120, word:'月', color:'#8d9980' },
  { chapter:'第二章 · 花间寻踪', name:'花影小魅', description:'藏在落花里的小妖，等一首春日的诗。', hp:160, word:'花', color:'#bca094' },
  { chapter:'第三章 · 清风过岭', name:'风吟山魈', description:'山风吹乱了书页，快用诗句定住它。', hp:200, word:'风', color:'#9ba99e' },
  { chapter:'第四章 · 水墨江湖', name:'沧浪水灵', description:'江水载不走诗意，且以笔墨破浪。', hp:240, word:'水', color:'#889ea6' },
  { chapter:'第五章 · 诗镇千山', name:'千山墨王', description:'守着最后一卷诗书，等你写下千古名句。', hp:300, word:'山', color:'#a49bad' }
];
const $ = id => document.getElementById(id);
const normalize = text => text.replace(/[^\u3400-\u9fff]/g, '');
// Match consecutive complete clauses, so isolated words cannot be used as attacks.
function findPoem(text) {
  const normalized = normalize(text);
  if (normalized.length < 4) return null;
  for (const poem of POEMS) {
    const lines = poem[3].split(/[，。！？；、]/).map(normalize).filter(Boolean);
    for (let start=0; start<lines.length; start++) {
      let phrase='';
      for (let end=start; end<lines.length; end++) {
        phrase+=lines[end];
        if (phrase===normalized) return { poem, count:end-start+1, lines:lines.slice(start,end+1) };
        if (phrase.length>=normalized.length) break;
      }
    }
  }
  return null;
}
let state, category='唐诗', sound=false, audioContext, transitionTimer;
function resetGame() {
  clearTimeout(transitionTimer);
  state={stage:0,hp:100,enemyHp:120,score:0,defeated:0,combo:0,used:new Set(),busy:false,over:false};
  $('poemInput').value=''; $('charCount').textContent='0';
  $('resultDialog').close(); $('monster').classList.remove('hit');
  feedback('');
  render(); renderSuggestions();
}
function render() {
  const stage=STAGES[state.stage];
  $('chapter').textContent=stage.chapter;
  $('enemyName').innerHTML=`${stage.name} <span>${['壹','贰','叁','肆','伍'][state.stage]}</span>`;
  $('enemyDescription').textContent=stage.description;
  $('enemyHpText').textContent=`${state.enemyHp} / ${stage.hp}`;
  $('enemyHpBar').style.width=`${state.enemyHp/stage.hp*100}%`;
  $('playerHpText').textContent=`${state.hp} / 100`;
  $('playerHpBar').style.width=`${state.hp}%`;
  $('defeated').textContent=state.defeated;
  $('monster').style.setProperty('--monster',stage.color);
  $('weaknessTip').innerHTML=`诗句中含「${stage.word}」字<br>可获得 <b>额外 20 点</b>伤害`;
  document.querySelector('.tip-card h3').textContent=`本关诗意 · ${stage.word}`;
  $('stageProgress').innerHTML=STAGES.map((_,i)=>`${i?'<span class="stage-line"></span>':''}<span class="stage-node ${i===state.stage?'current':i<state.stage?'completed':''}">${i<state.stage?'✓':i+1}</span>`).join('');
  $('attackButton').disabled=state.busy||state.over;
  $('comboText').textContent=state.combo?`诗意连击 × ${state.combo} · 好诗，好招！`:'让第一句诗，开启你的江湖';
  if (!state.busy) $('enemySpeech').textContent=['哼，没点诗意可过不了我这关！','花开花落，你还记得哪一句？','风声太大，让我听听你的诗！','诗海无涯，接招吧！','最后一关，看你的真本事！'][state.stage];
}
function feedback(message,type='') { $('feedback').textContent=message; $('feedback').className=`feedback ${type}`; }
function playTone(victory=false) {
  if(!sound) return;
  try {
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    audioContext.resume();
    (victory?[392,494,587,784]:[440,659]).forEach((freq,i)=>{
      const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+i*.09;
      osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.08,t);gain.gain.exponentialRampToValueAtTime(.001,t+.35);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.35);
    });
  } catch { /* Audio is optional; gameplay remains available. */ }
}
function attack(event) {
  event.preventDefault();
  if(state.busy||state.over) return;
  const input=$('poemInput').value, text=normalize(input),match=findPoem(input);
  if(!match){state.combo=0;render();feedback(text.length<4?'请写下至少四个字的完整诗句，再来出招。':'这句暂未被诗库收录，试试右侧的诗意锦囊吧。元气不会扣除。','error');return;}
  if(match.lines.some(line=>state.used.has(line))){feedback('这一招本关已经用过啦，换一句诗，让小妖措手不及！','error');return;}
  match.lines.forEach(line=>state.used.add(line));state.combo++;
  const bonus=text.includes(STAGES[state.stage].word)?20:0;
  const damage=text.length*6+(match.count>=2?15:0)+bonus+Math.min(state.combo-1,5)*5;
  state.enemyHp=Math.max(0,state.enemyHp-damage);state.score+=damage;state.busy=true;
  $('damage').textContent=`−${damage}`;$('damage').classList.remove('show');void $('damage').offsetWidth;$('damage').classList.add('show');
  $('monster').classList.remove('hit');void $('monster').offsetWidth;$('monster').classList.add('hit');
  $('poemInput').value='';$('charCount').textContent='0';
  feedback(`「${match.poem[1]} · ${match.poem[2]}」命中！造成 ${damage} 点伤害${bonus?'，诗意加成 +20':''}。`,'success');
  $('enemySpeech').textContent=state.enemyHp?'哎哟！这句诗，有点厉害…':'好诗好诗！小妖甘拜下风…';
  playTone(state.enemyHp===0);render();renderSuggestions();
  transitionTimer=setTimeout(()=>{
    $('monster').classList.remove('hit');
    if(state.enemyHp===0){
      state.defeated++;state.hp=Math.min(100,state.hp+25);
      if(state.stage===STAGES.length-1){finish(true);return;}
      state.stage++;state.enemyHp=STAGES[state.stage].hp;state.used.clear();
      feedback(`✦ 小妖已降服，恢复 25 点元气！新关卡含「${STAGES[state.stage].word}」字的诗句伤害更高。`,'success');
    }else{
      state.hp=Math.max(0,state.hp-8);
      if(state.hp===0){finish(false);return;}
    }
    state.busy=false;render();renderSuggestions();$('poemInput').focus({preventScroll:true});
  },950);
}
function finish(won){
  state.over=true;state.busy=false;render();
  $('resultTitle').textContent=won?'诗出有名，名满江湖！':'歇一歇，再提笔';
  $('resultDescription').textContent=`你降服了 ${state.defeated} 只小妖，积攒了 ${state.score} 点诗意。${won?'五关已过，胸中诗意自有千钧之力。':'诗途未尽，锦囊中的长诗句能助你更进一步。'}`;
  $('resultDialog').showModal();
}
function renderSuggestions(){
  const word=STAGES[state.stage].word;
  const options=POEMS.filter(p=>p[0]===category).flatMap(p=>{
    const lines=p[3].split(/[，。！？；]/).filter(Boolean);
    return lines.filter(line=>normalize(line).length>=4&&!state.used.has(normalize(line))).map(line=>({line,poem:p}));
  }).sort((a,b)=>Number(b.line.includes(word))-Number(a.line.includes(word)));
  // Prefer different poems within the four visible suggestions.
  const picks=[],titles=new Set();
  for(const item of options){if(!titles.has(item.poem[2])){picks.push(item);titles.add(item.poem[2]);}if(picks.length===4)break;}
  if(picks.length<4)for(const item of options){if(!picks.includes(item))picks.push(item);if(picks.length===4)break;}
  $('suggestions').replaceChildren();
  for(const item of picks){
    const button=document.createElement('button');button.className='poem-tile';
    const title=document.createElement('strong');title.textContent=item.line;
    const author=document.createElement('small');author.textContent=`${item.poem[1]} · ${item.poem[2]}`;
    button.append(title,author);button.addEventListener('click',()=>{if(state.over)return;$('poemInput').value=item.line;$('charCount').textContent=item.line.length;$('poemInput').focus({preventScroll:true});});
    $('suggestions').append(button);
  }
}
$('attackForm').addEventListener('submit',attack);
$('poemInput').addEventListener('input',()=>{$('charCount').textContent=$('poemInput').value.length;});
$('poemInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229){event.preventDefault();$('attackForm').requestSubmit();}});
$('resetButton').addEventListener('click',resetGame);
$('playAgain').addEventListener('click',resetGame);
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
document.querySelectorAll('.dialog-close,.dialog-close-action').forEach(button=>button.addEventListener('click',()=>$('helpDialog').close()));
$('soundButton').addEventListener('click',()=>{sound=!sound;$('soundButton').innerHTML=sound?'♪':'♪<span class="sound-off">/</span>';$('soundButton').title=sound?'关闭音效':'开启音效';$('soundButton').setAttribute('aria-label',$('soundButton').title);if(sound)playTone();});
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(tab=>{tab.classList.toggle('active',tab===button);tab.setAttribute('aria-selected',String(tab===button));});renderSuggestions();}));
resetGame();
