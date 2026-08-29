import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GPUProvider } from "@/components/providers/GPUProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Injoy&read&play — Interactive Java/Spring Universe",
    template: "%s | Injoy&read&play",
  },
  description:
    "A cinematic, node-graph-driven, ultra-animated interactive encyclopedia for Java, Spring Boot, Microservices, Collections, Multithreading, SQL, and JVM internals. 700+ interview questions, animated diagrams, and gamified learning.",
  keywords: [
    "Java",
    "Spring Boot",
    "Microservices",
    "Interview Preparation",
    "JVM",
    "Multithreading",
    "Collections",
    "Interactive Learning",
    "Injoy&read&play",
  ],
  authors: [{ name: "Injoy&read&play" }],
  creator: "Injoy&read&play",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Injoy&read&play — Interactive Java/Spring Universe",
    description:
      "Cinematic, animated, graph-first learning platform for Java & Spring ecosystem mastery.",
    siteName: "Injoy&read&play",
  },
  twitter: {
    card: "summary_large_image",
    title: "Injoy&read&play — Interactive Java/Spring Universe",
    description: "Cinematic learning — not docs. Graph-first, animated, 700+ interview questions.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { Sidebar } from "@/components/layout/Sidebar";
import { SearchProvider } from "@/components/providers/SearchProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans antialiased">
        <GPUProvider>
          <SearchProvider>
            <Sidebar />
            {children}
          </SearchProvider>
        </GPUProvider>
      </body>
    </html>
  );
}
