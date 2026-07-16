# Python 勇者斗恶龙

一个桌面优先的 16-bit 像素风 Python 学习工具：阅读 17 章课程，在 Monaco 编辑器中运行 Python，完成挑战后升级勇者、解锁地图并购买装备。

## 当前可用能力

- 创建 10 种原创像素头像的本地勇者
- 17 节点分区地图与完成、当前、锁定状态
- Markdown 课程 + 42/58 双栏学习工作台 + Monaco Python 编辑器
- 独立 Docker 执行服务：一次一容器、禁网、只读根文件系统、CPU/内存/进程限制
- stdout 和可选 stdin 练习，返回通过、未通过、错误和超时四种状态
- 经验、等级、金币、10 场 Boss 额外奖励与称号
- 与 PRD 一致的 15 件装备、6 个装备槽、商店、背包和属性加成
- 版本化 localStorage 存档、v1→v2 自动迁移，以及经过契约校验的 JSON 导入/导出
- 原创双主题音频包、全局静音、持久化音量，以及任务/代码/交易/装备短音效

内置 AI 魔法书、账号同步、真实排行榜、多组隐藏 Boss 测试、提示药水、背景音乐播放与生产部署仍属于后续阶段；界面不会用伪数据冒充这些能力。

## 本地运行

需要 Node.js 20+、npm 和正在运行的 Docker Desktop。

```bash
npm ci
docker pull python:3.12-alpine
```

分别启动代码执行服务和 Web 应用：

```bash
npm run execution:start
```

```bash
npm run dev
```

打开 `http://localhost:3000`。执行服务默认只监听 `127.0.0.1:8787`，不要未经额外认证、限流和网络隔离就将它公开到互联网。

## 验证

```bash
npm run verify
```

该命令依次运行契约/领域/服务测试、TypeScript、ESLint 和 Next.js 生产构建。运行时验收还应启动上述两个服务，再检查：

```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/executions \
  -H 'content-type: application/json' \
  --data '{"exerciseId":"chapter-01-final","code":"print(\"我准备好了\")"}'
```

## 契约与文档

- API：[`contracts/openapi.yaml`](contracts/openapi.yaml)
- 本地存档：[`contracts/game-state.schema.json`](contracts/game-state.schema.json)
- 产品需求：[`docs/Python-DragonQuest/PRD-Python-DragonQuest.md`](docs/Python-DragonQuest/PRD-Python-DragonQuest.md)
- UI/UX：[`docs/Python-DragonQuest/UI-UX-设计规范.md`](docs/Python-DragonQuest/UI-UX-设计规范.md)
- 实施与边界：[`docs/plans/implementation-contract-tdd-20260716.md`](docs/plans/implementation-contract-tdd-20260716.md)

像素中文字体使用自托管的 Fusion Pixel Font 12px 比例简体中文版本，许可见 `public/fonts/fusion-pixel/LICENSE-OFL.txt`。
