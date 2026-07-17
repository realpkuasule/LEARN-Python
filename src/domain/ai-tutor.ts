export type AiTutorMode = "tutor" | "collaborate";

export interface AiTutorExecutionContext {
  readonly status: "passed" | "failed" | "error" | "timeout";
  readonly message: string;
}

export interface AiTutorRequest {
  readonly chapterNumber: number;
  readonly exerciseId: string;
  readonly question: string;
  readonly code: string;
  readonly execution?: AiTutorExecutionContext;
  readonly chapterCompleted: boolean;
}

export interface AiTutorContext extends AiTutorRequest {
  readonly mode: AiTutorMode;
  readonly chapter: {
    readonly number: number;
    readonly title: string;
  };
  readonly exercise: {
    readonly id: string;
    readonly title: string;
    readonly instructions: string;
  };
}

export type AiTutorProvider = (context: AiTutorContext) => AsyncIterable<string>;

export type AiTutorEvent =
  | { readonly type: "meta"; readonly mode: AiTutorMode }
  | { readonly type: "delta"; readonly content: string }
  | { readonly type: "done" }
  | { readonly type: "error"; readonly message: string };
