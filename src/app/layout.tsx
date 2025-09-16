import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UK Food Recipes - Authentic British Cuisine & International Favourites",
  description: "Discover delicious recipes from Britain and beyond. Traditional Sunday roasts, quick weeknight dinners, and international favourites with proper UK measurements.",
  keywords: "UK recipes, British food, cooking, recipes, metric measurements, vegetarian, quick meals",
  authors: [{ name: "UK Food Recipes Team" }],
  creator: "UK Food Recipes",
  publisher: "UK Food Recipes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ukfoodrecipes.com"),
  openGraph: {
    title: "UK Food Recipes - Authentic British Cuisine",
    description: "Discover delicious recipes from Britain and beyond with proper UK measurements.",
    url: "https://ukfoodrecipes.com",
    siteName: "UK Food Recipes",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Food Recipes - Authentic British Cuisine",
    description: "Discover delicious recipes from Britain and beyond with proper UK measurements.",
    creator: "@ukfoodrecipes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} font-sans antialiased bg-cream min-h-screen`}>
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
