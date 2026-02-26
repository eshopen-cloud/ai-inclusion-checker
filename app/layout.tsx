import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conpady — Is AI Ignoring Your Business?",
  description: "Run a free scan and see if your site appears in AI answers. No signup required. Results in seconds.",
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
