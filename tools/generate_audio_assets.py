#!/usr/bin/env python3
"""Generate the original European/Chinese fantasy audio skins."""

from __future__ import annotations

import argparse
import json
import math
import random
import shutil
import struct
import subprocess
import tempfile
import wave
from array import array
from dataclasses import dataclass
from functools import cache
from pathlib import Path


SAMPLE_RATE = 44_100
MASTER_PEAK = 0.72
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "audio"
STYLES = ("european", "chinese")


@dataclass(frozen=True)
class MusicSpec:
    cue: str
    title: str
    bpm: int
    bars: int
    root: int
    scale: tuple[int, ...]
    progression: tuple[int, ...]
    motif: tuple[int | None, ...]

    @property
    def duration(self) -> float:
        return self.bars * 4 * 60 / self.bpm


MUSIC: dict[str, tuple[MusicSpec, ...]] = {
    "european": (
        MusicSpec("world-map", "Rune Road", 96, 8, 50, (0, 2, 3, 5, 7, 9, 10), (0, -4, 3, -2), (0, 2, 4, 3, 2, 1, 0, None, 2, 3, 5, 4, 3, 2, 1, None)),
        MusicSpec("region-explore", "Brassleaf Trail", 112, 8, 55, (0, 2, 4, 5, 7, 9, 11), (0, 5, -2, 3), (0, 1, 2, 4, 3, 2, 1, None, 2, 4, 5, 4, 2, 1, 0, None)),
        MusicSpec("dungeon", "The Indented Crypt", 76, 8, 50, (0, 1, 3, 5, 7, 8, 10), (0, 1, -2, 0), (0, None, 1, 0, 3, None, 2, 1, 0, None, -1, 0, 2, 1, 0, None)),
        MusicSpec("boss", "Red Syntax Wyrm", 148, 8, 50, (0, 2, 3, 5, 7, 8, 11), (0, 3, -2, 1), (0, 0, 4, 3, 2, 1, 0, 5, 4, 3, 6, 5, 4, 2, 1, 0)),
    ),
    "chinese": (
        MusicSpec("world-map", "云篆山河", 88, 8, 50, (0, 2, 4, 7, 9), (0, -5, 2, -3), (0, 2, 3, 4, 3, 2, 1, None, 2, 4, 3, 2, 1, 0, 1, None)),
        MusicSpec("region-explore", "竹径寻符", 104, 8, 55, (0, 2, 4, 7, 9), (0, 2, -3, -5), (0, 1, 2, 4, 3, 2, 1, None, 2, 3, 4, 3, 2, 0, 1, None)),
        MusicSpec("dungeon", "玄门空栈", 72, 8, 45, (0, 1, 3, 5, 7, 10), (0, 1, -2, 0), (0, None, 2, 1, 0, None, -1, 0, 3, None, 2, 1, 0, -1, 0, None)),
        MusicSpec("boss", "烬鳞龙王", 138, 8, 50, (0, 3, 5, 7, 10, 11), (0, 3, -2, 1), (0, 0, 3, 2, 1, 4, 3, 0, 2, 2, 5, 4, 3, 1, 0, -1)),
    ),
}

SFX: tuple[tuple[str, str, float], ...] = (
    ("ui-move", "Move selection", 0.12),
    ("ui-confirm", "Confirm", 0.24),
    ("ui-cancel", "Cancel", 0.22),
    ("dialog-open", "Open dialog", 0.34),
    ("quest-unlock", "Quest unlocked", 1.10),
    ("code-run", "Run code", 0.45),
    ("code-success", "Code passed", 1.25),
    ("code-error", "Code error", 0.48),
    ("coin", "Collect coin", 0.45),
    ("equip", "Equip item", 0.55),
    ("chest-open", "Open chest", 1.00),
    ("dragon-roar", "Dragon roar", 1.60),
)


class Mix:
    def __init__(self, duration: float, seed: str) -> None:
        self.duration = duration
        self.frames = round(duration * SAMPLE_RATE)
        self.left = array("f", [0.0]) * self.frames
        self.right = array("f", [0.0]) * self.frames
        self.random = random.Random(seed)

    def add_note(
        self,
        start: float,
        duration: float,
        midi: int,
        volume: float,
        instrument: str,
        pan: float = 0.0,
    ) -> None:
        first = max(0, round(start * SAMPLE_RATE))
        last = min(self.frames, round((start + duration) * SAMPLE_RATE))
        if last <= first:
            return

        frequency = 440 * 2 ** ((midi - 69) / 12)
        attack = min(0.06, duration * 0.18)
        release = min(0.12, duration * 0.28)
        pan = max(-1.0, min(1.0, pan))
        left_gain = math.sqrt((1 - pan) / 2)
        right_gain = math.sqrt((1 + pan) / 2)

        for frame in range(first, last):
            elapsed = frame / SAMPLE_RATE - start
            remaining = duration - elapsed
            envelope = min(1.0, elapsed / max(attack, 0.001), remaining / max(release, 0.001))
            phase = 2 * math.pi * frequency * elapsed
            value = self._tone(instrument, phase, elapsed, duration, frequency)
            sample = value * envelope * volume
            self.left[frame] += sample * left_gain
            self.right[frame] += sample * right_gain

    def _tone(self, instrument: str, phase: float, elapsed: float, duration: float, frequency: float) -> float:
        vibrato = 0.0
        if instrument in {"flute", "dizi", "erhu"}:
            vibrato = 0.018 * math.sin(2 * math.pi * 5.2 * elapsed)
            phase += vibrato * phase

        if instrument == "flute":
            return 0.82 * math.sin(phase) + 0.14 * math.sin(2 * phase) + 0.04 * math.sin(3 * phase)
        if instrument == "dizi":
            breath = self.random.uniform(-1, 1) * 0.025
            return 0.70 * math.sin(phase) + 0.20 * math.sin(2 * phase) + 0.08 * math.sin(3 * phase) + breath
        if instrument == "erhu":
            return 0.68 * math.sin(phase) + 0.22 * math.sin(2 * phase) + 0.10 * math.sin(3 * phase)
        if instrument in {"lute", "guzheng"}:
            brightness = 0.34 if instrument == "lute" else 0.48
            decay = math.exp(-elapsed * (3.0 if instrument == "lute" else 3.8) / max(duration, 0.08))
            transient = self.random.uniform(-1, 1) * math.exp(-35 * elapsed) * 0.08
            return decay * (0.72 * math.sin(phase) + brightness * math.sin(2 * phase) + 0.12 * math.sin(3 * phase)) + transient
        if instrument == "organ":
            return 0.62 * math.sin(phase) + 0.25 * math.sin(2 * phase) + 0.13 * math.sin(4 * phase)
        if instrument == "pad":
            return 0.70 * math.sin(phase) + 0.20 * math.sin(phase * 0.5) + 0.10 * math.sin(2 * phase)
        if instrument == "bass":
            return 2 / math.pi * math.asin(math.sin(phase))
        if instrument == "pulse":
            return 0.72 if math.sin(phase) >= 0 else -0.72
        if instrument == "bell":
            return math.exp(-3.5 * elapsed / max(duration, 0.05)) * (
                0.58 * math.sin(phase) + 0.27 * math.sin(2.01 * phase) + 0.15 * math.sin(3.97 * phase)
            )
        return math.sin(phase)

    def add_kick(self, start: float, volume: float = 0.32) -> None:
        length = 0.22
        first = round(start * SAMPLE_RATE)
        last = min(self.frames, first + round(length * SAMPLE_RATE))
        for frame in range(max(first, 0), last):
            elapsed = (frame - first) / SAMPLE_RATE
            phase = 2 * math.pi * (78 * elapsed - 45 * elapsed * elapsed)
            sample = math.sin(phase) * math.exp(-18 * elapsed) * volume
            self.left[frame] += sample * 0.7
            self.right[frame] += sample * 0.7

    def add_noise_hit(self, start: float, duration: float, volume: float, metallic: bool = False) -> None:
        first = round(start * SAMPLE_RATE)
        last = min(self.frames, first + round(duration * SAMPLE_RATE))
        previous = 0.0
        for frame in range(max(first, 0), last):
            elapsed = (frame - first) / SAMPLE_RATE
            noise = self.random.uniform(-1, 1)
            high = noise - previous * (0.88 if metallic else 0.55)
            previous = noise
            carrier = math.sin(2 * math.pi * (180 if metallic else 110) * elapsed)
            sample = (high * 0.72 + carrier * 0.28) * math.exp(-elapsed * 18 / max(duration, 0.05)) * volume
            self.left[frame] += sample * 0.68
            self.right[frame] += sample * 0.72

    def add_gong(self, start: float, volume: float = 0.18, duration: float = 1.4) -> None:
        for midi, gain in ((45, 0.55), (52, 0.28), (57, 0.17)):
            self.add_note(start, duration, midi, volume * gain, "bell", pan=(midi - 52) / 18)

    def add_roar(self, start: float, duration: float, eastern: bool) -> None:
        first = round(start * SAMPLE_RATE)
        last = min(self.frames, first + round(duration * SAMPLE_RATE))
        smooth = 0.0
        base = 105 if eastern else 82
        for frame in range(max(first, 0), last):
            elapsed = (frame - first) / SAMPLE_RATE
            progress = elapsed / duration
            smooth = smooth * 0.92 + self.random.uniform(-1, 1) * 0.08
            frequency = base * (1.18 - 0.45 * progress) + 9 * math.sin(2 * math.pi * 7 * elapsed)
            growl = math.sin(2 * math.pi * frequency * elapsed + 1.4 * smooth)
            rasp = math.tanh((growl + smooth * 1.7) * 2.2)
            envelope = math.sin(math.pi * min(progress, 1.0)) ** 0.55
            sample = rasp * envelope * 0.42
            self.left[frame] += sample * (0.70 + 0.08 * math.sin(elapsed * 8))
            self.right[frame] += sample * (0.70 - 0.08 * math.sin(elapsed * 8))

    def write_wav(self, path: Path) -> None:
        peak = max(max(map(abs, self.left), default=0.0), max(map(abs, self.right), default=0.0), 0.001)
        gain = MASTER_PEAK / peak
        with wave.open(str(path), "wb") as output:
            output.setnchannels(2)
            output.setsampwidth(2)
            output.setframerate(SAMPLE_RATE)
            chunk = bytearray()
            for left, right in zip(self.left, self.right, strict=True):
                chunk.extend(struct.pack("<hh", round(left * gain * 32767), round(right * gain * 32767)))
                if len(chunk) >= 262_144:
                    output.writeframesraw(chunk)
                    chunk.clear()
            output.writeframes(chunk)


def scale_note(spec: MusicSpec, degree: int, octave: int = 0) -> int:
    scale_size = len(spec.scale)
    octave_shift, index = divmod(degree, scale_size)
    return spec.root + spec.scale[index] + 12 * (octave + octave_shift)


def render_music(style: str, spec: MusicSpec) -> Mix:
    beat = 60 / spec.bpm
    mix = Mix(spec.duration, f"{style}:{spec.cue}")
    chinese = style == "chinese"
    lead = "dizi" if chinese and spec.cue != "dungeon" else "erhu" if chinese else "flute"
    pluck = "guzheng" if chinese else "lute"
    if spec.cue == "dungeon" and not chinese:
        lead = "organ"
    if spec.cue == "boss" and not chinese:
        lead = "pulse"

    for bar in range(spec.bars):
        start_beat = bar * 4
        chord_root = spec.root + spec.progression[bar % len(spec.progression)]
        chord = (chord_root, chord_root + (4 if chinese else 3), chord_root + 7)
        if spec.cue != "boss":
            for index, note in enumerate(chord):
                mix.add_note(start_beat * beat, 3.85 * beat, note, 0.055, "pad", pan=(index - 1) * 0.45)

        bass_steps = (0, 2) if spec.cue != "boss" else (0, 1, 2, 3)
        for bass_step in bass_steps:
            mix.add_note((start_beat + bass_step) * beat, 0.72 * beat, chord_root - 12, 0.12, "bass", pan=-0.08)

        arp_pattern = (0, 2, 1, 2, 0, 2, 1, 2)
        for step, chord_index in enumerate(arp_pattern):
            mix.add_note(
                (start_beat + step * 0.5) * beat,
                0.42 * beat,
                chord[chord_index] + 12,
                0.075 if spec.cue != "dungeon" else 0.045,
                pluck,
                pan=-0.38 if step % 2 == 0 else 0.38,
            )

        if spec.cue in {"region-explore", "boss"}:
            for drum_beat in (0, 2) if spec.cue == "region-explore" else (0, 1.5, 2, 3):
                mix.add_kick((start_beat + drum_beat) * beat, 0.22 if chinese else 0.28)
            for drum_beat in (1, 3):
                mix.add_noise_hit((start_beat + drum_beat) * beat, 0.16, 0.09, metallic=chinese)
        elif spec.cue == "dungeon":
            mix.add_kick(start_beat * beat, 0.20)

        if chinese and bar % 4 == 0:
            mix.add_gong(start_beat * beat, 0.13 if spec.cue != "boss" else 0.18, min(1.2, 3.5 * beat))
        elif not chinese and bar % 4 == 0:
            mix.add_note(start_beat * beat, 1.2 * beat, chord_root + 24, 0.055, "bell", pan=0.22)

    steps = spec.bars * 8
    for step in range(steps):
        degree = spec.motif[step % len(spec.motif)]
        if degree is None:
            continue
        phrase = step // len(spec.motif)
        variation = 1 if phrase % 4 == 2 and degree >= 0 else 0
        octave = 1 if spec.cue in {"world-map", "region-explore"} else 0
        note = scale_note(spec, degree + variation, octave)
        mix.add_note(step * 0.5 * beat, 0.43 * beat, note, 0.13, lead, pan=0.18 * math.sin(step * 0.9))

    return mix


def add_chime(mix: Mix, notes: tuple[int, ...], instrument: str, spacing: float, volume: float = 0.22) -> None:
    for index, note in enumerate(notes):
        mix.add_note(index * spacing, min(0.48, mix.duration - index * spacing), note, volume, instrument, pan=(index % 3 - 1) * 0.28)


def render_sfx(style: str, cue: str, duration: float) -> Mix:
    mix = Mix(duration, f"{style}:{cue}")
    chinese = style == "chinese"
    pluck = "guzheng" if chinese else "lute"
    bell = "bell"

    if cue == "ui-move":
        mix.add_note(0, duration, 76 if chinese else 72, 0.20, pluck)
    elif cue == "ui-confirm":
        add_chime(mix, (74, 79) if chinese else (72, 76), pluck, 0.07, 0.23)
    elif cue == "ui-cancel":
        add_chime(mix, (72, 67) if chinese else (69, 65), pluck, 0.08, 0.20)
    elif cue == "dialog-open":
        add_chime(mix, (62, 69, 74) if chinese else (60, 64, 67), pluck, 0.075, 0.18)
    elif cue == "quest-unlock":
        add_chime(mix, (62, 66, 69, 74, 78) if chinese else (60, 64, 67, 72, 76), bell, 0.13, 0.20)
        if chinese:
            mix.add_gong(0.36, 0.15, 0.7)
    elif cue == "code-run":
        add_chime(mix, (62, 64, 67, 71) if chinese else (55, 60, 64, 67), pluck, 0.065, 0.19)
    elif cue == "code-success":
        add_chime(mix, (62, 66, 69, 74, 78, 81) if chinese else (60, 64, 67, 72, 76, 79), bell, 0.13, 0.20)
        mix.add_note(0.62, 0.55, 50 if chinese else 48, 0.09, "pad")
    elif cue == "code-error":
        add_chime(mix, (62, 61, 58) if chinese else (55, 54, 51), "pulse", 0.105, 0.16)
        mix.add_noise_hit(0.03, 0.18, 0.08, metallic=chinese)
    elif cue == "coin":
        add_chime(mix, (81, 86, 90) if chinese else (84, 88, 91), bell, 0.08, 0.18)
    elif cue == "equip":
        mix.add_noise_hit(0, 0.22, 0.14, metallic=True)
        add_chime(mix, (62, 69) if chinese else (52, 59), pluck, 0.13, 0.18)
    elif cue == "chest-open":
        add_chime(mix, (50, 57, 62, 66, 69) if chinese else (48, 55, 60, 64, 67), pluck, 0.12, 0.20)
        mix.add_noise_hit(0, 0.28, 0.10, metallic=not chinese)
    elif cue == "dragon-roar":
        mix.add_roar(0, duration, eastern=chinese)
        if chinese:
            mix.add_gong(0.12, 0.12, 1.2)
    else:
        raise ValueError(f"Unknown sound effect: {cue}")

    return mix


@cache
def ogg_encoder() -> tuple[str, ...]:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        raise RuntimeError("ffmpeg is required to encode the browser-ready OGG files")
    encoders = subprocess.run(
        [ffmpeg, "-hide_banner", "-encoders"], check=True, capture_output=True, text=True
    ).stdout
    if "libvorbis" in encoders:
        return ffmpeg, "-c:a", "libvorbis"
    if " vorbis " in encoders:
        return ffmpeg, "-strict", "-2", "-c:a", "vorbis"
    raise RuntimeError("ffmpeg has no Vorbis encoder; install a build with libvorbis or native vorbis")


def encode_ogg(source: Path, target: Path) -> None:
    encoder = ogg_encoder()
    subprocess.run(
        [*encoder[:1], "-hide_banner", "-loglevel", "error", "-y", "-i", str(source), *encoder[1:], "-q:a", "5", str(target)],
        check=True,
    )


def write_manifest() -> None:
    manifest = {
        "version": 1,
        "license": "Original project assets; see README.md",
        "defaults": {"musicVolume": 0.28, "sfxVolume": 0.55},
        "skins": {style: f"/assets/audio/{style}" for style in STYLES},
        "music": [
            {
                "id": spec.cue,
                "file": f"bgm/{spec.cue}-loop.ogg",
                "loop": True,
                "title": {
                    style: next(item.title for item in MUSIC[style] if item.cue == spec.cue) for style in STYLES
                },
                "bpm": {style: next(item.bpm for item in MUSIC[style] if item.cue == spec.cue) for style in STYLES},
                "durationSeconds": {
                    style: round(next(item.duration for item in MUSIC[style] if item.cue == spec.cue), 3) for style in STYLES
                },
            }
            for spec in MUSIC["european"]
        ],
        "sfx": [
            {"id": cue, "file": f"sfx/{cue}.ogg", "durationSeconds": duration, "label": label}
            for cue, label, duration in SFX
        ],
    }
    (OUTPUT / "audio-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="python-dragonquest-audio-") as temporary:
        temp = Path(temporary)
        for style in STYLES:
            for category in ("bgm", "sfx"):
                (OUTPUT / style / category).mkdir(parents=True, exist_ok=True)

            for spec in MUSIC[style]:
                wav = temp / f"{style}-{spec.cue}.wav"
                render_music(style, spec).write_wav(wav)
                encode_ogg(wav, OUTPUT / style / "bgm" / f"{spec.cue}-loop.ogg")

            for cue, _, duration in SFX:
                wav = temp / f"{style}-{cue}.wav"
                render_sfx(style, cue, duration).write_wav(wav)
                encode_ogg(wav, OUTPUT / style / "sfx" / f"{cue}.ogg")

    write_manifest()


def check() -> None:
    manifest_path = OUTPUT / "audio-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    expected = {
        OUTPUT / style / entry["file"]
        for style in STYLES
        for group in ("music", "sfx")
        for entry in manifest[group]
    }
    missing = sorted(str(path.relative_to(ROOT)) for path in expected if not path.is_file() or path.stat().st_size == 0)
    if missing:
        raise RuntimeError(f"Missing or empty audio assets: {', '.join(missing)}")
    print(f"OK: {len(expected)} audio files and manifest are present")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate generated files without regenerating them")
    args = parser.parse_args()
    check() if args.check else generate()


if __name__ == "__main__":
    main()
