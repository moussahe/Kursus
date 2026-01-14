import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/a11y/skip-link";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Schoolaris - Plateforme educative pour scolaires",
    template: "%s | Schoolaris",
  },
  description:
    "Plateforme EdTech francaise #1 pour les scolaires du CP a la Terminale. Cours interactifs, exercices personnalises et assistant IA.",
  keywords: [
    "education",
    "scolaire",
    "cours en ligne",
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "college",
    "lycee",
    "mathematiques",
    "francais",
    "IA",
  ],
  authors: [{ name: "Schoolaris" }],
  creator: "Schoolaris",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Schoolaris",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://schoolaris.fr",
    title: "Schoolaris - Plateforme educative pour scolaires",
    description:
      "Plateforme EdTech francaise #1 pour les scolaires du CP a la Terminale.",
    siteName: "Schoolaris",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schoolaris - Plateforme educative pour scolaires",
    description:
      "Plateforme EdTech francaise #1 pour les scolaires du CP a la Terminale.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SkipLink />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
