import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CYLO Guatemala - Cotizador",
  description: "Sistema de cotizaciones privado para CYLO Guatemala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    'cylo-dark': '#1a202c',
                    'cylo-accent': '#3182ce',
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
