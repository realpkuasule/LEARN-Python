import type { MetadataRoute } from "next";

import { CHAPTERS } from "@/domain/chapter-catalog";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/create-hero", "/map", "/hero", "/shop"];
  return [
    ...routes.map((route) => ({ url: new URL(route, SITE_URL).toString(), changeFrequency: "weekly" as const })),
    ...CHAPTERS.map(({ number }) => ({
      url: new URL(`/chapter/${number}`, SITE_URL).toString(),
      changeFrequency: "monthly" as const,
    })),
  ];
}
