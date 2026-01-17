import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kursus.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private dashboard areas
          "/parent/",
          "/teacher/",
          "/student/",
          "/admin/",
          // Auth pages (no need to index)
          "/onboarding/",
          "/reset-password/",
          // API routes
          "/api/",
          // Checkout and private transactions
          "/checkout/",
          // Search results (avoid duplicate content)
          "/courses?*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/parent/",
          "/teacher/",
          "/student/",
          "/admin/",
          "/onboarding/",
          "/reset-password/",
          "/api/",
          "/checkout/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
