import { getExercise } from "../domain/chapter-catalog.ts";
import { evaluateExecution, type ExecutionResult, type RunnerResult } from "../domain/execution.ts";

const MAX_CODE_LENGTH = 20_000;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_PAYLOAD_TOO_LARGE = 413;

export interface ExecutionInput {
  readonly exerciseId: string;
  readonly code: string;
  readonly stdin?: string;
}

export type PythonRunner = (code: string, stdin?: string) => Promise<RunnerResult>;

export class ExerciseServiceError extends Error {
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

export const executeExercise = async (
  input: ExecutionInput,
  runPython: PythonRunner,
): Promise<ExecutionResult> => {
  const exercise = getExercise(input.exerciseId);
  if (!exercise) throw new ExerciseServiceError("练习不存在。", HTTP_NOT_FOUND, "EXERCISE_NOT_FOUND");
  if (!input.code.trim()) throw new ExerciseServiceError("代码不能为空。", HTTP_BAD_REQUEST, "EMPTY_CODE");
  if (input.code.length > MAX_CODE_LENGTH) {
    throw new ExerciseServiceError("代码不能超过 20,000 个字符。", HTTP_PAYLOAD_TOO_LARGE, "CODE_TOO_LARGE");
  }
  if ((input.stdin?.length ?? 0) > MAX_CODE_LENGTH) {
    throw new ExerciseServiceError("标准输入不能超过 20,000 个字符。", HTTP_PAYLOAD_TOO_LARGE, "STDIN_TOO_LARGE");
  }

  return evaluateExecution(await runPython(input.code, input.stdin), exercise.expectedOutput);
};
