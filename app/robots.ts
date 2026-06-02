import type { MetadataRoute } from "next";

const SITE_URL = "https://www.replacedbyai.ro";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/portal/",
          "/login",
          "/intake/",
          "/rezultate/quiz",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
