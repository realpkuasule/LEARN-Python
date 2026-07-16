# Python DragonQuest environment skins

章节环境采用 640×360 的 16:9 俯视角场景卡。它们服务于 17 节点的章节地图、对话、任务和 Boss 演出，不是自由行走瓦片地图。

## 目录

```text
environment-manifest.json
<theme>/scenes/<scene-id>.png
```

皮肤 ID 为 `european` 和 `chinese`。`environment-manifest.json` 是成品资产合同；当前运行时固定使用欧洲主题，主题状态落地后可直接按同构路径切换。只有切出 20 张合格场景的主题才会进入清单。

```ts
type EnvironmentSkin = "european" | "chinese";

function environmentAsset(skin: EnvironmentSkin, sceneId: string): string {
  return `/assets/environments/${skin}/scenes/${sceneId}.png`;
}
```

两套皮肤共享 scene ID、尺寸、章节语义和中心交互安全区。文化差异由建筑结构、材质、纹样与陈设表达，业务逻辑不分叉。

## 场景范围

- 17 个章节专属环境：冒险者公会到恶龙之巢。
- `dragon-battle-arena`：第 17 章最终 Boss 战。
- `world-map`：世界地图底图；17 个状态节点由可交互 GUI 图层覆盖。
- `victory-camp`：最终通关画面。

## 重新切图与验证

```bash
node tools/process_environment_atlases.mjs
```

脚本会从本地生产母图去除黑色分隔边、切出场景、统一为 640×360，并验证每套主题恰好具有 20 张正确尺寸的图片。生产母图不进入运行时仓库；成品 PNG 使用整数倍显示并设置 `image-rendering: pixelated`。
