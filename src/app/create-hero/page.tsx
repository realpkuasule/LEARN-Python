"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PixelAvatar } from "@/components/pixel-avatar";
import { useGameStore } from "@/store/game-store";

export default function CreateHeroPage(): React.ReactNode {
  const router = useRouter();
  const createHero = useGameStore(({ createHero }) => createHero);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState(1);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    try {
      createHero(name, avatarId);
      router.push("/map");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法创建勇者");
    }
  };

  return (
    <main className="page-container" id="main-content">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">冒险者登记</p>
        <h1 className="mt-3 text-4xl">创建你的像素勇者</h1>
        <form className="pixel-panel mt-8 space-y-8 p-6 md:p-8" onSubmit={submit}>
          <div>
            <label className="mb-3 block text-accent" htmlFor="hero-name">勇者姓名</label>
            <input
              aria-describedby="name-help name-error"
              className="pixel-input"
              id="hero-name"
              maxLength={16}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：刘老三"
              value={name}
            />
            <p className="muted mt-2" id="name-help">1-16 个字符，可以稍后通过导入存档更换。</p>
            {error && <p className="status-error mt-2" id="name-error" role="alert">{error}</p>}
          </div>
          <fieldset>
            <legend className="mb-4 text-accent">选择头像</legend>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((id) => (
                <button
                  aria-label={`选择头像 ${id}`}
                  aria-pressed={avatarId === id}
                  className="hero-avatar-choice pixel-panel grid min-h-24 place-items-center p-3"
                  key={id}
                  onClick={() => setAvatarId(id)}
                  type="button"
                >
                  <PixelAvatar avatarId={id} />
                </button>
              ))}
            </div>
          </fieldset>
          <button className="pixel-button w-full" type="submit">开始冒险</button>
        </form>
      </div>
    </main>
  );
}
