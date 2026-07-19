"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";

const GLOBAL_TOUR_STORAGE_KEY = "python-dragonquest:onboarding-complete";
const CHAPTER_TOUR_STORAGE_KEY = "python-dragonquest:chapter-onboarding-complete";
const TARGET_PADDING = 8;

type TourStep = Readonly<{
  target?: string;
  title: string;
  description: string;
}>;

const GLOBAL_TOUR_STEPS: readonly TourStep[] = [
  {
    title: "欢迎来到 Python 冒险世界",
    description: "这里的路线很简单：选择任务、阅读剧情、写下代码，再运行挑战。四步认识界面后就可以出发。",
  },
  {
    target: '[data-tour="main-navigation"]',
    title: "从地图选择任务",
    description: "地图是冒险入口；角色、商店和排行榜会记录你的成长。完成章节后，新的区域会逐步开放。",
  },
  {
    target: '[data-tour="hero-status"]',
    title: "查看勇者状态",
    description: "这里显示等级、金币和当前角色，也可以随时开关音效。还没有勇者时，先完成角色创建。",
  },
  {
    title: "读剧情，然后亲手运行代码",
    description: "进入章节后，左侧学习知识，右侧完成练习。运行结果会直接告诉你下一步该修改什么。",
  },
] as const;

const CHAPTER_TOUR_STEPS: readonly TourStep[] = [
  {
    title: "这是你的章节工作台",
    description: "每章都按同一条路线进行：先读剧情和知识点，再到代码区完成任务，最后根据运行反馈继续修改。",
  },
  {
    target: '[data-tour="chapter-story"]',
    title: "先读剧情与知识点",
    description: "课程会把 Python 知识放进冒险剧情。按顺序阅读；遇到实践检查点时，右侧代码挑战会解锁对应任务。",
  },
  {
    target: '[data-tour="chapter-editor"]',
    title: "在这里编写 Python",
    description: "按照任务要求修改代码。编辑器会保留本章的起始代码，你只需要完成缺少的部分。",
  },
  {
    target: '[data-tour="chapter-run"]',
    title: "运行代码接受挑战",
    description: "写完后点击运行。普通练习会检查输出，Boss 关卡还会使用隐藏测试验证你的代码。",
  },
  {
    target: '[data-tour="chapter-log"]',
    title: "从冒险日志继续改进",
    description: "成功结果、报错和测试反馈都会出现在这里。没有通过也没关系，按日志提示修改后再次运行。",
  },
] as const;

interface TourProperties {
  readonly autoStart?: boolean;
  readonly launcherLabel?: string;
  readonly onStepChange?: (stepIndex: number) => void;
  readonly steps: readonly TourStep[];
  readonly storageKey: string;
}

type TargetRect = Readonly<{
  top: number;
  left: number;
  width: number;
  height: number;
}>;

const isTourComplete = (storageKey: string): boolean => {
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
};

const markTourComplete = (storageKey: string): void => {
  try {
    window.localStorage.setItem(storageKey, "true");
  } catch {
    return;
  }
};

const Tour = ({ autoStart = true, launcherLabel, onStepChange, steps, storageKey }: TourProperties): ReactNode => {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!autoStart || isTourComplete(storageKey)) return;
    onStepChange?.(0);
    setStepIndex(0);
  }, [autoStart, onStepChange, storageKey]);

  const step = stepIndex === null ? null : steps[stepIndex];

  useEffect(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }

    const targetSelector = step.target;
    const updateTargetRect = (): void => {
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const top = Math.max(TARGET_PADDING, rect.top - TARGET_PADDING);
      const left = Math.max(TARGET_PADDING, rect.left - TARGET_PADDING);
      const right = Math.min(window.innerWidth - TARGET_PADDING, rect.right + TARGET_PADDING);
      const bottom = Math.min(window.innerHeight - TARGET_PADDING, rect.bottom + TARGET_PADDING);
      setTargetRect({ top, left, width: right - left, height: bottom - top });
    };

    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [step]);

  useEffect(() => {
    if (stepIndex !== null) dialogRef.current?.focus();
  }, [stepIndex]);

  const closeTour = (): void => {
    markTourComplete(storageKey);
    setStepIndex(null);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  };

  const openStep = (nextStepIndex: number): void => {
    onStepChange?.(nextStepIndex);
    setStepIndex(nextStepIndex);
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      closeTour();
      return;
    }

    if (event.key !== "Tab") return;
    const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    if (buttons.length === 0) return;

    const firstButton = buttons[0];
    const lastButton = buttons.at(-1);
    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton?.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton.focus();
    }
  };

  return (
    <>
      {launcherLabel ? (
        <button
          className="audio-toggle tour-launcher"
          onClick={() => openStep(0)}
          ref={launcherRef}
          type="button"
        >
          {launcherLabel}
        </button>
      ) : null}
      {step && stepIndex !== null ? (
        <>
          <div
            aria-hidden="true"
            className={`onboarding-shade ${targetRect ? "" : "is-solid"}`}
          />
          {targetRect ? (
            <div
              aria-hidden="true"
              className="onboarding-focus"
              style={targetRect}
            />
          ) : null}
          <section
            aria-describedby="onboarding-description"
            aria-labelledby="onboarding-title"
            aria-modal="true"
            className={`onboarding-card pixel-panel ${targetRect ? "" : "is-centered"}`}
            key={stepIndex}
            onKeyDown={handleDialogKeyDown}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <p className="onboarding-kicker">新手任务 {stepIndex + 1} / {steps.length}</p>
            <h2 id="onboarding-title">{step.title}</h2>
            <p className="muted" id="onboarding-description">{step.description}</p>
            <div aria-label={`教程进度：第 ${stepIndex + 1} 步，共 ${steps.length} 步`} className="onboarding-progress" role="progressbar">
              {steps.map((tourStep, index) => (
                <span className={index <= stepIndex ? "is-complete" : ""} key={tourStep.title} />
              ))}
            </div>
            <div className="onboarding-actions">
              <div>
                {stepIndex > 0 ? (
                  <button className="pixel-button secondary" onClick={() => openStep(stepIndex - 1)} type="button">上一步</button>
                ) : null}
              </div>
              <div>
                {stepIndex < steps.length - 1 ? (
                  <button className="pixel-button secondary" onClick={closeTour} type="button">跳过</button>
                ) : null}
                <button
                  className="pixel-button"
                  onClick={() => stepIndex === steps.length - 1 ? closeTour() : openStep(stepIndex + 1)}
                  type="button"
                >
                  {stepIndex === steps.length - 1 ? "完成指引" : "下一步"}
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
};

export const OnboardingTour = ({ autoStart = true }: Readonly<{ autoStart?: boolean }>): ReactNode => (
  <Tour
    autoStart={autoStart}
    launcherLabel="新手指引"
    steps={GLOBAL_TOUR_STEPS}
    storageKey={GLOBAL_TOUR_STORAGE_KEY}
  />
);

export const ChapterOnboardingTour = ({ onStepChange }: Readonly<{ onStepChange: (stepIndex: number) => void }>): ReactNode => (
  <Tour
    onStepChange={onStepChange}
    steps={CHAPTER_TOUR_STEPS}
    storageKey={CHAPTER_TOUR_STORAGE_KEY}
  />
);
