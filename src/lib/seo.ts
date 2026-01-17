import type { Metadata } from "next";

const siteConfig = {
  name: "Kursus",
  description:
    "Plateforme educative francaise pour les scolaires du CP a la Terminale. Cours en ligne, exercices interactifs et suivi personnalise.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kursus.fr",
  ogImage: "/og-image.png",
  keywords: [
    "cours en ligne",
    "education",
    "scolaire",
    "primaire",
    "college",
    "lycee",
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "6eme",
    "5eme",
    "4eme",
    "3eme",
    "seconde",
    "premiere",
    "terminale",
    "mathematiques",
    "francais",
    "histoire",
    "geographie",
    "sciences",
    "anglais",
    "physique",
    "chimie",
    "SVT",
    "philosophie",
    "cours particuliers",
    "soutien scolaire",
    "aide aux devoirs",
    "revision bac",
    "revision brevet",
  ],
  authors: [{ name: "Kursus", url: "https://kursus.fr" }],
  creator: "Kursus",
};

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  pathname?: string;
}

export function generateSiteMetadata({
  title,
  description,
  image,
  noIndex = false,
  pathname = "",
}: GenerateMetadataParams = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - Cours en ligne pour scolaires`;
  const pageDescription = description || siteConfig.description;
  const pageImage = image || siteConfig.ogImage;
  const pageUrl = `${siteConfig.url}${pathname}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// JSON-LD structured data for courses
export function generateCourseJsonLd(course: {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  author: { name: string };
  averageRating: number;
  reviewCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    image: course.imageUrl,
    provider: {
      "@type": "Organization",
      name: "Kursus",
      sameAs: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      price: (course.price / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    instructor: {
      "@type": "Person",
      name: course.author.name,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: course.averageRating.toFixed(1),
      reviewCount: course.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

// JSON-LD for organization
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kursus",
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
  },
  sameAs: [],
};

// JSON-LD for educational website
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Kursus",
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/courses?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export { siteConfig };
