"use client";

import Script from "next/script";

interface StructuredDataProps {
  type: "WebSite" | "Organization" | "LocalBusiness" | "Service";
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    };

    return JSON.stringify(baseSchema);
  };

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: generateSchema() }}
    />
  );
}

// Predefined schemas for common use cases
export const TranspoWebsiteSchema = () => (
  <StructuredData
    type="WebSite"
    data={{
      name: "TRANSPO",
      alternateName: "Transpo Malang",
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      description:
        "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    }}
  />
);

export const TranspoOrganizationSchema = () => (
  <StructuredData
    type="Organization"
    data={{
      name: "TRANSPO",
      alternateName: "Transpo Malang",
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      logo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/opengraph.png`,
      description:
        "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Malang",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: ["Indonesian"],
      },
      sameAs: [
        // Add social media URLs when available
      ],
    }}
  />
);

export const TranspoLocalBusinessSchema = () => (
  <StructuredData
    type="LocalBusiness"
    data={{
      "@type": ["LocalBusiness", "AutoRental"],
      name: "TRANSPO",
      image: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/opengraph.png`,
      description:
        "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Malang",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -7.9666,
        longitude: 112.6326,
      },
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      telephone: "+62-XXX-XXXX-XXXX", // Replace with actual phone number
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "06:00",
          closes: "22:00",
        },
      ],
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: -7.9666,
          longitude: 112.6326,
        },
        geoRadius: "50000", // 50km radius
      },
    }}
  />
);
