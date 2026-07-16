export interface ExerciseAssessment {
  readonly codeSuffix?: string;
  readonly expectedOutput: string;
}

const ASSESSMENTS: Readonly<Record<string, readonly ExerciseAssessment[]>> = {
  "chapter-01-final": [{ expectedOutput: "我准备好了" }],
  "chapter-02-final": [{ expectedOutput: "Hello, Python!" }],
  "chapter-03-final": [{ expectedOutput: "刘老三" }],
  "chapter-04-final": [{ expectedOutput: "200" }],
  "chapter-05-final": [
    { codeSuffix: "print(battle_result(18))", expectedOutput: "继续" },
    { codeSuffix: "print(battle_result(0))", expectedOutput: "胜利" },
    { codeSuffix: "print(battle_result(-7))", expectedOutput: "胜利" },
  ],
  "chapter-06-final": [{ expectedOutput: "1\n2\n3" }],
  "chapter-07-final": [{ expectedOutput: "1\n2\n3" }],
  "chapter-08-final": [{ expectedOutput: "10" }],
  "chapter-09-final": [{ expectedOutput: "存活" }],
  "chapter-10-final": [{ expectedOutput: "回复药\n木剑\n龙鳞" }],
  "chapter-11-final": [{ expectedOutput: "刘老三 100" }],
  "chapter-12-final": [{ expectedOutput: "PYTHON HERO" }],
  "chapter-13-final": [{ expectedOutput: "击败恶龙" }],
  "chapter-14-final": [{ expectedOutput: ".json" }],
  "chapter-15-final": [{ expectedOutput: "魔法失效" }],
  "chapter-16-final": [{ expectedOutput: "[500, 800]" }],
  "chapter-17-final": [{ expectedOutput: "恶龙 5000" }],
};

export const getExerciseAssessment = (exerciseId: string): readonly ExerciseAssessment[] | undefined => (
  ASSESSMENTS[exerciseId]
);
