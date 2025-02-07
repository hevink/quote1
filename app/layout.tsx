import "./globals.css";
import { Inter } from "next/font/google";
import type React from "react";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Contractor Quote Builder",
  description: "Build and manage contractor quotes easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
      <Toaster />
    </html>
  );
}
