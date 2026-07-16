"use client";

import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { EnvironmentBackdrop } from "@/components/environment-backdrop";
import { PixelSprite } from "@/components/pixel-sprite";
import { BOSS_COIN_BONUS, BOSS_EXP_BONUS, canAccessChapter } from "@/domain/game-state";
import { submitExecution } from "@/lib/api-client";
import { playSound } from "@/lib/audio-assets";
import { chapterEnvironmentAsset } from "@/lib/environment-assets";
import { bossSpriteAsset } from "@/lib/game-art-assets";
import type { ChapterDetail } from "@/server/chapter-service";
import { useGameStore } from "@/store/game-store";

interface ChapterWorkbenchProperties {
  readonly chapter: ChapterDetail;
}

export const ChapterWorkbench = ({ chapter }: ChapterWorkbenchProperties): React.ReactNode => {
  const [code, setCode] = useState(chapter.exercise.starterCode);
  const [stdin, setStdin] = useState("");
  const [state, setState] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [output, setOutput] = useState("尚未运行。写完代码后接受挑战吧。");
  const [testsPassed, setTestsPassed] = useState(0);
  const game = useGameStore(({ game }) => game);
  const hydrated = useGameStore(({ hydrated }) => hydrated);
  const completeChapter = useGameStore(({ completeChapter }) => completeChapter);
  const recordAttempt = useGameStore(({ recordAttempt }) => recordAttempt);
  const completed = game?.progress.completedChapters.includes(chapter.number) ?? false;
  const bossSprite = bossSpriteAsset(chapter.number);
  const hasHiddenBossTests = chapter.isBoss && chapter.exercise.testCount > 1;
  const displayedTestsPassed = completed ? chapter.exercise.testCount : testsPassed;
  const bossHp = Math.max(chapter.exercise.testCount - displayedTestsPassed, 0);
  const bossRewardExp = chapter.rewardExp + BOSS_EXP_BONUS;
  const bossRewardCoins = chapter.rewardCoins + BOSS_COIN_BONUS;
  const chapterAccessible = !game || canAccessChapter(game, chapter.number);

  const run = async (): Promise<void> => {
    if (!hydrated || !chapterAccessible) return;
    if (game) playSound(chapter.isBoss ? "dragon-roar" : "code-run", game.settings);
    setState("running");
    setTestsPassed(0);
    setOutput("正在召唤隔离的 Python 运行环境...");
    recordAttempt(chapter.exercise.id);
    try {
      const result = await submitExecution({ exerciseId: chapter.exercise.id, code, stdin });
      setTestsPassed(result.testsPassed);
      const detail = [result.message, result.stdout && `\n输出：\n${result.stdout}`, result.stderr && `\n错误：\n${result.stderr}`].filter(Boolean).join("");
      setOutput(`${detail}\n耗时：${result.durationMs}ms`);
      setState(result.status === "passed" ? "passed" : "failed");
      if (game) playSound(result.status === "passed" ? (chapter.isBoss ? "quest-unlock" : "code-success") : "code-error", game.settings);
      if (result.status === "passed") completeChapter(chapter.number);
    } catch (error) {
      setState("failed");
      if (game) playSound("code-error", game.settings);
      setOutput(error instanceof Error ? error.message : "运行失败，请稍后重试。");
    }
  };

  return (
    <main className="chapter-layout" id="main-content">
      <article className="course-scroll pixel-panel">
        <div className="chapter-scene">
          <EnvironmentBackdrop
            alt={`第 ${chapter.number} 章地点：${chapter.location}`}
            priority
            sizes="(max-width: 1023px) calc(100vw - 52px), 42vw"
            src={chapterEnvironmentAsset(chapter.number)}
          />
          {bossSprite && (
            <PixelSprite
              alt={`第 ${chapter.number} 章 Boss 像素立绘`}
              className="chapter-boss-sprite"
              size={192}
              sprite={bossSprite}
            />
          )}
        </div>
        <header className="chapter-heading">
          <div>
            <p className="eyebrow">第 {chapter.number} 章 · {chapter.location}</p>
            <h1>{chapter.title}</h1>
          </div>
          <Link className="pixel-button secondary" href="/map">返回地图</Link>
        </header>
        <div className="course-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.contentMarkdown}</ReactMarkdown>
        </div>
      </article>

      <aside className="mission-scroll pixel-panel" aria-label="编程挑战">
        <div className="mission-heading">
          <div>
            <p className="eyebrow">本章挑战</p>
            <h2>{chapter.exercise.title}</h2>
          </div>
          <span className={completed || state === "passed" ? "status-success" : "muted"}>
            {completed || state === "passed" ? "已通关" : "待挑战"}
          </span>
        </div>
        {hasHiddenBossTests && (
          <section className={`boss-status ${bossHp === 0 ? "defeated" : ""}`} aria-label="Boss 战斗状态">
            <div className="boss-status-heading">
              <div>
                <p className="eyebrow">BOSS · 隐藏测试试炼</p>
                <h3>{chapter.bossName}</h3>
              </div>
              <strong>{bossHp}/{chapter.exercise.testCount} HP</strong>
            </div>
            <progress
              aria-label={`Boss 剩余生命 ${bossHp}/${chapter.exercise.testCount}`}
              className="boss-health-bar"
              max={chapter.exercise.testCount}
              value={bossHp}
            />
            <p>{displayedTestsPassed}/{chapter.exercise.testCount} 组隐藏测试已通过</p>
          </section>
        )}
        <p className="mission-copy">{chapter.exercise.instructions}</p>
        <div className="editor-frame" aria-label="Python 代码编辑器">
          <Editor
            height="42vh"
            language="python"
            onChange={(value) => setCode(value ?? "")}
            options={{ fontSize: 15, minimap: { enabled: false }, padding: { top: 14 }, scrollBeyondLastLine: false }}
            theme="vs-dark"
            value={code}
          />
        </div>
        <label className="mb-2 block text-accent" htmlFor="exercise-stdin">标准输入（可选）</label>
        <textarea
          className="pixel-input mb-4 min-h-20 resize-y font-mono"
          id="exercise-stdin"
          maxLength={20_000}
          onChange={(event) => setStdin(event.target.value)}
          placeholder="如果程序使用 input()，在这里填写输入；多行内容按行提供。"
          value={stdin}
        />
        <button className="pixel-button w-full" disabled={!hydrated || !chapterAccessible || state === "running"} onClick={() => void run()} type="button">
          {!hydrated
            ? "读取存档..."
            : !chapterAccessible
              ? "章节尚未解锁"
              : state === "running" ? "运行中..." : chapter.isBoss ? "发动代码攻击" : "运行并挑战"}
        </button>
        <section className={`result-panel ${state === "passed" ? "passed" : state === "failed" ? "failed" : ""}`} aria-live="polite">
          <h3>冒险日志</h3>
          <pre>{output}</pre>
        </section>
        {hasHiddenBossTests && (
          <section className={`boss-rewards ${completed ? "settled" : ""}`} aria-label="Boss 胜利奖励">
            <div className="boss-status-heading">
              <h3>胜利奖励</h3>
              <span>{completed ? "已结算" : "待领取"}</span>
            </div>
            <div className="boss-reward-grid">
              <span>EXP +{bossRewardExp}</span>
              <span>金币 +{bossRewardCoins}</span>
              {chapter.titleReward && <span>称号「{chapter.titleReward}」</span>}
            </div>
            <p>{completed
              ? "奖励只结算一次，下一章已经解锁。"
              : state === "passed" && !game
                ? "挑战已通过，但没有勇者存档，奖励尚未结算。"
                : `${chapter.exercise.testCount} 组隐藏测试全部通过后自动结算。`}</p>
          </section>
        )}
        {hydrated && game && !chapterAccessible && <p className="status-error">请先完成上一章，再回来挑战这里。</p>}
        {hydrated && !game && <p className="status-error">当前没有勇者存档；代码仍可运行，但不会结算奖励。</p>}
      </aside>
    </main>
  );
};
