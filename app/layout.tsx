import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kibu Solutions",
  description: "Empowering businesses with Kibu Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="kibu.solutions" />
        <link rel="manifest" href="/manifest-main.json" />
        <link rel="icon" href="/favicon/main/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icons/main/icon0.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/main/web-app-manifest-192x192.png" type="image/png" />
        <link rel="icon" href="/icons/main/web-app-manifest-512x512.png" type="image/png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}