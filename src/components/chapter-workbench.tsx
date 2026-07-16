"use client";

import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { EnvironmentBackdrop } from "@/components/environment-backdrop";
import { PixelSprite } from "@/components/pixel-sprite";
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
  const game = useGameStore(({ game }) => game);
  const completeChapter = useGameStore(({ completeChapter }) => completeChapter);
  const recordAttempt = useGameStore(({ recordAttempt }) => recordAttempt);
  const completed = game?.progress.completedChapters.includes(chapter.number) ?? false;
  const bossSprite = bossSpriteAsset(chapter.number);

  const run = async (): Promise<void> => {
    if (game) playSound("code-run", game.settings);
    setState("running");
    setOutput("正在召唤隔离的 Python 运行环境...");
    recordAttempt(chapter.exercise.id);
    try {
      const result = await submitExecution({ exerciseId: chapter.exercise.id, code, stdin });
      const detail = [result.message, result.stdout && `\n输出：\n${result.stdout}`, result.stderr && `\n错误：\n${result.stderr}`].filter(Boolean).join("");
      setOutput(`${detail}\n耗时：${result.durationMs}ms`);
      setState(result.status === "passed" ? "passed" : "failed");
      if (game) playSound(result.status === "passed" ? "code-success" : "code-error", game.settings);
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
        <button className="pixel-button w-full" disabled={state === "running"} onClick={() => void run()} type="button">
          {state === "running" ? "运行中..." : "运行并挑战"}
        </button>
        <section className={`result-panel ${state === "passed" ? "passed" : state === "failed" ? "failed" : ""}`} aria-live="polite">
          <h3>冒险日志</h3>
          <pre>{output}</pre>
        </section>
        {!game && <p className="status-error">当前没有勇者存档；代码仍可运行，但不会结算奖励。</p>}
      </aside>
    </main>
  );
};
