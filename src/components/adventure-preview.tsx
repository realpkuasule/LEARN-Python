import type { ChapterViewState } from "@/domain/map-view";
import { worldMapEnvironmentAsset } from "@/lib/environment-assets";
import { chapterNodeSpriteAsset, guiSpriteAsset } from "@/lib/game-art-assets";

import { EnvironmentBackdrop } from "./environment-backdrop";
import { PixelSprite } from "./pixel-sprite";

const PREVIEW_ICON_SIZE = 56;

const PREVIEW_NODES: readonly {
  readonly chapter: number;
  readonly label: string;
  readonly state: ChapterViewState;
}[] = [
  { chapter: 1, label: "公会", state: "current" },
  { chapter: 2, label: "训练场", state: "locked" },
  { chapter: 5, label: "试炼洞穴", state: "locked" },
];

export const AdventurePreview = (): React.ReactNode => (
  <section aria-label="世界地图与任务卡预览" className="adventure-preview pixel-panel">
    <EnvironmentBackdrop priority sizes="(max-width: 1023px) 100vw, 46vw" src={worldMapEnvironmentAsset()} />
    <header className="adventure-preview-heading">
      <div>
        <p className="eyebrow">启程之地</p>
        <h2>从第一章出发</h2>
      </div>
      <PixelSprite sprite={guiSpriteAsset("python-rune")} />
    </header>

    <ol aria-label="章节路线预览" className="preview-route">
      {PREVIEW_NODES.map(({ chapter, label, state }) => (
        <li className={`preview-node ${state}`} key={chapter}>
          <PixelSprite size={PREVIEW_ICON_SIZE} sprite={chapterNodeSpriteAsset(state)} />
          <span>第 {chapter} 章</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>

    <article className="preview-quest pixel-panel">
      <PixelSprite sprite={guiSpriteAsset("quest")} />
      <div>
        <p className="text-accent">当前任务</p>
        <h3>写下冒险宣言</h3>
        <p className="muted">使用 print 输出：我准备好了</p>
      </div>
    </article>
  </section>
);
