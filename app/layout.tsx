import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Central Phones | Assistência Técnica em São João del-Rei",
  description:
    "Assistência técnica especializada em celulares, notebooks, videogames e eletrônicos em São João del-Rei - MG. Troca de tela, bateria, reparo de placa e venda de aparelhos e acessórios.",
  keywords: [
    "assistência técnica são joão del-rei",
    "conserto celular sjdr",
    "troca de tela iphone",
    "reparo de notebook",
    "manutenção ps5 xbox",
    "central phones",
  ],
  openGraph: {
    title: "Central Phones | Assistência Técnica em São João del-Rei",
    description:
      "Tecnologia, transparência e cuidado com seu smartphone, computador e videogame.",
    url: "https://centralphones.com.br",
    siteName: "Central Phones",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#171717] selection:bg-[#D4AF37] selection:text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
