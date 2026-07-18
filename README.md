# Python 勇者斗恶龙

一个响应式 16-bit 像素风 Python 学习工具：阅读 17 章课程，在 Monaco 编辑器中运行 Python，完成挑战后升级勇者、解锁地图并购买装备。

## 当前可用能力

- 创建 10 种原创像素头像的本地勇者
- 17 节点分区地图与完成、当前、锁定状态
- Markdown 课程 + 42/58 双栏学习工作台 + Monaco Python 编辑器
- 独立 Docker 执行服务：一次一容器、非 root、禁网、只读根文件系统、CPU/内存/进程/文件描述符限制
- stdout 和可选 stdin 练习，返回通过、未通过、错误和超时四种状态
- 10 场 Boss 的专属对话、键盘选择、30 组服务端隐藏测试、血条/战斗演出、掉落与幂等奖励
- 与 PRD 一致的 15 件装备、6 个装备槽、商店、20 格背包、重复获取和属性加成
- 可购买/消耗的提示药水，以及每章 3 级预写提示
- 16 个称号的解锁与佩戴、1200×630 像素角色分享卡
- 章节内 AI 魔法书侧边栏：使用 DeepSeek V4 Flash，携带当前代码与运行日志、流式回应，并按通关状态切换辅导/协作模式
- 版本化 localStorage 存档、v1/v2→v3 自动迁移，以及经过契约校验的 JSON 导入/导出
- 原创双主题音频包、全局静音、持久化音量，以及任务/代码/交易/装备短音效
- 桌面、平板和移动端响应式工作台、减少动效开关、延迟加载 Monaco、站点地图与 SEO 元数据

需要外部服务决策的能力仍未冒充完成：AI 魔法书的每章额度与提示药水计费，邮箱账号与跨设备同步、真实排行榜/公会，以及生产容器平台、认证、限流、监控和扩缩容。背景音乐素材已就绪但按学习工具的克制原则不自动播放。

## 本地运行

需要 Node.js 20+、npm 和正在运行的 Docker Desktop。

```bash
npm ci
docker pull python:3.12-alpine
```

AI 魔法书使用服务端环境变量 `DEEPSEEK_API_KEY` 调用 `deepseek-v4-flash`。已有 DeepSeek Claude 兼容环境时，也会在 `ANTHROPIC_BASE_URL` 指向 `api.deepseek.com` 的前提下读取 `ANTHROPIC_AUTH_TOKEN`。提问会把当前章节、练习代码和最近运行日志发送至 DeepSeek，密钥不会进入浏览器或仓库。

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
