import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Barraca | Barraca Armada",
  description: "Gestão de moradores, gastos, pagamentos e tarefas da Barraca Armada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}