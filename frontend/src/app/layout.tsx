import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-worksans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plexmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Store",
    template: "%s · Store",
  },
  description: "A white-label storefront.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeProvider businessType="fashion">{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
