# 讲 Python（全知识点·勇者斗恶龙版）

> 这本书从头到尾只做一件事——用 Python 做一个文字 RPG 游戏。
> 你创建勇者、探索世界、遭遇怪物、战斗升级、存档读档。
> 学完 17 课，你收获的不只是一个能跑的游戏，更是「用编程思维看世界」的能力。
> Python 只是举例，换成 JavaScript/Go/Java，道理完全一样。

---

## 开篇：勇者，你的冒险开始了

国王发布了悬赏令：恶龙盘踞在北方山脉，王国需要勇者。

你走到王宫门口。卫兵拦住你：「想接任务？先在冒险者公会登记。」

登记处的老头递给你一张羊皮纸：「告诉我你的名字、职业和初始属性。别用嘴说——用 Python 写。」

你现在不会写一行代码？没关系。这本书从头开始，每学一个编程概念，你的冒险就推进一段。学完最后一课，你就能挑战恶龙——当然，是在代码的世界里。

**你的剑 = Python。你的盾 = 编程思维。你的冒险伙伴 = AI。**

---

## 课程总览

| 课 | 主题 | 节数 | 冒险进度 |
|----|------|------|---------|
| 1 | 编程为什么重要 | 2 | 理解：为什么勇者需要编程 |
| 2 | Python 安装与第一个程序 | 3 | 在冒险者公会登记，写出第一行代码 |
| 3 | 变量与数据类型 | 4 | 创建角色——HP、MP、攻击力、金币 |
| 4 | 运算符与输入输出 | 4 | 勇者走入武器店，输入预算算能买什么 |
| 5 | 条件判断 | 3 | 战斗逻辑——HP归零了吗？暴击了吗？ |
| 6 | for 循环 | 3 | 遍历背包、清点战利品、批量喝药 |
| 7 | while 循环 | 2 | 战斗主循环——打到一方倒下为止 |
| 8 | 函数定义与参数 | 3 | 攻击指令、使用道具——封装成技能 |
| 9 | 返回值与作用域 | 3 | 战斗结果——胜利/逃跑/团灭 |
| 10 | 列表与元组 | 4 | 背包系统、队伍管理、怪物掉落表 |
| 11 | 字典与集合 | 3 | 角色属性面板、怪物图鉴、装备栏 |
| 12 | 字符串处理 | 5 | 战斗日志、任务描述、装备名格式化 |
| 13 | 文本清洗与编码 | 3 | 读取古老的预言卷轴（不乱码） |
| 14 | 模块与文件操作 | 4 | 存档/读档——勇者的冒险被保存了 |
| 15 | 错误处理 | 3 | 装备不匹配？魔法值不够？优雅处理 |
| 16 | 推导式、生成器与 Lambda | 4 | 智能整理背包、筛选可用药水 |
| 17 | 装饰器与类型提示 | 4 | 战斗计时、技能冷却、角色类型标注 |
| **合计** | | **57** | |

---

## 第一课：编程为什么重要

> **核心理念**：先解决「为什么学」，再开始「学什么」。你要打败恶龙——一个人不行，你需要 AI 伙伴。但如果你说不清楚战术，再强的伙伴也帮不上忙。

### 1.1 AI 时代为什么还要学编程

你来到冒险者公会。墙上贴着一张告示：

> 「招募勇者讨伐恶龙。需自行组建队伍。不会编程者恕不接待。」

你找到公会会长：「为什么打龙还要会编程？」

会长指了指旁边的老勇者——他正跟一个 AI 魔法书对话。勇者说「帮我把攻击力提上来」，魔法书把他全身装备都变成了攻击力+1 的木剑。勇者崩溃了。

然后会长指了指另一个年轻勇者。他说：「读取我的装备列表，把所有防御力低于 50 的装备替换成防御力 80 以上的，优先替换头盔和铠甲，保留武器不变。」魔法书精准执行，五分钟搞定。

**魔法书（AI）不是问题的答案——它是对你表达能力的放大器。你说得模糊，它做得离谱。你说得精准，它做得完美。**

| 你不懂编程 | 你懂编程 |
|-----------|---------|
| 「帮我把装备弄好点」 | 「把防御低于 50 的换成 80+，武器不动」 |
| 魔法书给你全换木剑 | 魔法书精准替换，五分钟搞定 |
| 打龙团灭，不知道为什么 | 看战斗日志：「第 15 回合，HP 为 0 时还在攻击——没有判断死亡状态」 |

### 1.2 Python 是什么、为什么选它

Python 是所有编程语言里长得最像咒语的——读起来接近英文。我们用它写冒险游戏，因为写起来最省力。

**你记住：JavaScript 里 `let hp = 100` 就是 Python 里 `hp = 100`。Go 里 `var hp int = 100` 也是。换了个写法，说的都是「勇者有 100 点血」。**

我们学 Python，纯粹是因为说它最省嘴。不是为了学 Python 而学 Python——是为了打恶龙。

---

## 第二课：Python 安装与第一个程序

> **核心理念**：在冒险者公会登记，搭好「铁匠铺」，用 Python 写出勇者的第一句话。

### 2.1 安装 Python（Windows）

去 python.org 下载安装。关键一步——勾上「Add Python to PATH」。

**类比**：你在冒险者公会登记姓名。登记完，城里 NPC 才能喊出你的名字、给你任务。不登记？每次进城卫兵都问你是谁。

### 2.2 运行你的第一行 Python

打开终端，输入 `python`，出现 `>>>`。敲 `1+1` 回车，出了 `2`。

再敲 `print("勇者降临！")` 回车——屏幕上出现「勇者降临！」

**这是冒险的第一个信号弹。就一行字，但它意味着代码世界承认了你的存在。**

故意写错一次：`print("勇者降临！)`（少了一个引号）。红色报错出现了吗？那不是死咒，是魔法书在说「咒语没念完，我听不懂」。

### 2.3 注释——写给冒险者看的笔记

```python
# 勇者初始属性——出门别忘了分配属性点！
hp = 100    # 生命值
mp = 50     # 魔法值
atk = 15    # 物理攻击力

# 这个计算含了装备加成，不要再手动加一次
final_atk = atk + weapon_bonus + buff_bonus
```

**冒险笔记**：你在背包里记的「宝箱在枯树第三根树枝下」——不是给怪物看的，是给未来的自己看的。注释是写给未来自己、队友、AI 伙伴的。

---

## 第三课：变量与数据类型

> **核心理念**：创建勇者角色卡——名字、HP、等级、金币。每一种属性是一种「类型」。类型不是要背的概念，是「这个东西能干嘛」的说明书。

### 3.1 变量——给数据贴标签

```python
hp = 100        # 给数字 100 贴了标签「HP」
mp = 50         # 给数字 50 贴了标签「MP」
name = "勇者张三"  # 给文字贴了标签「名字」

# 挨了怪物一下
hp = hp - 15    # 把标签 hp 从 100 撕下来，贴到 85 上
```

**类比**：你的冒险者铭牌。铭牌上写着「勇者张三」，不是你本人变成了一张纸——铭牌只是贴在身上的标签。受伤了，HP 标签从「100」换成「85」，人还是同一个人。

**不是「盒子」**：不要说「变量是装数据的盒子」。盒子装东西就固定了。标签可以随时撕下来换贴。

### 3.2 数字类型

| 类型 | 冒险例子 | 说明 |
|------|---------|------|
| `int`（整数） | `hp = 100` | 生命值，只有整点 |
| `float`（小数） | `crit_rate = 0.15` | 暴击率 15% |
| `//` 整除 | `100 // 30 = 3` | 100 金币，恢复药 30 一瓶，最多买 3 瓶 |
| `/` 普通除 | `damage * 1.5` | 属性克制——伤害 ×1.5 |

**冒险思维**：HP 只能是整数——没有「半滴血」。但暴击率和属性倍率可以是小数。你不需要背类型名，但需要知道数字能用不同形状存在。

### 3.3 字符串类型

```python
hero_name = "勇者张三"
title = "史莱姆克星"
full_title = hero_name + "·" + title   # → "勇者张三·史莱姆克星"

divider = "=" * 30   # → "=============================="
```

**类比**：冒险者的称号系统。干掉一只怪物 → 获得称号 → 拼在名字后面。杂货铺招牌上画分隔线，`"=" * 30` 就是画线。

### 3.4 布尔类型与 None

```python
is_alive = True           # 还活着
has_weapon = False        # 手无寸铁
is_stunned = False        # 没被眩晕

quest_item = None   # 任务物品还没拿到——不是「没有」，是「还没」
```

**类比**：勇者状态栏——活着/死了、有武器/空手——只有两种状态。`None` 是「还没拿到任务物品」——不是不存在，是还没触发。

---

## 第四课：运算符与输入输出

> **核心理念**：勇者走进武器店。老板问「预算多少？」（input）→ 系统算能买什么（运算）→ 打印清单（print）。

### 4.1 算术与比较运算符

```python
# 武器店：铁剑 80 金币、钢盾 120 金币
gold = 200
sword = 80
shield = 120

can_afford_both = gold >= (sword + shield)   # → False，200 < 200，不够买两件
can_afford_one = gold >= sword               # → True

# 伤害计算（基础公式——后面课程会逐步加入暴击、克制等因素）
hero_atk = 15
monster_def = 5
damage = hero_atk - monster_def   # → 10
if damage < 1:
    damage = 1   # 保底 1 点伤害
```

**关键陷阱**：`=` 是贴标签，`==` 是「一样吗」。「勇者张三」写在铭牌上（=）和「这是勇者张三吗」（==）是两件完全不同的事。搞混了这个，AI 的代码会出神秘 bug。

### 4.2 逻辑运算符与优先级

```python
# 可以挑战恶龙的条件：等级≥30 AND 装备了传说之剑 AND 队伍满4人
can_challenge = (level >= 30) and has_legendary_sword and (party_size == 4)

# 进隐藏商店的条件：持有会员卡 OR 魅力值≥50
can_enter = has_member_card or (charisma >= 50)
```

**冒险类比**：「进最终迷宫的条件——收集四颗水晶 AND 等级达到 30 AND 持有勇者之证」。所有条件满足才能进——`and`。

### 4.3 print() 输出

```python
monster = "史莱姆"
damage = 25

print(f"勇者攻击了{monster}！造成了 {damage} 点伤害！")
# → 勇者攻击了史莱姆！造成了 25 点伤害！
```

**类比**：战斗日志——攻击动作是固定的模板（「___攻击了___！造成了___点伤害！」），名字和数字是活的。f-string 就是战斗日志生成器。

### 4.4 input() 输入与类型转换

```python
action = input("要做什么？1.攻击 2.魔法 3.道具 4.逃跑\n")
# 玩家输入 "1"
# action 是 "1"（文字！不是数字！）

action = int(action)   # 转成数字 1

if action == 1:
    print("勇者选择攻击！伤害 15 点")
elif action == 2:
    print("勇者选择魔法！消耗 MP 10")
elif action == 3:
    print("勇者使用道具！")
elif action == 4:
    print("勇者逃跑了！")
else:
    print("没有这个选项，请重新选择")
```

**核心陷阱**：`input()` 拿到的永远是字符串。玩家输入 `1`，拿到的是 `"1"`（文字），不是数字 `1`。必须用 `int()` 翻译。

**冒险类比**：冒险者公会的接待员——你在纸上写「我要接 3 号任务」，接待员要自己理解「3」是任务编号。计算机不会自动理解——你得明确告诉它「这是数字」。

---

## 第五课：条件判断

> **核心理念**：战斗逻辑 = 一连串的「如果...就...」。HP 归零了吗？暴击了吗？敌人有属性弱点吗？每个判断都是一个 if。

### 5.1 if 语句基础

```python
# 勇者攻击怪物——统一的伤害公式
hero_atk = 15
monster_def = 5
monster_hp = 30   # 怪物初始血量
damage = hero_atk - monster_def

if damage <= 0:
    print("攻击无效！怪物防御太高了！")
    damage = 1   # 保底 1 点伤害
else:
    print(f"造成了 {damage} 点伤害！")

monster_hp = monster_hp - damage   # → 30 - 10 = 20
print(f"怪物剩余 HP：{monster_hp}")
```

**类比**：每个回合你都在判断——「我的攻击 > 对方防御吗？」大于就造成伤害，不大就「叮！攻击被弹开了」。程序只是把你脑中的判断写下来。

### 5.2 if/elif/else 与嵌套

```python
# 元素克制判断
if hero_element == "火" and monster_element == "冰":
    damage = damage * 2    # 火克冰，双倍伤害！
    print("🔥 属性克制！伤害翻倍！")
elif hero_element == monster_element:
    damage = damage // 2   # 同属性，伤害减半
    print("同属性，效果不佳...")
else:
    print("普通攻击")       # 没有克制关系，正常伤害
```

**类比**：宝可梦属性克制表——火克草、草克水、水克火。程序判断：我方什么属性？敌人什么属性？按照克制表翻倍或减半。

### 5.3 条件表达式与实战

```python
# 暴击判定——一行搞定
final_damage = damage * 2 if is_critical else damage

# 判断怪物类型——不同怪物行为不同
if monster_type == "史莱姆":
    print("史莱姆很弱，直接攻击即可！")
elif monster_type == "恶龙":
    print("注意！恶龙每3回合会释放龙息！")
else:
    print("普通的怪物，正常战斗")
```

**类比**：捕捉宠物小精灵——不是每只都能抓。扫一眼可捕捉列表，有就能扔精灵球，没有只能打。

---

## 第六课：for 循环

> **核心理念**：遍历背包物品、清点战利品、给队伍全员回血——全是 for 循环。

### 6.1 for 循环基础

```python
# 战斗结束，清点战利品
loot = ["铜剑", "回复药", "回复药", "魔法戒指", "金币袋"]

for item in loot:
    print(f"获得了：{item}！")

# 给队伍所有成员回满血（heal_to_full 假设已经定义好了——第8课会教你写）
party = ["勇者", "法师", "牧师", "盗贼"]
for member in party:
    heal_to_full(member)   # 假装这个函数存在，后面会写
    print(f"{member} 的 HP 已恢复！")
```

**类比**：每次战斗结束，打开背包一个个看掉了什么。掉了几件就看几件——名单有多长看多长。牧师给队伍全员加血——对每个人做一遍「治疗术」。

### 6.2 range() 函数

```python
# 战斗回合计数器
for turn in range(1, 11):    # 第 1 到第 10 回合
    print(f"=== 第 {turn} 回合 ===")
    # 这里调用战斗逻辑（第8课会封装成函数）

# 每 3 回合触发一次环境效果（比如火山地形灼烧）
for turn in range(1, 31):
    if turn % 3 == 0:        # 第 3、6、9... 回合
        print(f"第 {turn} 回合：地形效果触发！")
```

**类比**：回合制战斗——你知道这场 boss 战最多 30 回合（狂暴倒计时）。每 3 回合 boss 会释放一次 AOE。`range + 取余` = 定时触发器。

### 6.3 break、continue 与循环嵌套

```python
# 在背包里找「传说之剑」
backpack = ["木剑", "铜盾", "回复药", "传说之剑", "破布"]

for item in backpack:
    if item == "传说之剑":
        print("找到了！装备上！")
        break          # 找到了，后面的不用翻了
    print(f"{item}...不是这个")

# 批量使用道具——跳过「不可使用」的装备
for item in backpack:
    if item in ["木剑", "铜盾", "破布"]:
        continue       # 这是装备不是消耗品，跳过
    use_item(item)     # 假装这个函数存在——第8课会教你写
```

**类比**：翻背包找钥匙——一个一个翻，找到了就拿起来（break）。翻到装备不消耗（continue），翻到药水才喝。嵌套循环 = 迷宫里的每个房间（外层）每块地板（内层）都检查有没有陷阱。

---

## 第七课：while 循环

> **核心理念**：战斗主循环——「一直打到一方倒下为止」。你不知道要打多少回合，所以用 while。

### 7.1 while 语法与使用场景

```python
# 勇者和怪物的「属性卡」（第11课会详细讲解字典）
hero = {"hp": 100, "atk": 15, "name": "勇者张三"}
monster = {"hp": 50, "atk": 8, "name": "史莱姆"}

# 战斗主循环！
while hero["hp"] > 0 and monster["hp"] > 0:
    print(f"\n勇者 HP: {hero['hp']} | {monster['name']} HP: {monster['hp']}")
    
    action = input("1.攻击 2.魔法 3.道具 4.逃跑 > ")
    
    if action == "1":
        damage = hero["atk"] - monster.get("def", 0)
        if damage < 1:
            damage = 1   # 保底 1 点伤害
        monster["hp"] -= damage
        print(f"勇者攻击！造成 {damage} 点伤害")
    elif action == "4":
        print("勇者逃跑了！")
        break
    
    # 怪物还活着的话就反击
    if monster["hp"] > 0:
        hero["hp"] -= monster["atk"]
        print(f"{monster['name']} 反击！造成 {monster['atk']} 点伤害")

# 战斗结束——判断结果
if hero["hp"] <= 0:
    print("勇者倒下了...Game Over")
elif monster["hp"] <= 0:
    print(f"击败了{monster['name']}！获得经验值！")
```

**类比**：你打任何一个回合制 RPG——打架就是「你一刀我一刀，一直重复到谁先倒下」。你不知道第几回合会结束，所以用 while。while 条件 = 「双方都还活着」。

### 7.2 死循环与循环控制

```python
# 危险！boss 锁血了——永远打不死
boss = {"hp": 1000}
while boss["hp"] > 0:
    boss["hp"] -= 20
    # boss 有个被动：低于 100 血时自动回满
    if boss["hp"] < 100:
        boss["hp"] = 1000   # ← 死循环！永远打不死！
```

**类比**：有些 boss 有「锁血」机制——低于一定血量自动回满。代码没写好就成了死循环。Ctrl+C 是「强制退出战斗」。写 while 时第一句就该问：**什么情况下会停？**

---

## 第八课：函数定义与参数

> **核心理念**：攻击指令、「使用道具」、「装备武器」——这些都是函数。函数 = 给一组战斗动作起名字。

### 8.1 为什么要写函数

```python
# 没有函数——每次攻击都要写一遍完整逻辑
# 勇者攻击史莱姆
slime_hp = slime_hp - (hero_atk - slime_def)
print(f"勇者攻击了史莱姆！造成{hero_atk - slime_def}点伤害")
# 勇者攻击哥布林
goblin_hp = goblin_hp - (hero_atk - goblin_def)
print(f"勇者攻击了哥布林！造成{hero_atk - goblin_def}点伤害")
# 重复几十次...迟早会写错

# 有函数——「攻击」就是一个技能名
def attack(attacker, defender):
    damage = attacker["atk"] - defender["def"]
    if damage < 1:
        damage = 1
    defender["hp"] -= damage
    print(f"{attacker['name']} 攻击了 {defender['name']}！造成 {damage} 点伤害")

# 每次攻击一句话
# 先创建角色和怪物的「属性卡」
hero = {"name": "勇者张三", "hp": 100, "atk": 15, "def": 5}
slime = {"name": "史莱姆", "hp": 30, "atk": 8, "def": 2}
goblin = {"name": "哥布林", "hp": 50, "atk": 12, "def": 5}

attack(hero, slime)      # 勇者攻击史莱姆
attack(hero, goblin)     # 勇者攻击哥布林
attack(goblin, hero)     # 怪物也能用！哥布林反击
```

**类比**：RPG 的技能系统。每个技能都是一段固定的动画+计算——你选「火焰斩」，系统自动播放动画、算伤害。你不会每场战斗都重新设计技能。函数就是你的技能设计器。

### 8.2 def 定义函数

```python
def use_potion(hero, potion_type="回复药"):
    """使用药水——默认是回复药"""
    potions = {
        "回复药": {"hp": 30, "mp": 0},
        "魔力药": {"hp": 0, "mp": 20},
        "完全回复药": {"hp": 9999, "mp": 9999},
    }
    effect = potions[potion_type]
    hero["hp"] = min(hero["hp"] + effect["hp"], hero["max_hp"])
    hero["mp"] = min(hero["mp"] + effect["mp"], hero["max_mp"])
    print(f"使用了{potion_type}！HP+{effect['hp']} MP+{effect['mp']}")

# 在战斗中使用
# hero 现在有最大生命值了（升过级）
hero = {"name": "勇者张三", "hp": 85, "max_hp": 100, "mp": 40, "max_mp": 50}
use_potion(hero, "回复药")   # → HP 恢复到 100（不会超过 max_hp）
use_potion(hero, "魔力药")   # → MP 恢复到 50（不会超过 max_mp）
```

**类比**：你把所有药水的效果做成了一张表（字典），用函数统一处理。新加一种药水？只需在表里加一行，函数不用改。

### 8.3 参数的类型与用法

```python
def cast_spell(caster, target, spell_name="火球术", boosted=False):
    """施放魔法——默认是火球术"""
    spells = {
        "火球术":  {"mp_cost": 10, "base_damage": 30},
        "暴风雪":  {"mp_cost": 25, "base_damage": 80},
        "治愈术":  {"mp_cost": 15, "base_heal": 50},
    }
    spell = spells[spell_name]
    
    if caster["mp"] < spell["mp_cost"]:
        print("MP 不足！")
        return
    
    caster["mp"] -= spell["mp_cost"]
    damage = spell.get("base_damage", 0)
    if boosted:
        damage = damage * 1.5   # 魔力强化！
    target["hp"] -= damage

# 用法
# 创建法师和怪物
mage = {"name": "大法师", "hp": 60, "mp": 100, "atk": 5}
boss = {"name": "恶龙", "hp": 500, "atk": 80, "def": 30}

cast_spell(mage, boss)                          # 默认火球
cast_spell(mage, boss, "暴风雪")                 # 指定魔法
cast_spell(mage, boss, "火球术", boosted=True)   # 魔力强化火球
```

**类比**：法师的魔法书——每个魔法有固定消耗和基础威力。你选魔法（参数 spell_name）、选目标（参数 target）、决定是否加 Buff（参数 boosted）。参数就是你在战斗菜单里选的那几下。

---

## 第九课：返回值与作用域

> **核心理念**：战斗结果——胜利还是团灭？返回值是战斗函数给你的「战报」。作用域——队伍的对话敌人听不到。

### 9.1 return 的用法

```python
def battle(hero, monster):
    """战斗（第7课的循环封装成了函数）！返回结果"""
    while hero["hp"] > 0 and monster["hp"] > 0:
        # 战斗逻辑（和课7一样的回合制循环）
        action = input("1.攻击 2.魔法 3.道具 4.逃跑 > ")
        if action == "4":
            return "escaped"   # 跑了——战斗结束，返回结果
        # ...攻击和反击逻辑...

    if hero["hp"] <= 0:
        return "defeat"        # 团灭
    else:
        return "victory"       # 胜利！

# 根据战斗结果做不同的事
hero = {"name": "勇者张三", "hp": 100, "atk": 15, "def": 5}
dragon = {"name": "恶龙", "hp": 500, "atk": 80, "def": 30}
result = battle(hero, dragon)
if result == "victory":
    print("🏆 击败了恶龙！")
    # level_up(hero) ← 后面可以加上升级逻辑
    # open_treasure_chest() ← 后面可以加上宝箱系统
elif result == "defeat":
    print("☠️ 勇者倒下了...Game Over")
elif result == "escaped":
    print("勇者逃回了城镇...")
```

**类比**：冒险者公会交任务——你去打了一只怪物，回来报告结果：「打死了」「被打回来了」「怪物跑了」。return 就是你回来交差时说的那句话。

### 9.2 变量的作用域

```python
def boss_fight():
    boss_secret = "恶龙的弱点是尾巴尖"   # 只在 boss 战里知道
    return boss_secret

# print(boss_secret)   ← 报错！战斗中发现的秘密，出了战斗就没人知道

world_name = "阿尔德大陆"   # 全局——所有人都知道这个世界叫什么
```

**类比**：队伍频道 vs 世界频道——队伍里讨论的战术（局部变量），敌人听不到。但世界公告「魔王已死」（全局变量），所有 NPC 都知道了。好的设计：用参数传情报，用 return 回报战果——不走「世界频道广播」。

### 9.3 什么时候该拆函数

```python
# 拆之前——「战斗」一个函数干了四件事
def battle(...):
    # 选指令 → 算伤害 → 播动画 → 记录日志
    # 100 行，改起来头疼

# 拆之后——每件事一个函数
def select_action(hero): ...        # 选指令
def calculate_damage(atk, def_): ... # 算伤害
def play_animation(action): ...      # 播动画
def log_battle(turn, event): ...    # 记日志
```

**三条铁律**：超过 20 行→拆。重复两次→拆。能起个技能名→拆。

**类比**：RPG 的系统架构——战斗系统、装备系统、技能系统、存档系统——分开开发，各管各的。不会把存档逻辑写在战斗代码里。拆函数就是给代码分系统。

---

## 第十课：列表与元组

> **核心理念**：背包、队伍、技能栏、怪物掉落表——全是列表。列表是 RPG 游戏最常见的数据结构。

### 10.1 列表基础操作

```python
# 勇者的背包
backpack = ["回复药", "魔力药", "解毒草", "铜剑"]

backpack[0]      # → "回复药"（第 0 格！）
backpack[-1]     # → "铜剑"（倒数第一格）
backpack[1:3]    # → ["魔力药", "解毒草"]
len(backpack)    # → 4（背包里有 4 样东西）
"回复药" in backpack   # → True（背包里有回复药吗？有！）
```

**类比**：背包格子系统。第一格放药水、最后一格放武器。第 0 格不是 bug——计算机里「第 0 个」是从起点偏移 0 步。

### 10.2 列表的增删改查

```python
backpack = ["回复药", "魔力药", "木剑"]

# 打怪掉了新装备
backpack.append("铁剑")          # 放进背包末尾

# 任务道具放第一位（重要！）
backpack.insert(0, "勇者之证")

# 木剑卖了
backpack.remove("木剑")

# 最后一格的东西用了
used_item = backpack.pop()       # 取出来用掉

# 整理背包（按字母排序）
backpack.sort()
```

**类比**：整理背包——新东西往里放（append）、最重要的放最前面（insert）、不用的扔掉（remove）、最后一格用完（pop）、按类型排序（sort）。

### 10.3 列表遍历与枚举

```python
backpack = ["回复药", "魔力药", "解毒草", "火之魔石"]

# 给背包格子编号
for slot, item in enumerate(backpack):
    print(f"[{slot+1}] {item}")

# 输出：
# [1] 回复药
# [2] 魔力药
# [3] 解毒草
# [4] 火之魔石
```

**类比**：打开背包菜单——每个物品有自己的格子编号。`enumerate` 自动帮你标号。玩家说「用第 3 个」→ 系统取 `backpack[2]`。

### 10.4 元组——不可变的列表

```python
# 怪物掉落表——固定配置，不能改
slime_drops = ("回复药", "黏液", "小金币")   # 元组

# slime_drops[1] = "稀有黏液"  ← 报错！掉落表不能随便改！

# 角色出生属性（不会变的基础值）
# 顺序约定：第0位=HP, 第1位=MP, 第2位=ATK, 第3位=DEF
base_stats = (100, 50, 15, 10)
# base_stats[0] → 100 (初始HP)
# base_stats[2] → 15  (初始攻击力)
```

**类比**：怪物图鉴里的掉落清单——史莱姆固定掉这三样东西。配置写死了不能改。元组 = 锁定在石碑上的配置。

---

## 第十一课：字典与集合

> **核心理念**：角色属性面板、装备栏位、怪物图鉴——全是字典。字典让你用「名字」而不是「第几个」来找数据。

### 11.1 字典基础

```python
# 勇者的完整属性面板
hero = {
    "name": "勇者张三",
    "level": 15,
    "hp": 320,
    "max_hp": 320,
    "mp": 85,
    "max_mp": 100,
    "atk": 65,
    "def": 40,
    "gold": 3840,
    "exp": 2750,
}

hero["hp"]       # → 320（当前血量）
hero["atk"]      # → 65（攻击力）
hero.get("luck", 0)   # → 0（没有幸运值，默认 0）

# 获得新属性！
hero["title"] = "史莱姆克星"   # 随时加字段（终章会升级为「恶龙杀手」）
```

**类比**：角色状态面板——你按 C 键打开，看到所有属性整齐排列。`hero["hp"]` 就是「看一眼血量」。字典就是角色面板的代码形态。

### 11.2 字典的常用操作

```python
# 装备栏——每个部位一件装备
equipment = {
    "武器": "传说之剑",
    "头盔": "龙鳞盔",
    "铠甲": "秘银甲",
    "饰品": "勇者之证",
}

# 查看所有装备
for slot, item in equipment.items():
    print(f"{slot}：{item}")

# 换装备
equipment["武器"] = "勇者之剑·真"   # 升级了！

# 检查有没有装备头盔
if "头盔" in equipment:
    print(f"头盔：{equipment['头盔']}")
```

**类比**：装备界面——武器槽、头盔槽、铠甲槽、饰品槽。每个槽位（key）装一件装备（value）。换武器就是给「武器」这个 key 换一个 value。

### 11.3 集合——不重复的无序容器

```python
# 怪物图鉴——遇到了哪些怪物（自动去重）
encountered = {"史莱姆", "哥布林", "史莱姆", "骷髅兵", "哥布林"}
# → {"史莱姆", "哥布林", "骷髅兵"}  自动去重！

# 所有怪物 vs 已击败的 → 还有哪些没打过？
all_monsters = {"史莱姆", "哥布林", "骷髅兵", "恶龙", "魔王"}
defeated = {"史莱姆", "哥布林", "骷髅兵"}
remaining = all_monsters - defeated   # → {"恶龙", "魔王"}  还要打！

# 两个冒险者的图鉴合并
hero_a_seen = {"史莱姆", "哥布林"}
hero_b_seen = {"骷髅兵", "恶龙"}
combined = hero_a_seen | hero_b_seen   # → {"史莱姆", "哥布林", "骷髅兵", "恶龙"}
```

**类比**：怪物图鉴——你遇到史莱姆 10 次，图鉴只记录一次。差集 = 图鉴上还空着的格（没遇到的怪物）。并集 = 两个冒险者交换图鉴后合在一起。

---

## 第十二课：字符串处理

> **核心理念**：战斗日志、任务描述、NPC 对话、装备名格式化——全是字符串操作。

### 12.1 字符串格式化

```python
# 战斗日志
hero_name = "勇者张三"
monster_name = "恶龙"
damage = 145
is_critical = True

log = f"{hero_name} 的传说之剑发出耀眼光芒！对 {monster_name} 造成了 {damage} 点伤害！"
if is_critical:
    log += " 暴击！！"
```

**类比**：战斗画面的旁白字幕——每个技能有一个描述模板，伤害数字和角色名填进去。f-string 就是字幕生成器。

### 12.2 字符串常用方法（上）

```python
# 玩家输入名字时多打了空格
name = "  勇者张三  "
clean_name = name.strip()   # → "勇者张三"

# 格式化装备名
weapon = "勇者之剑"
rank = "+10"
full_name = weapon + "·" + rank   # → "勇者之剑·+10"

# 解析宝箱内容「回复药×3、魔力药×2、金币×500」
chest = "回复药×3、魔力药×2、金币×500"
items = chest.split("、")   # → ["回复药×3", "魔力药×2", "金币×500"]
```

**类比**：玩家起名字时不小心打了空格——`strip()` 帮你去掉。宝箱掉落列表是一串文字——`split` 帮你切开成一个一个物品。

### 12.3 字符串常用方法（下）

```python
# 技能书鉴定
skill_book = "禁咒·陨石术（远古文字）"

skill_book.startswith("禁咒")   # → True，这是禁术！
skill_book.find("陨石")         # → 3，在第 3 个位置
"（远古文字）" in skill_book    # → True，需要翻译
```

**类比**：鉴定魔法书——看名字就知道是不是禁术（startswith），需要不需要翻译（find 找「远古文字」标记）。

### 12.4 正则表达式（上）

```python
import re

# 从战斗记录里提取所有伤害数字
battle_log = "对史莱姆造成25点伤害！暴击造成50点伤害！普通攻击15点伤害"
damages = re.findall(r"造成(\d+)点伤害", battle_log)
# → ["25", "50", "15"]

# 检查密码强度（至少8位、含大小写和数字）
password = "Hero2024!"
if re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$", password):
    print("密码够强！可以保护你的存档了")
```

**类比**：战斗记录分析——你打完一场 boss 战想看「我总共造成了多少伤害」。正则帮你把散落在 500 行战斗日志里的伤害数字一键提取。你不需要会写，但要知道「让 AI 写正则提出来」。

### 12.5 正则表达式（下）

```python
# 清洗 NPC 对话文本（去掉标记）
npc_text = "<anger>你竟敢闯入我的领地！</anger><normal>不过...如果你帮我找一样东西...</normal>"
clean = re.sub(r"<[^>]*>", "", npc_text)
# → "你竟敢闯入我的领地！不过...如果你帮我找一样东西..."

# 提取任务描述中的数字
quest = "收集 5 个狼牙、3 张熊皮、10 株草药"
counts = re.findall(r"(\d+)\s*[个张株]", quest)
# → ["5", "3", "10"]
```

**类比**：NPC 对话文本带了很多情绪标记（`<anger>`），你只需要纯文字显示给玩家。正则帮你洗掉标记。任务描述里提取「要几个什么」——交给 AI。

---

## 第十三课：文本清洗与编码

> **核心理念**：拿到一本古老的预言书——打开全是乱码。不是书坏了，是你没找到对的密码本。

### 13.1 文本清洗实战

```python
# 从游戏攻略网站抓了 Boss 打法，结果全是 HTML
raw_guide = "<div class='boss'><h2>恶龙攻略</h2><p>弱点：尾巴尖<br/>注意：每3回合释放<strong>龙息</strong></p></div>"

import re
clean = re.sub(r"<[^>]*>", "", raw_guide)
# → "恶龙攻略弱点：尾巴尖注意：每3回合释放龙息"
```

**类比**：从网页复制的攻略带了一堆格式标记。你只要文字内容——正则帮你一键「只留文字」。

### 13.2 编码——为什么会有乱码

```python
# 古代石板（日文编码），你用通用解读器（UTF-8）读——乱码
# 换「古代文字解读器」（shift-jis）——就能读了！
# （with open 语法在第14课详细讲解，这里先看 encoding 参数的作用）

with open("古代石板.txt", "r", encoding="shift-jis") as f:
    prophecy = f.read()   # 「当四颗星辰汇聚，勇者将降临」
```

**类比**：考古现场挖出一块石板——上面不是乱刻的，是用古代文字写的。你需要一个古代文字学家（换 encoding）来翻译。乱码的本质是「写的人用的密码本」和「读的人用的密码本」不一样。

### 13.3 文件读写中的编码

```python
# 铁律：存档文件统一用 UTF-8
with open("save_data.json", "w", encoding="utf-8") as f:
    f.write(save_json)

# 你的项目规则里写：
# 「所有 open() 都指定 encoding='utf-8'」
# —— AI 帮你记住这个习惯
```

**类比**：游戏存档格式统一——所有平台、所有版本都用一个格式。不会出现「Windows 存的档 Mac 读不了」。

---

## 第十四课：模块与文件操作

> **核心理念**：存档/读档——RPG 里最重要的功能。打了一夜的恶龙，不能白打。

### 14.1 import——使用别人的代码

```python
import random
# 暴击率 15% → 随机判定
is_critical = random.random() < 0.15   # 15% 概率暴击

# 随机遇敌
monsters = ["史莱姆", "哥布林", "骷髅兵", "暗影骑士"]
encounter = random.choice(monsters)

import math
# 伤害波动：基础伤害的 0.9 到 1.1 倍
base_damage = 25   # 前面章节算出来的基础伤害
final_damage = math.floor(base_damage * random.uniform(0.9, 1.1))

import json
# 存档——把勇者数据转成 JSON（hero 是前面创建的角色字典）
hero = {"name": "勇者张三", "hp": 320, "atk": 65}
save_data = json.dumps(hero, ensure_ascii=False)
```

**类比**：游戏内置的骰子系统（random）、伤害计算公式（math）、存档格式（json）。这些都是「已经写好的功能」，你 import 一下就能用。不用自己重写随机数生成器。

### 14.2 自己的模块与 `__name__`

```python
# monsters.py —— 怪物数据
SLIMES = {"name": "史莱姆", "hp": 30, "atk": 8, "def": 2}
GOBLINS = {"name": "哥布林", "hp": 50, "atk": 12, "def": 5}

# battle.py —— 战斗系统
from monsters import SLIMES, GOBLINS

# main.py —— 游戏入口
if __name__ == "__main__":
    print("=== 勇者斗恶龙 ===")
    print("1. 新游戏  2. 读档  3. 退出")
    main_menu()
```

**类比**：游戏引擎的模块化——怪物数据一个文件夹、战斗系统一个文件夹、存档系统一个文件夹。每个文件夹独立开发。`if __name__ == "__main__"` = 「如果双击运行这个文件，就启动游戏」。

### 14.3 文件读写操作

```python
import json

def save_game(hero, filename="save.json"):
    """存档！"""
    save_data = {
        "hero": hero,
        "timestamp": "2026-04-28 19:23",
        "location": "恶龙山脉·入口",
    }
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(save_data, f, ensure_ascii=False, indent=2)
    print("💾 存档成功！")

def load_game(filename="save.json"):
    """读档！"""
    with open(filename, "r", encoding="utf-8") as f:
        save_data = json.load(f)
    print(f"📂 读取存档——{save_data['timestamp']}，地点：{save_data['location']}")
    return save_data["hero"]
```

**类比**：RPG 的存档点——你在教堂祈祷（save），冒险被刻入石碑。下次打开游戏——读取石碑（load），继续冒险。没有存档，一切白打。

### 14.4 路径处理

```python
import os

# 不要手写路径！Windows 和 Mac 分隔符不一样
save_dir = os.path.join("saves", "slot_1", "save.json")
# Windows → saves\slot_1\save.json
# Mac → saves/slot_1/save.json

# 存档存在吗？
if os.path.exists(save_dir):
    hero = load_game(save_dir)
else:
    print("没有存档，开始新游戏！")
    hero = create_new_hero()
```

**类比**：插卡带——存档文件在「saves/slot_1」里。`os.path.exists` = 「摸摸卡槽里有没有卡带」。

---

## 第十五课：错误处理

> **核心理念**：装备不匹配？MP 不够？物品用完？优雅处理——不要闪退。

### 15.1 异常是什么

```python
# 勇者想装备「魔法杖」
hero["class"] = "战士"
equip("魔法杖")   # 战士不能装备魔法杖！
# → ClassRestrictionError: 战士不能装备魔法杖

# 报错信息告诉你三件事：
# 1. 什么错了：职业限制
# 2. 为什么：战士不能装备法杖
# 3. 在哪一行：去那里加个判断
```

**类比**：游戏里你想给战士装备法杖——系统弹出红字「职业不匹配」。不是游戏坏了，是规则不允许。报错 = 系统在告诉你规则。

**RPG 常见错误**：

| 错误 | RPG 场景 |
|------|---------|
| `KeyError` | 你想用「终极魔法」但这个技能不存在 |
| `IndexError` | 背包只有 20 格，你想取第 21 格 |
| `ValueError` | 传送坐标写了个负数 |
| `FileNotFoundError` | 你没存过档就想读档 |
| `TypeError` | 把「火焰斩」当数字算伤害 |

### 15.2 try/except 捕获异常

```python
def equip_weapon(hero, weapon):
    """装备武器——优雅处理各种问题"""
    try:
        requirements = weapon_db[weapon]["requirements"]
        if hero["level"] < requirements.get("level", 0):
            print(f"等级不足！需要 {requirements['level']} 级")
            return
        if hero["class"] not in requirements.get("classes", [hero["class"]]):
            print(f"职业不匹配！{weapon} 需要 {'/'.join(requirements['classes'])}")
            return
        hero["weapon"] = weapon
        print(f"装备了 {weapon}！攻击力 +{weapon_db[weapon]['atk']}")
    except KeyError:
        print(f"武器数据库里没有「{weapon}」——是不是打错名字了？")
```

**类比**：游戏里点「装备」——系统先检查等级够不够、职业对不对。不够就弹出提示，不会闪退。`try/except` = 游戏引擎的「容错逻辑」。

### 15.3 else/finally 与自定义异常

```python
class GameOver(Exception):
    """勇者阵亡——自定义异常"""
    pass

def check_alive(hero):
    """检查勇者是否还活着——死了就抛出异常"""
    if hero["hp"] <= 0:
        raise GameOver("勇者倒下了...")

# 在战斗循环中使用（attack 是第8课定义的统一攻击函数）
hero = {"name": "勇者张三", "hp": 100, "atk": 15, "def": 5}
monster = {"name": "恶龙", "hp": 500, "atk": 80, "def": 30}

try:
    # 战斗主循环
    while hero["hp"] > 0 and monster["hp"] > 0:
        attack(hero, monster)         # 勇者先手（课8.1 定义的函数）
        check_alive(monster)          # 怪物倒了吗？
        if monster["hp"] <= 0:
            break
        attack(monster, hero)         # 怪物反击（同样的 attack 函数！）
        check_alive(hero)             # 勇者倒了吗？
except GameOver as e:
    print(f"\n☠️ {e}")
    print("—— GAME OVER ——")
else:
    print("\n🏆 战斗胜利！")
finally:
    print("战斗日志已保存。")
    # save_game(hero) ← 第14课学的存档，无论输赢自动存
```

**类比**：战斗流程——每个回合结束都检查「还活着吗」。死了就触发 GameOver 动画（except），活到敌人倒下就播放胜利动画（else），打完无论输赢都存档（finally）。`finally` = 你不会因为团灭就白打了三小时。

---

## 第十六课：推导式、生成器与 Lambda

> **核心理念**：RPG 数据处理的「高级技能」——一行代码整理背包、筛选药水、排序掉落。

### 16.1 列表推导式

```python
# 背包里有装备和消耗品——只提取装备名
backpack = ["铁剑", "回复药", "钢盾", "解毒草", "魔法杖", "魔力药"]

# 传统写法
weapons = []
for item in backpack:
    # 检查是否以「剑」「盾」「杖」结尾（课12.3 学的 endswith）
    if item.endswith("剑") or item.endswith("盾") or item.endswith("杖"):
        weapons.append(item)

# 推导式——一行出活（同样的逻辑，更简洁）
weapons = [item for item in backpack 
           if item.endswith("剑") or item.endswith("盾") or item.endswith("杖")]
# → ["铁剑", "钢盾", "魔法杖"]

# 怪物掉落经验值汇总
slimes_killed = [5, 3, 8, 2, 6]   # 每只的经验值
total_exp = sum(slimes_killed)     # → 24
```

**类比**：一键整理背包——点「整理」，武器归武器、药水归药水。推导式 = 那个「整理」按钮的代码实现。

### 16.2 字典与集合推导式

```python
# 怪物图鉴：{怪物名: 击败次数}
kills = {"史莱姆": 15, "哥布林": 23, "骷髅兵": 8, "恶龙": 1}

# 只显示击败超过 10 只的（刷怪狂人）
farmed = {name: count for name, count in kills.items() if count > 10}
# → {"史莱姆": 15, "哥布林": 23}

# 从敌人队伍里找出所有属性弱点
enemies = [
    {"name": "史莱姆", "weakness": "火"},
    {"name": "冰龙", "weakness": "火"},
    {"name": "树精", "weakness": "火"},
    {"name": "水元素", "weakness": "雷"},
]
fire_weak = {e["name"] for e in enemies if e["weakness"] == "火"}
# → {"史莱姆", "冰龙", "树精"}  火系法师狂喜
```

**类比**：图鉴筛选——「我火球术满级了，看看哪些怪怕火」。字典推导式一键列出。比一个一个翻图鉴快一万倍。

### 16.3 生成器与 yield

```python
def read_battle_log(filename):
    """读取超长战斗日志——一行一行处理，不占内存"""
    import re
    with open(filename, "r") as f:
        for line in f:
            if "伤害" in line:
                yield line.strip()

# 处理十万行战斗日志，内存只占一行的大小
import re
total_damage = 0
for line in read_battle_log("epic_battle.log"):
    damage = int(re.search(r"造成(\d+)点伤害", line).group(1))
    total_damage += damage
print(f"这场战斗总共造成了 {total_damage} 点伤害！")
```

**类比**：战斗回放——你不需要把整个回放一次性加载到脑子里。一帧一帧看，看完一帧忘掉前一帧。`yield` = 回放的「逐帧播放」按钮。

### 16.4 Lambda 与高阶函数

```python
# 战利品按价值排序（金币优先）
loot = [
    {"name": "铜剑", "value": 50},
    {"name": "龙鳞", "value": 5000},
    {"name": "回复药", "value": 30},
    {"name": "传说之剑", "value": 99999},
]

# 按价值从高到低排
sorted_loot = sorted(loot, key=lambda item: item["value"], reverse=True)
# → 传说之剑 > 龙鳞 > 铜剑 > 回复药

# 筛出价值超过 100 的（值得捡的）
valuable = list(filter(lambda item: item["value"] > 100, loot))
# → [龙鳞, 传说之剑]

# 所有物品打折甩卖（半价）
half_price = list(map(lambda item: item["value"] // 2, loot))
# → [25, 2500, 15, 49999]
```

**类比**：战利品结算界面——自动按价值排序（sorted）、高亮稀有掉落（filter）、计算半价回收价（map）。lambda = 结算界面的临时排序规则——用完就忘，不污染技能栏。

---

## 第十七课：装饰器与类型提示

> **核心理念**：战斗计时器、技能冷却、装备 Buff——装饰器帮你「给技能加特效」。类型提示 = 角色的「属性铭牌」，让 AI 一看就懂。

### 17.1 装饰器是什么

```python
import time
import random

def combat_log(func):
    """装饰器——自动记录每次技能使用的效果"""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"[战斗日志] {func.__name__} 发动！耗时 {elapsed:.2f}s")
        return result
    return wrapper

@combat_log
def dragon_breath(caster, targets):
    """恶龙的龙息——造成全队 AOE 伤害"""
    for target in targets:
        damage = random.randint(80, 120)
        target["hp"] -= damage
    return True

# 每次龙息发动——自动记录时间！不用改龙息函数本身
boss = {"name": "恶龙", "hp": 500}
party = [{"name": "勇者", "hp": 100}, {"name": "法师", "hp": 60}, {"name": "牧师", "hp": 80}]
dragon_breath(boss, party)
# → [战斗日志] dragon_breath 发动！耗时 0.05s
```

**类比**：游戏内置的战斗记录器。你不用手动记「第几回合谁用了什么技能」——系统自动帮你记。装饰器 = 给你的技能函数套了一层「自动记录」的外壳。

### 17.2 常见内置装饰器

```python
class Weapon:
    def __init__(self, name, base_atk, enchant=0):
        self._base_atk = base_atk
        self._enchant = enchant
    
    @property
    def atk(self):
        """攻击力 = 基础攻击 + 附魔加成"""
        return self._base_atk + self._enchant

sword = Weapon("传说之剑", 80, enchant=15)
print(sword.atk)   # → 95（直接读 sword.atk，不用 sword.atk()！）
```

**类比**：装备属性面板——你看到的攻击力是「基础 + 附魔 + Buff」的最终值。`@property` = 面板自动帮你算好了，不需要你手动加。

### 17.3 类型提示（上）

```python
# 角色创建——标清楚每个属性是什么类型
hero_name: str = "勇者张三"
hero_level: int = 1
hero_hp: int = 100            # HP 是整数——没有半滴血
hero_crit_rate: float = 0.15  # 但暴击率可以是小数
is_chosen_one: bool = True

def attack(attacker: dict, defender: dict, skill_name: str = "普通攻击") -> int:
    """攻击！返回造成的伤害值"""
    ...
```

**类比**：角色创建界面的属性字段——姓名是文字、等级是整数、HP 是数字。类型提示 = 属性栏旁边的标签——告诉你（和 AI）这个字段该填什么类型的值。

**AI 场景**：你写 `def heal(target: dict, amount: int) -> int:`——AI 秒懂：target 是角色字典，amount 是整数回血量，返回实际回血值。比写三行注释还快。

### 17.4 类型提示（下）

```python
from typing import Optional
from dataclasses import dataclass

@dataclass
class Monster:
    name: str
    hp: int
    atk: int
    defense: int = 0
    element: str = "无"
    is_boss: bool = False

# 自动生成 __init__、__repr__、__eq__
slime = Monster(name="史莱姆", hp=30, atk=8)
boss = Monster(name="恶龙", hp=5000, atk=120, defense=50, element="火", is_boss=True)

print(slime)   # → Monster(name='史莱姆', hp=30, atk=8, defense=0, element='无', is_boss=False)

def find_monster(name: str) -> Optional[Monster]:
    """查怪物图鉴——可能还没遇到，返回 None"""
    return monster_handbook.get(name)
```

**类比**：怪物图鉴卡片模板——每张卡格式一样（名字、HP、攻击、属性、是否BOSS），但数值不同。`@dataclass` = 那个卡片印刷模板——你填数据就行，格式自动统一。

---

## 终章：恶龙倒下了

你从零开始创建勇者，写了 17 课代码。回过头看——

| 阶段 | 你学会的 | 在冒险里的样子 |
|------|---------|-------------|
| 课 1-3 | 数据与变量 | 创建角色面板——HP/MP/等级/名字 |
| 课 4-7 | 运算与流程 | 战斗系统——算伤害、判断生死、回合制循环 |
| 课 8-9 | 函数与封装 | 技能系统——「火焰斩」「治疗术」一个指令发动 |
| 课 10-13 | 数据结构 | 背包、装备栏、怪物图鉴、战斗日志 |
| 课 14-15 | 外部交互 | 存档读档、错误处理——不会因为装备不匹配闪退 |
| 课 16-17 | 精炼与标注 | 一键整理背包、类型标注——让 AI 秒懂你的代码 |

**最重要的收获**：你不是学会了 Python。你是学会了「用编程思维打 RPG」——勇者的每一个动作，背后都是一段可以精准描述的逻辑。Python 只是你的第一把剑，将来换 JavaScript 之剑、Go 之盾、Java 之甲，战斗方式不变。

还记得课3时勇者的称号是什么吗？「史莱姆克星」。现在，他叫「恶龙杀手」。从一个 title 变量的赋值开始，你一路写完了整场冒险——变量没变，是勇者变了。

**而 AI 是你最强的冒险伙伴。** 你说「检查第 15 行的技能判定，少了一个暴击分支」——AI 秒修。你说「帮我把战斗循环抽成函数」——AI 秒重构。你说「给技能系统加个冷却机制」——AI 开始写代码，你负责说「对」「不对」「再加个效果」。

**你的冒险，才刚刚开始。**

---

## 附录：冒险手册速查

每一个编程概念在 RPG 里的映射：

| 编程概念 | RPG 映射 | 一句话 |
|---------|---------|--------|
| 变量 | 角色属性铭牌 | 标签贴在数据上，HP 从 100 变 85 |
| int | HP/等级 | 血量只有整数，没有半滴 |
| float | 暴击率/属性倍率 | 15% 暴击，1.5 倍克制 |
| str | 角色名/称号 | 「勇者张三」，后期获得称号拼成完整名 |
| bool | 存活/阵亡 | 活着 True，死了 False |
| None | 未触发任务 | 不是没有，是还没 |
| input() | 战斗菜单选指令 | 选「攻击」拿到的是 "1"（文字） |
| if/elif/else | 属性克制表 | 火克冰、同属性减半 |
| for | 遍历背包/批量回血 | 背包每个物品看一遍 |
| range | 回合计数器 | 第 1-10 回合，每 3 回合触发 AOE |
| while | 战斗主循环 | 打到一方倒下为止 |
| 函数 | 技能系统 | 「火焰斩」= 伤害计算 + 动画 + 音效 |
| return | 战斗结果 | 「打赢了」「团灭了」「逃跑了」 |
| 作用域 | 队伍频道 vs 世界频道 | 战术讨论敌人听不到 |
| 列表 | 背包格子 | 第 0 格、最后 1 格 |
| 元组 | 怪物掉落表 | 史莱姆固定掉这三样，不能改 |
| 字典 | 角色面板/装备栏 | 搜「武器」出武器，搜「头盔」出头盔 |
| 集合 | 怪物图鉴/已击败列表 | 遇到 10 次只记 1 次 |
| f-string | 战斗旁白字幕 | 「勇者攻击了史莱姆！造成 25 点伤害！」 |
| 正则 | 提取战斗日志 | 找出所有伤害数字 |
| 编码 | 古代石板解读 | 换密码本读古文字 |
| import | 系统内置骰子 | random 帮你丢骰子 |
| 文件读写 | 存档/读档 | 教堂祈祷 = save |
| 异常 | 装备限制 | 战士不能装法杖，弹出提示不闪退 |
| try/except | 容错逻辑 | 按错了也优雅处理 |
| 推导式 | 一键整理背包 | 点「整理」，武器归武器 |
| yield | 战斗回放逐帧播放 | 看一帧忘一帧 |
| lambda | 战利品排序规则 | 按价值排，临时规则用完就忘 |
| 装饰器 | 战斗记录器 | 自动记每次技能使用时间 |
| 类型提示 | 属性栏标签 | 标清楚这是什么类型 |
| @dataclass | 怪物图鉴卡片模板 | 格式统一，填内容就行 |
