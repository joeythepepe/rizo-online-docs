/**
 * Seed 睿卓课程培训 products: 3 stages × 3 subjects.
 *   bun scripts/seed-training-products.mjs
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../content/products");

const stages = {
  primary: {
    label: "小学",
    exam: "小升初与校内测评",
    categoryLabel: "小学学科培训",
    cycle: "2026 学年",
    subjects: ["math", "english", "chinese"],
  },
  junior: {
    label: "初中",
    exam: "中考",
    categoryLabel: "初中学科培训",
    cycle: "2026 中考备考",
    subjects: ["math", "english", "chinese"],
  },
  senior: {
    label: "高中",
    exam: "高考",
    categoryLabel: "高中学科培训",
    cycle: "2026 高考备考",
    subjects: ["math", "english", "chinese"],
  },
  dse: {
    label: "DSE",
    exam: "香港中学文凭考试（DSE）",
    categoryLabel: "DSE学科培训",
    cycle: "2026 DSE 备考",
    /** 目前支持：数学、数学延伸 M2、英语、物理、化学 */
    subjects: ["math", "math2", "english", "physics", "chemistry"],
  },
};

const subjects = {
  math: "数学",
  math2: "数学延伸M2",
  english: "英语",
  chinese: "语文",
  physics: "物理",
  chemistry: "化学",
};

/** @type {Record<string, Record<string, object>>} */
const contentByKey = {
  // ——— 小学 ———
  "primary-math": {
    name: "小学数学培训",
    tagline: "算理·图形·应用题·思维拓展",
    summary: "小学中高年级学生，目标夯实校内成绩并衔接小升初数学要求。",
    segments: ["3–6年级", "需夯实基础", "小升初衔接"],
    formats: {
      group: ["同学互学有氛围", "统一进度好跟进", "费用更友好"],
      oneOnOne: ["按薄弱点定制", "错题精讲精练", "节奏完全贴合"],
    },
    examAbility: [
      { id: "r1", label: "数感与四则运算准确流畅" },
      { id: "r2", label: "分数小数百分数灵活互化" },
      { id: "r3", label: "几何图形周长面积体积模型" },
      { id: "r4", label: "应用题审题与等量关系建模" },
      { id: "r5", label: "简单统计与规律探究表达" },
    ],
    training: {
      intro: "按小升初与校内测评高频能力设计模块，先会再熟再拓展。",
      items: [
        { id: "d1", label: "整数分数小数混合运算提速" },
        { id: "d2", label: "行程工程利润类应用题模板" },
        { id: "d3", label: "平面几何与立体图形核心量" },
        { id: "d4", label: "比与比例、浓度与百分数" },
        { id: "d5", label: "抽屉原理、容斥等高阶思维" },
        { id: "d6", label: "周测错题本与家长反馈" },
      ],
    },
    trust: ["考点透明可核对", "小组课/一对一可选", "阶段测评可追踪"],
  },
  "primary-english": {
    name: "小学英语培训",
    tagline: "词汇·拼读·听说·阅读习惯",
    summary: "小学中高年级学生，目标提升听说读写与小升初英语衔接能力。",
    segments: ["3–6年级", "听说薄弱", "阅读起步"],
    formats: {
      group: ["情境对话练开口", "同伴互助记单词", "班级节奏稳定"],
      oneOnOne: ["发音纠音更细", "阅读分级定制", "作业一对一盯"],
    },
    examAbility: [
      { id: "r1", label: "核心词汇与拼读规则掌握" },
      { id: "r2", label: "课堂听说应答清晰自然" },
      { id: "r3", label: "基础语法句型准确运用" },
      { id: "r4", label: "短文阅读抓主旨与细节" },
      { id: "r5", label: "简单书面表达与书写规范" },
    ],
    training: {
      intro: "围绕小升初常见英语能力：听得懂、说得出、读得进、写得对。",
      items: [
        { id: "d1", label: "自然拼读与高频词巩固" },
        { id: "d2", label: "情景听说与语音语调" },
        { id: "d3", label: "时态句型与基础语法网" },
        { id: "d4", label: "分级阅读与信息定位" },
        { id: "d5", label: "看图写话与小短文结构" },
        { id: "d6", label: "听写打卡与阶段口语测" },
      ],
    },
    trust: ["听说读写全覆盖", "可测可复盘", "与校内进度同步"],
  },
  "primary-chinese": {
    name: "小学语文培训",
    tagline: "识字·阅读·作文·古诗文",
    summary: "小学中高年级学生，目标提升阅读理解与习作表达，衔接小升初语文。",
    segments: ["3–6年级", "阅读偏弱", "作文吃力"],
    formats: {
      group: ["共读讨论开思路", "范文互评有对照", "氛围带动表达"],
      oneOnOne: ["作文面批更细", "阅读方法定制", "薄弱点逐项补"],
    },
    examAbility: [
      { id: "r1", label: "识字写字与词语准确运用" },
      { id: "r2", label: "阅读理解主旨与关键句" },
      { id: "r3", label: "记叙文结构与细节描写" },
      { id: "r4", label: "古诗文朗读背诵与大意" },
      { id: "r5", label: "口语交际条理清晰" },
    ],
    training: {
      intro: "以阅读方法与习作框架为核心，让孩子知道「读什么、写什么、怎么写」。",
      items: [
        { id: "d1", label: "课内精读与信息提取训练" },
        { id: "d2", label: "记叙文六要素与段落展开" },
        { id: "d3", label: "好词好句积累与仿写" },
        { id: "d4", label: "古诗古文诵读与释义" },
        { id: "d5", label: "看图/命题作文结构模板" },
        { id: "d6", label: "错字本与阶段阅读测评" },
      ],
    },
    trust: ["方法可迁移", "作文可面批", "与校内单元同步"],
  },

  // ——— 初中 ———
  "junior-math": {
    name: "初中数学培训",
    tagline: "中考核心考点体系化精讲",
    summary: "初中学生及家长，目标中考数学提分：会做、做对、做快。",
    segments: ["初一至初三", "中考冲刺", "计算/几何薄弱"],
    formats: {
      group: ["同步考点串讲", "同层同学可对照", "性价比更高"],
      oneOnOne: ["专攻失分模块", "解题路径定制", "考前压轴陪练"],
    },
    examAbility: [
      { id: "r1", label: "实数运算与整式分式方程" },
      { id: "r2", label: "函数图象与性质综合" },
      { id: "r3", label: "三角形圆与相似全等推理" },
      { id: "r4", label: "统计概率与数据分析" },
      { id: "r5", label: "综合压轴建模与规范书写" },
    ],
    training: {
      intro: "按中考数学高频考点模块推进，每模块：概念→例题→变式→周测。",
      items: [
        { id: "d1", label: "一次二次函数与图象综合" },
        { id: "d2", label: "相似全等圆的综合证明" },
        { id: "d3", label: "方程不等式与应用建模" },
        { id: "d4", label: "锐角三角比与测量应用" },
        { id: "d5", label: "统计概率与实际问题" },
        { id: "d6", label: "压轴题分层突破与限时训" },
      ],
    },
    trust: ["考点清单可查", "错题闭环复盘", "中考题型对齐"],
  },
  "junior-english": {
    name: "初中英语培训",
    tagline: "中考听说读写分项突破",
    summary: "初中学生，目标中考英语稳分提分：词汇语法扎实、阅读写作过关。",
    segments: ["初一至初三", "词汇薄弱", "写作成绩低"],
    formats: {
      group: ["听说互动更真实", "作文互评找差距", "统一模考节奏"],
      oneOnOne: ["语法漏洞定点补", "作文逐句改", "听力精听陪练"],
    },
    examAbility: [
      { id: "r1", label: "课标核心词汇与词性转换" },
      { id: "r2", label: "时态语态从句等语法网" },
      { id: "r3", label: "阅读细节推断与主旨概括" },
      { id: "r4", label: "听力信息捕捉与速记" },
      { id: "r5", label: "中考作文结构与得分句" },
    ],
    training: {
      intro: "对标中考英语卷面结构，分项训练并合成完整应试能力。",
      items: [
        { id: "d1", label: "高频词组与词性变形过关" },
        { id: "d2", label: "语法填空/改错专项网" },
        { id: "d3", label: "阅读四选一与任务型阅读" },
        { id: "d4", label: "听力场景词与速记符号" },
        { id: "d5", label: "中考作文模板与升格改" },
        { id: "d6", label: "套卷限时与错题归因" },
      ],
    },
    trust: ["分项可量化", "作文可升格", "对齐本地中考"],
  },
  "junior-chinese": {
    name: "初中语文培训",
    tagline: "中考阅读与作文得分方法",
    summary: "初中学生，目标中考语文：文言文稳、现代文会答、作文有框架。",
    segments: ["初一至初三", "阅读失分多", "作文缺结构"],
    formats: {
      group: ["范文共评开眼界", "文言共译有节奏", "答题规范统一"],
      oneOnOne: ["答题术语定制练", "作文全程面批", "薄弱文体专训"],
    },
    examAbility: [
      { id: "r1", label: "课内文言实词虚词与翻译" },
      { id: "r2", label: "现代文信息筛选与鉴赏" },
      { id: "r3", label: "名著与古诗文积累运用" },
      { id: "r4", label: "中考作文立意结构与语言" },
      { id: "r5", label: "规范答题术语与踩分点" },
    ],
    training: {
      intro: "把「会读会写」拆成可训练的得分动作，对标中考题型。",
      items: [
        { id: "d1", label: "文言实词虚词与句式翻译" },
        { id: "d2", label: "现代文阅读答题术语库" },
        { id: "d3", label: "古诗文默写与理解性默写" },
        { id: "d4", label: "记叙议论作文结构升格" },
        { id: "d5", label: "名著考点提纲与运用" },
        { id: "d6", label: "中考模拟与踩分复盘" },
      ],
    },
    trust: ["答题有术语", "作文有框架", "默写可过关"],
  },

  // ——— 高中 ———
  "senior-math": {
    name: "高中数学培训",
    tagline: "高考核心考点·题型与思想",
    summary: "高中学生，目标高考数学：主干知识体系化，中高档题有路径。",
    segments: ["高一至高三", "函数薄弱", "压轴难突破"],
    formats: {
      group: ["体系串讲效率高", "同卷讲评有对照", "适合稳态提分"],
      oneOnOne: ["知识漏洞扫描", "压轴思路陪练", "考前个性化清单"],
    },
    examAbility: [
      { id: "r1", label: "函数导数与不等式综合" },
      { id: "r2", label: "三角函数与平面向量" },
      { id: "r3", label: "立体几何与空间想象" },
      { id: "r4", label: "解析几何运算与设问" },
      { id: "r5", label: "概率统计与数列综合" },
    ],
    training: {
      intro: "按高考主干模块构建「考点—题型—思想」三层清单，强调通法与运算。",
      items: [
        { id: "d1", label: "函数导数极值零点与不等式" },
        { id: "d2", label: "三角恒等变换与解三角形" },
        { id: "d3", label: "立体几何证明与空间角" },
        { id: "d4", label: "圆锥曲线定义与联立运算" },
        { id: "d5", label: "数列通项求和与综合题" },
        { id: "d6", label: "概率统计与选填提速策略" },
      ],
    },
    trust: ["通法优先", "运算可过关", "高考真题对齐"],
  },
  "senior-english": {
    name: "高中英语培训",
    tagline: "高考阅读完形写作系统提分",
    summary: "高中学生，目标高考英语：词汇量上台阶，阅读速度与写作得分提升。",
    segments: ["高一至高三", "阅读慢", "写作模板僵"],
    formats: {
      group: ["阅读方法共练", "写作互评对照", "套卷讲评高效"],
      oneOnOne: ["词汇漏洞清扫", "长难句精析", "作文个性化升格"],
    },
    examAbility: [
      { id: "r1", label: "高考核心词汇与熟词生义" },
      { id: "r2", label: "长难句分析与语篇逻辑" },
      { id: "r3", label: "阅读七选五与细节推断" },
      { id: "r4", label: "完形逻辑与词汇辨析" },
      { id: "r5", label: "应用文/读后续写得分点" },
    ],
    training: {
      intro: "按高考试卷板块训练：词→句→篇→写，强调可迁移方法而非死背。",
      items: [
        { id: "d1", label: "高考词表与熟词生义" },
        { id: "d2", label: "长难句拆解与语法填空" },
        { id: "d3", label: "阅读理解与七选五策略" },
        { id: "d4", label: "完形填空逻辑链训练" },
        { id: "d5", label: "应用文框架与读后续写" },
        { id: "d6", label: "限时套卷与错题归因" },
      ],
    },
    trust: ["方法可迁移", "写作可升格", "题型全覆盖"],
  },
  "senior-chinese": {
    name: "高中语文培训",
    tagline: "高考现代文文言与作文升格",
    summary: "高中学生，目标高考语文：文言稳、现代文会答、作文有深度与结构。",
    segments: ["高一至高三", "文言吃力", "作文缺思辨"],
    formats: {
      group: ["文言共译节奏好", "作文议题讨论深", "答题规范统一"],
      oneOnOne: ["文言实词定点补", "作文立意面批", "主观题术语精练"],
    },
    examAbility: [
      { id: "r1", label: "文言实词虚词与翻译踩分" },
      { id: "r2", label: "古诗词鉴赏术语与意象" },
      { id: "r3", label: "现代文信息与观点分析" },
      { id: "r4", label: "作文思辨立意与论证结构" },
      { id: "r5", label: "语用题规范与快速得分" },
    ],
    training: {
      intro: "把高考语文主观题拆成「读懂—术语—踩分」三步，作文强调思辨与结构。",
      items: [
        { id: "d1", label: "文言实词虚词与翻译踩分" },
        { id: "d2", label: "古诗鉴赏意象与手法库" },
        { id: "d3", label: "现代文阅读术语与答题" },
        { id: "d4", label: "议论文思辨结构与素材" },
        { id: "d5", label: "语用与默写过关清单" },
        { id: "d6", label: "高考模拟与踩分复盘" },
      ],
    },
    trust: ["术语可背可练", "作文可升格", "踩分路径清晰"],
  },

  // ——— DSE ———
  "dse-math": {
    name: "DSE数学培训",
    tagline: "Compulsory 核心题型与策略",
    summary: "DSE 考生，目标数学必修稳分冲 5**：概念扎实、运算过关、卷面策略清晰。",
    segments: ["中四至中六", "DSE 数学", "计算/综合薄弱"],
    formats: {
      group: ["卷面讲评效率高", "同层进度好对照", "模考节奏统一"],
      oneOnOne: ["失分点定向清", "压轴思路陪练", "考前个性化清单"],
    },
    examAbility: [
      { id: "r1", label: "数与代数运算准确流畅" },
      { id: "r2", label: "函数图像与方程综合" },
      { id: "r3", label: "几何测量与三角应用" },
      { id: "r4", label: "统计概率解读与计算" },
      { id: "r5", label: "长题分步得分与时间管理" },
    ],
    training: {
      intro: "按 DSE Mathematics Compulsory Part 主干模块推进：通法优先，再练限时。",
      items: [
        { id: "d1", label: "二次函数与方程不等式" },
        { id: "d2", label: "指数对数与变化率" },
        { id: "d3", label: "三角比与二维测量" },
        { id: "d4", label: "圆直线与几何综合" },
        { id: "d5", label: "统计概率与数据解读" },
        { id: "d6", label: "Paper 限时与分步得分" },
      ],
    },
    trust: ["对标 DSE 卷面", "通法可迁移", "小组/一对一可选"],
  },
  "dse-math2": {
    name: "DSE数学M2",
    tagline: "Calculus 与代数延伸精讲",
    summary: "选修数学延伸单元二（M2）的 DSE 考生，目标微积分与代数综合冲高分。",
    segments: ["中五中六", "选修 M2", "微积分入门难"],
    formats: {
      group: ["延伸题共练", "证明书写规范", "进度同频"],
      oneOnOne: ["微积分漏洞补", "证明逐步陪写", "难题拆解定制"],
    },
    examAbility: [
      { id: "r1", label: "极限连续与求导基本功" },
      { id: "r2", label: "导数应用与最值问题" },
      { id: "r3", label: "不定积分与定积分应用" },
      { id: "r4", label: "矩阵与代数延伸运算" },
      { id: "r5", label: "证明题逻辑与规范书写" },
    ],
    training: {
      intro: "对标 M2 考纲：微积分主线 + 代数延伸，强调定义理解与证明规范。",
      items: [
        { id: "d1", label: "极限连续与求导法则" },
        { id: "d2", label: "导数应用与曲线性质" },
        { id: "d3", label: "积分技巧与面积体积" },
        { id: "d4", label: "矩阵变换与代数综合" },
        { id: "d5", label: "证明题结构与踩分点" },
        { id: "d6", label: "M2 套卷限时与复盘" },
      ],
    },
    trust: ["M2 考纲对齐", "证明可面批", "难点可拆解"],
  },
  "dse-english": {
    name: "DSE英语培训",
    tagline: "Reading Writing Listening 系统",
    summary: "DSE 英语考生，目标阅读速度、写作结构、听力策略与口语表达综合提升。",
    segments: ["中四至中六", "DSE 英语", "读写薄弱"],
    formats: {
      group: ["听说互动真实", "作文互评对照", "套卷讲评高效"],
      oneOnOne: ["写作逐段升格", "阅读策略定制", "口语模拟陪练"],
    },
    examAbility: [
      { id: "r1", label: "学术词汇与语篇衔接" },
      { id: "r2", label: "阅读细节推断与综合" },
      { id: "r3", label: "写作体裁结构与论证" },
      { id: "r4", label: "听力笔记与信息整合" },
      { id: "r5", label: "口语互动与表达连贯" },
    ],
    training: {
      intro: "按 DSE English 四卷能力拆分训练，强调可迁移策略而非死背范文。",
      items: [
        { id: "d1", label: "学术词汇与搭配网络" },
        { id: "d2", label: "Reading 题型与时间分配" },
        { id: "d3", label: "Writing 体裁框架与升格" },
        { id: "d4", label: "Listening 笔记符号训练" },
        { id: "d5", label: "Speaking 互动与论证" },
        { id: "d6", label: "全卷模考与错题归因" },
      ],
    },
    trust: ["四卷全覆盖", "写作可升格", "策略可迁移"],
  },
  "dse-physics": {
    name: "DSE物理培训",
    tagline: "力学电学波动热学核心",
    summary: "DSE 物理考生，目标概念模型清晰、计算规范、实验与长题得分稳定。",
    segments: ["中四至中六", "DSE 物理", "计算/实验弱"],
    formats: {
      group: ["模型串讲高效", "实验题共练", "同层对照快"],
      oneOnOne: ["概念漏洞扫描", "计算步骤陪练", "长题得分定制"],
    },
    examAbility: [
      { id: "r1", label: "力学运动与能量守恒" },
      { id: "r2", label: "电场电路与电磁基础" },
      { id: "r3", label: "波动光学与热学模型" },
      { id: "r4", label: "实验设计与数据处理" },
      { id: "r5", label: "长题分步推理与单位" },
    ],
    training: {
      intro: "按 DSE Physics 主干章节构建模型：概念图 → 公式选用 → 实验与综合题。",
      items: [
        { id: "d1", label: "运动学与牛顿定律综合" },
        { id: "d2", label: "功能量与动量守恒" },
        { id: "d3", label: "电路电磁与场的图像" },
        { id: "d4", label: "波动光学与热学核心" },
        { id: "d5", label: "实验设计与误差分析" },
        { id: "d6", label: "长题限时与单位规范" },
      ],
    },
    trust: ["模型优先", "实验可练", "卷面可规范"],
  },
  "dse-chemistry": {
    name: "DSE化学培训",
    tagline: "结构反应计算与实验",
    summary: "DSE 化学考生，目标微观结构理解、反应与计算过关、实验题稳定得分。",
    segments: ["中四至中六", "DSE 化学", "计算/方程式弱"],
    formats: {
      group: ["方程式共练", "实验题对照", "进度统一"],
      oneOnOne: ["计算漏洞定点补", "有机反应链梳理", "实验题精讲"],
    },
    examAbility: [
      { id: "r1", label: "原子结构与化学键" },
      { id: "r2", label: "计量与氧化还原计算" },
      { id: "r3", label: "酸减平衡与速率平衡" },
      { id: "r4", label: "有机官能团与反应" },
      { id: "r5", label: "实验操作与现象解释" },
    ],
    training: {
      intro: "对标 DSE Chemistry：结构 → 反应 → 计算 → 实验，强调方程式与计量规范。",
      items: [
        { id: "d1", label: "原子分子与化学键模型" },
        { id: "d2", label: "计量学与氧化还原计算" },
        { id: "d3", label: "酸减平衡与反应速率" },
        { id: "d4", label: "有机官能团与转化链" },
        { id: "d5", label: "实验现象与误差分析" },
        { id: "d6", label: "套卷限时与方程式过关" },
      ],
    },
    trust: ["计算可过关", "实验可拆解", "考纲章节对齐"],
  },
};

function buildProduct(stageId, subjectId) {
  const stage = stages[stageId];
  const subjectLabel = subjects[subjectId];
  const key = `${stageId}-${subjectId}`;
  const c = contentByKey[key];
  if (!c) throw new Error(`Missing content for ${key}`);

  return {
    templateId: "a4-service-onepager-v1",
    locale: "zh-CN",
    meta: {
      documentTitle: `${c.name}-课程说明`,
      version: "2026.07",
      cycleLabel: stage.cycle,
      priceBand: "面议",
      confidential: false,
      disclaimer:
        "本材料为课程培训说明，用于帮助家长了解学习内容与授课形式；不承诺具体提分幅度，最终学习效果因人而异。",
    },
    product: {
      name: c.name,
      categoryLabel: stage.categoryLabel,
      tagline: c.tagline,
      catalog: "training",
      trainingStage: stageId,
      trainingSubject: subjectId,
      prosLabel: "小组课",
      consLabel: "一对一",
      pros: c.formats.group,
      cons: c.formats.oneOnOne,
    },
    targetCustomer: {
      title: "适合学员",
      summary: c.summary,
      segments: c.segments,
    },
    deliverables: {
      title: "培训内容·核心考点",
      intro: c.training.intro,
      items: c.training.items,
    },
    requirements: {
      title: "阶段能力要求",
      intro: `对标${stage.exam}对${subjectLabel}的能力期待；培训将围绕下列能力逐项打磨。`,
      items: c.examAbility.map((item) => ({ ...item, mandatory: true })),
    },
    highlights: {
      title: "为什么选睿卓",
      items: c.trust,
    },
    layout: {
      variant: "split",
      showHighlights: true,
      showQr: true,
      density: "normal",
      softPanelOn: "none",
    },
  };
}

let n = 0;
for (const [stageId, stage] of Object.entries(stages)) {
  for (const subjectId of stage.subjects) {
    const id = `train-${stageId}-${subjectId}`;
    const product = buildProduct(stageId, subjectId);
    const path = join(OUT, `${id}.json`);
    writeFileSync(path, `${JSON.stringify(product, null, 2)}\n`, "utf8");
    console.log("wrote", id);
    n++;
  }
}
console.log(`seeded ${n} training products`);
