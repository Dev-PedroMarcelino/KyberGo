import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KyberGo — Orçamentos profissionais por IA, direto no WhatsApp",
  description:
    "Transforme conversas em propostas, leads e vendas com poucos cliques. IA que gera orçamentos, PDFs profissionais, CRM e follow-up automático pelo WhatsApp.",
  keywords: ["orçamentos", "IA", "WhatsApp", "CRM", "propostas", "PDF", "automação de vendas"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
