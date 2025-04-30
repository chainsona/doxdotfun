import Root from "@/app/doxdotfun/components/ui/root";

export const metadata = {
  title: "doxdotfun",
  description: "Monitor and audit launches with Doxdotfun",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <head>
        <meta name="apple-mobile-web-app-title" content="doxdotfun" />
        <link rel="manifest" href="/manifest-doxdotfun.json" />
        <link rel="icon" href="/favicon/doxdotfun/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icons/doxdotfun/icon0.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/doxdotfun/web-app-manifest-192x192.png" type="image/png" />
        <link rel="icon" href="/icons/doxdotfun/web-app-manifest-512x512.png" type="image/png" />
        </head>
      <body>
        <Root>{children}</Root>
      </body>
    </html>
  );
}