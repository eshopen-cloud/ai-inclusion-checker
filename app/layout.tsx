import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Inclusion Checker — Is Your Business Cited by AI?",
  description: "Run a free AI inclusion scan in under 60 seconds. Find out if AI systems recommend your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
