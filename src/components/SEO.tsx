"use client";

import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = "/opengraph.png",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author = "TRANSPO",
  section = "Transportation",
  tags = [],
}: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  const pageTitle = title
    ? `${title} | TRANSPO`
    : "TRANSPO - Sewa Angkot, Hiace & ELF Terpercaya di Malang Raya";

  const pageDescription =
    description ||
    "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya dengan harga terjangkau dan pelayanan 24/7.";

  const allKeywords = [
    ...keywords,
    "sewa angkot malang",
    "sewa hiace malang",
    "sewa elf malang",
    "transportasi malang",
    "rental kendaraan malang",
  ];

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={allKeywords.join(", ")} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Indonesian" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="web" />
      <meta name="rating" content="general" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta
        property="og:image:alt"
        content={`${title || "TRANSPO"} - Transportation Services`}
      />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TRANSPO" />
      <meta property="og:locale" content="id_ID" />

      {type === "article" && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          <meta property="article:author" content={author} />
          <meta property="article:section" content={section} />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@transpo" />
      <meta name="twitter:creator" content="@transpo" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#0891b2" />
      <meta name="msapplication-TileColor" content="#0891b2" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* JSON-LD Structured Data for specific pages */}
      {type === "article" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: title,
              description: pageDescription,
              image: fullImageUrl,
              author: {
                "@type": "Organization",
                name: author,
              },
              publisher: {
                "@type": "Organization",
                name: "TRANSPO",
                logo: {
                  "@type": "ImageObject",
                  url: `${baseUrl}/opengraph.png`,
                },
              },
              datePublished: publishedTime,
              dateModified: modifiedTime || publishedTime,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": fullUrl,
              },
            }),
          }}
        />
      )}
    </Head>
  );
}

// Hook untuk menggunakan SEO di komponen
export function useSEO(seoProps: SEOProps) {
  return {
    title: seoProps.title,
    description: seoProps.description,
    openGraph: {
      title: seoProps.title,
      description: seoProps.description,
      images: [{ url: seoProps.image || "/opengraph.png" }],
      url: seoProps.url,
      type: seoProps.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoProps.title,
      description: seoProps.description,
      images: [seoProps.image || "/opengraph.png"],
    },
  };
}
