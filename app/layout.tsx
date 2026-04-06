import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Admin | Multi Impresiones AH",
  description: "Panel de administración para el catálogo CPG",
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
