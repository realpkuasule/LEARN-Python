import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSET_ROOT = path.join(ROOT, "public/assets/environments");
const OUTPUT_WIDTH = 640;
const OUTPUT_HEIGHT = 360;
const GRID_COLUMNS = 2;
const GRID_ROWS = 2;
const EXPECTED_SCENE_COUNT = 20;

const ATLASES = [
  {
    file: "chapters-01-04.png",
    scenes: [
      ["chapter-01-guild-hall", "冒险者公会"],
      ["chapter-02-training-yard", "训练场"],
      ["chapter-03-character-shrine", "角色祭坛"],
      ["chapter-04-weapon-shop", "武器店"],
    ],
  },
  {
    file: "chapters-05-08.png",
    scenes: [
      ["chapter-05-trial-cave", "试炼洞穴"],
      ["chapter-06-treasure-vault", "宝藏库"],
      ["chapter-07-arena", "竞技场"],
      ["chapter-08-magic-academy", "魔法学院"],
    ],
  },
  {
    file: "chapters-09-12.png",
    scenes: [
      ["chapter-09-guild-headquarters", "公会总部"],
      ["chapter-10-great-warehouse", "大仓库"],
      ["chapter-11-wisdom-temple", "智慧神殿"],
      ["chapter-12-bard-tavern", "吟游诗人酒馆"],
    ],
  },
  {
    file: "chapters-13-16.png",
    scenes: [
      ["chapter-13-ancient-library", "古代图书馆"],
      ["chapter-14-cathedral-save-hall", "大教堂存档厅"],
      ["chapter-15-abyss-rift", "深渊裂隙"],
      ["chapter-16-alchemy-workshop", "炼金工房"],
    ],
  },
  {
    file: "chapter-17-and-extras.png",
    scenes: [
      ["chapter-17-dragon-nest", "恶龙之巢"],
      ["dragon-battle-arena", "最终龙战场"],
      ["world-map", "世界地图"],
      ["victory-camp", "终章营地"],
    ],
  },
];

const THEMES = ["european", "chinese"];

async function processAtlas(theme, atlas) {
  const sourcePath = path.join(ASSET_ROOT, theme, "source", atlas.file);
  const source = sharp(sourcePath);
  const metadata = await source.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read atlas dimensions: ${sourcePath}`);
  }

  const cellWidth = Math.floor(metadata.width / GRID_COLUMNS);
  const cellHeight = Math.floor(metadata.height / GRID_ROWS);
  const outputDirectory = path.join(ASSET_ROOT, theme, "scenes");
  await mkdir(outputDirectory, { recursive: true });

  return Promise.all(
    atlas.scenes.map(async ([id, name], index) => {
      const column = index % GRID_COLUMNS;
      const row = Math.floor(index / GRID_COLUMNS);
      const left = column * cellWidth;
      const top = row * cellHeight;
      const width = column === GRID_COLUMNS - 1 ? metadata.width - left : cellWidth;
      const height = row === GRID_ROWS - 1 ? metadata.height - top : cellHeight;
      const outputPath = path.join(outputDirectory, `${id}.png`);

      const cell = await sharp(sourcePath)
        .extract({ left, top, width, height })
        .toBuffer();

      await sharp(cell)
        .trim({ background: "#000000", threshold: 12 })
        .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "cover", kernel: "nearest" })
        .png()
        .toFile(outputPath);

      return {
        id,
        name,
        path: `/assets/environments/${theme}/scenes/${id}.png`,
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT,
      };
    }),
  );
}

async function themeExists(theme) {
  try {
    await access(path.join(ASSET_ROOT, theme, "source", ATLASES[0].file));
    return true;
  } catch {
    return false;
  }
}

async function validateTheme(theme, scenes) {
  if (scenes.length !== EXPECTED_SCENE_COUNT) {
    throw new Error(`${theme} has ${scenes.length} scenes; expected ${EXPECTED_SCENE_COUNT}`);
  }

  await Promise.all(
    scenes.map(async ({ id }) => {
      const file = path.join(ASSET_ROOT, theme, "scenes", `${id}.png`);
      const metadata = await sharp(file).metadata();
      if (metadata.width !== OUTPUT_WIDTH || metadata.height !== OUTPUT_HEIGHT) {
        throw new Error(`${file} has invalid dimensions`);
      }
    }),
  );
}

async function main() {
  const availableThemes = [];
  const scenesByTheme = {};

  for (const theme of THEMES) {
    if (!(await themeExists(theme))) continue;

    availableThemes.push(theme);
    const scenes = (
      await Promise.all(ATLASES.map((atlas) => processAtlas(theme, atlas)))
    ).flat();
    await validateTheme(theme, scenes);
    scenesByTheme[theme] = scenes;
  }

  if (availableThemes.length === 0) {
    throw new Error(`No environment atlases found in ${ASSET_ROOT}`);
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    availableThemes,
    dimensions: { width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT },
    scenesByTheme,
  };

  await writeFile(
    path.join(ASSET_ROOT, "environment-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(`Processed ${availableThemes.join(", ")} environment atlases.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
