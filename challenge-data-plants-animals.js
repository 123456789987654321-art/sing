// Classical public-domain texts, checked against the linked original-text editions.
// Traditional characters are normalized to simplified Chinese; punctuation is supplied where needed.
const CHALLENGE_PLANTS_ANIMALS = [
  {
    id: 'plants',
    name: '花木',
    description: '循着花香草色，吟诵古诗里的四时花木。',
    chapters: [
      {
        topic: '花', description: '从春花盛放到风雨落英，感受诗中的花意。',
        verses: [
          { title: '春晓', author: '孟浩然', sentence: '夜来风雨声，花落知多少。', source: 'https://zh.wikisource.org/wiki/春曉_(孟浩然)' },
          { title: '春望', author: '杜甫', sentence: '感时花溅泪，恨别鸟惊心。', source: 'https://zh.wikisource.org/wiki/春望' },
          { title: '钱塘湖春行', author: '白居易', sentence: '乱花渐欲迷人眼，浅草才能没马蹄。', source: 'https://zh.wikisource.org/wiki/錢塘湖春行' }
        ]
      },
      {
        topic: '草', description: '读原上青草的枯荣，体会草木不息的生机。',
        verses: [
          { title: '赋得古原草送别', author: '白居易', sentence: '离离原上草，一岁一枯荣。', source: 'https://zh.wikisource.org/wiki/賦得古原草送別' },
          { title: '赋得古原草送别', author: '白居易', sentence: '野火烧不尽，春风吹又生。', source: 'https://zh.wikisource.org/wiki/賦得古原草送別' },
          { title: '赋得古原草送别', author: '白居易', sentence: '远芳侵古道，晴翠接荒城。', source: 'https://zh.wikisource.org/wiki/賦得古原草送別' }
        ]
      },
      {
        topic: '树', description: '走过庭院村庄，在绿叶树阴间寻诗。',
        verses: [
          { title: '庭中有奇树', author: '佚名', sentence: '庭中有奇树，绿叶发华滋。', source: 'https://zh.wikisource.org/wiki/庭中有奇樹' },
          { title: '过故人庄', author: '孟浩然', sentence: '绿树村边合，青山郭外斜。', source: 'https://zh.wikisource.org/wiki/過故人莊' },
          { title: '小池', author: '杨万里', sentence: '泉眼无声惜细流，树阴照水爱晴柔。', source: 'https://zh.wikisource.org/wiki/小池' }
        ]
      },
      {
        topic: '竹', description: '听幽篁中的琴声，读青竹的坚劲。',
        verses: [
          { title: '竹石', author: '郑燮', sentence: '咬定青山不放松，立根原在破岩中。', source: 'https://zh.wikisource.org/wiki/竹石' },
          { title: '竹石', author: '郑燮', sentence: '千磨万击还坚劲，任尔东西南北风。', source: 'https://zh.wikisource.org/wiki/竹石' },
          { title: '竹里馆', author: '王维', sentence: '独坐幽篁里，弹琴复长啸。', source: 'https://zh.wikisource.org/wiki/輞川集_(王維)/竹里館' }
        ]
      },
      {
        topic: '松', description: '从松间明月到山谷清风，读苍松的风骨。',
        verses: [
          { title: '山居秋暝', author: '王维', sentence: '明月松间照，清泉石上流。', source: 'https://zh.wikisource.org/wiki/山居秋暝' },
          { title: '寻隐者不遇', author: '贾岛', sentence: '松下问童子，言师采药去。', source: 'https://zh.wikisource.org/wiki/尋隱者不遇' },
          { title: '赠从弟·其二', author: '刘桢', sentence: '亭亭山上松，瑟瑟谷中风。', source: 'https://zh.wikisource.org/zh-hant/贈從弟_(亭亭山上松)' }
        ]
      },
      {
        topic: '柳', description: '看春风裁出柳叶，也读柳色里的离情。',
        verses: [
          { title: '咏柳', author: '贺知章', sentence: '碧玉妆成一树高，万条垂下绿丝绦。', source: 'https://zh.wikisource.org/zh-hant/詠柳_(賀知章)' },
          { title: '咏柳', author: '贺知章', sentence: '不知细叶谁裁出，二月春风似剪刀。', source: 'https://zh.wikisource.org/zh-hant/詠柳_(賀知章)' },
          { title: '送元二使安西', author: '王维', sentence: '渭城朝雨浥轻尘，客舍青青柳色新。', source: 'https://zh.wikisource.org/wiki/送元二使安西' }
        ]
      },
      {
        topic: '梅', description: '循着寒枝暗香，品读梅与雪的相映。',
        verses: [
          { title: '梅花', author: '王安石', sentence: '墙角数枝梅，凌寒独自开。', source: 'https://zh.wikisource.org/wiki/梅花_(王安石)' },
          { title: '梅花', author: '王安石', sentence: '遥知不是雪，为有暗香来。', source: 'https://zh.wikisource.org/wiki/梅花_(王安石)' },
          { title: '雪梅·其一', author: '卢梅坡', sentence: '梅须逊雪三分白，雪却输梅一段香。', source: 'https://zh.wikisource.org/wiki/雪梅_(盧梅坡)' }
        ]
      },
      {
        topic: '桃', description: '走入山寺与门前的桃花，读春光中的相逢。',
        verses: [
          { title: '大林寺桃花', author: '白居易', sentence: '人间四月芳菲尽，山寺桃花始盛开。', source: 'https://zh.wikisource.org/wiki/大林寺桃花' },
          { title: '题都城南庄', author: '崔护', sentence: '去年今日此门中，人面桃花相映红。', source: 'https://zh.wikisource.org/wiki/題都城南莊' },
          { title: '题都城南庄', author: '崔护', sentence: '人面不知何处去，桃花依旧笑春风。', source: 'https://zh.wikisource.org/wiki/題都城南莊' }
        ]
      },
      {
        topic: '荷', description: '从小荷初露到莲叶接天，吟咏荷塘清趣。',
        verses: [
          { title: '小池', author: '杨万里', sentence: '小荷才露尖尖角，早有蜻蜓立上头。', source: 'https://zh.wikisource.org/wiki/小池' },
          { title: '晓出净慈寺送林子方', author: '杨万里', sentence: '接天莲叶无穷碧，映日荷花别样红。', source: 'https://zh.wikisource.org/zh-hant/曉出淨慈寺送林子方' },
          { title: '池上', titleAliases: ['池上二绝·其二'], author: '白居易', sentence: '小娃撑小艇，偷采白莲回。', source: 'https://zh.wikisource.org/wiki/池上二絕' }
        ]
      },
      {
        topic: '菊', description: '赏篱边秋菊，赴诗中的重阳之约。',
        verses: [
          { title: '菊花', author: '元稹', sentence: '秋丛绕舍似陶家，遍绕篱边日渐斜。', source: 'https://zh.wikisource.org/wiki/菊花_(元稹)' },
          { title: '菊花', author: '元稹', sentence: '不是花中偏爱菊，此花开尽更无花。', source: 'https://zh.wikisource.org/wiki/菊花_(元稹)' },
          { title: '过故人庄', author: '孟浩然', sentence: '待到重阳日，还来就菊花。', source: 'https://zh.wikisource.org/wiki/過故人莊' }
        ]
      }
    ]
  },
  {
    id: 'animals',
    name: '动物',
    description: '听鸟鸣蝉唱，看鱼游雁归，寻找诗里的生灵。',
    chapters: [
      {
        topic: '鸟', description: '听春晨啼鸟，也看寒山中鸟迹消隐。',
        verses: [
          { title: '春晓', author: '孟浩然', sentence: '春眠不觉晓，处处闻啼鸟。', source: 'https://zh.wikisource.org/wiki/春曉_(孟浩然)' },
          { title: '钱塘湖春行', author: '白居易', sentence: '几处早莺争暖树，谁家新燕啄春泥。', source: 'https://zh.wikisource.org/wiki/錢塘湖春行' },
          { title: '江雪', author: '柳宗元', sentence: '千山鸟飞绝，万径人踪灭。', source: 'https://zh.wikisource.org/wiki/江雪' }
        ]
      },
      {
        topic: '鱼', description: '从莲叶间的游鱼，读到江上鲈鱼的滋味。',
        verses: [
          { title: '江南', author: '佚名', sentence: '鱼戏莲叶间。', source: 'https://zh.wikisource.org/zh/江南_(漢樂府)' },
          { title: '江南', author: '佚名', sentence: '鱼戏莲叶东，鱼戏莲叶西，鱼戏莲叶南，鱼戏莲叶北。', source: 'https://zh.wikisource.org/zh/江南_(漢樂府)' },
          { title: '江上渔者', author: '范仲淹', sentence: '江上往来人，但爱鲈鱼美。', source: 'https://zh.wikisource.org/wiki/江上漁者' }
        ]
      },
      {
        topic: '马', description: '细看骏马的耳骨蹄足，感受驰骋万里的英姿。',
        verses: [
          { title: '房兵曹胡马', author: '杜甫', sentence: '胡马大宛名，锋棱瘦骨成。', source: 'https://zh.wikisource.org/zh-hant/九家集注杜詩_(四庫全書本)/卷18' },
          { title: '房兵曹胡马', author: '杜甫', sentence: '竹批双耳峻，风入四蹄轻。', source: 'https://zh.wikisource.org/zh-hant/九家集注杜詩_(四庫全書本)/卷18' },
          { title: '房兵曹胡马', author: '杜甫', sentence: '骁腾有如此，万里可横行。', source: 'https://zh.wikisource.org/zh-hant/九家集注杜詩_(四庫全書本)/卷18' }
        ]
      },
      {
        topic: '蝉', description: '在清露疏桐间，聆听秋蝉的高声与幽思。',
        verses: [
          { title: '蝉', author: '虞世南', sentence: '垂緌饮清露，流响出疏桐。', source: 'https://zh.wikisource.org/wiki/蟬_(虞世南)' },
          { title: '蝉', author: '虞世南', sentence: '居高声自远，非是藉秋风。', source: 'https://zh.wikisource.org/wiki/蟬_(虞世南)' },
          { title: '在狱咏蝉', author: '骆宾王', sentence: '西陆蝉声唱，南冠客思侵。', source: 'https://zh.wikisource.org/zh-hant/在獄詠蟬' }
        ]
      },
      {
        topic: '鹤', description: '望野鹤排云而上，读它的悠远与自在。',
        verses: [
          { title: '秋词·其一', author: '刘禹锡', sentence: '晴空一鹤排云上，便引诗情到碧霄。', source: 'https://zh.wikisource.org/wiki/秋詞二首' },
          { title: '黄鹤楼', author: '崔颢', sentence: '黄鹤一去不复返，白云千载空悠悠。', source: 'https://zh.wikisource.org/wiki/黃鶴樓_(崔顥)' },
          { title: '送上人', author: '刘长卿', sentence: '孤云将野鹤，岂向人间住？', source: 'https://zh.wikisource.org/wiki/送上人' }
        ]
      },
      {
        topic: '雁', description: '循着归雁的行踪，读边塞风雪与故乡书信。',
        verses: [
          { title: '次北固山下', author: '王湾', sentence: '乡书何处达，归雁洛阳边。', source: 'https://zh.wikisource.org/wiki/次北固山下' },
          { title: '使至塞上', author: '王维', sentence: '征蓬出汉塞，归雁入胡天。', source: 'https://zh.wikisource.org/wiki/使至塞上' },
          { title: '别董大·其一', author: '高适', sentence: '千里黄云白日曛，北风吹雁雪纷纷。', source: 'https://zh.wikisource.org/wiki/別董大' }
        ]
      }
    ]
  }
];
