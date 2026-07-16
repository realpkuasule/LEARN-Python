# Python DragonQuest audio skins

本目录提供两套原创、可无缝切换的 16-bit 奇幻音频资源：

- `european/`：鲁特琴、长笛、钟琴、管风琴与战鼓质感。
- `chinese/`：古筝、笛/胡琴、木质打击与锣音质感。

两套皮肤使用完全相同的文件名与 cue id，每套包含 4 首循环 BGM 和 12 个短音效。音乐保持经典俯视角冒险的探索感，短音效保持掌机 RPG 所需的清晰、克制反馈；旋律、编配与合成波形均为本项目原创，没有采样或改编现有游戏音乐。

## 使用

资源索引见 `audio-manifest.json`。运行时只切换皮肤目录：

```ts
type AudioSkin = "european" | "chinese";

function audioAsset(skin: AudioSkin, file: string): string {
  return `/assets/audio/${skin}/${file}`;
}
```

例如世界地图音乐使用 `bgm/world-map-loop.ogg`，代码通过反馈使用 `sfx/code-success.ogg`。BGM 已按完整小节导出，播放器应设置 `loop = true`；建议初始音乐音量 `0.28`、音效音量 `0.55`，并遵守存档中的全局静音设置。

## Cue 清单

- BGM：`world-map`、`region-explore`、`dungeon`、`boss`
- SFX：`ui-move`、`ui-confirm`、`ui-cancel`、`dialog-open`、`quest-unlock`、`code-run`、`code-success`、`code-error`、`coin`、`equip`、`chest-open`、`dragon-roar`

## 重新生成

生成器只使用 Python 标准库进行合成，并调用 `ffmpeg` 编码浏览器可播放的 OGG：

```bash
python3 tools/generate_audio_assets.py
python3 tools/generate_audio_assets.py --check
```

## 授权与来源

这些音频由项目内的确定性程序合成器生成，不包含第三方录音、采样包或受保护游戏素材。可随本项目使用、修改和再分发；若项目另设整体许可证，以整体许可证为准。
