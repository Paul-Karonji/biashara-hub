import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CSPostHogProvider } from "@/components/providers/PostHogProvider";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biashara Hub — Quality Products. Trusted by Kenyans.",
  description: "A production-grade, open-source ecommerce platform tailored for the Kenyan market with native M-Pesa payments.",
  openGraph: {
    siteName: "Biashara Hub",
    type: "website",
    images: [{ url: "/logo.png", width: 800, height: 200, alt: "Biashara Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@biasharahub",
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
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CSPostHogProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <main className="flex-1 flex flex-col pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
          </CartProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
