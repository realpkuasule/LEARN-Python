export interface Exercise {
  readonly id: string;
  readonly chapterNumber: number;
  readonly title: string;
  readonly instructions: string;
  readonly starterCode: string;
  readonly testCount: number;
}

export interface Chapter {
  readonly number: number;
  readonly title: string;
  readonly location: string;
  readonly region: string;
  readonly sourcePath: string;
  readonly isBoss: boolean;
  readonly bossName?: string;
  readonly rewardExp: number;
  readonly rewardCoins: number;
  readonly titleReward?: string;
  readonly exercise: Exercise;
}

const chapter = (
  number: number,
  title: string,
  location: string,
  region: string,
  sourceFile: string,
  exerciseTitle: string,
  instructions: string,
  starterCode: string,
  options: Pick<Chapter, "bossName" | "titleReward"> & {
    readonly testCount?: number;
  } = {},
): Chapter => ({
  number,
  title,
  location,
  region,
  sourcePath: `docs/Python-DragonQuest/${sourceFile}`,
  isBoss: Boolean(options.bossName),
  bossName: options.bossName,
  rewardExp: number * 100,
  rewardCoins: number * 50,
  titleReward: options.titleReward,
  exercise: {
    id: `chapter-${String(number).padStart(2, "0")}-final`,
    chapterNumber: number,
    title: exerciseTitle,
    instructions,
    starterCode,
    testCount: options.testCount ?? 1,
  },
});

export const CHAPTERS: readonly Chapter[] = [
  chapter(1, "编程为什么重要", "冒险者公会", "启程之地", "01-编程为什么重要.md", "写下冒险宣言", "使用 print 输出：我准备好了", "# 用 print() 写下你的冒险宣言\n", { titleReward: "初出茅庐" }),
  chapter(2, "安装与第一个程序", "训练场", "启程之地", "02-安装与第一个程序.md", "第一行 Python", "使用 print 输出：Hello, Python!", "# 输出你的第一句 Python 咒语\n"),
  chapter(3, "变量与数据类型", "角色祭坛", "启程之地", "03-变量与数据类型.md", "创建勇者名字", "把 刘老三 保存到变量 hero_name，再输出变量", "hero_name = \"\"\nprint(hero_name)\n", { titleReward: "史莱姆克星" }),
  chapter(4, "运算符与输入输出", "武器店", "启程之地", "04-运算符与输入输出.md", "计算装备总价", "TRUE 之剑 80 金，FALSE 之盾 120 金，输出总价", "sword_price = 80\nshield_price = 120\n# 输出总价\n"),
  chapter(5, "条件判断", "试炼洞穴", "判断峡谷", "05-条件判断.md", "击败条件判断哥布林队长", "定义 battle_result(boss_hp)：boss_hp 小于等于 0 时返回 胜利，否则返回 继续。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def battle_result(boss_hp):\n    # 使用 if/else 返回战斗结果\n    pass\n", {
    bossName: "条件判断哥布林队长",
    titleReward: "条件判断克星",
    testCount: 3,
  }),
  chapter(6, "for 循环", "宝藏库", "循环荒原", "06-for循环.md", "清点三个回合", "使用 for 循环依次输出 1、2、3，每个数字一行", "# 使用 range() 完成循环\n", { bossName: "缩进岩石巨人" }),
  chapter(7, "while 循环", "竞技场", "循环荒原", "07-while循环.md", "安全结束循环", "使用 while 循环依次输出 1、2、3，然后正常结束", "turn = 1\n# 写出有出口的 while 循环\n", { bossName: "循环骷髅将军", titleReward: "循环克星" }),
  chapter(8, "函数定义与参数", "魔法学院", "函数高地", "08-函数定义与参数.md", "封装攻击技能", "定义 attack(atk, defense)，返回至少为 1 的伤害，并输出 attack(15, 5)", "def attack(atk, defense):\n    pass\n\nprint(attack(15, 5))\n"),
  chapter(9, "返回值与作用域", "公会总部", "函数高地", "09-返回值与作用域.md", "回报战斗结果", "定义 battle_result(hp)，hp 大于 0 返回 存活，否则返回 阵亡；输出 hp=20 的结果", "def battle_result(hp):\n    pass\n\nprint(battle_result(20))\n", { bossName: "函数暗影骑士", titleReward: "函数克星" }),
  chapter(10, "列表与元组", "大仓库", "数据群岛", "10-列表与元组.md", "整理背包", "把列表中的 木剑、回复药、龙鳞 按中文顺序排序并逐行输出", "inventory = [\"木剑\", \"回复药\", \"龙鳞\"]\n# 排序后逐行输出\n", { bossName: "背包魔王" }),
  chapter(11, "字典与集合", "智慧神殿", "数据群岛", "11-字典与集合.md", "读取角色属性", "从 hero 字典中读取并输出名字和 HP，中间用一个空格", "hero = {\"name\": \"刘老三\", \"hp\": 100}\n# 输出：刘老三 100\n", { bossName: "数据结构火元素", titleReward: "数据结构大师" }),
  chapter(12, "字符串处理", "吟游诗人酒馆", "文本海岸", "12-字符串处理.md", "清洗勇者名字", "去掉字符串两端空格并输出大写的 PYTHON HERO", "name = \"  python hero  \"\n# 清洗并输出\n", { bossName: "字符串妖精" }),
  chapter(13, "文本清洗与编码", "古代图书馆", "文本海岸", "13-文本清洗与编码.md", "清洗任务标记", "移除文本中的 <b> 和 </b> 标签，输出：击败恶龙", "text = \"<b>击败恶龙</b>\"\n# 清洗并输出\n"),
  chapter(14, "模块与文件操作", "大教堂", "模块山脉", "14-模块与文件操作.md", "使用标准库", "导入 pathlib，创建 Path('save.json') 并输出它的 suffix", "# 导入 pathlib 并输出文件后缀\n", { bossName: "文件操作古代守护者", titleReward: "文件操作大师" }),
  chapter(15, "错误处理", "深渊裂隙", "模块山脉", "15-错误处理.md", "接住除零错误", "使用 try/except 捕获除零错误并输出：魔法失效", "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    pass\n", { bossName: "错误处理地狱犬", titleReward: "错误处理大师" }),
  chapter(16, "推导式、生成器与 Lambda", "炼金工房", "龙巢边境", "16-推导式生成器Lambda.md", "筛选高价值战利品", "使用列表推导式筛选大于 100 的数字并输出：[500, 800]", "values = [50, 500, 30, 800]\n# 使用列表推导式\n"),
  chapter(17, "装饰器与类型提示", "恶龙之巢", "龙巢边境", "17-装饰器与类型提示.md", "创建怪物类型", "使用 @dataclass 定义 Monster(name: str, hp: int)，创建恶龙并输出：恶龙 5000", "from dataclasses import dataclass\n\n# 定义 Monster 并输出恶龙属性\n", { bossName: "白帝之子恶龙", titleReward: "赤帝之子" }),
];

export const getChapter = (chapterNumber: number): Chapter | undefined => (
  CHAPTERS.find(({ number }) => number === chapterNumber)
);

export const getExercise = (exerciseId: string): Exercise | undefined => (
  CHAPTERS.find(({ exercise }) => exercise.id === exerciseId)?.exercise
);
