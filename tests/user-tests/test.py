import time
boss = {"hp": 1000, "攻击力": 50, "名字": "恶龙"}
复活次数 = 0   # 已经复活过几次了？

while boss["hp"] > 0:
    boss["hp"] -= 120
    print(f"造成 120 点伤害！恶龙剩余 hp：{boss['hp']}")
    time.sleep(1)   # 暂停 2 秒
    if boss["hp"] < 100 and 复活次数 < 3:
        boss["hp"] = 1000
        复活次数 += 1
        print(f"恶龙发动「龙血复苏」！（剩余复活次数：{3 - 复活次数}）")
        time.sleep(1)   # 暂停 2 秒

print("恶龙倒下了！！！")