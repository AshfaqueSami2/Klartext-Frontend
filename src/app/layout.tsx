import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
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
  title: "KlarText - Learn German Through Reading",
  description: "Master German through comprehensible input. Read engaging stories, build vocabulary, and track your progress.",
  keywords: ["German", "language learning", "comprehensible input", "vocabulary", "reading"],
  authors: [{ name: "KlarText" }],
  openGraph: {
    title: "KlarText - Learn German Through Reading",
    description: "Master German through comprehensible input",
    type: "website",
    locale: "en_US",
  },
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
                <main id="main-content">
                  {children}
                </main>
                <Toaster position="top-center" richColors />
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}