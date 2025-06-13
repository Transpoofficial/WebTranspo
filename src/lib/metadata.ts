import { Metadata } from "next";

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article"; // Remove 'product' as it's not supported by Next.js OpenGraph
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  alternateLanguages?: Record<string, string>;
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image = "/opengraph.png",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
  alternateLanguages = {},
}: GenerateMetadataProps): Metadata {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
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
    "angkot wisata malang",
    "jasa transportasi malang",
  ];

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: allKeywords,
    authors: [{ name: "TRANSPO", url: baseUrl }],
    creator: "TRANSPO",
    publisher: "TRANSPO",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        "id-ID": url || "/",
        ...alternateLanguages,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: fullUrl,
      siteName: "TRANSPO",
      type: type,
      locale: "id_ID",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${title || "TRANSPO"} - Transportation Services`,
          type: "image/png",
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [fullImageUrl],
      creator: "@transpo",
      site: "@transpo",
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
    category: "transportation",
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "msapplication-TileColor": "#0891b2",
      "theme-color": "#0891b2",
    },
  };
}

// Predefined metadata for common pages
export const pageMetadata = {
  home: () =>
    generatePageMetadata({
      title: "Beranda",
      description:
        "Platform sewa transportasi terpercaya di Malang Raya. Pesan angkot, Hiace, dan ELF dengan mudah, harga terjangkau, pelayanan 24/7.",
      keywords: [
        "beranda transpo",
        "sewa angkot malang",
        "platform transportasi malang",
      ],
      url: "/",
    }),

  signin: () =>
    generatePageMetadata({
      title: "Masuk",
      description:
        "Masuk ke akun TRANSPO Anda untuk mengakses layanan sewa angkot, Hiace, dan ELF di Malang Raya.",
      keywords: ["login transpo", "masuk akun", "signin transportasi"],
      url: "/auth/signin",
      noIndex: true,
    }),

  signup: () =>
    generatePageMetadata({
      title: "Daftar",
      description:
        "Daftar akun TRANSPO gratis dan nikmati kemudahan sewa angkot, Hiace, dan ELF di Malang Raya.",
      keywords: ["daftar transpo", "register akun", "signup transportasi"],
      url: "/auth/signup",
    }),

  dashboard: () =>
    generatePageMetadata({
      title: "Dashboard",
      description:
        "Dashboard TRANSPO - Kelola pesanan, riwayat perjalanan, dan akses semua layanan transportasi Anda.",
      keywords: ["dashboard transpo", "kelola pesanan", "riwayat perjalanan"],
      url: "/dashboard",
      noIndex: true,
    }),

  orderAngkot: () =>
    generatePageMetadata({
      title: "Sewa Angkot",
      description:
        "Sewa angkot di Malang Raya dengan TRANSPO. Tersedia berbagai pilihan angkot untuk keperluan wisata, pelajar, dan perjalanan harian.",
      keywords: [
        "sewa angkot malang",
        "rental angkot",
        "angkot wisata malang",
        "angkot pelajar",
      ],
      url: "/order/angkot",
    }),

  orderHiace: () =>
    generatePageMetadata({
      title: "Sewa Hiace",
      description:
        "Sewa Hiace di Malang Raya dengan TRANSPO. Kapasitas besar, nyaman untuk rombongan wisata, family trip, dan acara khusus.",
      keywords: [
        "sewa hiace malang",
        "rental hiace",
        "hiace wisata",
        "hiace rombongan",
      ],
      url: "/order/hiace",
    }),

  orderElf: () =>
    generatePageMetadata({
      title: "Sewa ELF",
      description:
        "Sewa ELF di Malang Raya dengan TRANSPO. Kendaraan ideal untuk grup kecil, perjalanan bisnis, dan wisata keluarga.",
      keywords: ["sewa elf malang", "rental elf", "elf wisata", "elf bisnis"],
      url: "/order/elf",
    }),

  about: () =>
    generatePageMetadata({
      title: "Tentang Kami",
      description:
        "Tentang TRANSPO - Platform sewa transportasi terpercaya di Malang Raya. Misi kami memberikan layanan transportasi terbaik untuk Anda.",
      keywords: ["tentang transpo", "profil perusahaan", "visi misi transpo"],
      url: "/about",
    }),

  contact: () =>
    generatePageMetadata({
      title: "Hubungi Kami",
      description:
        "Hubungi TRANSPO untuk informasi lebih lanjut tentang layanan sewa angkot, Hiace, dan ELF di Malang Raya. Customer service 24/7.",
      keywords: ["kontak transpo", "customer service", "hubungi kami"],
      url: "/contact",
    }),

  terms: () =>
    generatePageMetadata({
      title: "Syarat dan Ketentuan",
      description:
        "Syarat dan ketentuan penggunaan layanan TRANSPO. Baca dengan teliti sebelum menggunakan platform kami.",
      keywords: ["syarat ketentuan", "terms of service", "kebijakan transpo"],
      url: "/terms",
      noIndex: true,
    }),

  privacy: () =>
    generatePageMetadata({
      title: "Kebijakan Privasi",
      description:
        "Kebijakan privasi TRANSPO. Kami berkomitmen melindungi data pribadi dan privasi pengguna platform kami.",
      keywords: ["kebijakan privasi", "privacy policy", "perlindungan data"],
      url: "/privacy",
      noIndex: true,
    }),
};
