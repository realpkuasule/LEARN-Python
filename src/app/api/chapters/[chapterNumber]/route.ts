import { readChapterDetail } from "@/server/chapter-service";

interface RouteContext {
  readonly params: Promise<{ chapterNumber: string }>;
}

export const GET = async (_request: Request, { params }: RouteContext): Promise<Response> => {
  const { chapterNumber } = await params;
  const chapter = await readChapterDetail(Number(chapterNumber));
  if (chapter) return Response.json(chapter);

  return Response.json(
    { status: 404, code: "CHAPTER_NOT_FOUND", message: "章节不存在。" },
    { status: 404, headers: { "content-type": "application/problem+json" } },
  );
};
