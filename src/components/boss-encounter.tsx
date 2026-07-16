"use client";

import { useRef, useState } from "react";

import type { BossDialogue } from "@/domain/boss-dialogues";

interface BossEncounterProperties {
  readonly bossName: string;
  readonly dialogue: BossDialogue;
  readonly onComplete: () => void;
}

export const BossEncounter = ({ bossName, dialogue, onComplete }: BossEncounterProperties): React.ReactNode => {
  const [selected, setSelected] = useState(0);
  const [response, setResponse] = useState("");
  const [ready, setReady] = useState(false);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (step: number): void => {
    const next = (selected + step + dialogue.options.length) % dialogue.options.length;
    setSelected(next);
    buttons.current[next]?.focus();
  };

  const choose = (index: number): void => {
    const option = dialogue.options[index];
    setSelected(index);
    setResponse(option.response);
    setReady(option.correct);
  };

  return (
    <section
      aria-label={`${bossName} 登场对话`}
      className="boss-encounter"
      onKeyDown={(event) => {
        const insideOptions = (event.target as HTMLElement).closest(".boss-dialogue-options");
        if (insideOptions && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
          event.preventDefault();
          move(event.key === "ArrowDown" ? 1 : -1);
          return;
        }
        if (insideOptions && event.key === "Enter") {
          event.preventDefault();
          choose(selected);
        }
      }}
    >
      <p className="eyebrow">Boss 登场 · 上下键选择，Enter 确认</p>
      <h3>{bossName}</h3>
      <blockquote>“{dialogue.opening}”</blockquote>
      <div className="boss-dialogue-options" role="group" aria-label="选择回复">
        {dialogue.options.map((option, index) => (
          <button
            aria-pressed={selected === index}
            className="pixel-button secondary"
            key={option.label}
            onClick={() => choose(index)}
            onFocus={() => setSelected(index)}
            ref={(element) => { buttons.current[index] = element; }}
            tabIndex={selected === index ? 0 : -1}
            type="button"
          >
            {selected === index ? "▶ " : ""}{option.label}
          </button>
        ))}
      </div>
      {response && <p className={ready ? "status-success" : "status-error"} role="status">{response}</p>}
      {ready && <button className="pixel-button mt-3 w-full" onClick={onComplete} type="button">结束对话，接受代码试炼</button>}
    </section>
  );
};
