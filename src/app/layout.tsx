import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

//! Update metadata to match your project
export const metadata: Metadata = {
  title: "Bean & Brew Co.",
  description: "A simple coffee shop website built with Next.js 14 and TypeScript.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
