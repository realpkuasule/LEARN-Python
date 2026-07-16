# Python Dragon Quest v2 visual assets

`art-manifest.json` is the committed final-asset inventory for the two planned cultural themes. The current application uses the European theme; the Chinese theme is ready for a future theme-state contract.

- `game-art/<theme>/*-v2.png`: processed PNG atlases with alpha transparency.
- `gui/<theme>/*-v2.png`: processed GUI atlases with alpha transparency.
- `*-source.png`: local production input for reprocessing, intentionally excluded from the runtime repository.

Environment atlases are processed into `/assets/environments/<theme>/scenes/` and listed in `environment-manifest.json`.
