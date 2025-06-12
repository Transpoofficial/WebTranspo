"use client";

import Script from "next/script";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbList),
      }}
    />
  );
}

// Predefined breadcrumbs for common pages
export const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const pathSegments = path.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ name: "Beranda", url: "/" }];

  let currentPath = "";

  const pathMap: Record<string, string> = {
    auth: "Autentikasi",
    signin: "Masuk",
    signup: "Daftar",
    dashboard: "Dashboard",
    order: "Pemesanan",
    angkot: "Angkot",
    hiace: "Hiace",
    elf: "ELF",
    about: "Tentang Kami",
    contact: "Hubungi Kami",
    terms: "Syarat dan Ketentuan",
    privacy: "Kebijakan Privasi",
    settings: "Pengaturan",
    admin: "Admin",
  };

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name =
      pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      name,
      url: currentPath,
    });
  });

  return breadcrumbs;
};
