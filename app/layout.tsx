import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import Provider from './provider';

export const metadata: Metadata = {
  title: {
    default: "Novas Agent — AI-Powered E2E Test Automation",
    template: "%s | Novas Agent",
  },
  description:
    "Connect your GitHub repo, let AI generate clean Playwright test cases, and execute end-to-end test runs instantly with Browserbase. Free to start.",
  keywords: [
    "AI test automation",
    "Playwright",
    "E2E testing",
    "GitHub integration",
    "Browserbase",
    "QA automation",
    "Next.js",
  ],
  authors: [{ name: "Novas" }],
  creator: "Novas",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Novas Agent",
    title: "Novas Agent — AI-Powered E2E Test Automation",
    description:
      "AI-driven Playwright test generation and execution from your GitHub codebase.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Novas Agent — AI Test Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novas Agent — AI-Powered E2E Test Automation",
    description:
      "AI-driven Playwright test generation and execution from your GitHub codebase.",
    images: ["/og-image.png"],
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
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
