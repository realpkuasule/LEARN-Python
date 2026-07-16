import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterWorkbench } from "@/components/chapter-workbench";
import { readChapterDetail } from "@/server/chapter-service";

interface ChapterPageProperties {
  readonly params: Promise<{ chapterNumber: string }>;
}

export const generateMetadata = async ({ params }: ChapterPageProperties): Promise<Metadata> => {
  const { chapterNumber } = await params;
  const chapter = await readChapterDetail(Number(chapterNumber));
  return { title: chapter ? `第 ${chapter.number} 章：${chapter.title}` : "章节不存在" };
};

export default async function ChapterPage({ params }: ChapterPageProperties): Promise<React.ReactNode> {
  const { chapterNumber } = await params;
  const chapter = await readChapterDetail(Number(chapterNumber));
  if (!chapter) notFound();
  return <ChapterWorkbench chapter={chapter} />;
}
