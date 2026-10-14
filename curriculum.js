// Learning categories are independent pools. Add poems in poems.js using these names.
const LEARNING_CATEGORIES = [
  {name:'诗经', note:'风雅颂 · 四言古韵', mark:'风', color:'#a29674'},
  {name:'楚辞', note:'香草美人 · 楚地长歌', mark:'辞', color:'#9b91ab'},
  {name:'汉赋', note:'铺采摛文 · 两汉辞章', mark:'赋', color:'#b09b79'},
  {name:'唐诗', note:'山川明月 · 盛唐诗意', mark:'诗', color:'#8d9980'},
  {name:'宋词', note:'长短句里 · 人间清欢', mark:'词', color:'#91a4a5'},
  {name:'元曲', note:'小令散曲 · 市井烟火', mark:'曲', color:'#b19a91'}
];

// Add future volumes here; poem titles select each chapter's question pool.
const CHALLENGE_VOLUMES = [{
  id:'four-seasons', title:'第一篇 · 四季篇', description:'从春风到冬雪，循着诗句走过一年。',
  chapters:[
    {chapter:'第一章 · 春', season:'春', name:'春芽小妖', description:'春风翻开诗页，唤醒一山新绿。', hp:24, color:'#8d9980', speech:'春风到了，拼一句春天的诗吧！', titles:['春晓','春夜喜雨','咏柳','绝句·迟日江山丽'], opening:'春眠不觉晓'},
    {chapter:'第二章 · 夏', season:'夏', name:'荷风小妖', description:'荷叶田田，诗意藏在夏日水边。', hp:32, color:'#85a6a0', speech:'听见荷风了吗？这次写夏天！', titles:['小池','晓出净慈寺送林子方','池上','子夜吴歌·夏歌'], opening:'小荷才露尖尖角'},
    {chapter:'第三章 · 秋', season:'秋', name:'枫影小妖', description:'层林尽染，拾起一片秋日诗意。', hp:40, color:'#ba9a7b', speech:'秋风翻书页，下一句是什么？', titles:['山行','山居秋暝','天净沙·秋思','天净沙·秋','九月九日忆山东兄弟'], opening:'停车坐爱枫林晚'},
    {chapter:'第四章 · 冬', season:'冬', name:'雪墨小妖', description:'一炉微火，一场冬雪，等你以诗收卷。', hp:48, color:'#9ca9b9', speech:'最后一场雪，等你拼出冬日诗！', titles:['江雪','逢雪宿芙蓉山主人','问刘十九'], opening:'独钓寒江雪'}
  ]
}];
