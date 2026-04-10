import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Admin | Multi Impresiones AH",
  description: "Panel de administración para el catálogo CPG",
  manifest: "/favicon-mi/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-mi/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-mi/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-mi/favicon.ico" },
    ],
    apple: [
      { url: "/favicon-mi/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className={`${inter.className} min-h-screen bg-[var(--background)]`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
