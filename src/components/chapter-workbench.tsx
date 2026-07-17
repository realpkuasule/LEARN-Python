"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import { BossEncounter } from "@/components/boss-encounter";
import { AiSpellbook } from "@/components/ai-spellbook";
import { EnvironmentBackdrop } from "@/components/environment-backdrop";
import { StoryCourse } from "@/components/story-course";
import { getBossDialogue } from "@/domain/boss-dialogues";
import { getChapterHints } from "@/domain/chapter-hints";
import type { AiTutorExecutionContext } from "@/domain/ai-tutor";
import { HINT_POTION_ID, getEquipment } from "@/domain/equipment";
import { BOSS_COIN_BONUS, BOSS_EXP_BONUS, canAccessChapter } from "@/domain/game-state";
import { inventoryQuantity } from "@/domain/inventory";
import { submitExecution } from "@/lib/api-client";
import { playSound } from "@/lib/audio-assets";
import { chapterEnvironmentAsset, dragonBattleEnvironmentAsset, victoryCampEnvironmentAsset } from "@/lib/environment-assets";
import { bossSpriteAsset } from "@/lib/game-art-assets";
import type { ChapterDetail } from "@/server/chapter-service";
import { useGameStore } from "@/store/game-store";

interface ChapterWorkbenchProperties {
  readonly chapter: ChapterDetail;
}

const Editor = dynamic(() => import("@monaco-editor/react"), {
  loading: () => <div className="editor-loading" role="status">正在加载代码编辑器...</div>,
  ssr: false,
});

export const ChapterWorkbench = ({ chapter }: ChapterWorkbenchProperties): React.ReactNode => {
  const [code, setCode] = useState(chapter.exercise.starterCode);
  const [stdin, setStdin] = useState("");
  const [state, setState] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [output, setOutput] = useState("尚未运行。写完代码后接受挑战吧。");
  const [testsPassed, setTestsPassed] = useState(0);
  const [executionContext, setExecutionContext] = useState<AiTutorExecutionContext>();
  const [encounterComplete, setEncounterComplete] = useState(!chapter.isBoss);
  const [mobilePanel, setMobilePanel] = useState<"course" | "code">("course");
  const game = useGameStore(({ game }) => game);
  const hydrated = useGameStore(({ hydrated }) => hydrated);
  const completeChapter = useGameStore(({ completeChapter }) => completeChapter);
  const recordAttempt = useGameStore(({ recordAttempt }) => recordAttempt);
  const recordAiRequest = useGameStore(({ recordAiRequest }) => recordAiRequest);
  const consumeHintPotion = useGameStore(({ consumeHintPotion }) => consumeHintPotion);
  const completed = game?.progress.completedChapters.includes(chapter.number) ?? false;
  const bossSprite = bossSpriteAsset(chapter.number);
  const hasHiddenBossTests = chapter.isBoss && chapter.exercise.testCount > 1;
  const displayedTestsPassed = completed ? chapter.exercise.testCount : testsPassed;
  const bossHp = Math.max(chapter.exercise.testCount - displayedTestsPassed, 0);
  const bossRewardExp = chapter.rewardExp + BOSS_EXP_BONUS;
  const bossRewardCoins = chapter.rewardCoins + BOSS_COIN_BONUS;
  const chapterAccessible = !game || canAccessChapter(game, chapter.number);
  const hints = getChapterHints(chapter.number);
  const revealedHintCount = game?.progress.hintsRevealed[chapter.exercise.id] ?? 0;
  const hintPotionCount = game ? inventoryQuantity(game, HINT_POTION_ID) : 0;
  const dropNames = (chapter.dropItemIds ?? []).map((itemId) => getEquipment(itemId)?.name).filter(Boolean);
  const bossDialogue = chapter.isBoss ? getBossDialogue(chapter.number) : undefined;
  const showBossEncounter = Boolean(hydrated && bossDialogue && chapterAccessible && !completed && !encounterComplete);
  const sceneAsset = chapter.number === 17 && (encounterComplete || completed)
    ? dragonBattleEnvironmentAsset()
    : chapterEnvironmentAsset(chapter.number);

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
      const executionMessage = `${detail}\n耗时：${result.durationMs}ms`;
      setOutput(executionMessage);
      setExecutionContext({ status: result.status, message: executionMessage });
      setState(result.status === "passed" ? "passed" : "failed");
      if (game) playSound(result.status === "passed" ? (chapter.isBoss ? "quest-unlock" : "code-success") : "code-error", game.settings);
      if (result.status === "passed") completeChapter(chapter.number);
    } catch (error) {
      const message = error instanceof Error ? error.message : "运行失败，请稍后重试。";
      setState("failed");
      if (game) playSound("code-error", game.settings);
      setOutput(message);
      setExecutionContext({ status: "error", message });
    }
  };

  const revealHint = (): void => {
    if (!game) return;
    try {
      consumeHintPotion(chapter.exercise.id);
      playSound("chest-open", game.settings);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "提示暂时无法使用。");
    }
  };

  return (
    <main className={`chapter-layout view-${mobilePanel}`} id="main-content">
      <nav aria-label="章节移动端视图" className="chapter-mobile-tabs">
        <button aria-pressed={mobilePanel === "course"} className="pixel-button secondary" onClick={() => setMobilePanel("course")} type="button">课程内容</button>
        <button aria-pressed={mobilePanel === "code"} className="pixel-button secondary" onClick={() => setMobilePanel("code")} type="button">代码挑战</button>
      </nav>
      <article className="course-scroll pixel-panel">
        <StoryCourse
          battleState={state}
          bossSprite={bossSprite}
          chapter={chapter}
          completed={completed || state === "passed"}
          heroAvatarId={game?.hero.avatarId ?? 1}
          heroName={game?.hero.name ?? "刘老三"}
          onRequestChallenge={() => setMobilePanel("code")}
          reducedMotion={game?.settings.reducedMotion ?? false}
          sceneAsset={sceneAsset}
        />
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
        {showBossEncounter && bossDialogue ? (
          <BossEncounter
            bossName={chapter.bossName ?? "Boss"}
            dialogue={bossDialogue}
            onComplete={() => {
              setEncounterComplete(true);
              if (game) playSound("ui-confirm", game.settings);
            }}
          />
        ) : (
          <>
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
        {(state === "failed" || revealedHintCount > 0) && (
          <section className="hint-panel" aria-label="分级提示">
            <div className="boss-status-heading">
              <h3>提示药水</h3>
              <span>背包 {hintPotionCount} · 已解锁 {revealedHintCount}/3</span>
            </div>
            {revealedHintCount > 0 && (
              <ol>
                {hints.slice(0, revealedHintCount).map((hint, index) => <li key={hint}>第 {index + 1} 级：{hint}</li>)}
              </ol>
            )}
            {revealedHintCount < hints.length && (
              game
                ? hintPotionCount > 0
                  ? <button className="pixel-button secondary mt-3" onClick={revealHint} type="button">使用 1 瓶并解锁下一级</button>
                  : <Link className="pixel-button secondary mt-3" href="/shop">前往商店购买 · 1 金币</Link>
                : <Link className="pixel-button secondary mt-3" href="/create-hero">创建勇者后使用提示</Link>
            )}
          </section>
        )}
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
              {dropNames.map((name) => <span key={name}>首件掉落「{name}」</span>)}
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
        {chapter.number === 17 && (completed || state === "passed") && (
          <section className="final-victory pixel-panel" aria-label="最终通关画面">
            <div className="final-victory-scene">
              <EnvironmentBackdrop alt="击败恶龙后的胜利营地" sizes="(max-width: 1023px) calc(100vw - 52px), 58vw" src={victoryCampEnvironmentAsset()} />
            </div>
            <p className="eyebrow">17/17 · 冒险完成</p>
            <h3>赤帝之子凯旋</h3>
            <p>两千年前，刘邦斩白蛇，提三尺剑取天下。两千年后，{game?.hero.name ?? "勇者"}斩白帝之子，用 17 章 Python 征服代码世界。祖宗用剑，你用 print()。时代变了。</p>
            <Link className="pixel-button mt-3" href="/hero">查看通关角色卡</Link>
          </section>
        )}
          </>
        )}
      </aside>
      <AiSpellbook
        aiRequestCount={game?.achievements.aiRequests ?? 0}
        chapterCompleted={completed || state === "passed"}
        chapterNumber={chapter.number}
        code={code}
        execution={executionContext}
        exerciseId={chapter.exercise.id}
        onReplyComplete={recordAiRequest}
      />
    </main>
  );
};
