import type { ChapterViewState } from "@/domain/map-view";
import { chapterNodeAsset, guiAsset } from "@/lib/gui-assets";

import { PixelIcon } from "./pixel-icon";

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
    <header className="adventure-preview-heading">
      <div>
        <p className="eyebrow">启程之地</p>
        <h2>从第一章出发</h2>
      </div>
      <PixelIcon src={guiAsset("icon-python-rune")} />
    </header>

    <ol aria-label="章节路线预览" className="preview-route">
      {PREVIEW_NODES.map(({ chapter, label, state }) => (
        <li className={`preview-node ${state}`} key={chapter}>
          <PixelIcon size={PREVIEW_ICON_SIZE} src={chapterNodeAsset(state)} />
          <span>第 {chapter} 章</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>

    <article className="preview-quest pixel-panel">
      <PixelIcon src={guiAsset("icon-quest")} />
      <div>
        <p className="text-accent">当前任务</p>
        <h3>写下冒险宣言</h3>
        <p className="muted">使用 print 输出：我准备好了</p>
      </div>
    </article>
  </section>
);
