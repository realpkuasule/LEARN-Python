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
  "chapter-06-final": [
    { codeSuffix: "print(turn_sequence(0))", expectedOutput: "[]" },
    { codeSuffix: "print(turn_sequence(1))", expectedOutput: "[1]" },
    { codeSuffix: "print(turn_sequence(4))", expectedOutput: "[1, 2, 3, 4]" },
  ],
  "chapter-07-final": [
    { codeSuffix: "print(countdown(0))", expectedOutput: "[]" },
    { codeSuffix: "print(countdown(1))", expectedOutput: "[1]" },
    { codeSuffix: "print(countdown(4))", expectedOutput: "[4, 3, 2, 1]" },
  ],
  "chapter-08-final": [{ expectedOutput: "10" }],
  "chapter-09-final": [
    { codeSuffix: "print(battle_result(20))", expectedOutput: "存活" },
    { codeSuffix: "print(battle_result(0))", expectedOutput: "阵亡" },
    { codeSuffix: "print(battle_result(-4))", expectedOutput: "阵亡" },
  ],
  "chapter-10-final": [
    { codeSuffix: "items = ['回复药', '回复药', '铁剑', '回复药']\nprint(organize_inventory(items), items)", expectedOutput: "['回复药', '铁剑'] ['回复药', '回复药', '铁剑', '回复药']" },
    { codeSuffix: "items = ['龙鳞', '木剑', '龙鳞', '木剑', '金币']\nprint(organize_inventory(items), items)", expectedOutput: "['龙鳞', '木剑', '金币'] ['龙鳞', '木剑', '龙鳞', '木剑', '金币']" },
    { codeSuffix: "items = []\nprint(organize_inventory(items), items)", expectedOutput: "[] []" },
  ],
  "chapter-11-final": [
    { codeSuffix: "print(hero_summary({'name': '刘老三', 'hp': 100}))", expectedOutput: "刘老三 100" },
    { codeSuffix: "print(hero_summary({'hp': 0, 'name': '法师李四'}))", expectedOutput: "法师李四 0" },
    { codeSuffix: "print(hero_summary({'name': '恶龙', 'hp': 5000, 'atk': 120}))", expectedOutput: "恶龙 5000" },
  ],
  "chapter-12-final": [
    { codeSuffix: "print(clean_dialog('  你好！！欢迎来到...勇者公会...  '))", expectedOutput: "你好！欢迎来到。勇者公会。" },
    { codeSuffix: "print(clean_dialog('危险！！！快跑...'))", expectedOutput: "危险！快跑。" },
    { codeSuffix: "print(clean_dialog('任务完成。'))", expectedOutput: "任务完成。" },
  ],
  "chapter-13-final": [{ expectedOutput: "击败恶龙" }],
  "chapter-14-final": [
    { codeSuffix: "print(file_suffix('save.json'))", expectedOutput: ".json" },
    { codeSuffix: "print(file_suffix('archive.tar.gz'))", expectedOutput: ".gz" },
    { codeSuffix: "print(file_suffix('README'))", expectedOutput: "" },
  ],
  "chapter-15-final": [
    { codeSuffix: "print(safe_divide(10, 2))", expectedOutput: "5.0" },
    { codeSuffix: "print(safe_divide(1, 0))", expectedOutput: "魔法失效" },
    { codeSuffix: "print(safe_divide(9, -3))", expectedOutput: "-3.0" },
  ],
  "chapter-16-final": [{ expectedOutput: "[500, 800]" }],
  "chapter-17-final": [
    {
      codeSuffix: "from dataclasses import is_dataclass\nmonster = Monster('恶龙', 5000, 50)\nprint(is_dataclass(Monster), Monster.__annotations__.get('name') is str, Monster.__annotations__.get('hp') is int, Monster.__annotations__.get('defense') is int, battle_turn(monster, 120))",
      expectedOutput: "True True True True 恶龙 4930",
    },
    {
      codeSuffix: "monster = Monster('岩石巨人', 10, 99)\nprint(battle_turn(monster, 1))",
      expectedOutput: "岩石巨人 9",
    },
    {
      codeSuffix: "monster = Monster('史莱姆', 8, 2)\nprint(battle_turn(monster, 20))",
      expectedOutput: "史莱姆 0",
    },
  ],
};

export const getExerciseAssessment = (exerciseId: string): readonly ExerciseAssessment[] | undefined => (
  ASSESSMENTS[exerciseId]
);
