import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { AppProvider } from "@/contexts/AppProvider";

// Fonte Inter para todo o app
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Plantões",
  description: "Gerenciador de plantões médicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased", 
          inter.variable,
          "pb-16" // Adicionando padding inferior para a navegação
        )}
      >
        <AppProvider>
          {/* Conteúdo principal */}
          <main className="container mx-auto px-4 py-4 h-full">
            {children}
          </main>

          {/* Barra de navegação inferior */}
          <BottomNavigation />
          
          {/* Toaster para notificações */}
          <Toaster position="top-center" richColors closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
