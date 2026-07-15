import { listChapterSummaries } from "@/server/chapter-service";

export const GET = (): Response => Response.json({ chapters: listChapterSummaries() });
