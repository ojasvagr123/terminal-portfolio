import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ojasv Agrawal | Software Engineer",
  description:
    "Portfolio of Ojasv Agrawal - software engineer building full-stack, AI and cybersecurity products.",
  keywords: [
    "Ojasv Agrawal",
    "software engineer",
    "full-stack developer",
    "SGSITS",
    "portfolio",
  ],
  authors: [{ name: "Ojasv Agrawal" }],
  openGraph: {
    title: "Ojasv Agrawal | Software Engineer",
    description:
      "Full-stack, AI and cybersecurity projects backed by strong engineering fundamentals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={geistSans.variable}
    >
      <body>{children}</body>
    </html>
  );
}
