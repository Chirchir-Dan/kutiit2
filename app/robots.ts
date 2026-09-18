// app/robots.ts

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/"]
      },
      {
        userAgent: "GPTBot",
        disallow: "/dictionary"
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/dictionary"
      },
      {
        userAgent: "Google-Extended",
        disallow: "/dictionary"
      },
      {
        userAgent: "CCBot",
        disallow: "/dictionary"
      }
    ],
    sitemap: "https://kutiit.vercel.app/sitemap.xml"
  };
}