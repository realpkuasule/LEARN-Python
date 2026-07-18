"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { AiTutorExecutionContext, AiTutorMode } from "@/domain/ai-tutor";
import { streamAiTutorReply } from "@/lib/api-client";

interface AiSpellbookProperties {
  readonly aiRequestCount: number;
  readonly chapterCompleted: boolean;
  readonly chapterNumber: number;
  readonly code: string;
  readonly execution?: AiTutorExecutionContext;
  readonly exerciseId: string;
  readonly onReplyComplete: () => void;
}

interface SpellbookMessage {
  readonly id: string;
  readonly role: "learner" | "assistant";
  readonly content: string;
}

const QUICK_QUESTION = "请根据我的代码和冒险日志，给我下一步提示。";

export const AiSpellbook = ({
  aiRequestCount,
  chapterCompleted,
  chapterNumber,
  code,
  execution,
  exerciseId,
  onReplyComplete,
}: AiSpellbookProperties): React.ReactNode => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<readonly SpellbookMessage[]>([]);
  const [confirmedMode, setConfirmedMode] = useState<AiTutorMode | null>(null);
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);
  useEffect(() => () => abort.current?.abort(), []);

  const openDialog = (): void => {
    if (!dialog.current?.open) dialog.current?.showModal();
    setOpen(true);
  };

  const closeDialog = (): void => dialog.current?.close();

  const send = async (rawQuestion: string, appendLearner = true): Promise<void> => {
    const prompt = rawQuestion.trim();
    if (!prompt || status === "streaming") return;
    const assistantId = crypto.randomUUID();
    const nextMessages: SpellbookMessage[] = [];
    if (appendLearner) nextMessages.push({ id: crypto.randomUUID(), role: "learner", content: prompt });
    nextMessages.push({ id: assistantId, role: "assistant", content: "" });
    setMessages((current) => [...current, ...nextMessages]);
    setQuestion("");
    setLastQuestion(prompt);
    setError("");
    setStatus("streaming");
    setConfirmedMode(null);
    abort.current = new AbortController();
    let completed = false;
    try {
      await streamAiTutorReply({
        chapterNumber,
        exerciseId,
        question: prompt,
        code,
        execution,
        chapterCompleted,
      }, (event) => {
        if (event.type === "meta") setConfirmedMode(event.mode);
        if (event.type === "delta") {
          setMessages((current) => current.map((message) => message.id === assistantId
            ? { ...message, content: message.content + event.content }
            : message));
        }
        if (event.type === "done") completed = true;
      }, abort.current.signal);
      if (!completed) throw new Error("AI 魔法书的回应意外中断。");
      setStatus("idle");
      onReplyComplete();
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "AI 魔法书暂时无法回应。");
      setStatus("error");
    } finally {
      abort.current = null;
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void send(question);
  };

  const mode = confirmedMode ?? (chapterCompleted ? "collaborate" : "tutor");

  return (
    <>
      <button
        aria-controls="ai-spellbook-dialog"
        aria-expanded={open}
        className="ai-spellbook-trigger"
        onClick={openDialog}
        ref={trigger}
        type="button"
      >
        <span aria-hidden="true" className="ai-spellbook-rune">AI</span>
        AI 魔法书
      </button>
      <dialog
        aria-labelledby="ai-spellbook-title"
        className="ai-spellbook-dialog"
        id="ai-spellbook-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          closeDialog();
        }}
        ref={dialog}
      >
        <header className="ai-spellbook-header">
          <div>
            <p>冒险者公会 · DeepSeek V4 Flash</p>
            <h2 id="ai-spellbook-title">AI 魔法书</h2>
          </div>
          <button aria-label="关闭 AI 魔法书" className="ai-spellbook-close" onClick={closeDialog} type="button">×</button>
        </header>
        <div className="ai-spellbook-mode">
          <strong>{mode === "tutor" ? "辅导模式" : "协作模式"}</strong>
          <span>{mode === "tutor" ? "只给线索，不直接给完整答案" : "本章已通关，可以讨论扩展方案"}</span>
          <span>提问会将本章代码和最近运行日志发送至 DeepSeek</span>
          <small>已完成对话 {aiRequestCount} 次</small>
        </div>
        <div aria-live="polite" className="ai-spellbook-feed" ref={feed}>
          {messages.length === 0 && (
            <section className="ai-spellbook-empty">
              <h3>导师已经读取本章上下文</h3>
              <p>提问时会附带当前章节、练习代码和最近一次运行日志。</p>
              <button className="story-text-button" onClick={() => setQuestion(QUICK_QUESTION)} type="button">使用推荐问题</button>
            </section>
          )}
          {messages.map((message) => (
            <article className={`ai-message ${message.role}`} key={message.id}>
              <strong>{message.role === "learner" ? "勇者" : "公会导师"}</strong>
              {message.role === "assistant"
                ? message.content
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  : <p>魔法文字正在浮现……</p>
                : <p>{message.content}</p>}
            </article>
          ))}
          {status === "error" && (
            <section className="ai-spellbook-error" role="alert">
              <p>{error}</p>
              <button className="story-text-button" onClick={() => void send(lastQuestion, false)} type="button">重试本次提问</button>
            </section>
          )}
        </div>
        <form className="ai-spellbook-form" onSubmit={submit}>
          <label htmlFor="ai-spellbook-question">向公会导师提问</label>
          <textarea
            disabled={status === "streaming"}
            id="ai-spellbook-question"
            maxLength={2_000}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例如：为什么我的循环没有停止？"
            required
            value={question}
          />
          <button className="pixel-button" disabled={!question.trim() || status === "streaming"} type="submit">
            {status === "streaming" ? "导师回应中…" : "发送问题"}
          </button>
        </form>
      </dialog>
    </>
  );
};
