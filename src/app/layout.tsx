import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRcode Menu",
  description: "Cardapio digital para restaurante com painel administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
