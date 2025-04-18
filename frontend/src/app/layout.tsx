import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { Navbar } from '@/components/layout/navbar';
import { ConditionalFooter } from '@/components/layout/conditional-footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeneTrust AI Studio - CRISPR Gene Editing",
  description: "A cutting-edge platform that combines AI, IoT, and blockchain for CRISPR gene editing exploration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <ConditionalFooter />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
