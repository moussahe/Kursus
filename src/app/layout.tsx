import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
