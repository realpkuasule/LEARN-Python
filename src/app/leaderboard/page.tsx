import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "排行榜" };

export default function LeaderboardPage(): React.ReactNode {
  return (
    <main className="page-container" id="main-content">
      <section className="pixel-panel mx-auto max-w-3xl p-8 text-center">
        <p className="eyebrow">Phase 3 · 联网功能</p>
        <h1 className="mt-3 text-4xl">全服勇者榜尚未开放</h1>
        <p className="muted mx-auto mt-5 max-w-xl">当前版本的学习进度只保存在本机。排行榜将在账号、数据库和隐私方案确认后开放，不会用虚构数据冒充真实玩家。</p>
        <Link className="pixel-button mt-8" href="/map">继续本地冒险</Link>
      </section>
    </main>
  );
}
