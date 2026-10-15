// Public-domain poems, verified against the linked original-text editions.
// Traditional characters are normalized to simplified Chinese; punctuation is unified.
const CHALLENGE_FESTIVALS_WEATHER = [
  {
    id: 'festivals',
    name: '节日',
    description: '循着岁时节俗，在诗句中重逢团圆、思念与祈愿。',
    chapters: [
      {
        topic: '春节',
        description: '爆竹换岁，桃符迎新，田家共盼丰年。',
        verses: [
          { title: '元日', author: '王安石', sentence: '爆竹声中一岁除，春风送暖入屠苏。', source: 'https://zh.wikisource.org/zh-hans/元日_(王安石)' },
          { title: '元日', author: '王安石', sentence: '千门万户曈曈日，总把新桃换旧符。', source: 'https://zh.wikisource.org/zh-hans/元日_(王安石)' },
          { title: '田家元日', author: '孟浩然', sentence: '昨夜斗回北，今朝岁起东。', source: 'https://zh.wikisource.org/wiki/田家元日' },
          { title: '田家元日', author: '孟浩然', sentence: '田家占气候，共说此年丰。', source: 'https://zh.wikisource.org/wiki/田家元日' }
        ]
      },
      {
        topic: '元宵',
        description: '灯树与星桥相映，满城歌声直到夜深。',
        verses: [
          { title: '正月十五夜', author: '苏味道', sentence: '火树银花合，星桥铁锁开。', source: 'https://zh.wikisource.org/zh-hans/正月十五夜' },
          { title: '正月十五夜', author: '苏味道', sentence: '暗尘随马去，明月逐人来。', source: 'https://zh.wikisource.org/zh-hans/正月十五夜' },
          { title: '正月十五夜', author: '苏味道', sentence: '金吾不禁夜，玉漏莫相催。', source: 'https://zh.wikisource.org/zh-hans/正月十五夜' },
          { title: '青玉案·元夕', author: '辛弃疾', sentence: '东风夜放花千树，更吹落、星如雨。', source: 'https://zh.wikisource.org/zh-hans/青玉案·元夕' }
        ]
      },
      {
        topic: '端午',
        description: '五月江水悠悠，诗人追念屈原的忠魂。',
        verses: [
          { title: '端午', author: '文秀', sentence: '节分端午自谁言，万古传闻为屈原。', source: 'https://zh.wikisource.org/wiki/唐僧𢎞秀集_(四庫全書本)/卷10' },
          { title: '端午', author: '文秀', sentence: '堪笑楚江空渺渺，不能洗得直臣冤。', source: 'https://zh.wikisource.org/wiki/唐僧𢎞秀集_(四庫全書本)/卷10' },
          { title: '五月五日', author: '梅尧臣', sentence: '屈氏已沉死，楚人哀不容。', source: 'https://zh.wikisource.org/zh-hans/梅堯臣集/卷24' },
          { title: '五月五日', author: '梅尧臣', sentence: '未泯生前恨，而追没后踪。', source: 'https://zh.wikisource.org/zh-hans/梅堯臣集/卷24' }
        ]
      },
      {
        topic: '中秋',
        description: '桂露月色照见人间，也照见远客的乡愁。',
        verses: [
          { title: '十五夜望月寄杜郎中', author: '王建', sentence: '中庭地白树栖鸦，冷露无声湿桂花。', source: 'https://zh.wikisource.org/zh-hans/十五夜望月寄杜郎中' },
          { title: '十五夜望月寄杜郎中', author: '王建', sentence: '今夜月明人尽望，不知秋思在谁家。', source: 'https://zh.wikisource.org/zh-hans/十五夜望月寄杜郎中' },
          { title: '八月十五日夜湓亭望月', author: '白居易', sentence: '昔年八月十五夜，曲江池畔杏园边。', source: 'https://zh.wikisource.org/zh-hans/八月十五日夜湓亭望月' },
          { title: '八月十五日夜湓亭望月', author: '白居易', sentence: '今年八月十五夜，湓浦沙头水馆前。', source: 'https://zh.wikisource.org/zh-hans/八月十五日夜湓亭望月' }
        ]
      },
      {
        topic: '除夕',
        description: '守岁灯下，一年的离愁与期盼涌上心头。',
        verses: [
          { title: '除夜作', author: '高适', sentence: '旅馆寒灯独不眠，客心何事转凄然。', source: 'https://zh.wikisource.org/zh-hans/除夜作_(高適)' },
          { title: '除夜作', author: '高适', sentence: '故乡今夜思千里，愁鬓明朝又一年。', source: 'https://zh.wikisource.org/zh-hans/除夜作_(高適)' },
          { title: '除夜', author: '文天祥', sentence: '乾坤空落落，岁月去堂堂。', source: 'https://zh.wikisource.org/zh-hans/除夜_(文天祥)' },
          { title: '除夜', author: '文天祥', sentence: '无复屠苏梦，挑灯夜未央。', source: 'https://zh.wikisource.org/zh-hans/除夜_(文天祥)' }
        ]
      },
      {
        topic: '七夕',
        description: '仰望牵牛织女，细细红丝寄托人间心愿。',
        verses: [
          { title: '乞巧', author: '林杰', sentence: '七夕今宵看碧霄，牵牛织女渡河桥。', source: 'https://zh.wikisource.org/zh-hans/乞巧' },
          { title: '乞巧', author: '林杰', sentence: '家家乞巧望秋月，穿尽红丝几万条。', source: 'https://zh.wikisource.org/zh-hans/乞巧' },
          { title: '秋夕', author: '杜牧', sentence: '天阶夜色凉如水，卧看牵牛织女星。', source: 'https://zh.wikisource.org/zh-hans/秋夕_(杜牧)' }
        ]
      },
      {
        topic: '重阳',
        description: '登高插茱萸，菊花与佳节唤起亲友之思。',
        verses: [
          { title: '九月九日忆山东兄弟', author: '王维', sentence: '独在异乡为异客，每逢佳节倍思亲。', source: 'https://zh.wikisource.org/zh-hans/九月九日憶山東兄弟' },
          { title: '九月九日忆山东兄弟', author: '王维', sentence: '遥知兄弟登高处，遍插茱萸少一人。', source: 'https://zh.wikisource.org/zh-hans/九月九日憶山東兄弟' },
          { title: '九日齐山登高', author: '杜牧', sentence: '尘世难逢开口笑，菊花须插满头归。', source: 'https://zh.wikisource.org/zh/九日齊山登高' },
          { title: '九日齐山登高', author: '杜牧', sentence: '但将酩酊酬佳节，不用登临恨落晖。', source: 'https://zh.wikisource.org/zh/九日齊山登高' }
        ]
      },
      {
        topic: '寒食',
        description: '春城禁火，柳影与轻烟藏着不同的人间故事。',
        verses: [
          { title: '寒食', author: '韩翃', sentence: '春城无处不飞花，寒食东风御柳斜。', source: 'https://zh.wikisource.org/zh-hans/寒食_(韓翃)' },
          { title: '寒食', author: '韩翃', sentence: '日暮汉宫传蜡烛，轻烟散入五侯家。', source: 'https://zh.wikisource.org/zh-hans/寒食_(韓翃)' },
          { title: '寒食', author: '孟云卿', sentence: '二月江南花满枝，他乡寒食远堪悲。', source: 'https://zh.wikisource.org/zh-hans/寒食_(孟雲卿)' },
          { title: '寒食', author: '孟云卿', sentence: '贫居往往无烟火，不独明朝为子推。', source: 'https://zh.wikisource.org/zh-hans/寒食_(孟雲卿)' }
        ]
      },
      {
        topic: '清明',
        description: '春雨杏花与新火书灯，写下清明时节的百般心绪。',
        verses: [
          { title: '清明', author: '杜牧', sentence: '清明时节雨纷纷，路上行人欲断魂。', source: 'https://zh.wikisource.org/zh-hans/清明_(杜牧)' },
          { title: '清明', author: '杜牧', sentence: '借问酒家何处有，牧童遥指杏花村。', source: 'https://zh.wikisource.org/zh-hans/清明_(杜牧)' },
          { title: '清明感事三首·其一', author: '王禹偁', sentence: '无花无酒过清明，兴味萧然似野僧。', source: 'https://zh.wikisource.org/wiki/歲時雜詠_(四庫全書本)/卷15' },
          { title: '清明感事三首·其一', author: '王禹偁', sentence: '昨日邻家乞新火，晓窗分与读书灯。', source: 'https://zh.wikisource.org/wiki/歲時雜詠_(四庫全書本)/卷15' }
        ]
      }
    ]
  },
  {
    id: 'weather',
    name: '气候',
    description: '听风观云，读雨赏雪，在诗中感受天地的变幻。',
    chapters: [
      {
        topic: '风',
        description: '风掠花叶江竹，也裁出二月的春色。',
        verses: [
          { title: '风', author: '李峤', sentence: '解落三秋叶，能开二月花。', source: 'https://zh.wikisource.org/zh-hans/風_(李嶠)' },
          { title: '风', author: '李峤', sentence: '过江千尺浪，入竹万竿斜。', source: 'https://zh.wikisource.org/zh-hans/風_(李嶠)' },
          { title: '咏柳', author: '贺知章', sentence: '不知细叶谁裁出，二月春风似剪刀。', source: 'https://zh.wikisource.org/zh-hans/詠柳_(賀知章)' }
        ]
      },
      {
        topic: '雨',
        description: '春雨悄然入夜，滋润万物，染湿满城花朵。',
        verses: [
          { title: '春夜喜雨', author: '杜甫', sentence: '好雨知时节，当春乃发生。', source: 'https://zh.wikisource.org/zh-hans/春夜喜雨' },
          { title: '春夜喜雨', author: '杜甫', sentence: '随风潜入夜，润物细无声。', source: 'https://zh.wikisource.org/zh-hans/春夜喜雨' },
          { title: '春夜喜雨', author: '杜甫', sentence: '晓看红湿处，花重锦官城。', source: 'https://zh.wikisource.org/zh-hans/春夜喜雨' }
        ]
      },
      {
        topic: '雪',
        description: '寒江孤舟与边塞飞雪，把天地写成洁白的诗笺。',
        verses: [
          { title: '江雪', author: '柳宗元', sentence: '孤舟蓑笠翁，独钓寒江雪。', source: 'https://zh.wikisource.org/zh-hans/江雪' },
          { title: '白雪歌送武判官归京', author: '岑参', sentence: '北风卷地白草折，胡天八月即飞雪。', source: 'https://zh.wikisource.org/zh-hans/白雪歌送武判官歸京' },
          { title: '白雪歌送武判官归京', author: '岑参', sentence: '忽如一夜春风来，千树万树梨花开。', source: 'https://zh.wikisource.org/zh-hans/白雪歌送武判官歸京' },
          { title: '白雪歌送武判官归京', author: '岑参', sentence: '山回路转不见君，雪上空留马行处。', source: 'https://zh.wikisource.org/zh-hans/白雪歌送武判官歸京' }
        ]
      },
      {
        topic: '云',
        description: '孤云悠然，山霭聚散，夜色中的云层渐渐浓黑。',
        verses: [
          { title: '独坐敬亭山', author: '李白', sentence: '众鸟高飞尽，孤云独去闲。', source: 'https://zh.wikisource.org/zh-hans/獨坐敬亭山' },
          { title: '终南山', author: '王维', sentence: '白云回望合，青霭入看无。', source: 'https://zh.wikisource.org/zh-hans/終南山_(王維)' },
          { title: '春夜喜雨', author: '杜甫', sentence: '野径云俱黑，江船火独明。', source: 'https://zh.wikisource.org/zh-hans/春夜喜雨' }
        ]
      },
      {
        topic: '雷',
        description: '惊雷唤醒春耕，也催动夏日江村的骤雨。',
        verses: [
          { title: '观田家', author: '韦应物', sentence: '微雨众卉新，一雷惊蛰始。', source: 'https://zh.wikisource.org/zh/觀田家' },
          { title: '有美堂暴雨', author: '苏轼', sentence: '游人脚底一声雷，满座顽云拨不开。', source: 'https://zh.wikisource.org/zh/有美堂暴雨' },
          { title: '暴雨', author: '韦庄', sentence: '江村入夏多雷雨，晓作狂霖晚又晴。', source: 'https://zh.wikisource.org/zh-hans/暴雨_(韋莊)' }
        ]
      }
    ]
  }
];
