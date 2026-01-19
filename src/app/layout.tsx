import type { Metadata, Viewport } from "next";
import { Geist_Mono, Teachers } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/a11y/skip-link";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const teachers = Teachers({
  subsets: ["latin"],
  variable: "--font-teachers",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Kursus - La plateforme des cours qui cartonnent",
    template: "%s | Kursus",
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
  authors: [{ name: "Kursus" }],
  creator: "Kursus",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kursus",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://kursus.fr",
    title: "Kursus - La plateforme des cours qui cartonnent",
    description:
      "Plateforme EdTech francaise #1 pour les scolaires du CP a la Terminale.",
    siteName: "Kursus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kursus - La plateforme des cours qui cartonnent",
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
      <body
        className={`${teachers.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SkipLink />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
