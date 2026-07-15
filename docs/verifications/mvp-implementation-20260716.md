# MVP 实施验证记录（2026-07-16）

## 自动门禁

- `npm test`：27/27 通过。
- `npm run typecheck`：通过。
- `npm run lint`：通过（修正最后一条测试无用变量提示后复验）。
- `npm run build`：Next.js 16.2.10 生产构建通过，11 条页面/API 路由成功生成。
- `npm audit`：生产与完整依赖均为 0 个已知漏洞。

## 运行时验收

- Web 健康检查：`{"status":"ok","executionService":"ready"}`。
- 第 1 章详情能读取 Markdown，且公开响应不包含 `expectedOutput`。
- 未知练习返回 `404 / EXERCISE_NOT_FOUND`。
- 第 1 章正确答案通过可选 stdin 进入 `python:3.12-alpine` 一次性容器，输出 `我准备好了`，API 返回 `passed`。
- 同一运行时分别验证了 `passed`、`failed`、`error` 和 `timeout`；无限循环在 10,000ms 被终止。
- 真实执行首次发现 Docker 未保持 stdin 开放；补充失败回归测试后加入 `--interactive`，测试与运行时复验均通过。

## 视觉验收说明

生产页面与静态资源可通过 HTTP 访问；本轮使用的应用内浏览器预览通道无法连接宿主机 localhost/LAN 地址，因此没有把截图检查标记为完成。UI 的最终 1024px、200% 缩放和键盘路径仍需在可访问本地服务的浏览器中人工复核。

## 未冒充完成的后续边界

- Phase 2：多组隐藏 Boss 测试、nsjail、Boss 掉落、提示药水、战斗动画/音效。
- Phase 3：AI 供应商、账号/数据库、多设备同步和真实排行榜。
- 部署：代码执行服务的平台、认证、限流、监控与扩缩容。
