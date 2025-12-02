import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Painter Assist - Estimation Tool",
    template: "%s | Painter Assist",
  },
  description: "Professional painting estimation tool for standardized project estimates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

