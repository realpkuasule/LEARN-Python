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
  readonly dropItemIds?: readonly string[];
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
  options: Pick<Chapter, "bossName" | "titleReward" | "dropItemIds"> & {
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
  dropItemIds: options.dropItemIds,
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
  chapter(2, "第一个 Python 程序", "训练场", "启程之地", "02-安装与第一个程序.md", "第一行 Python", "在右侧「Python 代码」编辑器中使用 print 输出：Hello, Python!", "# 输出你的第一句 Python 咒语\n"),
  chapter(3, "变量与数据类型", "角色祭坛", "启程之地", "03-变量与数据类型.md", "创建勇者名字", "让名字 hero_name 绑定到字符串 刘老三，再输出 hero_name", "hero_name = \"\"\nprint(hero_name)\n", { titleReward: "史莱姆克星" }),
  chapter(4, "运算符与输入输出", "武器店", "启程之地", "04-运算符与输入输出.md", "计算装备总价", "TRUE 之剑 80 金，FALSE 之盾 120 金，输出总价", "sword_price = 80\nshield_price = 120\n# 输出总价\n"),
  chapter(5, "条件判断", "试炼洞穴", "判断峡谷", "05-条件判断.md", "击败条件判断哥布林队长", "定义 battle_result(boss_hp)：boss_hp 小于等于 0 时返回 胜利，否则返回 继续。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def battle_result(boss_hp):\n    # 使用 if/else 返回战斗结果\n    pass\n", {
    bossName: "条件判断哥布林队长",
    titleReward: "条件判断克星",
    testCount: 3,
  }),
  chapter(6, "for 循环", "宝藏库", "循环荒原", "06-for循环.md", "击败缩进岩石巨人", "定义 turn_sequence(total_turns)，使用 for 和 range 返回从 1 到 total_turns 的整数列表。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def turn_sequence(total_turns):\n    turns = []\n    # 使用 for 和 range 把回合编号加入 turns\n    return turns\n", { bossName: "缩进岩石巨人", dropItemIds: ["for-spear", "indentation-helmet"], testCount: 3 }),
  chapter(7, "while 循环", "竞技场", "循环荒原", "07-while循环.md", "击败循环骷髅将军", "定义 countdown(start)，使用 while 返回从 start 递减到 1 的整数列表；start 为 0 时返回空列表。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def countdown(start):\n    turns = []\n    # 使用有出口的 while 完成倒计时\n    return turns\n", { bossName: "循环骷髅将军", titleReward: "循环克星", dropItemIds: ["while-charm"], testCount: 3 }),
  chapter(8, "函数定义与参数", "魔法学院", "函数高地", "08-函数定义与参数.md", "封装攻击技能", "定义 attack(atk, defense)，返回至少为 1 的伤害，并输出 attack(15, 5)", "def attack(atk, defense):\n    pass\n\nprint(attack(15, 5))\n"),
  chapter(9, "返回值与作用域", "公会总部", "函数高地", "09-返回值与作用域.md", "击败函数暗影骑士", "定义 battle_result(hp)：hp 大于 0 时返回 存活，否则返回 阵亡。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def battle_result(hp):\n    # 根据 hp 返回战斗结果\n    pass\n", { bossName: "函数暗影骑士", titleReward: "函数克星", testCount: 3 }),
  chapter(10, "列表与元组", "大仓库", "数据群岛", "10-列表与元组.md", "击败背包魔王", "定义 organize_inventory(items)，返回按首次出现顺序去重的新列表，不修改传入列表。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def organize_inventory(items):\n    organized = []\n    # 遍历 items，把首次出现的物品加入 organized\n    return organized\n", { bossName: "背包魔王", dropItemIds: ["list-sword"], testCount: 3 }),
  chapter(11, "字典与集合", "智慧神殿", "数据群岛", "11-字典与集合.md", "击败数据结构火元素", "定义 hero_summary(hero)，从字典读取 name 和 hp，返回格式为 名字 空格 HP 的字符串。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def hero_summary(hero):\n    # 使用字典键读取名字和 HP\n    pass\n", { bossName: "数据结构火元素", titleReward: "数据结构大师", dropItemIds: ["ordered-dict-boots", "unique-set-helmet"], testCount: 3 }),
  chapter(12, "字符串处理", "吟游诗人酒馆", "文本海岸", "12-字符串处理.md", "击败字符串妖精", "定义 clean_dialog(dialog)：去掉首尾空白、把连续中文感叹号合并为一个，并把每组 ... 替换为中文句号。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def clean_dialog(dialog):\n    # 使用 strip 和 replace 修复对话\n    pass\n", { bossName: "字符串妖精", dropItemIds: ["string-staff"], testCount: 3 }),
  chapter(13, "文本清洗与编码", "古代图书馆", "文本海岸", "13-文本清洗与编码.md", "清洗任务标记", "移除文本中的 <b> 和 </b> 标签，输出：击败恶龙", "text = \"<b>击败恶龙</b>\"\n# 清洗并输出\n"),
  chapter(14, "模块与文件操作", "大教堂", "模块山脉", "14-模块与文件操作.md", "击败文件操作古代守护者", "定义 file_suffix(filename)，使用 pathlib.Path 返回最后一个文件扩展名；没有扩展名时返回空字符串。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "from pathlib import Path\n\ndef file_suffix(filename):\n    # 返回 Path(filename) 的文件扩展名\n    pass\n", { bossName: "文件操作古代守护者", titleReward: "文件操作大师", dropItemIds: ["import-armor"], testCount: 3 }),
  chapter(15, "错误处理", "深渊裂隙", "模块山脉", "15-错误处理.md", "击败错误处理地狱犬", "定义 safe_divide(a, b)，正常时返回 a / b；除数为 0 时捕获 ZeroDivisionError 并返回 魔法失效。系统会运行 3 组隐藏测试，请不要调用函数或 print。", "def safe_divide(a, b):\n    # 使用 try/except 安全完成除法\n    pass\n", { bossName: "错误处理地狱犬", titleReward: "错误处理大师", dropItemIds: ["try-except-bracers"], testCount: 3 }),
  chapter(16, "推导式、生成器与 Lambda", "炼金工房", "龙巢边境", "16-推导式生成器Lambda.md", "筛选高价值战利品", "使用列表推导式筛选大于 100 的数字并输出：[500, 800]", "values = [50, 500, 30, 800]\n# 使用列表推导式\n"),
  chapter(17, "装饰器与类型提示", "恶龙之巢", "龙巢边境", "17-装饰器与类型提示.md", "击败白帝之子恶龙", "用 @dataclass 定义 Monster(name: str, hp: int, defense: int)，再定义 battle_turn(monster, attack)：伤害至少为 1、HP 不低于 0，更新 HP 后返回 名字 空格 HP。系统会运行 3 组隐藏测试，请不要创建怪物或 print。", "from dataclasses import dataclass\n\n# 为 Monster 添加 @dataclass 和三个带类型提示的字段\nclass Monster:\n    pass\n\ndef battle_turn(monster: Monster, attack: int) -> str:\n    # 计算伤害、更新 HP 并返回战报\n    pass\n", { bossName: "白帝之子恶龙", titleReward: "赤帝之子", dropItemIds: ["second-run-proof"], testCount: 3 }),
];

export const getChapter = (chapterNumber: number): Chapter | undefined => (
  CHAPTERS.find(({ number }) => number === chapterNumber)
);

export const getExercise = (exerciseId: string): Exercise | undefined => (
  CHAPTERS.find(({ exercise }) => exercise.id === exerciseId)?.exercise
);
