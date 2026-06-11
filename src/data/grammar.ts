import { GrammarPoint } from "../types/grammar";

const makeQuizzes = (
  id: string,
  title: string,
  meaning: string,
  correct: string,
  wrongA: string,
  wrongB: string
) => [
  {
    id: `${id}-q1`,
    type: "choice" as const,
    prompt: `「${title}」最接近哪个意思？`,
    options: [meaning, wrongA, wrongB, "表示强烈命令"],
    answer: meaning,
    explanation: `「${title}」常用来表示：${meaning}。`
  },
  {
    id: `${id}-q2`,
    type: "input" as const,
    prompt: `补全：${correct.replace("＿", "____")}`,
    answer: title,
    explanation: `这里要用「${title}」，结构是：${correct}。`
  },
  {
    id: `${id}-q3`,
    type: "boolean" as const,
    prompt: `「${title}」属于 N5 入门语法。`,
    answer: true,
    explanation: `本应用把「${title}」作为 N5 基础语法训练。`
  }
];

export const grammarPoints: GrammarPoint[] = [
  {
    id: "wa",
    title: "は",
    level: "N5",
    meaning: "提示主题：至于……",
    structure: "名词 + は",
    explanation: "把话题摆出来，后面说明这个话题的情况。",
    examples: [
      {
        japanese: "私は学生です。",
        reading: "わたしは がくせいです。",
        chinese: "我是学生。",
        notes: [
          { text: "私", note: "我" },
          { text: "は", note: "提示主题，读作 wa" },
          { text: "学生", note: "学生" },
          { text: "です", note: "礼貌判断" }
        ]
      }
    ],
    comparisons: ["は强调话题，が强调主语或新信息。"],
    quizzes: makeQuizzes("wa", "は", "提示主题：至于……", "名詞＿説明", "表示地点", "表示过去")
  },
  {
    id: "ga",
    title: "が",
    level: "N5",
    meaning: "提示主语或新信息",
    structure: "名词 + が",
    explanation: "常用来指出是谁、什么东西，或强调刚出现的新信息。",
    examples: [
      {
        japanese: "雨が降っています。",
        reading: "あめが ふっています。",
        chinese: "正在下雨。",
        notes: [
          { text: "雨", note: "雨" },
          { text: "が", note: "提示主语" },
          { text: "降っています", note: "正在下" }
        ]
      }
    ],
    comparisons: ["が回答“谁/什么”，は继续谈已经知道的话题。"],
    quizzes: makeQuizzes("ga", "が", "提示主语或新信息", "名詞＿あります", "表示手段", "表示所属")
  },
  {
    id: "wo",
    title: "を",
    level: "N5",
    meaning: "提示动作对象",
    structure: "名词 + を + 动词",
    explanation: "表示动作直接作用到的对象。",
    examples: [
      {
        japanese: "水を飲みます。",
        reading: "みずを のみます。",
        chinese: "喝水。",
        notes: [
          { text: "水", note: "水" },
          { text: "を", note: "动作对象，读作 o" },
          { text: "飲みます", note: "喝" }
        ]
      }
    ],
    comparisons: ["を接动作对象；で常接动作发生地点或工具。"],
    quizzes: makeQuizzes("wo", "を", "提示动作对象", "名詞＿動詞", "表示主题", "表示原因")
  },
  {
    id: "ni",
    title: "に",
    level: "N5",
    meaning: "表示时间、目的地、存在位置或对象",
    structure: "时间/地点/对象 + に",
    explanation: "用途很多，核心感觉是动作或状态落到某个点上。",
    examples: [
      {
        japanese: "七時に学校へ行きます。",
        reading: "しちじに がっこうへ いきます。",
        chinese: "七点去学校。",
        notes: [
          { text: "七時", note: "七点" },
          { text: "に", note: "时间点" },
          { text: "学校", note: "学校" },
          { text: "行きます", note: "去" }
        ]
      }
    ],
    comparisons: ["に偏向到达点；で偏向动作发生的场所。"],
    quizzes: makeQuizzes("ni", "に", "表示时间、目的地、存在位置或对象", "時間＿動詞", "表示动作对象", "连接形容词")
  },
  {
    id: "de",
    title: "で",
    level: "N5",
    meaning: "表示动作地点、工具、方式",
    structure: "地点/工具 + で + 动词",
    explanation: "说明动作在哪里发生，或用什么方式完成。",
    examples: [
      {
        japanese: "図書館で勉強します。",
        reading: "としょかんで べんきょうします。",
        chinese: "在图书馆学习。",
        notes: [
          { text: "図書館", note: "图书馆" },
          { text: "で", note: "动作地点" },
          { text: "勉強します", note: "学习" }
        ]
      }
    ],
    comparisons: ["で是动作现场；に是存在点或到达点。"],
    quizzes: makeQuizzes("de", "で", "表示动作地点、工具、方式", "場所＿動詞", "表示主题", "表示过去否定")
  },
  {
    id: "no",
    title: "の",
    level: "N5",
    meaning: "表示所属或修饰",
    structure: "名词 + の + 名词",
    explanation: "把两个名词连起来，常表示“的”。",
    examples: [
      {
        japanese: "これは私の本です。",
        reading: "これは わたしの ほんです。",
        chinese: "这是我的书。",
        notes: [
          { text: "私", note: "我" },
          { text: "の", note: "的" },
          { text: "本", note: "书" }
        ]
      }
    ],
    comparisons: ["の连接名词；な连接な形容词和名词。"],
    quizzes: makeQuizzes("no", "の", "表示所属或修饰", "名詞＿名詞", "表示动作对象", "表示允许")
  },
  {
    id: "desu",
    title: "です",
    level: "N5",
    meaning: "礼貌判断：是……",
    structure: "名词/な形容词 + です",
    explanation: "让句子变得礼貌，也用于说明身份、状态。",
    examples: [
      {
        japanese: "今日は休みです。",
        reading: "きょうは やすみです。",
        chinese: "今天休息。",
        notes: [
          { text: "今日", note: "今天" },
          { text: "休み", note: "休息" },
          { text: "です", note: "礼貌结尾" }
        ]
      }
    ],
    comparisons: ["です偏判断；ます接动词，表示礼貌动作。"],
    quizzes: makeQuizzes("desu", "です", "礼貌判断：是……", "名詞＿", "动作对象", "动作地点")
  },
  {
    id: "masu",
    title: "ます",
    level: "N5",
    meaning: "动词礼貌现在/将来",
    structure: "动词ます形",
    explanation: "用于礼貌地说现在习惯或未来动作。",
    examples: [
      {
        japanese: "毎日日本語を勉強します。",
        reading: "まいにち にほんごを べんきょうします。",
        chinese: "每天学习日语。",
        notes: [
          { text: "毎日", note: "每天" },
          { text: "日本語", note: "日语" },
          { text: "勉強します", note: "学习，ます形" }
        ]
      }
    ],
    comparisons: ["ます是肯定；ません是否定。"],
    quizzes: makeQuizzes("masu", "ます", "动词礼貌现在/将来", "動詞＿", "所属", "过去否定")
  },
  {
    id: "masen",
    title: "ません",
    level: "N5",
    meaning: "动词礼貌否定",
    structure: "动词ます形词干 + ません",
    explanation: "礼貌地说“不做、不发生”。",
    examples: [
      {
        japanese: "今日は行きません。",
        reading: "きょうは いきません。",
        chinese: "今天不去。",
        notes: [
          { text: "今日", note: "今天" },
          { text: "行きません", note: "不去" }
        ]
      }
    ],
    comparisons: ["ません是否定；ませんでした是过去否定。"],
    quizzes: makeQuizzes("masen", "ません", "动词礼貌否定", "動詞語幹＿", "正在进行", "所属")
  },
  {
    id: "mashita",
    title: "ました",
    level: "N5",
    meaning: "动词礼貌过去",
    structure: "动词ます形词干 + ました",
    explanation: "礼貌地说过去做了某事。",
    examples: [
      {
        japanese: "昨日映画を見ました。",
        reading: "きのう えいがを みました。",
        chinese: "昨天看了电影。",
        notes: [
          { text: "昨日", note: "昨天" },
          { text: "映画", note: "电影" },
          { text: "見ました", note: "看了" }
        ]
      }
    ],
    comparisons: ["ました是过去肯定；ます是现在或未来。"],
    quizzes: makeQuizzes("mashita", "ました", "动词礼貌过去", "動詞語幹＿", "允许", "比较")
  },
  {
    id: "masendeshita",
    title: "ませんでした",
    level: "N5",
    meaning: "动词礼貌过去否定",
    structure: "动词ます形词干 + ませんでした",
    explanation: "礼貌地说过去没有做某事。",
    examples: [
      {
        japanese: "昨日は勉強しませんでした。",
        reading: "きのうは べんきょうしませんでした。",
        chinese: "昨天没有学习。",
        notes: [
          { text: "昨日", note: "昨天" },
          { text: "勉強しませんでした", note: "没有学习" }
        ]
      }
    ],
    comparisons: ["ませんでした是过去否定；ません是现在或未来否定。"],
    quizzes: makeQuizzes("masendeshita", "ませんでした", "动词礼貌过去否定", "動詞語幹＿", "现在肯定", "主题提示")
  },
  {
    id: "i-adjectives",
    title: "い-adjectives",
    level: "N5",
    meaning: "い形容词，直接修饰名词或作谓语",
    structure: "い形容词 + 名词 / い形容词 + です",
    explanation: "以い结尾的一类形容词，变形时保留形容词自己的活性。",
    examples: [
      {
        japanese: "この本は面白いです。",
        reading: "このほんは おもしろいです。",
        chinese: "这本书很有趣。",
        notes: [
          { text: "この", note: "这个" },
          { text: "面白い", note: "有趣的，い形容词" },
          { text: "です", note: "礼貌" }
        ]
      }
    ],
    comparisons: ["い形容词直接接名词；な形容词修饰名词时要加な。"],
    quizzes: makeQuizzes("iadj", "い-adjectives", "い形容词，直接修饰名词或作谓语", "形容詞＿", "动作过去", "目的地")
  },
  {
    id: "na-adjectives",
    title: "な-adjectives",
    level: "N5",
    meaning: "な形容词，修饰名词时加な",
    structure: "な形容词 + な + 名词",
    explanation: "这类词作谓语时常接です，修饰名词时中间放な。",
    examples: [
      {
        japanese: "静かな部屋です。",
        reading: "しずかな へやです。",
        chinese: "是安静的房间。",
        notes: [
          { text: "静か", note: "安静，な形容词" },
          { text: "な", note: "连接名词" },
          { text: "部屋", note: "房间" }
        ]
      }
    ],
    comparisons: ["な形容词接名词要な；い形容词一般直接接名词。"],
    quizzes: makeQuizzes("nadj", "な-adjectives", "な形容词，修饰名词时加な", "形容動詞＿名詞", "动作对象", "时间点")
  },
  {
    id: "te-form",
    title: "て-form",
    level: "N5",
    meaning: "连接动作、请求、状态表达的基础形",
    structure: "动词て形",
    explanation: "て形像接口，可连接多个动作，也能接ください、いる等表达。",
    examples: [
      {
        japanese: "朝ご飯を食べて、学校へ行きます。",
        reading: "あさごはんを たべて、がっこうへ いきます。",
        chinese: "吃早饭，然后去学校。",
        notes: [
          { text: "食べて", note: "食べる的て形" },
          { text: "学校", note: "学校" },
          { text: "行きます", note: "去" }
        ]
      }
    ],
    comparisons: ["て形连接自然顺序；た形表示过去或完成。"],
    quizzes: makeQuizzes("te", "て-form", "连接动作、请求、状态表达的基础形", "動詞＿", "所属关系", "礼貌判断")
  },
  {
    id: "nai-form",
    title: "ない-form",
    level: "N5",
    meaning: "动词普通否定形",
    structure: "动词ない形",
    explanation: "普通体里的“不做”，也能接很多后续语法。",
    examples: [
      {
        japanese: "今日は肉を食べない。",
        reading: "きょうは にくを たべない。",
        chinese: "今天不吃肉。",
        notes: [
          { text: "肉", note: "肉" },
          { text: "を", note: "动作对象" },
          { text: "食べない", note: "不吃，ない形" }
        ]
      }
    ],
    comparisons: ["ない是普通否定；ません是礼貌否定。"],
    quizzes: makeQuizzes("nai", "ない-form", "动词普通否定形", "動詞＿", "过去肯定", "动作地点")
  },
  {
    id: "ta-form",
    title: "た-form",
    level: "N5",
    meaning: "动词普通过去形",
    structure: "动词た形",
    explanation: "普通体里表示过去做了，后面也可接ことがある等表达。",
    examples: [
      {
        japanese: "昨日ラーメンを食べた。",
        reading: "きのう ラーメンを たべた。",
        chinese: "昨天吃了拉面。",
        notes: [
          { text: "昨日", note: "昨天" },
          { text: "食べた", note: "吃了，た形" }
        ]
      }
    ],
    comparisons: ["た形是普通过去；ました是礼貌过去。"],
    quizzes: makeQuizzes("ta", "た-form", "动词普通过去形", "動詞＿", "允许", "所属")
  },
  {
    id: "tai",
    title: "たい",
    level: "N5",
    meaning: "想做……",
    structure: "动词ます形词干 + たい",
    explanation: "表达说话人自己的愿望，像い形容词一样变化。",
    examples: [
      {
        japanese: "日本へ行きたいです。",
        reading: "にほんへ いきたいです。",
        chinese: "想去日本。",
        notes: [
          { text: "日本", note: "日本" },
          { text: "へ", note: "方向" },
          { text: "行きたい", note: "想去" }
        ]
      }
    ],
    comparisons: ["たい说自己的愿望；ほしい常说想要某物。"],
    quizzes: makeQuizzes("tai", "たい", "想做……", "動詞語幹＿", "必须", "正在")
  },
  {
    id: "teiru",
    title: "ている",
    level: "N5",
    meaning: "正在做；状态持续",
    structure: "动词て形 + いる",
    explanation: "既能表示正在进行，也能表示动作结果留下来的状态。",
    examples: [
      {
        japanese: "猫が寝ています。",
        reading: "ねこが ねています。",
        chinese: "猫正在睡觉。",
        notes: [
          { text: "猫", note: "猫" },
          { text: "が", note: "主语" },
          { text: "寝ています", note: "正在睡" }
        ]
      }
    ],
    comparisons: ["ている偏动作或状态持续；てある偏人为准备后的结果。"],
    quizzes: makeQuizzes("teiru", "ている", "正在做；状态持续", "て形＿", "动作对象", "礼貌否定")
  },
  {
    id: "temoii",
    title: "てもいい",
    level: "N5",
    meaning: "可以……；允许……",
    structure: "动词て形 + もいい",
    explanation: "用来询问或说明许可。",
    examples: [
      {
        japanese: "ここで写真を撮ってもいいですか。",
        reading: "ここで しゃしんを とってもいいですか。",
        chinese: "可以在这里拍照吗？",
        notes: [
          { text: "ここ", note: "这里" },
          { text: "写真", note: "照片" },
          { text: "撮ってもいい", note: "可以拍" }
        ]
      }
    ],
    comparisons: ["てもいい表示许可；なければならない表示必须。"],
    quizzes: makeQuizzes("temoii", "てもいい", "可以……；允许……", "て形＿", "想做", "过去")
  },
  {
    id: "nakerebanaranai",
    title: "なければならない",
    level: "N5",
    meaning: "必须……；不得不……",
    structure: "动词ない形去い + ければならない",
    explanation: "表示义务或必须做的事情，日常也常缩成なきゃ。",
    examples: [
      {
        japanese: "宿題をしなければなりません。",
        reading: "しゅくだいを しなければなりません。",
        chinese: "必须做作业。",
        notes: [
          { text: "宿題", note: "作业" },
          { text: "を", note: "动作对象" },
          { text: "しなければなりません", note: "必须做" }
        ]
      }
    ],
    comparisons: ["なければならない表示必须；てもいい表示许可。"],
    quizzes: makeQuizzes(
      "nakereba",
      "なければならない",
      "必须……；不得不……",
      "ない形＿",
      "可以",
      "正在"
    )
  },
  {
    id: "e",
    title: "へ",
    level: "N5",
    meaning: "表示移动方向",
    structure: "地点 + へ + 移动动词",
    explanation: "强调朝某个方向移动，读作 e。",
    examples: [
      {
        japanese: "京都へ行きます。",
        reading: "きょうとへ いきます。",
        chinese: "去京都。",
        notes: [
          { text: "京都", note: "京都" },
          { text: "へ", note: "方向，读作 e" },
          { text: "行きます", note: "去" }
        ]
      }
    ],
    comparisons: ["へ强调方向；に强调到达点。"],
    quizzes: makeQuizzes("e", "へ", "表示移动方向", "場所＿行きます", "动作对象", "所属")
  },
  {
    id: "tearu",
    title: "てある",
    level: "N4",
    meaning: "人为动作后留下的状态",
    structure: "他动词て形 + ある",
    explanation: "表示有人提前做了某事，因此结果现在保持着。",
    examples: [
      {
        japanese: "机の上に本が置いてあります。",
        reading: "つくえのうえに ほんが おいてあります。",
        chinese: "桌上放着书。",
        notes: [
          { text: "置いてあります", note: "有人放好后保持着" },
          { text: "机の上", note: "桌上" }
        ]
      }
    ],
    comparisons: ["てある暗示人为准备；ている只说状态或正在进行。"],
    quizzes: makeQuizzes("tearu", "てある", "人为动作后留下的状态", "て形＿", "想做", "允许")
  },
  {
    id: "sou",
    title: "そう",
    level: "N4",
    meaning: "看起来……；听说……",
    structure: "词干 + そう / 普通形 + そうだ",
    explanation: "根据外观判断，或转述听来的消息。",
    examples: [
      {
        japanese: "雨が降りそうです。",
        reading: "あめが ふりそうです。",
        chinese: "看起来要下雨。",
        notes: [
          { text: "雨", note: "雨" },
          { text: "降りそう", note: "看起来要下" }
        ]
      }
    ],
    comparisons: ["そう偏视觉判断或听说；よう偏比喻推测；らしい偏典型或传闻。"],
    quizzes: makeQuizzes("sou", "そう", "看起来……；听说……", "語幹＿", "必须", "动作地点")
  },
  {
    id: "you",
    title: "よう",
    level: "N4",
    meaning: "像……一样；似乎……",
    structure: "名词 + のよう / 普通形 + よう",
    explanation: "用于比喻、举例或稍委婉的推测。",
    examples: [
      {
        japanese: "夢のようです。",
        reading: "ゆめのようです。",
        chinese: "像梦一样。",
        notes: [
          { text: "夢", note: "梦" },
          { text: "のよう", note: "像……一样" }
        ]
      }
    ],
    comparisons: ["よう常用于比喻；そう更像眼前判断。"],
    quizzes: makeQuizzes("you", "よう", "像……一样；似乎……", "名詞の＿", "过去否定", "许可")
  },
  {
    id: "rashii",
    title: "らしい",
    level: "N4",
    meaning: "好像……；很有……特点",
    structure: "普通形 + らしい",
    explanation: "可表示传闻，也可表示符合某人或某物的典型特征。",
    examples: [
      {
        japanese: "今日は春らしい天気です。",
        reading: "きょうは はるらしい てんきです。",
        chinese: "今天是很有春天气息的天气。",
        notes: [
          { text: "春らしい", note: "有春天特点的" },
          { text: "天気", note: "天气" }
        ]
      }
    ],
    comparisons: ["らしい可表示典型特征；よう更像比喻。"],
    quizzes: makeQuizzes("rashii", "らしい", "好像……；很有……特点", "普通形＿", "动作对象", "想做")
  },
  {
    id: "ba",
    title: "ば",
    level: "N4",
    meaning: "如果……就……",
    structure: "ば形",
    explanation: "表示条件，常用于一般规律或假设。",
    examples: [
      {
        japanese: "安ければ買います。",
        reading: "やすければ かいます。",
        chinese: "如果便宜就买。",
        notes: [
          { text: "安ければ", note: "如果便宜" },
          { text: "買います", note: "买" }
        ]
      }
    ],
    comparisons: ["ば偏一般条件；たら更强调前项发生后。"],
    quizzes: makeQuizzes("ba", "ば", "如果……就……", "条件形＿", "正在", "所属")
  },
  {
    id: "tara",
    title: "たら",
    level: "N4",
    meaning: "如果……；……之后",
    structure: "た形 + ら",
    explanation: "既能表示条件，也常带有先后顺序。",
    examples: [
      {
        japanese: "家に帰ったら、電話します。",
        reading: "いえに かえったら、でんわします。",
        chinese: "回到家后打电话。",
        notes: [
          { text: "帰ったら", note: "回去之后/如果回去" },
          { text: "電話します", note: "打电话" }
        ]
      }
    ],
    comparisons: ["たら很灵活；と更像自然结果。"],
    quizzes: makeQuizzes("tara", "たら", "如果……；……之后", "た形＿", "允许", "方向")
  },
  {
    id: "nara",
    title: "なら",
    level: "N4",
    meaning: "如果说到……；要是……的话",
    structure: "普通形/名词 + なら",
    explanation: "常承接对方提到的话题，再给建议或判断。",
    examples: [
      {
        japanese: "日本語なら、この本がいいです。",
        reading: "にほんごなら、このほんが いいです。",
        chinese: "如果是日语的话，这本书不错。",
        notes: [
          { text: "日本語なら", note: "如果说到日语" },
          { text: "この本", note: "这本书" }
        ]
      }
    ],
    comparisons: ["なら擅长承接话题；ば和たら更像条件。"],
    quizzes: makeQuizzes("nara", "なら", "如果说到……；要是……的话", "名詞＿", "正在", "必须")
  },
  {
    id: "to-condition",
    title: "と",
    level: "N4",
    meaning: "一……就……；自然结果",
    structure: "辞书形 + と",
    explanation: "用于自然规律、机器操作结果、习惯性结果。",
    examples: [
      {
        japanese: "春になると暖かくなります。",
        reading: "はるに なると あたたかくなります。",
        chinese: "一到春天就会变暖。",
        notes: [
          { text: "春になると", note: "一到春天" },
          { text: "暖かくなります", note: "变暖" }
        ]
      }
    ],
    comparisons: ["と偏固定结果；たら可用于一次性的个人计划。"],
    quizzes: makeQuizzes("to-condition", "と", "一……就……；自然结果", "辞書形＿", "所属", "愿望")
  }
];

export const presetComparisons = [
  {
    id: "wa-ga",
    leftId: "wa",
    rightId: "ga",
    title: "は vs が",
    usage: "は标出讨论话题，が标出主语或新信息。",
    nuance: "は像把聚光灯打在话题上；が像指出答案本身。",
    structure: "名词 + は / 名词 + が",
    examples: ["私は学生です。", "誰が来ましたか。田中さんが来ました。"]
  },
  {
    id: "ni-de",
    leftId: "ni",
    rightId: "de",
    title: "に vs で",
    usage: "に常表示点，で常表示动作发生的场。",
    nuance: "に重落点，で重现场。",
    structure: "地点 + に / 地点 + で",
    examples: ["学校にいます。", "学校で勉強します。"]
  },
  {
    id: "e-ni",
    leftId: "e",
    rightId: "ni",
    title: "へ vs に",
    usage: "へ强调方向，に强调到达点。",
    nuance: "へ像朝那边去，に像落到那里。",
    structure: "地点 + へ / 地点 + に",
    examples: ["日本へ行きます。", "日本に着きました。"]
  },
  {
    id: "teiru-tearu",
    leftId: "teiru",
    rightId: "tearu",
    title: "ている vs てある",
    usage: "ている表示持续状态；てある表示人为动作留下的准备状态。",
    nuance: "てある通常暗示有人提前做了。",
    structure: "て形 + いる / て形 + ある",
    examples: ["窓が開いています。", "窓が開けてあります。"]
  },
  {
    id: "sou-you-rashii",
    leftId: "sou",
    rightId: "you",
    title: "そう vs よう vs らしい",
    usage: "そう偏看起来或听说；よう偏比喻或推测；らしい偏典型特征或传闻。",
    nuance: "三者都像“好像”，但信息来源和语气不同。",
    structure: "词干 + そう / 名词 + のよう / 普通形 + らしい",
    examples: ["雨が降りそうです。", "夢のようです。", "彼は学生らしいです。"]
  },
  {
    id: "ba-tara-nara-to",
    leftId: "ba",
    rightId: "tara",
    title: "ば vs たら vs なら vs と",
    usage: "都能表示条件，但ば偏一般条件，たら偏发生后，なら偏承接话题，と偏自然结果。",
    nuance: "选择时先看是不是固定结果、先后顺序、还是接对方话题。",
    structure: "ば形 / た形 + ら / 普通形 + なら / 辞書形 + と",
    examples: ["春になると暖かくなります。", "日本へ行ったら寿司を食べたいです。"]
  }
];
