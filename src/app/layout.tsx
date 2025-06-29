import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/NextAuthProviders";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import {
  TranspoWebsiteSchema,
  TranspoOrganizationSchema,
  TranspoLocalBusinessSchema,
} from "@/components/StructuredData";
import Analytics from "@/components/Analytics";
import WebVitals from "@/components/WebVitals";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "TRANSPO - Sewa Angkot, Hiace & ELF Terpercaya di Malang Raya",
    template: "%s | TRANSPO",
  },
  description:
    "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya dengan harga terjangkau dan pelayanan 24/7.",
  keywords: [
    "sewa angkot malang",
    "sewa hiace malang",
    "sewa elf malang",
    "transportasi malang",
    "angkot malang",
    "rental kendaraan malang",
    "wisata malang",
    "transportasi online malang",
    "sewa mobil malang",
    "tour transport malang",
    "rental hiace malang",
    "sewa angkot murah",
    "transportasi wisata malang",
    "sewa kendaraan malang",
    "angkot wisata malang",
    "rental elf malang",
    "transportasi pelajar malang",
    "sewa angkot harian",
    "jasa transportasi malang",
    "booking angkot online",
  ],
  authors: [{ name: "TRANSPO", url: "https://transpo.com" }],
  creator: "TRANSPO",
  publisher: "TRANSPO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
    },
  },
  openGraph: {
    title: "TRANSPO - Sewa Angkot, Hiace & ELF Terpercaya di Malang Raya",
    description:
      "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya dengan harga terjangkau dan pelayanan 24/7.",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    siteName: "TRANSPO",
    type: "website",
    locale: "id_ID",
    countryName: "Indonesia",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "TRANSPO - Platform Sewa Angkot, Hiace & ELF Terpercaya di Malang Raya",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRANSPO - Sewa Angkot, Hiace & ELF Terpercaya di Malang Raya",
    description:
      "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya.",
    images: ["/opengraph.png"],
    creator: "@transpo",
    site: "@transpo",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "transportation",
  classification: "Transportation Services",
  verification: {
    google: "google-site-verification-code", // Ganti dengan kode verifikasi Google yang sebenarnya
    yandex: "yandex-verification-code", // Ganti dengan kode verifikasi Yandex
    yahoo: "yahoo-site-verification-code", // Ganti dengan kode verifikasi Yahoo
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#0891b2",
    "theme-color": "#0891b2",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/opengraph.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {" "}
      <head>
        <TranspoWebsiteSchema />
        <TranspoOrganizationSchema />
        <TranspoLocalBusinessSchema />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-config" content="/browserconfig.xml" />{" "}
        {/* Additional icon links for better compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/opengraph.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <NextAuthProvider>
            <Toaster position="bottom-right" />
            {children}
            <Analytics
              googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
              googleTagManagerId={process.env.NEXT_PUBLIC_GTM_ID}
              facebookPixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID}
              hotjarId={process.env.NEXT_PUBLIC_HOTJAR_ID}
            />
            <WebVitals debug={process.env.NODE_ENV === "development"} />
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
