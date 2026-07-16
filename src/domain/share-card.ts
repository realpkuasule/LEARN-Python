import { getEffectiveStats } from "./equipment.ts";
import type { GameState, Stats } from "./game-state.ts";

export interface ShareCardDetails {
  readonly name: string;
  readonly level: number;
  readonly title: string;
  readonly completedChapters: number;
  readonly totalExp: number;
  readonly stats: Stats;
}

export const shareCardDetails = (state: GameState): ShareCardDetails => ({
  name: state.hero.name,
  level: state.hero.level,
  title: state.hero.title || "见习勇者",
  completedChapters: state.progress.completedChapters.length,
  totalExp: state.hero.totalExp,
  stats: getEffectiveStats(state),
});
