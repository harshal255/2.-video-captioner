import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://novacaption-ai.vercel.app";

  const pages = [
    { loc: "", changefreq: "daily", priority: "1.0" },
    { loc: "/about", changefreq: "weekly", priority: "0.8" },
    { loc: "/contact", changefreq: "monthly", priority: "0.6" },
    { loc: "/faq", changefreq: "weekly", priority: "0.8" },
    { loc: "/privacy", changefreq: "monthly", priority: "0.4" },
    { loc: "/sitemap", changefreq: "weekly", priority: "0.5" }
  ];

  const currentDate = new Date().toISOString().split("T")[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xmlContent.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
