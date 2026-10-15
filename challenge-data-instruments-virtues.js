// 闯关专用主题语料：古典原句按语义归类，繁体转简体并统一句末标点。
// source 指向核验原文；不修改学习模式 poems.js。
const CHALLENGE_INSTRUMENTS_VIRTUES = [
    {
        id: 'instruments',
        name: '乐器',
        description: '循着琴笛箫鼓的余韵，听见古诗中的声声回响。',
        chapters: [
            {
                topic: '琴',
                description: '吟诵写琴声、弹琴与听琴的完整诗句。',
                verses: [
                    { title: '竹里馆', author: '王维', sentence: '独坐幽篁里，弹琴复长啸。', source: 'https://zh.wikisource.org/wiki/竹里館_(王維)' },
                    { title: '听弹琴', author: '刘长卿', sentence: '泠泠七弦上，静听松风寒。', source: 'https://zh.wikisource.org/wiki/聽彈琴' },
                    { title: '听蜀僧浚弹琴', author: '李白', sentence: '蜀僧抱绿绮，西下峨眉峰。', source: 'https://zh.wikisource.org/wiki/聽蜀僧濬彈琴' },
                    { title: '听蜀僧浚弹琴', author: '李白', sentence: '为我一挥手，如听万壑松。', source: 'https://zh.wikisource.org/wiki/聽蜀僧濬彈琴' }
                ]
            },
            {
                topic: '笛',
                description: '从春夜到边塞，吟诵笛声入诗的句子。',
                verses: [
                    { title: '春夜洛城闻笛', author: '李白', sentence: '谁家玉笛暗飞声，散入春风满洛城。', source: 'https://zh.wikisource.org/wiki/春夜洛城聞笛' },
                    { title: '凉州词·其一', author: '王之涣', sentence: '羌笛何须怨杨柳，春风不度玉门关。', source: 'https://zh.wikisource.org/wiki/涼州詞_(王之渙)' },
                    { title: '春夜闻笛', author: '李益', sentence: '寒山吹笛唤春归，迁客相看泪满衣。', source: 'https://zh.wikisource.org/wiki/春夜聞笛' }
                ]
            },
            {
                topic: '箫',
                description: '在明月与春社之间，寻觅吹箫的诗意。',
                verses: [
                    { title: '寄扬州韩绰判官', author: '杜牧', sentence: '二十四桥明月夜，玉人何处教吹箫。', source: 'https://zh.wikisource.org/wiki/寄揚州韓綽判官' },
                    { title: '游山西村', author: '陆游', sentence: '箫鼓追随春社近，衣冠简朴古风存。', source: 'https://zh.wikisource.org/wiki/遊山西村' }
                ]
            },
            {
                topic: '鼓',
                description: '吟诵战鼓、夜鼓与宴乐击鼓的声响。',
                verses: [
                    { title: '阁夜', author: '杜甫', sentence: '五更鼓角声悲壮，三峡星河影动摇。', source: 'https://zh.wikisource.org/wiki/閣夜' },
                    { title: '雁门太守行', author: '李贺', sentence: '半卷红旗临易水，霜重鼓寒声不起。', source: 'https://zh.wikisource.org/wiki/雁門太守行' },
                    { title: '春日行', author: '李白', sentence: '三千双蛾献歌笑，挝钟考鼓宫殿倾。', source: 'https://zh.wikisource.org/wiki/春日行' }
                ]
            },
            {
                topic: '钟',
                description: '听古寺与深山的钟声，在诗句中悠然回荡。',
                verses: [
                    { title: '枫桥夜泊', author: '张继', sentence: '姑苏城外寒山寺，夜半钟声到客船。', source: 'https://zh.wikisource.org/wiki/楓橋夜泊' },
                    { title: '过香积寺', author: '王维', sentence: '古木无人径，深山何处钟。', source: 'https://zh.wikisource.org/wiki/過香積寺' },
                    { title: '题破山寺后禅院', author: '常建', sentence: '万籁此俱寂，惟闻钟磬音。', source: 'https://zh.wikisource.org/wiki/題破山寺後禪院' }
                ]
            },
            {
                topic: '筝',
                description: '循着素手拨弦的姿态，吟诵弹筝与听筝的诗句。',
                verses: [
                    { title: '听筝', author: '李端', sentence: '鸣筝金粟柱，素手玉房前。', source: 'https://zh.wikisource.org/wiki/聽箏_(李端)' },
                    { title: '听筝', author: '李端', sentence: '欲得周郎顾，时时误拂弦。', source: 'https://zh.wikisource.org/wiki/聽箏_(李端)' },
                    { title: '春日行', author: '李白', sentence: '佳人当窗弄白日，弦将手语弹鸣筝。', source: 'https://zh.wikisource.org/wiki/春日行' }
                ]
            }
        ]
    },
    {
        id: 'virtues',
        name: '品格',
        description: '从忠孝仁义到诚勇勤廉，在古诗中体会立身之道。',
        chapters: [
            {
                topic: '忠',
                description: '吟诵心系家国、至死不改其志的诗句。',
                verses: [
                    { title: '示儿', author: '陆游', sentence: '死去元知万事空，但悲不见九州同。', source: 'https://zh.wikisource.org/wiki/示兒_(陸游)' },
                    { title: '示儿', author: '陆游', sentence: '王师北定中原日，家祭无忘告乃翁。', source: 'https://zh.wikisource.org/wiki/示兒_(陸游)' },
                    { title: '雁门太守行', author: '李贺', sentence: '报君黄金台上意，提携玉龙为君死。', source: 'https://zh.wikisource.org/wiki/雁門太守行' }
                ]
            },
            {
                topic: '孝',
                description: '以感念养育、思报亲恩的诗句表达孝心。',
                verses: [
                    { title: '游子吟', author: '孟郊', sentence: '谁言寸草心，报得三春晖。', source: 'https://zh.wikisource.org/wiki/遊子吟_(孟郊)' },
                    { title: '诗经·小雅·蓼莪', author: '佚名', sentence: '哀哀父母，生我劬劳。', source: 'https://zh.wikisource.org/wiki/詩經/蓼莪' },
                    { title: '诗经·小雅·蓼莪', author: '佚名', sentence: '欲报之德，昊天罔极。', source: 'https://zh.wikisource.org/wiki/詩經/蓼莪' }
                ]
            },
            {
                topic: '仁',
                description: '吟诵推己及人、愿天下人免于寒苦的仁爱之心。',
                verses: [
                    { title: '新制布裘', author: '白居易', sentence: '丈夫贵兼济，岂独善一身。', source: 'https://zh.wikisource.org/wiki/新製布裘' },
                    { title: '新制布裘', author: '白居易', sentence: '安得万里裘，盖裹周四垠。', source: 'https://zh.wikisource.org/wiki/新製布裘' },
                    { title: '新制布裘', author: '白居易', sentence: '稳暖皆如我，天下无寒人。', source: 'https://zh.wikisource.org/wiki/新製布裘' }
                ]
            },
            {
                topic: '义',
                description: '吟诵重道义、敬侠骨而不计外在奖赏的诗句。',
                verses: [
                    { title: '酬裴侍御对雨感时见赠', author: '李白', sentence: '平生多感激，忠义非外奖。', source: 'https://zh.wikisource.org/wiki/全唐詩/卷178' },
                    { title: '侠客行', author: '李白', sentence: '纵死侠骨香，不惭世上英。', source: 'https://zh.wikisource.org/wiki/全唐詩/卷162' }
                ]
            },
            {
                topic: '廉',
                description: '吟诵清廉自守、不取民财与珍重清白的诗句。',
                verses: [
                    { title: '入京', author: '于谦', sentence: '清风两袖朝天去，免得闾阎话短长。', source: 'https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=201&webMd=2' },
                    { title: '石灰吟', author: '于谦', sentence: '粉骨碎身全不怕，要留清白在人间。', source: 'https://zh.wikisource.org/wiki/石灰吟' }
                ]
            },
            {
                topic: '勤',
                description: '吟诵勤学惜时、以积累求进益的诗句。',
                verses: [
                    { title: '符读书城南', author: '韩愈', sentence: '诗书勤乃有，不勤腹空虚。', source: 'https://zh.wikisource.org/wiki/符讀書城南' },
                    { title: '劝学', author: '颜真卿', sentence: '三更灯火五更鸡，正是男儿读书时。', source: 'https://zh.wikisource.org/wiki/勸學(顏真卿)' },
                    { title: '劝学', author: '颜真卿', sentence: '黑发不知勤学早，白首方悔读书迟。', source: 'https://zh.wikisource.org/wiki/勸學(顏真卿)' }
                ]
            },
            {
                topic: '诚',
                description: '以重诺守信的诗句，体会言出必践的诚意。',
                verses: [
                    { title: '酬崔五郎中', author: '李白', sentence: '海岳尚可倾，吐诺终不移。', source: 'https://zh.wikisource.org/wiki/全唐詩/卷178' },
                    { title: '侠客行', author: '李白', sentence: '三杯吐然诺，五岳倒为轻。', source: 'https://zh.wikisource.org/wiki/全唐詩/卷162' }
                ]
            },
            {
                topic: '勇',
                description: '吟诵迎难而上、临危无惧的勇毅精神。',
                verses: [
                    { title: '白马篇', author: '曹植', sentence: '狡捷过猴猿，勇剽若豹螭。', source: 'https://zh.wikisource.org/wiki/白馬篇_(曹植)' },
                    { title: '白马篇', author: '曹植', sentence: '弃身锋刃端，性命安可怀。', source: 'https://zh.wikisource.org/wiki/白馬篇_(曹植)' },
                    { title: '白马篇', author: '曹植', sentence: '捐躯赴国难，视死忽如归。', source: 'https://zh.wikisource.org/wiki/白馬篇_(曹植)' }
                ]
            }
        ]
    }
];
