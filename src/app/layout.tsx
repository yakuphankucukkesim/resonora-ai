import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "resonora.ai - AI-Powered Viral Clips",
  description: "🚀 Turn your long podcasts into viral clips with AI! Upload, generate, and share engaging content that goes viral. Trusted by 10,000+ podcasters!",
  icons: {
    icon: [
      { url: "/favicon-new.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon-new.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-new.ico", sizes: "48x48", type: "image/x-icon" }
    ],
    shortcut: "/favicon-new.ico",
    apple: "/favicon-new.ico"
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}
