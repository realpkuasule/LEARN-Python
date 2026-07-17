import { getChapter } from "../domain/chapter-catalog.ts";
import type {
  AiTutorContext,
  AiTutorExecutionContext,
  AiTutorMode,
  AiTutorProvider,
  AiTutorRequest,
} from "../domain/ai-tutor.ts";

const MAX_QUESTION_LENGTH = 2_000;
const MAX_CODE_LENGTH = 20_000;
const MAX_EXECUTION_MESSAGE_LENGTH = 4_000;
const MAX_EXECUTION_EXCERPT_LENGTH = 240;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_PAYLOAD_TOO_LARGE = 413;
const REQUEST_KEYS = new Set(["chapterNumber", "exerciseId", "question", "code", "execution", "chapterCompleted"]);
const EXECUTION_KEYS = new Set(["status", "message"]);
const EXECUTION_STATUSES = new Set(["passed", "failed", "error", "timeout"]);

export class AiTutorServiceError extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(
    message: string,
    status: number,
    code: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null && !Array.isArray(value)
);

const rejectUnknownKeys = (value: Record<string, unknown>, allowed: ReadonlySet<string>): void => {
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new AiTutorServiceError("请求包含未知字段。", HTTP_BAD_REQUEST, "UNKNOWN_FIELD");
  }
};

const parseExecution = (value: unknown): AiTutorExecutionContext | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new AiTutorServiceError("execution 必须是对象。", HTTP_BAD_REQUEST, "INVALID_EXECUTION");
  }
  rejectUnknownKeys(value, EXECUTION_KEYS);
  if (typeof value.status !== "string" || !EXECUTION_STATUSES.has(value.status)
    || typeof value.message !== "string" || !value.message.trim()) {
    throw new AiTutorServiceError("execution 状态或消息无效。", HTTP_BAD_REQUEST, "INVALID_EXECUTION");
  }
  if (value.message.length > MAX_EXECUTION_MESSAGE_LENGTH) {
    throw new AiTutorServiceError(
      "运行消息不能超过 4,000 个字符。",
      HTTP_PAYLOAD_TOO_LARGE,
      "EXECUTION_MESSAGE_TOO_LARGE",
    );
  }
  return { status: value.status as AiTutorExecutionContext["status"], message: value.message };
};

const parseRequest = (value: unknown): AiTutorRequest => {
  if (!isRecord(value)) throw new AiTutorServiceError("请求体必须是对象。", HTTP_BAD_REQUEST, "INVALID_REQUEST");
  rejectUnknownKeys(value, REQUEST_KEYS);
  if (!Number.isInteger(value.chapterNumber)
    || typeof value.exerciseId !== "string"
    || typeof value.question !== "string"
    || typeof value.code !== "string"
    || typeof value.chapterCompleted !== "boolean") {
    throw new AiTutorServiceError(
      "章节、练习、问题、代码和通关状态格式无效。",
      HTTP_BAD_REQUEST,
      "INVALID_REQUEST",
    );
  }
  const question = value.question.trim();
  if (!question) throw new AiTutorServiceError("问题不能为空。", HTTP_BAD_REQUEST, "EMPTY_QUESTION");
  if (question.length > MAX_QUESTION_LENGTH) {
    throw new AiTutorServiceError("问题不能超过 2,000 个字符。", HTTP_PAYLOAD_TOO_LARGE, "QUESTION_TOO_LARGE");
  }
  if (value.code.length > MAX_CODE_LENGTH) {
    throw new AiTutorServiceError("代码不能超过 20,000 个字符。", HTTP_PAYLOAD_TOO_LARGE, "CODE_TOO_LARGE");
  }
  return {
    chapterNumber: value.chapterNumber as number,
    exerciseId: value.exerciseId,
    question,
    code: value.code,
    execution: parseExecution(value.execution),
    chapterCompleted: value.chapterCompleted,
  };
};

const fakeAiTutorProvider: AiTutorProvider = async function* (context) {
  const response = context.mode === "tutor"
    ? context.execution
      ? `公会导师（演示）：先看最后一次冒险日志：${context.execution.message.slice(0, MAX_EXECUTION_EXCERPT_LENGTH)}。定位报错位置，再对照「${context.exercise.title}」的输入、处理和输出逐步修改。通关前我只给线索，不直接给完整答案。`
      : `公会导师（演示）：先把「${context.exercise.title}」拆成输入、处理和输出三步，再检查当前代码缺的是哪一步。通关前我只给线索，不直接给完整答案。`
    : `公会导师（演示）：协作模式已开启。围绕「${context.question}」，先说明你希望保留的输入和输出，再做一个最小扩展，并运行本章练习验证没有破坏原有行为。`;
  for (const chunk of response.match(/[\s\S]{1,24}/g) ?? []) yield chunk;
};

export const createAiTutorSession = (
  input: unknown,
  provider: AiTutorProvider = fakeAiTutorProvider,
): { readonly mode: AiTutorMode; readonly chunks: AsyncIterable<string> } => {
  const request = parseRequest(input);
  const chapter = getChapter(request.chapterNumber);
  if (!chapter) throw new AiTutorServiceError("章节不存在。", HTTP_NOT_FOUND, "CHAPTER_NOT_FOUND");
  if (chapter.exercise.id !== request.exerciseId) {
    throw new AiTutorServiceError("练习与章节不匹配。", HTTP_BAD_REQUEST, "EXERCISE_MISMATCH");
  }
  const mode: AiTutorMode = request.chapterCompleted ? "collaborate" : "tutor";
  const context: AiTutorContext = {
    ...request,
    mode,
    chapter: { number: chapter.number, title: chapter.title },
    exercise: {
      id: chapter.exercise.id,
      title: chapter.exercise.title,
      instructions: chapter.exercise.instructions,
    },
  };
  return { mode, chunks: provider(context) };
};
