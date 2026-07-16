export interface BossDialogueOption {
  readonly label: string;
  readonly response: string;
  readonly correct: boolean;
}

export interface BossDialogue {
  readonly opening: string;
  readonly options: readonly [BossDialogueOption, BossDialogueOption];
  readonly victory: string;
}

const DIALOGUES: Readonly<Record<number, BossDialogue>> = {
  5: {
    opening: "我写了十年 if-else，直到第 47 层缩进把我赶出了代码库。你知道我以前做什么吗？",
    options: [
      { label: "程序员？", response: "眼力不错。那就用清晰条件击败我的嵌套迷宫！", correct: true },
      { label: "宝箱管理员？", response: "宝箱哪需要 47 层判断？再猜。", correct: false },
    ],
    victory: "哥布林队长终于承认：提前返回比第 48 层 else 更体面。",
  },
  6: {
    opening: "我的石甲有四格厚。少缩进一格，你的攻击就会打到循环外面！",
    options: [
      { label: "我会用 for 清点每一回合", response: "很好。让我看看你的 range 能不能走到终点。", correct: true },
      { label: "我复制三遍代码", response: "复制粘贴可砍不穿岩石，只会长出重复代码。", correct: false },
    ],
    victory: "岩石巨人裂成四格整齐的代码块，长矛和头盔掉了出来。",
  },
  7: {
    opening: "欢迎进入永不散场的竞技场。我的 while True 从来没有出口！",
    options: [
      { label: "每个循环都要推进并结束", response: "你竟然带了 break 的思想。来倒数吧！", correct: true },
      { label: "那就一直跑", response: "服务器的超时守卫已经在看你了。换个答案。", correct: false },
    ],
    victory: "骷髅将军找到出口，竞技场第一次准时下班。",
  },
  9: {
    opening: "函数的力量只在我的暗影作用域内有效。离开这里，你什么都拿不到。",
    options: [
      { label: "我会用 return 带走结果", response: "作用域拦不住返回值。接受试炼。", correct: true },
      { label: "我把变量全设成 global", response: "公会维护者听见这句话已经拔剑了。", correct: false },
    ],
    victory: "暗影散去，函数把结果完整交回了调用者。",
  },
  10: {
    opening: "重复物品才是收藏的灵魂！你敢整理我的背包，我就把你塞进元组里。",
    options: [
      { label: "保留顺序，只移除重复", response: "什么？你连原背包都不修改？太讲武德了。", correct: true },
      { label: "先用 set 打乱一切", response: "我的收藏顺序！那可是按入手年份排的。", correct: false },
    ],
    victory: "背包魔王的重复藏品被整理完毕，列表之剑显露出来。",
  },
  11: {
    opening: "我是十万条重复数据燃烧成的火元素。列表查询要烧到什么时候？",
    options: [
      { label: "用字典取值，用集合去重", response: "O(1) 的冷风吹过来了。开战！", correct: true },
      { label: "再套十万层循环", response: "好热，但你的电脑风扇更热。", correct: false },
    ],
    victory: "火元素被键值索引熄灭，只留下有序长靴与唯一头盔。",
  },
  12: {
    opening: "你好！！！！勇者......我的标点军团是不是很有气势？？？",
    options: [
      { label: "先 strip，再清理重复标点", response: "别碰我的感叹号仓库……来吧。", correct: true },
      { label: "整段文字全部删除", response: "清洗不是毁灭证据。请保留有效文本。", correct: false },
    ],
    victory: "酒馆终于安静下来，字符串法杖停止疯狂抖动。",
  },
  14: {
    opening: "古代存档有 save.tar.gz、README 和 hero.json。你能辨认它们的最后印记吗？",
    options: [
      { label: "交给 pathlib.Path", response: "标准库的钥匙与石门严丝合缝。", correct: true },
      { label: "每个点都手动猜", response: "多重扩展名正在石门后嘲笑你。", correct: false },
    ],
    victory: "守护者交出 IMPORT 之甲，古代文件恢复了可读路径。",
  },
  15: {
    opening: "我有三个头：报错、崩溃、什么都不告诉你。你准备接哪一个？",
    options: [
      { label: "只捕获预期的除零异常", response: "精准的 except？我的三个头开始意见不合了。", correct: true },
      { label: "except 后什么都不写", response: "吞掉错误只会让它半夜再来找你。", correct: false },
    ],
    victory: "地狱犬的异常被准确处理，TryExcept 护臂落入背包。",
  },
  17: {
    opening: "两千年前姓刘的斩了我太爷爷。今天你用 keyboard 来算家族旧账？",
    options: [
      { label: "我用 dataclass 和类型提示应战", response: "时代确实变了。让我看看你的战斗模型。", correct: true },
      { label: "我先把所有类型都写成 Any", response: "白帝蛇族也没这么随便。重新选择。", correct: false },
    ],
    victory: "白帝之子伏于代码之下。祖宗用剑，你用 print()——时代变了。",
  },
};

export const getBossDialogue = (chapterNumber: number): BossDialogue => {
  const dialogue = DIALOGUES[chapterNumber];
  if (!dialogue) throw new RangeError(`Unknown Boss dialogue: ${chapterNumber}`);
  return dialogue;
};
