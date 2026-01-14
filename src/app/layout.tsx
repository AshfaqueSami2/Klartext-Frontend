import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SWRProvider } from "@/lib/swr-config";

const notoSans = Noto_Sans({ 
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const notoSerif = Noto_Serif({ 
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.klartext.tech'),
  title: {
    default: "KlarText - Learn German Through Reading | German Language Learning Platform",
    template: "%s | KlarText"
  },
  description: "Master German through comprehensible input with KlarText. Interactive German lessons, vocabulary building, live voice rooms, and personalized learning. Perfect for A1-C1 learners. Start learning German today!",
  keywords: [
    "KlarText",
    "klartext",
    "learn German",
    "German language learning",
    "German learning platform",
    "language learning website",
    "comprehensible input",
    "German reading practice",
    "German vocabulary",
    "German lessons",
    "learn German online",
    "German for beginners",
    "A1 German",
    "A2 German",
    "B1 German",
    "B2 German",
    "C1 German",
    "German grammar",
    "German conversation practice",
    "interactive German learning",
    "German voice chat",
    "German study app",
    "German language app",
    "German reading comprehension",
    "learn German free"
  ],
  authors: [{ name: "KlarText" }],
  creator: "KlarText",
  publisher: "KlarText",
  applicationName: "KlarText",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.klartext.tech",
    siteName: "KlarText",
    title: "KlarText - Learn German Through Reading | German Language Learning Platform",
    description: "Master German through comprehensible input with KlarText. Interactive German lessons, vocabulary building, live voice rooms, and personalized learning. Perfect for A1-C1 learners.",
    images: [
      {
        url: "/logo/logo final 1.png",
        width: 1200,
        height: 630,
        alt: "KlarText - German Language Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KlarText - Learn German Through Reading",
    description: "Master German through comprehensible input. Interactive lessons, vocabulary building, and live practice.",
    images: ["/logo/logo final 1.png"],
    creator: "@klartext",
  },
  alternates: {
    canonical: "https://www.klartext.tech",
  },
  category: "Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans bg-background text-foreground antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SWRProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <main id="main-content">
                    {children}
                  </main>
                  <Toaster position="top-center" richColors />
                </SubscriptionProvider>
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}